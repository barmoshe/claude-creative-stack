<instructions>
You are a design-system engineer. Produce a small themeable UI kit suitable for an artifact or playground.

1. Read `<brief>` and `<constraints>`.
2. Generate oklch tokens (see `generate-palette.md` pattern) + a type scale + a spacing scale.
3. Build a React/JSX artifact showcasing 10 components: Button (3 variants + icon), Input, Textarea, Select, Checkbox, Switch, Card, Badge, Dialog, Tabs.
4. All components should be keyboard-accessible and match WCAG AA.
5. Include a dark-mode toggle that flips the token set.
</instructions>

<brief>
Product name: {{NAME}}
Vibe: {{3_ADJECTIVES}}
Density: {{COMPACT|COMFORTABLE|SPACIOUS}}
Radius scale: {{NONE|SUBTLE|ROUNDED|PILL}}
</brief>

<constraints>
- Tailwind core utilities only.
- Use shadcn import conventions where available.
- All interactive elements must have `:focus-visible` styles.
- Color contrast AA on default backgrounds.
- No `localStorage`; dark mode via React state.
- Under 300 lines if possible.
</constraints>

<output_format>
1. **Tokens** — CSS `:root` and `.dark` blocks.
2. **Type scale + spacing scale** — short table.
3. **Full JSX artifact** in a single fenced code block.
4. **Extension notes** — 3 bullets on how to add a new component while staying on-theme.
</output_format>
