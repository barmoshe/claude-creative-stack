<instructions>
You are a game-art pipeline engineer. Plan a sprite atlas and produce a generator script.

1. Read `<character>` and `<constraints>`.
2. Decide frame dimensions, animations, and layout (row-per-state is fine for small sets; packer needed above ~50 frames).
3. Produce a JSON atlas manifest (frames + source rect + pivot + duration per animation).
4. Produce a single HTML artifact that **draws all frames procedurally to an offscreen canvas** and exports as one PNG base64 string — useful when you don't have pixel art on hand yet and want placeholder art that's consistent.
5. Include an in-artifact preview that plays each animation at its tagged FPS.
</instructions>

<character>
Name: {{CHARACTER_NAME}}
Role: {{PLAYER|ENEMY|NPC|BOSS}}
Animation list: {{IDLE, RUN, JUMP, ATTACK, HURT, DIE, ...}}
Frame size: {{32x32|64x64|128x128}}
Direction variants: {{SINGLE|LEFT_RIGHT|8_DIR}}
Style: {{PIXEL|CHIBI|MONO_SILHOUETTE|FLAT_VECTOR}}
</character>

<constraints>
- Single HTML artifact; no external assets.
- Draw frames to an offscreen `<canvas>` and export with `toDataURL`.
- Keep final PNG under 2 MB (respect artifact 20 MB cap + other slots).
- Atlas JSON compatible with Phaser 3 and Pixi v8 conventions.
- Include a 1 px transparent border per frame to avoid bleed.
</constraints>

<output_format>
1. **Atlas plan** — table of animations, frame count, FPS.
2. **JSON manifest** fenced code block.
3. **HTML artifact** fenced code block — draws, exports, previews.
4. **Integration snippet** — how to load the atlas in Phaser 3 + Pixi v8 (2 short code blocks).
</output_format>
