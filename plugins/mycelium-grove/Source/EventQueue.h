#pragma once

#include <atomic>
#include <cstdint>

namespace mycelium
{
    // Lock-free SPSC queue for handing JS-side events to the audio thread.
    // The audio thread drains it and triggers voices in AudioEngine.
    //
    // Event is a trivially-copyable POD: never put juce::var or juce::String
    // into the ring (both heap-allocate). The bridge converts var -> POD at
    // the native-function boundary; the ring only sees the POD.
    class EventQueue
    {
    public:
        enum class Kind : uint8_t { Spore = 0, Bond = 1 };

        struct Event
        {
            Kind    kind;
            uint8_t voiceTag;   // reserved for future per-voice routing
            float   hueA;       // spore hue, or tree A's hue for a bond
            float   hueB;       // bond only
            float   pitchHz;    // pre-computed by caller for a Bond
            float   velocity;   // 0..1, drives voice gain
            float   pan;        // -1..+1, drives stereo placement
            double  targetPpq;  // filled by audio thread when transferring SPSC -> pending
        };

        EventQueue() = default;

        // Called from message thread (WebView native-fn callbacks). Lock-free.
        void pushSpore (float hue, float velocity = 0.9f, float pan = 0.0f) noexcept
        {
            const int w = writeIdx.load (std::memory_order_relaxed);
            const int next = (w + 1) % kSlots;
            if (next == readIdx.load (std::memory_order_acquire)) return;  // full → drop
            queue[w] = { Kind::Spore, 0, hue, 0.0f, 0.0f, velocity, pan, 0.0 };
            writeIdx.store (next, std::memory_order_release);
        }

        void pushBond (float hueA, float hueB, float pitchHz,
                       float velocity = 0.7f, float pan = 0.0f) noexcept
        {
            const int w = writeIdx.load (std::memory_order_relaxed);
            const int next = (w + 1) % kSlots;
            if (next == readIdx.load (std::memory_order_acquire)) return;
            queue[w] = { Kind::Bond, 0, hueA, hueB, pitchHz, velocity, pan, 0.0 };
            writeIdx.store (next, std::memory_order_release);
        }

        // Audio thread: drain everything pending. Visitor is invoked on each event.
        template <typename Visitor>
        void drain (Visitor&& visit) noexcept
        {
            while (readIdx.load (std::memory_order_acquire) != writeIdx.load (std::memory_order_acquire))
            {
                const int r = readIdx.load (std::memory_order_relaxed);
                visit (queue[r]);
                readIdx.store ((r + 1) % kSlots, std::memory_order_release);
            }
        }

    private:
        static constexpr int kSlots = 256;
        std::atomic<int> writeIdx { 0 };
        std::atomic<int> readIdx  { 0 };
        Event queue[kSlots] {};
    };
}
