#include "PluginProcessor.h"
#include "PluginEditor.h"
#include "Presets.h"
#include "ScaleTables.h"

namespace ids
{
    constexpr auto rainOn       = "rainOn";
    constexpr auto rainRate     = "rainRate";
    constexpr auto bondRadius   = "bondRadius";
    constexpr auto branchProb   = "branchProb";
    constexpr auto scale        = "scale";
    constexpr auto root         = "root";
    constexpr auto octave       = "octave";
    constexpr auto masterGain   = "masterGain";
    constexpr auto reverbWet    = "reverbWet";
    constexpr auto lowpassHz    = "lowpassHz";
    constexpr auto padLevel     = "padLevel";
    constexpr auto pluckLevel   = "pluckLevel";
    constexpr auto thumpLevel   = "thumpLevel";
    constexpr auto freezeOnStop = "freezeOnStop";
    constexpr auto quantize     = "quantize";
    constexpr auto humanize     = "humanize";
    constexpr auto swing        = "swing";
    constexpr auto widenAmount  = "widenAmount";
    constexpr auto bellRatio    = "bellRatio";
    constexpr auto delayTime    = "delayTime";
    constexpr auto delayFb      = "delayFb";
    constexpr auto delayMix     = "delayMix";
}

juce::AudioProcessorValueTreeState::ParameterLayout
MyceliumGroveProcessor::makeLayout()
{
    using namespace juce;
    AudioProcessorValueTreeState::ParameterLayout layout;

    layout.add (std::make_unique<AudioParameterBool>  (ParameterID { ids::rainOn,     1 }, "Spore Rain", false));
    layout.add (std::make_unique<AudioParameterFloat> (ParameterID { ids::rainRate,   1 }, "Rain Rate (Hz)",
                                                       NormalisableRange<float> (0.1f, 4.0f, 0.01f, 0.6f), 1.4f));
    layout.add (std::make_unique<AudioParameterInt>   (ParameterID { ids::bondRadius, 1 }, "Bond Radius (px)", 8, 60, 22));
    layout.add (std::make_unique<AudioParameterFloat> (ParameterID { ids::branchProb, 1 }, "Branch Probability",
                                                       NormalisableRange<float> (0.0f, 0.5f, 0.005f), 0.16f));
    layout.add (std::make_unique<AudioParameterChoice>(ParameterID { ids::scale,      1 }, "Scale",
                                                       StringArray { "Pent Maj", "Pent Min", "Dorian",
                                                                     "Phrygian", "Lydian", "Major",
                                                                     "Minor", "Chromatic" }, 0));
    layout.add (std::make_unique<AudioParameterChoice>(ParameterID { ids::root,       1 }, "Root",
                                                       StringArray { "C", "C#", "D", "D#", "E", "F",
                                                                     "F#", "G", "G#", "A", "A#", "B" }, 0));
    layout.add (std::make_unique<AudioParameterInt>   (ParameterID { ids::octave,     1 }, "Octave", 1, 6, 4));

    layout.add (std::make_unique<AudioParameterFloat> (ParameterID { ids::masterGain, 1 }, "Master (dB)",
                                                       NormalisableRange<float> (-60.0f, 0.0f, 0.1f), -12.0f));
    layout.add (std::make_unique<AudioParameterFloat> (ParameterID { ids::reverbWet,  1 }, "Reverb Wet",
                                                       NormalisableRange<float> (0.0f, 1.0f, 0.005f), 0.55f));
    layout.add (std::make_unique<AudioParameterFloat> (ParameterID { ids::lowpassHz,  1 }, "Lowpass (Hz)",
                                                       NormalisableRange<float> (200.0f, 12000.0f, 1.0f, 0.4f), 2200.0f));
    layout.add (std::make_unique<AudioParameterFloat> (ParameterID { ids::padLevel,   1 }, "Pad (dB)",
                                                       NormalisableRange<float> (-60.0f, 0.0f, 0.1f), -28.0f));
    layout.add (std::make_unique<AudioParameterFloat> (ParameterID { ids::pluckLevel, 1 }, "Pluck (dB)",
                                                       NormalisableRange<float> (-60.0f, 6.0f, 0.1f), -22.0f));
    layout.add (std::make_unique<AudioParameterFloat> (ParameterID { ids::thumpLevel, 1 }, "Thump (dB)",
                                                       NormalisableRange<float> (-60.0f, 6.0f, 0.1f), -16.0f));

    layout.add (std::make_unique<AudioParameterBool>  (ParameterID { ids::freezeOnStop, 1 }, "Freeze On Stop", false));

    // Tempo sync — Off, 1/16, 1/8, 1/8T, 1/4. Default 1/16: musical lock without
    // feeling sloppy. Reads host PositionInfo each block and defers click-driven
    // events to the next grid point.
    layout.add (std::make_unique<AudioParameterChoice>(ParameterID { ids::quantize,    1 }, "Quantize",
                                                       StringArray { "Off", "1/16", "1/8", "1/8T", "1/4" }, 1));

    // Humanize: random ±jitter per fired event, scaled by the grid step. 0 = robotic.
    layout.add (std::make_unique<AudioParameterFloat> (ParameterID { ids::humanize,    1 }, "Humanize",
                                                       NormalisableRange<float> (0.0f, 1.0f, 0.005f), 0.0f));
    // Swing: pushes odd grid slots later (Akai MPC convention). 0.5 = no swing.
    layout.add (std::make_unique<AudioParameterFloat> (ParameterID { ids::swing,       1 }, "Swing",
                                                       NormalisableRange<float> (0.5f, 0.75f, 0.005f), 0.5f));
    // Stereo width: 0 = mono, 0.5 = normal, 1 = double width (M/S after reverb).
    layout.add (std::make_unique<AudioParameterFloat> (ParameterID { ids::widenAmount, 1 }, "Width",
                                                       NormalisableRange<float> (0.0f, 1.0f, 0.005f), 0.5f));

    // FM bell timbre — selects the C:M ratio + envelope preset for new strikes.
    layout.add (std::make_unique<AudioParameterChoice>(ParameterID { ids::bellRatio,   1 }, "Bell Timbre",
                                                       StringArray { "Small", "Cathedral", "Tubular", "Bright" }, 1));

    // Tempo-synced delay. delayTime as a subdivision; samples computed each block from BPM.
    layout.add (std::make_unique<AudioParameterChoice>(ParameterID { ids::delayTime,   1 }, "Delay Time",
                                                       StringArray { "Off", "1/16", "1/8", "1/8d", "1/4" }, 0));
    layout.add (std::make_unique<AudioParameterFloat> (ParameterID { ids::delayFb,     1 }, "Delay Feedback",
                                                       NormalisableRange<float> (0.0f, 0.85f, 0.005f), 0.4f));
    layout.add (std::make_unique<AudioParameterFloat> (ParameterID { ids::delayMix,    1 }, "Delay Mix",
                                                       NormalisableRange<float> (0.0f, 1.0f, 0.005f), 0.3f));

    return layout;
}

