#include "PluginProcessor.h"
#include "PluginEditor.h"

namespace ids
{
    constexpr auto internalSound = "internalSound";
    constexpr auto scale         = "scale";
    constexpr auto root          = "root";
    constexpr auto octave        = "octave";
}

juce::AudioProcessorValueTreeState::ParameterLayout
SpriteSynthProcessor::makeLayout()
{
    using namespace juce;
    AudioProcessorValueTreeState::ParameterLayout layout;

    layout.add (std::make_unique<AudioParameterBool>  (ParameterID { ids::internalSound, 1 }, "Internal Sound", false));
    layout.add (std::make_unique<AudioParameterChoice>(ParameterID { ids::scale,         1 }, "Scale",
                                                       StringArray { "Pent Maj", "Pent Min", "Dorian",
                                                                     "Phrygian", "Lydian", "Major",
                                                                     "Minor", "Chromatic" }, 0));
    layout.add (std::make_unique<AudioParameterChoice>(ParameterID { ids::root,          1 }, "Root",
                                                       StringArray { "C", "C#", "D", "D#", "E", "F",
                                                                     "F#", "G", "G#", "A", "A#", "B" }, 0));
    layout.add (std::make_unique<AudioParameterInt>   (ParameterID { ids::octave,        1 }, "Octave", 2, 6, 4));

    return layout;
}

SpriteSynthProcessor::SpriteSynthProcessor()
    : AudioProcessor (BusesProperties()
                          .withOutput ("Output", juce::AudioChannelSet::stereo(), true)),
      apvts (*this, nullptr, "SpriteSynth", makeLayout())
{
    static auto logFile = juce::File ("/tmp/spritesynth.log");
    static juce::FileLogger fileLogger (logFile, "SpriteSynth session start", 0);
    juce::Logger::setCurrentLogger (&fileLogger);
    juce::Logger::writeToLog ("[ctor] processor constructed (creature graph on audio thread)");

    firedScratch.reserve (128);
}

void SpriteSynthProcessor::prepareToPlay (double sampleRate, int /*samplesPerBlock*/)
{
    currentSampleRate  = sampleRate;
    wasPlaying         = false;
    internalPpq        = 0.0;
    pendingOffsCount   = 0;
    blockSampleCounter = 0;
    juce::Logger::writeToLog ("[prepare] sr=" + juce::String (sampleRate));
}

