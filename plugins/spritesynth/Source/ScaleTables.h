#pragma once

#include <array>
#include <cstdint>

namespace spritesynth
{
    enum class Scale : int
    {
        PentMaj  = 0,
        PentMin  = 1,
        Dorian   = 2,
        Phrygian = 3,
        Lydian   = 4,
        Major    = 5,
        Minor    = 6,
        Chromatic = 7,
    };

    // Each table is a list of semitone offsets from the root.
    // Bond hue 0..360 maps onto stepIdx = floor((hue/360) * length).
    struct ScaleSet
    {
        const int* steps;
        int length;
    };

    inline ScaleSet getScale (Scale s) noexcept
    {
        static constexpr int pentMaj[]  = { 0, 2, 4, 7, 9 };
        static constexpr int pentMin[]  = { 0, 3, 5, 7, 10 };
        static constexpr int dorian[]   = { 0, 2, 3, 5, 7, 9, 10 };
        static constexpr int phrygian[] = { 0, 1, 3, 5, 7, 8, 10 };
        static constexpr int lydian[]   = { 0, 2, 4, 6, 7, 9, 11 };
        static constexpr int major[]    = { 0, 2, 4, 5, 7, 9, 11 };
        static constexpr int minor[]    = { 0, 2, 3, 5, 7, 8, 10 };
        static constexpr int chromatic[] = { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 };

        switch (s)
        {
            case Scale::PentMaj:   return { pentMaj,   5 };
            case Scale::PentMin:   return { pentMin,   5 };
            case Scale::Dorian:    return { dorian,    7 };
            case Scale::Phrygian:  return { phrygian,  7 };
            case Scale::Lydian:    return { lydian,    7 };
            case Scale::Major:     return { major,     7 };
            case Scale::Minor:     return { minor,     7 };
            case Scale::Chromatic: return { chromatic, 12 };
            default:               return { pentMaj,   5 };
        }
    }

    // Map hue (0..360) → MIDI note number, given root (0..11), octave (1..6),
    // and the active scale.  Wraps the scale step into the chosen octave.
    inline int hueToMidi (float hue, int rootPc, int octave, Scale s) noexcept
    {
        const auto sc = getScale (s);
        const float normHue = hue - 360.0f * std::floor (hue / 360.0f);
        int idx = (int) std::floor ((normHue / 360.0f) * (float) sc.length);
        if (idx < 0) idx = 0;
        if (idx >= sc.length) idx = sc.length - 1;
        const int pitch = (octave * 12) + rootPc + sc.steps[idx];
        return pitch < 0 ? 0 : (pitch > 127 ? 127 : pitch);
    }
}
