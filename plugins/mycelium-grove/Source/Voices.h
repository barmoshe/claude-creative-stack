#pragma once

#include <juce_audio_basics/juce_audio_basics.h>
#include <juce_dsp/juce_dsp.h>
#include <array>
#include <cmath>
#include <random>

namespace mycelium
{
    inline float midiToHz (float note) noexcept
    {
        return 440.0f * std::pow (2.0f, (note - 69.0f) / 12.0f);
    }

    // -------------------------------------------------------------------------
    // PadVoice — AM synth, sustained. Carrier sine modulated by a slower sine.
    // Triggered once at startup; never released. Tone.js: PolySynth(AMSynth).
    // -------------------------------------------------------------------------
    class PadVoice
    {
    public:
        void prepare (double sr, float midiNote)
        {
            sampleRate = sr;
            carrierPhase = 0.0f;
            modulatorPhase = 0.0f;
            const float hz = midiToHz (midiNote);
            carrierIncrement   = juce::MathConstants<float>::twoPi * hz / (float) sr;
            modulatorIncrement = juce::MathConstants<float>::twoPi * (hz * 0.5f) / (float) sr;

            juce::ADSR::Parameters env { 6.0f, 2.0f, 0.7f, 12.0f }; // a, d, s, r — straight from artifact
            adsr.setSampleRate (sr);
            adsr.setParameters (env);
            adsr.noteOn();
        }

        float renderSample() noexcept
        {
            const float carrier   = std::sin (carrierPhase);
            const float modulator = 0.5f * (1.0f + std::sin (modulatorPhase));
            carrierPhase += carrierIncrement;
            modulatorPhase += modulatorIncrement;
            if (carrierPhase   > juce::MathConstants<float>::twoPi) carrierPhase   -= juce::MathConstants<float>::twoPi;
            if (modulatorPhase > juce::MathConstants<float>::twoPi) modulatorPhase -= juce::MathConstants<float>::twoPi;
            return carrier * modulator * adsr.getNextSample();
        }

    private:
        double sampleRate { 44100.0 };
        float  carrierPhase { 0.0f }, modulatorPhase { 0.0f };
        float  carrierIncrement { 0.0f }, modulatorIncrement { 0.0f };
        juce::ADSR adsr;
    };

    // -------------------------------------------------------------------------
    // PluckVoice — Karplus-Strong with one-pole damping in the loop.
    // Tone.js: PluckSynth(attackNoise: 0.6, dampening: 4500, resonance: 0.92).
    // -------------------------------------------------------------------------
    class PluckVoice
    {
    public:
        void prepare (double sr)
        {
            sampleRate = sr;
            buffer.assign ((size_t) sr / 20, 0.0f); // worst-case ~20 Hz
            writeIdx = 0;
            active = false;
            lastSample = 0.0f;
        }

        void trigger (float pitchHz, float velocity = 0.9f)
        {
            const auto period = (size_t) std::max<int> (8, (int) std::round (sampleRate / pitchHz));
            currentPeriod = period;

            // Excite with a band-limited noise burst the length of one period.
            std::mt19937 rng { (unsigned) (pitchHz * 1000.0f) + (unsigned) writeIdx };
            std::uniform_real_distribution<float> dist (-1.0f, 1.0f);
            for (size_t i = 0; i < period; ++i)
                buffer[(writeIdx + i) % buffer.size()] = dist (rng) * velocity;

            // Zero the rest so a previous voice's tail doesn't bleed in.
            for (size_t i = period; i < buffer.size(); ++i)
                buffer[(writeIdx + i) % buffer.size()] = 0.0f;

            ageSamples = 0;
            active     = true;
            lastSample = 0.0f;
        }

        float renderSample() noexcept
        {
            if (! active) return 0.0f;

            const size_t readIdx  = writeIdx;
            const size_t nextIdx  = (writeIdx + 1) % buffer.size();

            // Average two consecutive samples (low-pass), then apply feedback.
            const float averaged  = 0.5f * (buffer[readIdx] + buffer[nextIdx]);
            // Extra one-pole LP tuned to ~4.5 kHz to mimic Tone.js dampening.
            lastSample = lastSample + dampingCoeff * (averaged - lastSample);
            const float out = lastSample * resonance;

            buffer[readIdx] = out;
            writeIdx = nextIdx;

            ++ageSamples;
            // Auto-deactivate after ~6 seconds — the energy is inaudible by then.
            if (ageSamples > (size_t) (sampleRate * 6.0)) active = false;

            return out;
        }

        bool isActive() const noexcept { return active; }
        size_t age() const noexcept    { return ageSamples; }

    private:
        double sampleRate { 44100.0 };
        std::vector<float> buffer;
        size_t writeIdx { 0 };
        size_t currentPeriod { 0 };
        size_t ageSamples { 0 };
        bool   active { false };

        // dampingCoeff ≈ 1 - exp(-2π * 4500 / sr); ≈ 0.51 at 44.1 kHz, 0.47 at 48 kHz
        const float dampingCoeff { 0.5f };
        const float resonance    { 0.985f };  // controls overall sustain
        float lastSample { 0.0f };
    };

    // -------------------------------------------------------------------------
    // FmBellVoice — 2-op FM (Chowning bell). One sine modulator drives one
    // sine carrier; modulation index decays from idxPeak → idxFloor over the
    // modulator envelope, so the spectrum is rich at strike and sine-like in
    // the tail. C:M ratios in the trigger() call select the timbre family
    // (Cathedral 1:2.76, Small 1:3.5, etc.).
    // -------------------------------------------------------------------------
    class FmBellVoice
    {
    public:
        void prepare (double sr)
        {
            sampleRate = sr;
            carrierEnv.setSampleRate (sr);
            modEnv.setSampleRate (sr);
            active = false;
            ageSamples = 0;
        }