void SpriteSynthProcessor::processBlock (juce::AudioBuffer<float>& buffer,
                                         juce::MidiBuffer& midi)
{
    juce::ScopedNoDenormals noDenormals;
    midi.clear();
    buffer.clear();

    const int numSamples = buffer.getNumSamples();

    // ---- Read host transport ----
    double bpm       = 120.0;
    bool   isPlaying = false;
    double ppqStart  = internalPpq;
    bool   haveHost  = false;

    if (auto* ph = getPlayHead())
        if (auto pos = ph->getPosition())
        {
            haveHost = true;
            if (auto b = pos->getBpm())         bpm      = *b;
            if (auto q = pos->getPpqPosition()) ppqStart = *q;
            isPlaying = pos->getIsPlaying();
        }

    if (! haveHost) isPlaying = true;

    const double qps        = spritesynth::quartersPerSample (bpm, currentSampleRate);
    const double ppqEnd     = ppqStart + (double) numSamples * qps;
    const double beatsBlock = ppqEnd - ppqStart;

    auto load = [this] (const char* id) { return apvts.getRawParameterValue (id)->load(); };
    const int rootPc = (int) load (ids::root);
    const int oct    = (int) load (ids::octave);
    const int scIdx  = (int) load (ids::scale);

    // ---- Drain command queue → mutate graph (audio-thread side) ----
    queue.drain ([this, &midi] (const spritesynth::EventQueue::Event& ev)
    {
        using K = spritesynth::EventQueue::Kind;
        switch (ev.kind)
        {
            case K::AddNode:     graph.addNode (ev.iA, ev.iB, ev.fA, ev.fB, ev.fC); break;
            case K::AddBond:     graph.addBond (ev.iA, ev.iB);                      break;
            case K::AddCreature: graph.addCreature (ev.iA, ev.channel, ev.fA);      break;
            case K::Reset:       graph.reset(); pendingOffsCount = 0;               break;
            case K::DirectNote:
            {
                // Legacy: fire a noteOn at sampleOffset 0 + queue noteOff.
                // (Used only if some old client still calls fireNote.)
                midi.addEvent (juce::MidiMessage::noteOn ((int) ev.channel, ev.iA, (juce::uint8) ev.iB), 0);
                const auto gateSamples = (uint64_t) (ev.fA * currentSampleRate);
                const uint64_t releaseSample = blockSampleCounter + gateSamples;
                if (pendingOffsCount < kMaxPending)
                    pendingOffs[pendingOffsCount++] = { (uint8_t) ev.iA, ev.channel, releaseSample };
                break;
            }
        }
    });

    // ---- Emit pending note-offs that fall in this block ----
    int outIdx = 0;
    for (int i = 0; i < pendingOffsCount; ++i)
    {
        const auto& po = pendingOffs[i];
        if (po.releaseSample < blockSampleCounter + (uint64_t) numSamples
            && po.releaseSample >= blockSampleCounter)
        {
            const int offset = (int) (po.releaseSample - blockSampleCounter);
            midi.addEvent (juce::MidiMessage::noteOff (po.channel, po.note),
                           juce::jlimit (0, numSamples - 1, offset));
        }
        else if (po.releaseSample >= blockSampleCounter + (uint64_t) numSamples)
        {
            pendingOffs[outIdx++] = po;
        }
    }
    pendingOffsCount = outIdx;

    // ---- Advance creatures and schedule fired notes ----
    if (isPlaying && beatsBlock > 0.0)
    {
        firedScratch.clear();
        graph.advance (beatsBlock, rootPc, oct, scIdx, firedScratch);

        for (const auto& fn : firedScratch)
        {
            // Fraction of block where the step landed
            const double frac = beatsBlock > 0.0 ? juce::jlimit (0.0, 1.0, fn.beatOffsetInBlock / beatsBlock) : 0.0;
            const int onSample = juce::jlimit (0, numSamples - 1, (int) (frac * numSamples));
            midi.addEvent (juce::MidiMessage::noteOn ((int) fn.channel, (int) fn.pitch, fn.velocity), onSample);

            const auto gateSamples = (uint64_t) (fn.gateSeconds * currentSampleRate);
            const uint64_t releaseSample = blockSampleCounter + (uint64_t) onSample + gateSamples;

            if (releaseSample < blockSampleCounter + (uint64_t) numSamples)
            {
                const int offSample = (int) (releaseSample - blockSampleCounter);
                midi.addEvent (juce::MidiMessage::noteOff ((int) fn.channel, (int) fn.pitch),
                               juce::jlimit (0, numSamples - 1, offSample));
            }
            else if (pendingOffsCount < kMaxPending)
            {
                pendingOffs[pendingOffsCount++] = { fn.pitch, fn.channel, releaseSample };
            }
        }
    }

    // ---- Advance internal clock + transport state ----
    if (! haveHost) internalPpq = ppqEnd;
    blockSampleCounter += (uint64_t) numSamples;
    wasPlaying = isPlaying;
}

juce::AudioProcessorEditor* SpriteSynthProcessor::createEditor()
{
    return new SpriteSynthEditor (*this);
}

void SpriteSynthProcessor::getStateInformation (juce::MemoryBlock& destData)
{
    auto state = apvts.copyState();
    if (auto xml = state.createXml())
        copyXmlToBinary (*xml, destData);
}

void SpriteSynthProcessor::setStateInformation (const void* data, int sizeInBytes)
{
    if (auto xml = getXmlFromBinary (data, sizeInBytes))
        if (xml->hasTagName (apvts.state.getType()))
            apvts.replaceState (juce::ValueTree::fromXml (*xml));
}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new SpriteSynthProcessor();
}
