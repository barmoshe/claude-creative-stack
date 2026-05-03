import { useState, useRef, useEffect } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/alert";
import { Sparkles, Info, ChevronDown } from "lucide-react";

/**
 * CSS Anchor Positioning + Popover API demo.
 *
 * Baseline 2026: anchor-name + position-anchor + anchor() arrived in stable Chrome/Edge,
 * are behind flags in Firefox / Safari. The Popover API ships everywhere. This artifact
 * uses both, with a JS-positioned fallback for browsers that don't support anchor().
 *
 * No external positioning lib (Floating UI / Popper / Tippy) — that's the point.
 */

const FEATURES = [
  { id: "anchor", label: "anchor positioning", supported: CSS.supports?.("anchor-name", "--a") },
  { id: "popover", label: "popover API",       supported: typeof HTMLElement !== "undefined" && "popover" in HTMLElement.prototype },
  { id: "lightdark", label: "light-dark()",    supported: CSS.supports?.("color", "light-dark(red, blue)") },
  { id: "scope",   label: "@scope",            supported: CSS.supports?.("selector(@scope)") },
];

export default function AnchorPositionedPopover() {
  const [open, setOpen] = useState(null);
  const buttonRefs = useRef({});
  const fallbackPos = useRef({});
  const [, forceUpdate] = useState(0);

  // Fallback when CSS anchor() is unsupported: position popover absolutely below button.
  function positionFallback(id) {
    const btn = buttonRefs.current[id];
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    fallbackPos.current[id] = { top: rect.bottom + 8 + window.scrollY, left: rect.left + window.scrollX };
    forceUpdate(n => n + 1);
  }

  function toggle(id) {
    setOpen(prev => prev === id ? null : id);
    if (!CSS.supports?.("anchor-name", "--a") && open !== id) positionFallback(id);
  }

  useEffect(() => {
    function onResize() { if (open) positionFallback(open); }
    addEventListener("resize", onResize);
    addEventListener("scroll", onResize);
    return () => { removeEventListener("resize", onResize); removeEventListener("scroll", onResize); };
  }, [open]);

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg, #fafafa)", color: "var(--text, #111)", padding: "2rem 1rem" }}>
      <style>{`
        :root {
          color-scheme: light dark;
          --bg:      light-dark(oklch(0.98 0 0),       oklch(0.13 0 0));
          --surface: light-dark(oklch(0.96 0.01 250),  oklch(0.18 0.02 250));
          --text:    light-dark(oklch(0.18 0 0),       oklch(0.95 0 0));
          --muted:   light-dark(oklch(0.45 0.02 240),  oklch(0.65 0.02 240));
          --accent:  light-dark(oklch(0.55 0.20 270),  oklch(0.78 0.20 270));
        }
        body { background: var(--bg); color: var(--text); }
        .popover-anchor {
          /* anchor() path */
          position: absolute;
          position-anchor: var(--anchor);
          left: anchor(left); top: anchor(bottom);
          translate: 0 8px;
          margin: 0;
          padding: 0;
          border: 0;
          background: transparent;
        }
        .popover-fallback {
          position: absolute;
          margin: 0; padding: 0; border: 0; background: transparent;
        }
      `}</style>

      <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 700, margin: 0 }}>
        Anchor Positioning + Popover API
      </h1>
      <p style={{ color: "var(--muted)", maxWidth: "60ch", marginTop: "0.25rem" }}>
        Native popovers anchored to triggers — zero positioning libraries. Pop the menus and try resizing the window.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
        {FEATURES.map(f => (
          <Badge key={f.id} variant={f.supported ? "default" : "secondary"}>
            {f.supported ? "✓" : "✗"} {f.label}
          </Badge>
        ))}
      </div>

      <div style={{ marginTop: "2rem", display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))" }}>
        {[
          { id: "menu",   title: "Menu",   icon: <ChevronDown size={16} />, body: <MenuBody /> },
          { id: "tooltip",title: "Tooltip",icon: <Info size={16} />,        body: <TooltipBody /> },
          { id: "splash", title: "Splash", icon: <Sparkles size={16} />,    body: <SplashBody /> },
        ].map(p => {
          const anchorName = `--anchor-${p.id}`;
          const supported = CSS.supports?.("anchor-name", "--x");
          const popoverProps = "popover" in HTMLElement.prototype ? { popover: "auto" } : {};
          return (
            <Card key={p.id} style={{ background: "var(--surface)" }}>
              <CardHeader>
                <CardTitle>{p.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  ref={el => (buttonRefs.current[p.id] = el)}
                  onClick={() => toggle(p.id)}
                  style={{ anchorName }}
                >
                  {p.icon} Open {p.title.toLowerCase()}
                </Button>
                {open === p.id && (
                  <div
                    {...popoverProps}
                    className={supported ? "popover-anchor" : "popover-fallback"}
                    style={
                      supported
                        ? { ["--anchor"]: anchorName }
                        : fallbackPos.current[p.id]
                    }
                  >
                    {p.body}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MenuBody() {
  return (
    <div style={panelStyle}>
      {["Edit", "Duplicate", "Archive", "Delete"].map(item => (
        <button key={item} style={menuItemStyle} onClick={() => alert(item)}>{item}</button>
      ))}
    </div>
  );
}

function TooltipBody() {
  return (
    <div style={{ ...panelStyle, maxWidth: "20rem", padding: "0.75rem 1rem" }}>
      <strong>What is this?</strong>
      <p style={{ margin: "0.25rem 0 0", color: "var(--muted)", fontSize: "0.85rem" }}>
        A tooltip positioned via <code>anchor()</code>. No layout reads on every scroll — the browser handles it.
      </p>
    </div>
  );
}

function SplashBody() {
  return (
    <div style={{ ...panelStyle, maxWidth: "22rem", padding: "1rem" }}>
      <h3 style={{ margin: 0 }}>✨ Heads up</h3>
      <p style={{ margin: "0.25rem 0 0", color: "var(--muted)", fontSize: "0.85rem" }}>
        This panel is a real <code>&lt;div popover="auto"&gt;</code>. <kbd>Esc</kbd> closes it. Light dismiss works automatically.
      </p>
    </div>
  );
}

const panelStyle = {
  background: "var(--surface)",
  border: "1px solid oklch(from var(--text) l c h / 0.1)",
  borderRadius: "0.75rem",
  boxShadow: "0 20px 60px -20px oklch(from var(--accent) l c h / 0.4)",
  padding: "0.5rem",
  minWidth: "12rem",
  display: "flex", flexDirection: "column",
};

const menuItemStyle = {
  background: "transparent",
  border: 0,
  color: "var(--text)",
  textAlign: "left",
  padding: "0.5rem 0.75rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  font: "inherit",
};
