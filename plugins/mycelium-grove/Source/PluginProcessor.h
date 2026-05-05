#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include "AudioEngine.h"
#include "EventQueue.h"
#include "Quantizer.h"

class MyceliumGroveProcessor : public juce::AudioProcessor
{
public:
    MyceliumGroveProcessor();
    ~MyceliumGroveProcessor() override = default;

    void prepareToPlay (double sampleRate, int samplesPerBlock) override;
    void releaseResources() override {}
    bool isBusesLayoutSupported (const BusesLayout&) const override { return true; }

    void processBlock (juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override { return true; }

    const juce::String getName() const override { return "Mycelium Grove"; }
    bool   acceptsMidi() const override                { return true; }   // declared so Ableton sees a MIDI input port; we ignore the events
    bool   producesMidi() const override               { return false; }
    bool   isMidiEffect() const override               { return false; }
    double getTailLengthSeconds() const override       { return 14.0; } // matches reverb decay

    int  getNumPrograms() override;
    int  getCurrentProgram() override;
    void setCurrentProgram (int) override;
    const juce::String getProgramName (int) override;
    void changeProgramName (int, const juce::String&) override {}

    void getStateInformation (juce::MemoryBlock& destData) override;
    void setStateInformation (const void* data, int sizeInBytes) override;

    juce::AudioProcessorValueTreeState& getApvts() noexcept { return apvts; }
    mycelium::EventQueue&               getQueue() noexcept { return queue; }

private:
    static juce::AudioProcessorValueTreeState::ParameterLayout makeLayout();

    juce::AudioProcessorValueTreeState apvts;
    mycelium::EventQueue               queue;
    mycelium::AudioEngine              engine;
    int                                currentProgram { 0 };

    // Transport state for tempo sync.
    static constexpr int                 kPending = 32;
    mycelium::EventQueue::Event          pending[kPending] {};
    int                                  pendingCount { 0 };
    bool                                 wasPlaying { false };
    double                               internalPpq { 0.0 };  // standalone fallback clock
    double                               currentSampleRate { 44100.0 };

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (MyceliumGroveProcessor)
};
