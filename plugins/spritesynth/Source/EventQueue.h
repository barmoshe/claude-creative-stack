#pragma once

#include <atomic>
#include <cstdint>

namespace spritesynth
{
    // Lock-free SPSC queue for handing message-thread events to the audio thread.
    // Tagged-union POD payload — never push juce::var/String through this ring.
    class EventQueue
    {
    public:
        enum class Kind : uint8_t
        {
            AddNode      = 0,
            AddBond      = 1,
            AddCreature  = 2,
            Reset        = 3,
            DirectNote   = 4,   // legacy: fire a note immediately (kept for debug)
        };

        struct Event
        {
            Kind     kind;
            uint8_t  pad0;
            uint8_t  channel;
            uint8_t  pad1;
            int32_t  iA;        // node-add: parent (-1=root). bond: nodeA. creature: rootNodeIdx. directNote: pitch.
            int32_t  iB;        // node-add: treeId.            bond: nodeB. creature: --.            directNote: velocity.
            float    fA;        // node-add: x.                                 creature: beatsPerStep.  directNote: gateSec.
            float    fB;        // node-add: y.
            float    fC;        // node-add: hue.
        };

        EventQueue() = default;

        void pushAddNode (int parentIdx, int treeId, float x, float y, float hue) noexcept
        {
            push ({ Kind::AddNode, 0, 0, 0, parentIdx, treeId, x, y, hue });
        }
        void pushAddBond (int aIdx, int bIdx) noexcept
        {
            push ({ Kind::AddBond, 0, 0, 0, aIdx, bIdx, 0, 0, 0 });
        }
        void pushAddCreature (int rootNodeIdx, uint8_t channel, float beatsPerStep) noexcept
        {
            push ({ Kind::AddCreature, 0, channel, 0, rootNodeIdx, 0, beatsPerStep, 0, 0 });
        }
        void pushReset() noexcept
        {
            push ({ Kind::Reset, 0, 0, 0, 0, 0, 0, 0, 0 });
        }
        void pushDirectNote (uint8_t pitch, uint8_t velocity, uint8_t channel, float gateSec) noexcept
        {
            push ({ Kind::DirectNote, 0, channel, 0, (int) pitch, (int) velocity, gateSec, 0, 0 });
        }

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
        void push (const Event& ev) noexcept
        {
            const int w = writeIdx.load (std::memory_order_relaxed);
            const int next = (w + 1) % kSlots;
            if (next == readIdx.load (std::memory_order_acquire)) return;  // full → drop
            queue[w] = ev;
            writeIdx.store (next, std::memory_order_release);
        }

        static constexpr int kSlots = 1024;   // larger — graph mutations bulk-push
        std::atomic<int> writeIdx { 0 };
        std::atomic<int> readIdx  { 0 };
        Event queue[kSlots] {};
    };
}
