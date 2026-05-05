#include "AudioEngine.h"

using namespace mycelium;

namespace
{
    struct BellPreset
    {
        float ratio, idxPeak, idxFloor, carrierDecay, modDecay;
    };

    // Index matches the "bellRatio" APVTS choice order:
    //   0 Small Bell · 1 Cathedral · 2 Tubular · 3 Bright
    // Modulation indices are deliberately tame — a high idxPeak (>4) with
    // inharmonic ratios produces aliased sidebands that stack ugly when
    // multiple voices fire in quick succession.
    constexpr BellPreset kBellPresets[] = {
        { 3.5f,  1.6f, 0.15f, 1.2f, 0.5f },   // Small      — intimate, fast-decay
        { 2.0f,  3.0f, 0.4f,  5.0f, 1.5f },   // Cathedral  — warm, sine-leaning
        { 1.4f,  2.0f, 0.25f, 3.0f, 1.0f },   // Tubular    — woody, wide
        { 3.14f, 2.5f, 0.3f,  2.0f, 0.7f },   // Bright     — tamed glassy
    };
    constexpr int kNumBellPresets = (int) (sizeof (kBellPresets) / sizeof (kBellPresets[0]));
}

AudioEngine::AudioEngine() = default;

void AudioEngine::prepare (double sr, int maxBlockSize)
{
    sampleRate = sr;

    // Pad: 4 sustained voices held forever — A1, E2, C3, G3 (matches artifact line 311).
    static constexpr float padNotes[4] = { 33.0f, 40.0f, 48.0f, 55.0f };
    for (size_t i = 0; i < padVoices.size(); ++i)
        padVoices[i].prepare (sr, padNotes[i]);

    for (auto& v : bellVoices)
        v.prepare (sr);

    thump.prepare (sr);

    juce::dsp::ProcessSpec spec { sr, (juce::uint32) maxBlockSize, 1 };
    lowpassL.prepare (spec);
    lowpassR.prepare (spec);
    lowpassL.reset();
    lowpassR.reset();
    currentLowpassHz = -1.0f;

    delayL.setMaximumDelayInSamples (kDelayMaxSamples);
    delayR.setMaximumDelayInSamples (kDelayMaxSamples);
    delayL.prepare ({ sr, (juce::uint32) maxBlockSize, 1 });
    delayR.prepare ({ sr, (juce::uint32) maxBlockSize, 1 });
    delayL.reset();
    delayR.reset();
    delaySmoothed.reset (sr, 0.02);  // 20 ms ramp absorbs BPM jumps without zipper noise.
    delaySmoothed.setCurrentAndTargetValue (0.0f);

    reverb.setSampleRate (sr);
    juce::Reverb::Parameters rp;
    rp.roomSize = 0.85f;   // long tail (artifact: decay 14)
    rp.damping  = 0.3f;
    rp.wetLevel = 0.55f;
    rp.dryLevel = 0.45f;
    rp.width    = 1.0f;
    rp.freezeMode = 0.0f;
    reverb.setParameters (rp);
}

void AudioEngine::triggerThump (float /*hue*/, float velocity, float pan, double bpm) noexcept
{
    thumpPan = juce::jlimit (-1.0f, 1.0f, pan);
    thump.trigger (36.0f, velocity, bpm);
}

void AudioEngine::triggerBell (float pitchHz, float velocity, float pan, int ratioPreset) noexcept
{
    // Pick the oldest inactive slot; if all active, steal the oldest.
    int chosen = -1;
    size_t oldestAge = 0;
    for (int i = 0; i < kBellSlots; ++i)
    {
        if (! bellVoices[(size_t) i].isActive())
        {
            chosen = i;
            break;
        }
        if (bellVoices[(size_t) i].age() > oldestAge)
        {
            oldestAge = bellVoices[(size_t) i].age();
            chosen = i;
        }
    }
    if (chosen >= 0)
    {
        bellPan[(size_t) chosen] = juce::jlimit (-1.0f, 1.0f, pan);
        const auto& p = kBellPresets[juce::jlimit (0, kNumBellPresets - 1, ratioPreset)];
        bellVoices[(size_t) chosen].trigger (pitchHz,
                                             juce::jlimit (0.0f, 1.0f, velocity),
                                             p.ratio, p.idxPeak, p.idxFloor,
                                             p.carrierDecay, p.modDecay);
    }
}

