import { useState, useEffect, useRef, useMemo } from "react";
import { Button, Card, CardContent, Textarea, Badge } from "@/components/ui/alert";
import { Sparkles, Play, Pause, RefreshCw, MessageSquare, Camera } from "lucide-react";

/**
 * Shader Jam — live GLSL editor with vision-grounded AI critique.
 *
 * Flagship demo of the four-layer pipeline (knowledge / prompts / skills / artifacts + MCP).
 * Demonstrates:
 *   - GLSL ES 3.00 fragment shader inside the artifact sandbox (WebGL2).
 *   - Composite-only animation (no layout thrash).
 *   - prefers-reduced-motion gating.
 *   - Calling api.anthropic.com/v1/messages key-less from an artifact.
 *   - Vision input — sending a `canvas.toDataURL()` snapshot for grounded critique.
 *   - Streaming SSE response into a side panel.
 *   - Prompt caching for the persona system prompt.
 *
 * The persona system prompt mirrors `skills/critique-loop` and `prompts/shader-critique.md`.
 */

const PERSONAS = {
  "shader-critic": "You are a senior graphics engineer reviewing a fragment shader. Score it /10 across composition, perf budget, mobile precision, and visual interest. Then list 3 P0/P1/P2 fixes with specific GLSL line/snippet references.",
  "art-director": "You are an art director reviewing a generative visual. Focus on composition, color harmony, motion language, and cliché-avoidance. Suggest one bold pivot the engineer wouldn't think of.",
  "performance-auditor": "You are a perf auditor for WebGL/Canvas. Flag any dynamic loops, mobile-precision issues, overdraw, or render-target sizes you can infer. Suggest a budget for this shader on a 2022 Pixel 6a.",
};

const STARTERS = {
  plasma: `precision highp float;
uniform vec2 uResolution;
uniform float uTime;
out vec4 fragColor;

vec3 palette(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (vec3(1.0,1.0,0.5) * t + vec3(0.0,0.10,0.20)));
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5*uResolution) / uResolution.y;
  float t = uTime * 0.4;
  float v = sin(uv.x*4.0 + t) + sin(uv.y*5.0 - t*1.3) +
            sin((uv.x+uv.y)*3.0 + t*0.7) + sin(length(uv)*8.0 - t);
  fragColor = vec4(palette((v+4.0)/8.0), 1.0);
}`,
  rings: `precision highp float;
uniform vec2 uResolution;
uniform float uTime;
out vec4 fragColor;
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5*uResolution) / uResolution.y;
  float r = length(uv);
  float bands = sin(r * 30.0 - uTime * 2.0) * 0.5 + 0.5;
  vec3 col = mix(vec3(0.04, 0.1, 0.2), vec3(0.95, 0.7, 0.3), bands);
  col *= smoothstep(1.5, 0.0, r);
  fragColor = vec4(col, 1.0);
}`,
};

const VS = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

function compileShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(log);
  }
  return sh;
}

function linkProgram(gl, vs, fs) {
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog);
    gl.deleteProgram(prog);
    throw new Error(log);
  }
  return prog;
}

