#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "Quantizer.h"
#include "EventQueue.h"
#include "GraphSim.h"

class SpriteSynthProcessor : public juce::AudioProcessor
{
public:
    SpriteSynthProcessor();
    ~SpriteSynthProcessor() override = default;

    void prepareToPlay (double sampleRate, int samplesPerBlock) override;
    void releaseResources() override {}
    bool isBusesLayoutSupported (const BusesLayout&) const override { return true; }

    void processBlock (juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override { return true; }

    const juce::String getName() const override     { return "SpriteSynth"; }
    bool acceptsMidi() const override               { return true; }   // declared but ignored; Ableton needs the input port
    bool producesMidi() const override              { return true; }   // the whole point
    bool isMidiEffect() const override              { return false; }
    double getTailLengthSeconds() const override    { return 0.0; }

    int  getNumPrograms() override                  { return 1; }
    int  getCurrentProgram() override               { return 0; }
    void setCurrentProgram (int) override           {}
    const juce::String getProgramName (int) override { return "Init"; }
    void changeProgramName (int, const juce::String&) override {}

    void getStateInformation (juce::MemoryBlock& destData) override;
    void setStateInformation (const void* data, int sizeInBytes) override;

    juce::AudioProcessorValueTreeState& getApvts() noexcept { return apvts; }
    spritesynth::EventQueue&            getQueue() noexcept { return queue; }

private:
    static juce::AudioProcessorValueTreeState::ParameterLayout makeLayout();

    juce::AudioProcessorValueTreeState apvts;
    spritesynth::EventQueue            queue;
    spritesynth::GraphSim              graph;

    double currentSampleRate { 44100.0 };
    bool   wasPlaying        { false };
    double internalPpq       { 0.0 };
    std::vector<spritesynth::GraphSim::FiredNote> firedScratch;   // reused per block

    // Pending note-offs scheduled for future blocks.
    struct PendingOff { uint8_t note; uint8_t channel; uint64_t releaseSample; };
    static constexpr int kMaxPending = 32;
    PendingOff pendingOffs[kMaxPending] {};
    int        pendingOffsCount { 0 };
    uint64_t   blockSampleCounter { 0 };

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (SpriteSynthProcessor)
};