MyceliumGroveProcessor::MyceliumGroveProcessor()
    : AudioProcessor (BusesProperties()
                          .withOutput ("Output", juce::AudioChannelSet::stereo(), true)),
      apvts (*this, nullptr, "MyceliumGrove", makeLayout())
{
    static auto logFile = juce::File ("/tmp/mycelium-grove.log");
    static juce::FileLogger fileLogger (logFile, "Mycelium Grove session start", 0);
    juce::Logger::setCurrentLogger (&fileLogger);
    juce::Logger::writeToLog ("[ctor] processor constructed (synth mode)");
}

void MyceliumGroveProcessor::prepareToPlay (double sampleRate, int samplesPerBlock)
{
    engine.prepare (sampleRate, samplesPerBlock);
    currentSampleRate = sampleRate;
    pendingCount = 0;
    wasPlaying = false;
    internalPpq = 0.0;
    juce::Logger::writeToLog ("[prepare] sr=" + juce::String (sampleRate)
                              + " block=" + juce::String (samplesPerBlock));
}

void MyceliumGroveProcessor::processBlock (juce::AudioBuffer<float>& buffer,
                                           juce::MidiBuffer& midi)
{
    juce::ScopedNoDenormals noDenormals;
    midi.clear(); // we are a synth — no MIDI flows through

    const int numSamples = buffer.getNumSamples();
    auto load = [this] (const char* id) { return apvts.getRawParameterValue (id)->load(); };

    const int rootPc       = (int) load (ids::root);
    const int octave       = (int) load (ids::octave);
    const int scaleId      = (int) load (ids::scale);
    const int bellRatioIdx = (int) load (ids::bellRatio);

    // ---- Read host transport (or fall back to internal clock for standalone) ----
    double bpm        = 120.0;
    bool   isPlaying  = false;
    double ppqStart   = internalPpq;
    bool   haveHost   = false;

    if (auto* ph = getPlayHead())
        if (auto pos = ph->getPosition())
        {
            haveHost = true;
            if (auto b = pos->getBpm())         bpm      = *b;
            if (auto q = pos->getPpqPosition()) ppqStart = *q;
            isPlaying = pos->getIsPlaying();   // returns plain bool, not Optional
        }

    if (! haveHost)
    {
        // Standalone: pretend the transport is always running so quantize still works.
        isPlaying = true;
    }

    const auto qParam       = static_cast<mycelium::Quantize> ((int) load (ids::quantize));
    const double step       = mycelium::quantizeStepPpq (qParam);
    const double qps        = mycelium::quartersPerSample (bpm, currentSampleRate);
    const double ppqEnd     = ppqStart + (double) numSamples * qps;
    const bool   gridActive = (qParam != mycelium::Quantize::Off) && isPlaying && step > 0.0;
    const float  humanize01 = load (ids::humanize);
    const float  swing01    = load (ids::swing);

    // ---- Drain SPSC into the audio-thread pending ring ----
    // Compute targetPpq once per event so swing/humanize are stable across blocks.
    queue.drain ([&] (const mycelium::EventQueue::Event& evIn)
    {
        if (pendingCount >= kPending) return;
        mycelium::EventQueue::Event ev = evIn;

        if (gridActive)
        {
            const double base = mycelium::nextGridPpq (ppqStart, step);
            // Swing: shift every odd grid slot (1st, 3rd, …) later by
            // (swing − 0.5) × step.
            const long slotIdx = (long) std::llround (base / step);
            double offset = 0.0;
            if (slotIdx & 1)
                offset += ((double) swing01 - 0.5) * step;
            // Humanize: ±humanize × step × 0.15 jitter.
            if (humanize01 > 0.0f)
            {
                const float r = juce::Random::getSystemRandom().nextFloat() * 2.0f - 1.0f;
                offset += (double) (r * humanize01 * 0.15f) * step;
            }
            ev.targetPpq = base + offset;
        }
        else
        {
            ev.targetPpq = ppqStart;  // fire immediately, no grid
        }

        pending[pendingCount++] = ev;
    });

    // Falling-edge transport stop is handled implicitly: isPlaying=false flips
    // gridActive to false above, all newly-drained events get targetPpq=ppqStart
    // and fire this block. Already-pending events with future targetPpq remain;
    // when transport resumes, ppqEnd advances past them and they fire.

    // ---- Decide which pending events fire this block ----
    auto trigger = [&] (const mycelium::EventQueue::Event& ev)
    {
        if (ev.kind == mycelium::EventQueue::Kind::Spore)
        {
            engine.triggerThump (ev.hueA, ev.velocity, ev.pan, bpm);
        }
        else
        {
            // Recompute pitch here so live root/octave/scale changes apply.
            const float avgHue = 0.5f * (ev.hueA + ev.hueB);
            const int   note   = mycelium::hueToMidi (avgHue, rootPc, octave,
                                                      static_cast<mycelium::Scale> (scaleId));
            engine.triggerBell (mycelium::midiToHz ((float) note), ev.velocity, ev.pan, bellRatioIdx);
        }
    };

    int outIdx = 0;
    for (int i = 0; i < pendingCount; ++i)
    {
        if (pending[i].targetPpq < ppqEnd)
            trigger (pending[i]);
        else
            pending[outIdx++] = pending[i];
    }
    pendingCount = outIdx;

    // ---- Advance internal clock (used when no host) and remember transport state ----
    if (! haveHost)
        internalPpq = ppqEnd;
    wasPlaying = isPlaying;

    // Render audio.
    mycelium::AudioEngine::ParamSnapshot snap;
    snap.padLevelDb   = load (ids::padLevel);
    snap.pluckLevelDb = load (ids::pluckLevel);   // doubles as bell bus level
    snap.thumpLevelDb = load (ids::thumpLevel);
    snap.lowpassHz    = load (ids::lowpassHz);
    snap.reverbWet    = load (ids::reverbWet);
    snap.masterDb     = load (ids::masterGain);
    snap.widenAmount  = load (ids::widenAmount);

    // Tempo-synced delay: pick subdivision in quarters, convert to samples via BPM.
    const int delayIdx = (int) load (ids::delayTime);
    static constexpr double kDelayQuarters[] = { 0.0, 0.25, 0.5, 0.75, 1.0 };
    const double dQuarters    = kDelayQuarters[juce::jlimit (0, 4, delayIdx)];
    const double secsPerQ     = (bpm > 0.0) ? (60.0 / bpm) : 0.5;
    const double rawSamples   = dQuarters * secsPerQ * currentSampleRate;
    snap.delaySamples  = (delayIdx == 0) ? 0.0f : (float) juce::jmin (rawSamples, 191000.0);
    snap.delayFeedback = load (ids::delayFb);
    snap.delayMix      = load (ids::delayMix);

    if (buffer.getNumChannels() < 2)
    {
        buffer.clear();
        return;
    }
    engine.renderBlock (buffer.getWritePointer (0),
                        buffer.getWritePointer (1),
                        numSamples, snap);
}

juce::AudioProcessorEditor* MyceliumGroveProcessor::createEditor()
{
    return new MyceliumGroveEditor (*this);
}

void MyceliumGroveProcessor::getStateInformation (juce::MemoryBlock& destData)
{
    auto state = apvts.copyState();
    if (auto xml = state.createXml())
        copyXmlToBinary (*xml, destData);
}

void MyceliumGroveProcessor::setStateInformation (const void* data, int sizeInBytes)
{
    if (auto xml = getXmlFromBinary (data, sizeInBytes))
        if (xml->hasTagName (apvts.state.getType()))
            apvts.replaceState (juce::ValueTree::fromXml (*xml));
}

int MyceliumGroveProcessor::getNumPrograms()        { return mycelium::getNumPresets(); }
int MyceliumGroveProcessor::getCurrentProgram()     { return currentProgram; }

void MyceliumGroveProcessor::setCurrentProgram (int idx)
{
    currentProgram = juce::jlimit (0, mycelium::getNumPresets() - 1, idx);
    mycelium::applyPreset (apvts, currentProgram);
}

const juce::String MyceliumGroveProcessor::getProgramName (int idx)
{
    return mycelium::getPreset (idx).name;
}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new MyceliumGroveProcessor();
}