void AudioEngine::renderBlock (float* left, float* right, int numSamples,
                               const ParamSnapshot& p) noexcept
{
    // Update lowpass coefficients only when the cutoff changes (cheap path).
    if (std::abs (p.lowpassHz - currentLowpassHz) > 0.5f)
    {
        const auto coeffs = juce::dsp::IIR::Coefficients<float>::makeLowPass (sampleRate, p.lowpassHz, 0.7f);
        *lowpassL.coefficients = *coeffs;
        *lowpassR.coefficients = *coeffs;
        currentLowpassHz = p.lowpassHz;
    }

    juce::Reverb::Parameters rp = reverb.getParameters();
    if (std::abs (rp.wetLevel - p.reverbWet) > 0.001f)
    {
        rp.wetLevel = p.reverbWet;
        rp.dryLevel = 1.0f - p.reverbWet;
        reverb.setParameters (rp);
    }

    const float padGain   = dbToGain (p.padLevelDb);
    const float pluckGain = dbToGain (p.pluckLevelDb);
    const float thumpGain = dbToGain (p.thumpLevelDb);
    const float masterGain = dbToGain (p.masterDb);

    // Equal-power pan: pan in [-1..+1] -> theta in [0..pi/2].
    auto panL = [] (float pan) noexcept
    {
        const float theta = (pan + 1.0f) * juce::MathConstants<float>::pi * 0.25f;
        return std::cos (theta);
    };
    auto panR = [] (float pan) noexcept
    {
        const float theta = (pan + 1.0f) * juce::MathConstants<float>::pi * 0.25f;
        return std::sin (theta);
    };

    // Delay setup. delaySamples == 0 means bypass (handled by mix=0 below).
    const float fb        = juce::jlimit (0.0f, 0.85f, p.delayFeedback);
    const float delayMix  = juce::jlimit (0.0f, 1.0f, p.delayMix);
    const float delayBypass = (p.delaySamples <= 1.0f) ? 1.0f : 0.0f;
    delaySmoothed.setTargetValue (juce::jmax (1.0f, p.delaySamples));

    for (int n = 0; n < numSamples; ++n)
    {
        // Pad — kept centred for v2; will become granular in Phase C5.
        float pad = 0.0f;
        for (auto& v : padVoices) pad += v.renderSample();
        pad *= 0.25f * padGain;

        // FM bells — sum each voice into L/R with its own equal-power pan.
        // (pluckGain knob is reused as the bell bus level until Phase C param rename.)
        float bellL = 0.0f, bellR = 0.0f;
        for (size_t i = 0; i < bellVoices.size(); ++i)
        {
            if (! bellVoices[i].isActive()) continue;
            const float s = bellVoices[i].renderSample() * pluckGain;
            const float pp = bellPan[i];
            bellL += s * panL (pp);
            bellR += s * panR (pp);
        }

        // Thump — kept (almost) centred. Sub-100Hz Haas / hard pan breaks
        // mono fold-down, so we attenuate the pan for the kick.
        const float thumpRaw = thump.renderSample() * thumpGain;
        const float tp       = thumpPan * 0.4f;
        const float thumpL   = thumpRaw * panL (tp);
        const float thumpR   = thumpRaw * panR (tp);

        // Sum + per-channel lowpass.
        const float l = lowpassL.processSample (pad + bellL + thumpL);
        const float r = lowpassR.processSample (pad + bellR + thumpR);

        // Tempo-synced delay tap. Read at smoothed delay distance, feed back
        // a fraction, mix the wet copy into the bus before reverb.
        const float dCur = delaySmoothed.getNextValue();
        delayL.setDelay (dCur);
        delayR.setDelay (dCur);
        const float dl = delayL.popSample (0);
        const float dr = delayR.popSample (0);
        delayL.pushSample (0, l + dl * fb * (1.0f - delayBypass));
        delayR.pushSample (0, r + dr * fb * (1.0f - delayBypass));
        const float wetMix = delayMix * (1.0f - delayBypass);

        left[n]  = l + dl * wetMix;
        right[n] = r + dr * wetMix;
    }

    // Reverb processes the whole block at once.
    reverb.processStereo (left, right, numSamples);

    // Bus-level M/S width control after reverb.
    // widenAmount: 0 = mono, 0.5 = unchanged stereo, 1 = double width.
    const float widthScale = juce::jlimit (0.0f, 2.0f, p.widenAmount * 2.0f);
    if (std::abs (widthScale - 1.0f) > 0.001f)
    {
        for (int n = 0; n < numSamples; ++n)
        {
            const float mid  = 0.5f * (left[n] + right[n]);
            const float side = 0.5f * (left[n] - right[n]) * widthScale;
            left[n]  = mid + side;
            right[n] = mid - side;
        }
    }

    // Master gain + tanh soft-clip — protects against voice-stack peaks that
    // would otherwise drive into clipping and make the FM bells stab.
    for (int n = 0; n < numSamples; ++n)
    {
        left[n]  = std::tanh (left[n]  * masterGain);
        right[n] = std::tanh (right[n] * masterGain);
    }
}
