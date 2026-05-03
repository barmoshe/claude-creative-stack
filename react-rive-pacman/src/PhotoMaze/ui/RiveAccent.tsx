import { memo, useEffect, useState } from "react";
import { useRive } from "@rive-app/react-canvas";

interface RiveAccentProps {
  src: string;
  stateMachine?: string;
  className?: string;
  fallbackEmoji?: string;
  /** ms to wait for the .riv to load before showing the fallback */
  timeoutMs?: number;
}

/**
 * Isolated Rive instance. Falls back to a static emoji if loading fails
 * OR if the .riv hasn't loaded within `timeoutMs` (default 1800ms).
 * This is critical: if the public CDN is blocked / slow, the user
 * never sees a blank rectangle on intro / win.
 */
export const RiveAccent = memo(function RiveAccent({
  src, stateMachine, className, fallbackEmoji, timeoutMs = 1800,
}: RiveAccentProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { rive, RiveComponent } = useRive({
    src,
    stateMachines: stateMachine,
    autoplay: true,
    onLoad:      () => setLoaded(true),
    onLoadError: () => setFailed(true),
  });

  // Timeout: if Rive hasn't loaded in time, switch to fallback.
  useEffect(() => {
    if (loaded || failed) return;
    const t = setTimeout(() => { if (!loaded) setFailed(true); }, timeoutMs);
    return () => clearTimeout(t);
  }, [loaded, failed, timeoutMs]);

  // Cleanup on unmount
  useEffect(() => {
    if (!rive) return;
    return () => { rive.cleanup?.(); };
  }, [rive]);

  if (failed) {
    return (
      <div className={className} aria-hidden="true" style={{
        display: "grid", placeContent: "center",
        fontSize: "56px", lineHeight: 1,
        opacity: 0.85,
      }}>
        {fallbackEmoji ?? ""}
      </div>
    );
  }

  return <RiveComponent className={className} aria-hidden="true" />;
});