        void trigger (float pitchHz,
                      float vel          = 0.8f,
                      float ratio        = 2.76f,  // M:C ratio (Cathedral default)
                      float idxPeak      = 8.0f,
                      float idxFloor     = 1.0f,
                      float carrierDecay = 4.0f,
                      float modDecay     = 1.2f) noexcept
        {
            velocity = juce::jlimit (0.0f, 1.0f, vel);
            carrierPhase   = 0.0f;
            modulatorPhase = 0.0f;
            carrierIncrement   = juce::MathConstants<float>::twoPi * pitchHz / (float) sampleRate;
            modulatorIncrement = juce::MathConstants<float>::twoPi * pitchHz * ratio / (float) sampleRate;

            modIdxPeak  = idxPeak;
            modIdxFloor = idxFloor;

            const juce::ADSR::Parameters cEnv { 0.005f, carrierDecay, 0.0f, 0.1f };
            const juce::ADSR::Parameters mEnv { 0.005f, modDecay,     0.0f, 0.05f };
            carrierEnv.setParameters (cEnv);
            modEnv.setParameters (mEnv);
            carrierEnv.reset();
            modEnv.reset();
            carrierEnv.noteOn();
            modEnv.noteOn();

            active = true;
            ageSamples = 0;
        }

        bool isActive() const noexcept { return active; }
        size_t age() const noexcept    { return ageSamples; }

        float renderSample() noexcept
        {
            if (! active) return 0.0f;

            const float modA = modEnv.getNextSample();
            const float crA  = carrierEnv.getNextSample();

            // Modulation index ramps idxPeak → idxFloor as modEnv decays.
            const float idx        = modIdxFloor + (modIdxPeak - modIdxFloor) * modA;
            const float modSample  = std::sin (modulatorPhase) * idx;
            const float outSample  = std::sin (carrierPhase + modSample);

            carrierPhase   += carrierIncrement;
            modulatorPhase += modulatorIncrement;
            if (carrierPhase   > juce::MathConstants<float>::twoPi) carrierPhase   -= juce::MathConstants<float>::twoPi;
            if (modulatorPhase > juce::MathConstants<float>::twoPi) modulatorPhase -= juce::MathConstants<float>::twoPi;

            ++ageSamples;
            // Carrier env governs lifetime — when it's done, the voice goes silent.
            if (! carrierEnv.isActive()) active = false;

            return outSample * crA * velocity;
        }

    private:
        double sampleRate { 44100.0 };
        float  carrierPhase { 0.0f }, modulatorPhase { 0.0f };
        float  carrierIncrement { 0.0f }, modulatorIncrement { 0.0f };
        float  modIdxPeak { 8.0f }, modIdxFloor { 1.0f };
        float  velocity { 1.0f };
        juce::ADSR carrierEnv, modEnv;
        bool   active { false };
        size_t ageSamples { 0 };
    };

    // -------------------------------------------------------------------------
    // ThumpVoice — kick: sine sweeping down 4 octaves over 80ms + amp ADSR.
    // Tone.js: MembraneSynth(pitchDecay: 0.08, octaves: 4, env: a:0.001 d:0.5).
    // Mono — one voice, retrigger replaces.
    // -------------------------------------------------------------------------
    class ThumpVoice
    {
    public:
        void prepare (double sr)
        {
            sampleRate = sr;
            adsr.setSampleRate (sr);
            applyEnvelope (0.5f);
            phase = 0.0f;
            pitchPhase = 0.0f;
        }

        // bpm drives an adaptive decay: at 140+ BPM the kick tightens so
        // sequential thumps don't smear into a mud cloud. Clamp at 0.5s
        // so slow-tempo kicks still have weight.
        void trigger (float baseNoteMidi = 36.0f,
                      float vel = 1.0f,
                      double bpm = 120.0)
        {
            const float decay = (bpm > 0.0)
                ? std::min (0.5f, (float) (60.0 / bpm * 0.6))
                : 0.5f;
            applyEnvelope (decay);
            adsr.reset();
            adsr.noteOn();
            velocity = juce::jlimit (0.0f, 1.0f, vel);
            phase = 0.0f;
            pitchPhase = 0.0f;
            startHz = midiToHz (baseNoteMidi + 4.0f * 12.0f); // 4 octaves up
            endHz   = midiToHz (baseNoteMidi);
            pitchDecaySamples = (size_t) (sampleRate * 0.08f);
            samplesIn = 0;
        }

        float renderSample() noexcept
        {
            // Exponential pitch sweep from startHz → endHz over pitchDecaySamples.
            float t = std::min (1.0f, (float) samplesIn / (float) pitchDecaySamples);
            const float hz = startHz * std::pow (endHz / startHz, t);
            const float inc = juce::MathConstants<float>::twoPi * hz / (float) sampleRate;
            phase += inc;
            if (phase > juce::MathConstants<float>::twoPi)
                phase -= juce::MathConstants<float>::twoPi;
            ++samplesIn;
            return std::sin (phase) * adsr.getNextSample() * velocity;
        }

    private:
        void applyEnvelope (float decay)
        {
            juce::ADSR::Parameters env { 0.001f, decay, 0.0f, 0.05f };
            adsr.setParameters (env);
        }

        double sampleRate { 44100.0 };
        juce::ADSR adsr;
        float phase { 0.0f }, pitchPhase { 0.0f };
        float startHz { 1000.0f }, endHz { 65.0f };
        size_t pitchDecaySamples { 3500 };
        size_t samplesIn { 0 };
        float velocity { 1.0f };
    };
}
