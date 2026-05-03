import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/alert";

/**
 * Multi-cursor "collaboration" demo using BroadcastChannel + window.storage.
 *
 * Real WebSocket / WebRTC is blocked in published artifacts (see knowledge/03-artifacts.md
 * and 99-caveats.md). Instead we fan out cursor moves via BroadcastChannel — that gives
 * cross-tab sync within the same browser (the strongest "live" channel an artifact can use).
 *
 * Open this artifact in two browser tabs: cursors should appear in both.
 */

const CHANNEL = "creative-stack:cursors";
const STORAGE_KEY = "collab:peers";

function generateId() {
  return Math.random().toString(36).slice(2, 8);
}

function generateColor(seed) {
  // Deterministic oklch hue from id.
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `oklch(0.7 0.18 ${h})`;
}

export default function RealtimeCollabCursor() {
  const [me] = useState(() => ({
    id: generateId(),
    color: null,
    name: `you-${generateId()}`,
  }));
  const [peers, setPeers] = useState({});
  const [connected, setConnected] = useState(false);
  const channelRef = useRef(null);
  const lastBroadcast = useRef(0);
  const stageRef = useRef(null);

  me.color ??= generateColor(me.id);

  const broadcast = useCallback((msg) => {
    if (!channelRef.current) return;
    channelRef.current.postMessage(msg);
  }, []);

  // Set up BroadcastChannel.
  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel(CHANNEL);
      channelRef.current = bc;
      setConnected(true);
    } catch {
      setConnected(false);
      return;
    }
    bc.onmessage = (ev) => {
      const msg = ev.data;
      if (!msg || msg.id === me.id) return;
      if (msg.type === "move") {
        setPeers(prev => ({
          ...prev,
          [msg.id]: { ...msg, lastSeen: Date.now() },
        }));
      } else if (msg.type === "leave") {
        setPeers(prev => {
          const next = { ...prev };
          delete next[msg.id];
          return next;
        });
      } else if (msg.type === "hello") {
        // Reply with our presence so the new peer learns we exist.
        broadcast({ type: "move", id: me.id, name: me.name, color: me.color, x: -1, y: -1 });
      }
    };

    broadcast({ type: "hello", id: me.id, name: me.name, color: me.color });

    const onUnload = () => broadcast({ type: "leave", id: me.id });
    addEventListener("beforeunload", onUnload);
    return () => {
      onUnload();
      bc.close();
      removeEventListener("beforeunload", onUnload);
    };
  }, [broadcast, me]);

  // Garbage-collect peers we haven't heard from in 5s.
  useEffect(() => {
    const t = setInterval(() => {
      setPeers(prev => {
        const cutoff = Date.now() - 5000;
        const next = {};
        for (const [id, p] of Object.entries(prev)) {
          if (p.lastSeen >= cutoff) next[id] = p;
        }
        return next;
      });
    }, 1500);
    return () => clearInterval(t);
  }, []);

  // Track and broadcast our cursor.
  useEffect(() => {
    function onMove(e) {
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      if (x < 0 || y < 0 || x > 1 || y > 1) return;

      const now = performance.now();
      if (now - lastBroadcast.current < 33) return;       // ~30fps cap
      lastBroadcast.current = now;
      broadcast({ type: "move", id: me.id, name: me.name, color: me.color, x, y });
    }
    addEventListener("pointermove", onMove);
    return () => removeEventListener("pointermove", onMove);
  }, [broadcast, me]);

  // Persist last seen color set across reloads.
  useEffect(() => {
    (async () => {
      try {
        if (window.storage?.set) {
          await window.storage.set(STORAGE_KEY, JSON.stringify({ me }));
        }
      } catch {}
    })();
  }, [me]);

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg, oklch(0.98 0 0))", color: "var(--text, #111)" }}>
      <style>{`
        :root { color-scheme: light dark; --bg: light-dark(oklch(0.98 0 0), oklch(0.13 0 0));
                --surface: light-dark(oklch(0.96 0.01 250), oklch(0.18 0.02 250));
                --text: light-dark(oklch(0.18 0 0), oklch(0.95 0 0)); }
        body { background: var(--bg); color: var(--text); }
      `}</style>

      <div style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", fontWeight: 700 }}>Multi-cursor (artifact-safe)</h1>
          <p style={{ color: "oklch(from var(--text) l c h / 0.7)", margin: "0.25rem 0 0", maxWidth: "60ch" }}>
            BroadcastChannel + <code>window.storage</code> — the strongest "live" channel a published artifact can use. Open in two tabs.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Badge>{connected ? "channel: open" : "channel: unsupported"}</Badge>
          <Badge>peers: {Object.keys(peers).length}</Badge>
        </div>
      </div>

      <div
        ref={stageRef}
        style={{
          position: "relative",
          margin: "0 1.5rem 1.5rem",
          height: "calc(100svh - 8rem)",
          background: "var(--surface)",
          borderRadius: "1.25rem",
          overflow: "hidden",
          cursor: "crosshair",
          touchAction: "none",
        }}
      >
        {/* My label */}
        <div style={{ position: "absolute", top: 12, left: 12, padding: "0.25rem 0.5rem", background: me.color, color: "white", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
          you · {me.id}
        </div>

        {/* Peers */}
        {Object.values(peers).map(p => (
          p.x >= 0 && p.y >= 0 && (
            <Cursor key={p.id} x={p.x} y={p.y} color={p.color} name={p.name || p.id} />
          )
        ))}
      </div>
    </div>
  );
}

function Cursor({ x, y, color, name }) {
  const stage = { width: "100%", height: "100%" };
  return (
    <div
      style={{
        position: "absolute",
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: "translate(-2px, -2px)",
        pointerEvents: "none",
        transition: "left 80ms linear, top 80ms linear",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <path d="M2 2 L2 18 L7 13 L11 21 L14 19 L10 12 L17 12 Z" fill={color} stroke="white" strokeWidth="1.2" />
      </svg>
      <span style={{ position: "absolute", top: 18, left: 16, padding: "0.15rem 0.4rem", background: color, color: "white", borderRadius: 4, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
        {name}
      </span>
    </div>
  );
}
