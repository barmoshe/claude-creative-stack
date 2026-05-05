#pragma once

#include <cmath>
#include <cstdint>

namespace mycelium
{
    // PPQ = quarter notes elapsed (JUCE 8 PositionInfo::getPpqPosition() unit).
    // 1/4 note = 1.0 ppq; 1/8 = 0.5; 1/16 = 0.25; 1/8 triplet = 1/3.
    enum class Quantize : int
    {
        Off  = 0,
        _16  = 1,
        _8   = 2,
        _8T  = 3,
        _4   = 4
    };

    inline double quantizeStepPpq (Quantize q) noexcept
    {
        switch (q)
        {
            case Quantize::Off: return 0.0;
            case Quantize::_16: return 0.25;
            case Quantize::_8:  return 0.5;
            case Quantize::_8T: return 1.0 / 3.0;
            case Quantize::_4:  return 1.0;
        }
        return 0.0;
    }

    // Snap-to-current-or-next grid: returns the smallest grid ppq >= ppqStart,
    // tolerating ~1ns of FP drift so a click landing on the beat fires on it.
    inline double nextGridPpq (double ppqStart, double step) noexcept
    {
        constexpr double eps = 1.0e-9;
        if (step <= 0.0) return ppqStart;
        const double n = std::ceil ((ppqStart - eps) / step);
        return n * step;
    }

    inline double quartersPerSample (double bpm, double sampleRate) noexcept
    {
        return (bpm > 0.0 && sampleRate > 0.0) ? (bpm / (60.0 * sampleRate)) : 0.0;
    }
}
