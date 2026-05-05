#pragma once

#include <juce_core/juce_core.h>
#include <juce_audio_processors/juce_audio_processors.h>

namespace mycelium
{
    struct Preset
    {
        const char* name;
        bool   rainOn;
        float  rainRate;
        int    bondRadius;
        float  branchProb;
        int    scale;       // see ScaleTables.h enum
        int    root;        // 0..11
        int    octave;      // 1..6
        float  masterGain;
        float  reverbWet;
        float  lowpassHz;
        float  padLevel;
        float  pluckLevel;
        float  thumpLevel;
        bool   freezeOnStop;
    };

    inline const Preset& getPreset (int idx) noexcept
    {
        static const Preset presets[] =
        {
            // name              rain  rate  bondR  branch  scale root oct  master rev  cutoff   pad    pluck  thump  freeze
            { "Sparse Grove",    true,  0.6f,  36,   0.10f,  0,    0,   4,  -3.0f, 0.7f,  4000.0f, -28.0f,  -8.0f, -16.0f, false },
            { "Dense Drizzle",   true,  2.4f,  14,   0.32f,  1,    9,   3,  -3.0f, 0.4f,  1500.0f, -32.0f,  -10.0f,-14.0f, false },
            { "Cathedral Bonds", false, 1.0f,  52,   0.08f,  4,    0,   5,  -2.0f, 0.9f,  3200.0f, -18.0f,  -6.0f, -18.0f, false },
        };
        const int n = (int) (sizeof (presets) / sizeof (presets[0]));
        return presets[juce::jlimit (0, n - 1, idx)];
    }

    inline int getNumPresets() noexcept { return 3; }

    inline void applyPreset (juce::AudioProcessorValueTreeState& apvts, int idx)
    {
        const auto& p = getPreset (idx);
        auto set = [&] (const char* id, float value)
        {
            if (auto* param = apvts.getParameter (id))
                param->setValueNotifyingHost (param->convertTo0to1 (value));
        };
        set ("rainOn",       p.rainOn ? 1.0f : 0.0f);
        set ("rainRate",     p.rainRate);
        set ("bondRadius",   (float) p.bondRadius);
        set ("branchProb",   p.branchProb);
        set ("scale",        (float) p.scale);
        set ("root",         (float) p.root);
        set ("octave",       (float) p.octave);
        set ("masterGain",   p.masterGain);
        set ("reverbWet",    p.reverbWet);
        set ("lowpassHz",    p.lowpassHz);
        set ("padLevel",     p.padLevel);
        set ("pluckLevel",   p.pluckLevel);
        set ("thumpLevel",   p.thumpLevel);
        set ("freezeOnStop", p.freezeOnStop ? 1.0f : 0.0f);
    }
}