export default function ShaderJam() {
  const [code, setCode] = useState(STARTERS.plasma);
  const [persona, setPersona] = useState("shader-critic");
  const [running, setRunning] = useState(true);
  const [error, setError] = useState(null);
  const [critique, setCritique] = useState("");
  const [critiquing, setCritiquing] = useState(false);
  const canvasRef = useRef(null);
  const glStateRef = useRef(null);
  const runningRef = useRef(running);

  useEffect(() => { runningRef.current = running; }, [running]);

  // Build / rebuild the WebGL pipeline whenever code changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true });
    if (!gl) { setError("WebGL2 not available."); return; }

    let prog;
    try {
      const vs = compileShader(gl, gl.VERTEX_SHADER, VS);
      const fs = compileShader(gl, gl.FRAGMENT_SHADER, "#version 300 es\nout vec4 _;\n" /* placeholder removed below */);
    } catch {}

    // Rebuild for real with the user's code; prepend #version + out vec4 fragColor declaration if missing.
    const userSrc = code.trim();
    const fragSrc = userSrc.startsWith("#version") ? userSrc :
      `#version 300 es\n${userSrc.includes("fragColor") ? "" : "out vec4 fragColor;\n"}${userSrc}`;

    let vs2, fs2;
    try {
      vs2 = compileShader(gl, gl.VERTEX_SHADER, VS);
      fs2 = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
      prog = linkProgram(gl, vs2, fs2);
      setError(null);
    } catch (err) {
      setError(err.message);
      return;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    // Fullscreen triangle.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "uTime");
    const uRes  = gl.getUniformLocation(prog, "uResolution");
    const uMouse= gl.getUniformLocation(prog, "uMouse");

    let mouse = [0.5, 0.5];
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
    };
    canvas.addEventListener("pointermove", onMove);

    function fit() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    addEventListener("resize", fit); fit();

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf, t0 = performance.now();
    function frame(now) {
      if (!runningRef.current) { raf = requestAnimationFrame(frame); return; }
      const t = (now - t0) / 1000;
      gl.useProgram(prog);
      if (uTime) gl.uniform1f(uTime, reduced ? 0 : t);
      if (uRes)  gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse)gl.uniform2f(uMouse, mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    glStateRef.current = { gl, canvas };

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", fit);
      canvas.removeEventListener("pointermove", onMove);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [code]);

  // Snapshot the canvas + ask Claude for a critique grounded in the visual.
  async function critiqueNow() {
    setCritique("");
    setCritiquing(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("canvas not ready");
      const dataUrl = canvas.toDataURL("image/png");
      const base64 = dataUrl.split(",")[1];

      const body = {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        stream: true,
        system: [
          { type: "text", text: PERSONAS[persona], cache_control: { type: "ephemeral", ttl: "1h" } },
        ],
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/png", data: base64 } },
            { type: "text", text: `Here is the current GLSL fragment shader and a screenshot of the canvas it produces. Score and produce a P0/P1/P2 punch list.\n\n\`\`\`glsl\n${code}\n\`\`\`` },
          ],
        }],
      };

      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(`API ${r.status}: ${await r.text()}`);

      // Streaming SSE parse.
      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let acc = "", out = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const lines = acc.split("\n");
        acc = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          if (!json || json === "[DONE]") continue;
          try {
            const ev = JSON.parse(json);
            if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
              out += ev.delta.text;
              setCritique(out);
            }
          } catch {}
        }
      }
    } catch (err) {
      setCritique(`error: ${err.message}`);
    } finally {
      setCritiquing(false);
    }
  }

  return (
    <div style={{ minHeight: "100svh", display: "grid", gridTemplateColumns: "minmax(20rem, 1fr) minmax(0, 2fr)", background: "oklch(0.13 0 0)", color: "oklch(0.95 0 0)" }}>
      {/* Editor panel */}
      <div style={{ display: "flex", flexDirection: "column", padding: "1rem", borderRight: "1px solid oklch(0.95 0 0 / 0.08)", gap: "0.75rem", minWidth: 0 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
          <strong style={{ fontSize: "1.1rem" }}>Shader jam</strong>
          <Badge>{error ? "compile error" : "live"}</Badge>
        </header>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {Object.keys(STARTERS).map(k => (
            <Button key={k} variant="outline" onClick={() => setCode(STARTERS[k])}>{k}</Button>
          ))}
          <Button variant="outline" onClick={() => setRunning(r => !r)}>
            {running ? <><Pause size={14} /> pause</> : <><Play size={14} /> play</>}
          </Button>
        </div>

        <Textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
          style={{ flex: 1, fontFamily: "ui-monospace, monospace", fontSize: 12, lineHeight: 1.5, background: "oklch(0.18 0 0)", color: "oklch(0.95 0 0)", minHeight: "20rem" }}
        />

        {error && (
          <div style={{ background: "oklch(0.3 0.18 25)", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", fontSize: 12, fontFamily: "ui-monospace, monospace", whiteSpace: "pre-wrap" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={persona}
            onChange={e => setPersona(e.target.value)}
            style={{ background: "oklch(0.18 0 0)", color: "oklch(0.95 0 0)", border: "1px solid oklch(0.95 0 0 / 0.15)", borderRadius: 6, padding: "0.4rem 0.6rem" }}
          >
            {Object.keys(PERSONAS).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <Button onClick={critiqueNow} disabled={critiquing || !!error}>
            {critiquing ? <><Sparkles size={14} /> critiquing…</> : <><MessageSquare size={14} /> critique</>}
          </Button>
        </div>
      </div>

      {/* Canvas + critique panel */}
      <div style={{ position: "relative", display: "grid", gridTemplateRows: "1fr auto", minHeight: "100svh" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
        {(critique || critiquing) && (
          <div style={{ background: "oklch(0.16 0 0 / 0.92)", backdropFilter: "blur(10px)", padding: "1rem 1.25rem", borderTop: "1px solid oklch(0.95 0 0 / 0.08)", maxHeight: "40svh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "oklch(0.78 0.18 270)" }}>
              <Camera size={14} /> Vision-grounded critique · <span style={{ opacity: 0.7 }}>{persona}</span>
            </div>
            <div style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.55 }}>
              {critique || "…"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
