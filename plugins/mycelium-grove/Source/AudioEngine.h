#pragma once

#include <juce_audio_basics/juce_audio_basics.h>
#include <juce_dsp/juce_dsp.h>
#include "Voices.h"

namespace mycelium
{
    class AudioEngine
    {
    public:
        AudioEngine();

        void prepare (double sampleRate, int maxBlockSize);

        // Live parameter snapshot (audio-thread reads each block).
        struct ParamSnapshot
        {
            float padLevelDb;
            float pluckLevelDb;
            float thumpLevelDb;
            float lowpassHz;
            float reverbWet;
            float masterDb;
            float widenAmount;     // 0=mono, 0.5=normal stereo, 1=double-width
            float delaySamples;    // 0 = bypass; tempo-synced from BPM × subdivision
            float delayFeedback;   // 0..0.85
            float delayMix;        // 0..1 wet
        };

        // Audio-thread triggers, called by EventQueue::drain.
        void triggerThump (float hue, float velocity = 1.0f, float pan = 0.0f, double bpm = 120.0) noexcept;
        // ratioPreset: 0=Small, 1=Cathedral, 2=Tubular, 3=Bright (see kBellPresets in .cpp).
        void triggerBell  (float pitchHz, float velocity = 0.8f, float pan = 0.0f, int ratioPreset = 1) noexcept;

        // Render N samples into stereo buffer.
        void renderBlock (float* left, float* right, int numSamples,
                          const ParamSnapshot& params) noexcept;

    private:
        static float dbToGain (float db) noexcept { return std::pow (10.0f, db / 20.0f); }

        double sampleRate { 44100.0 };

        std::array<PadVoice, 4> padVoices;
        static constexpr int kBellSlots = 16;
        std::array<FmBellVoice, kBellSlots> bellVoices;
        // Per-bell pan read by renderBlock when mixing into L/R.
        std::array<float, kBellSlots> bellPan {};
        ThumpVoice thump;
        float thumpPan { 0.0f };

        // Lowpass + delay + reverb chain.
        juce::dsp::IIR::Filter<float> lowpassL, lowpassR;
        juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear> delayL, delayR;
        juce::SmoothedValue<float, juce::ValueSmoothingTypes::Linear> delaySmoothed;
        juce::Reverb reverb;     // legacy reverb has the simple processStereo() API we want
        float currentLowpassHz { -1.0f }; // tracks last-applied cutoff so we only update coeffs on change

        static constexpr int kDelayMaxSamples = 192000;  // ~2s at 96 kHz
    };
}
