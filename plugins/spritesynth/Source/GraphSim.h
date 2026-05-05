#pragma once

#include <vector>
#include <random>
#include <juce_core/juce_core.h>
#include "ScaleTables.h"

namespace spritesynth
{
    // Node in the mycelium graph — owned by the audio thread on the Processor.
    struct GraphNode
    {
        int   parent { -1 };       // in-tree parent index (-1 if root)
        int   treeId { 0 };
        float x { 0 }, y { 0 }, hue { 0 };
        std::vector<int> children;  // in-tree
        std::vector<int> bonds;     // cross-tree neighbours
    };

    // A creature is a tiny FSM walking edge-by-edge. Timing is in beats.
    struct Creature
    {
        int    currentNode { 0 };
        int    targetNode { 0 };
        int    lastNode   { -1 };
        double tInBeat    { 0.0 };   // 0..1 — fraction of the way to target
        double beatsPerStep { 0.5 }; // 0.5 = eighth note per step
        uint8_t channel    { 1 };
        int    octaveOffset { 0 };
        float  gateSeconds { 0.45f };
        std::vector<int> visited;    // node indices visited recently (ring of last 16)
    };

    class GraphSim
    {
    public:
        GraphSim()
        {
            nodes.reserve (4096);
            creatures.reserve (32);
            rng.seed (0xC0FFEE);
        }

        // ---- Mutation (audio thread, called from drain) ---------------------
        int addNode (int parentIdx, int treeId, float x, float y, float hue)
        {
            const int idx = (int) nodes.size();
            GraphNode n;
            n.parent = parentIdx;
            n.treeId = treeId;
            n.x = x; n.y = y; n.hue = hue;
            nodes.push_back (std::move (n));
            if (parentIdx >= 0 && parentIdx < idx)
                nodes[(size_t) parentIdx].children.push_back (idx);
            return idx;
        }

        void addBond (int aIdx, int bIdx)
        {
            if (aIdx < 0 || bIdx < 0
                || aIdx >= (int) nodes.size()
                || bIdx >= (int) nodes.size()
                || aIdx == bIdx) return;
            auto& a = nodes[(size_t) aIdx];
            auto& b = nodes[(size_t) bIdx];
            for (int x : a.bonds) if (x == bIdx) return; // already bonded
            a.bonds.push_back (bIdx);
            b.bonds.push_back (aIdx);
        }

        void addCreature (int rootIdx, uint8_t channel, float beatsPerStep)
        {
            if (rootIdx < 0 || rootIdx >= (int) nodes.size()) return;
            Creature c;
            c.currentNode = rootIdx;
            c.targetNode  = pickNext (c, rootIdx);
            c.tInBeat     = 0.0;
            c.beatsPerStep = beatsPerStep;
            c.channel = channel == 0 ? 1 : channel;
            creatures.push_back (std::move (c));
        }

        void reset()
        {
            nodes.clear();
            creatures.clear();
        }

        // ---- Audio-thread step ----------------------------------------------
        // Advance creatures by `beatsThisBlock` beats. Returns a list of fired
        // notes; the caller schedules them into the MidiBuffer.
        struct FiredNote
        {
            uint8_t pitch;
            uint8_t velocity;
            uint8_t channel;
            float   gateSeconds;
            float   beatOffsetInBlock;   // 0..beatsThisBlock — position inside block
        };

        void advance (double beatsThisBlock,
                      int rootPc, int octave, int scaleIdx,
                      std::vector<FiredNote>& outFired)
        {
            if (beatsThisBlock <= 0.0 || creatures.empty() || nodes.empty()) return;

            for (auto& c : creatures)
            {
                if (c.targetNode < 0 || c.targetNode >= (int) nodes.size())
                    c.targetNode = c.currentNode;

                double remaining = beatsThisBlock;
                double elapsed   = 0.0;
                while (remaining > 0.0 && c.beatsPerStep > 0.0)
                {
                    const double beatsToArrival = (1.0 - c.tInBeat) * c.beatsPerStep;
                    if (beatsToArrival > remaining)
                    {
                        c.tInBeat += remaining / c.beatsPerStep;
                        elapsed   += remaining;
                        remaining = 0.0;
                    }
                    else
                    {
                        // Arrived at targetNode → fire MIDI
                        elapsed   += beatsToArrival;
                        remaining -= beatsToArrival;
                        c.tInBeat = 0.0;
                        c.lastNode = c.currentNode;
                        c.currentNode = c.targetNode;

                        const auto& here = nodes[(size_t) c.currentNode];
                        const int pitch = hueToMidi (here.hue,
                                                     rootPc,
                                                     octave + c.octaveOffset,
                                                     static_cast<Scale> (scaleIdx));

                        FiredNote fn;
                        fn.pitch    = (uint8_t) juce::jlimit (0, 127, pitch);
                        fn.velocity = (uint8_t) juce::jlimit (0, 127, 70 + (int) (rng() % 30));
                        fn.channel  = c.channel;
                        fn.gateSeconds = c.gateSeconds;
                        fn.beatOffsetInBlock = (float) elapsed;
                        outFired.push_back (fn);

                        // Track visited (cap at 16 to keep the walk free)
                        c.visited.push_back (c.currentNode);
                        if ((int) c.visited.size() > 16)
                            c.visited.erase (c.visited.begin());

                        c.targetNode = pickNext (c, c.currentNode);
                    }
                }
            }
        }

        // ---- Read accessors (used by editor for visual sync, optional) ------
        int  numNodes()      const noexcept { return (int) nodes.size(); }
        int  numCreatures()  const noexcept { return (int) creatures.size(); }

    private:
        bool wasVisitedRecently (const Creature& c, int idx) const
        {
            for (int v : c.visited) if (v == idx) return true;
            return false;
        }

        int pickNext (Creature& c, int fromIdx)
        {
            if (fromIdx < 0 || fromIdx >= (int) nodes.size()) return fromIdx;
            const auto& here = nodes[(size_t) fromIdx];

            // Collect unvisited candidates: children first, then bonds
            std::vector<int> candidates;
            candidates.reserve (here.children.size() + here.bonds.size());
            for (int ch : here.children) if (! wasVisitedRecently (c, ch)) candidates.push_back (ch);
            for (int bo : here.bonds)    if (! wasVisitedRecently (c, bo)) candidates.push_back (bo);

            if (! candidates.empty())
                return candidates[rng() % candidates.size()];

            // Backtrack toward parent if possible
            if (here.parent >= 0 && here.parent != c.lastNode)
                return here.parent;

            // Fallback: any neighbour at all (clear visited)
            std::vector<int> any;
            any.reserve (here.children.size() + here.bonds.size() + 1);
            for (int ch : here.children) any.push_back (ch);
            for (int bo : here.bonds)    any.push_back (bo);
            if (here.parent >= 0) any.push_back (here.parent);
            if (any.empty()) return fromIdx;

            c.visited.clear();
            return any[rng() % any.size()];
        }

        std::vector<GraphNode> nodes;
        std::vector<Creature>  creatures;
        std::mt19937           rng;
    };
}
