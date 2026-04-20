---
name: ui-design-kit
description: Build a small themeable UI component kit — Button, Input, Textarea, Select, Checkbox, Switch, Card, Badge, Dialog, Tabs — using shadcn conventions, Tailwind core utilities, and oklch tokens from palette-generator. Use when the user asks for a UI kit, design system, component library, theme starter, or shadcn setup. All components ship with keyboard accessibility, focus-visible styles, WCAG AA contrast, and a dark-mode token flip.
license: MIT
---

# UI Design Kit

## When to trigger

- "Build me a design system"
- "UI kit for my project"
- "Component library"
- "shadcn theme"
- "Set up tokens + primitives"

## Stack

- Tokens from `palette-generator` — oklch, light + dark sets.
- Tailwind v4 (CSS-first config when possible) with core utilities only. No arbitrary values.
- shadcn/ui component primitives where they exist in the artifact runtime whitelist.
- React functional components with hooks. Default export for the showcase.
- Dark mode via `.dark` class toggled from React state (no `localStorage` in artifact).

## Components to ship

| Component | Variants | Keyboard |
|---|---|---|
| Button | `default`, `outline`, `ghost`, optional icon | Enter/Space |
| Input | default + error state | native |
| Textarea | auto-grow optional | native |
| Select | single-select | Arrow + Enter |
| Checkbox | with label | Space |
| Switch | with label | Space |
| Card | header + content + footer | — |
| Badge | `default`, `success`, `warn`, `danger` | — |
| Dialog | trap focus, ESC to close | Tab cycles, ESC |
| Tabs | horizontal | Arrow keys |

## Token + scale decisions

- **Radius scale:** `0` / `0.25rem` / `0.5rem` / `0.75rem` / `9999rem` — pick one family (`rounded-md` etc.) and commit.
- **Type scale:** 12 / 14 / 16 / 18 / 20 / 24 / 32 / 48 — map to Tailwind core `text-xs` → `text-5xl`.
- **Spacing scale:** Tailwind default (4px base).
- **Density:** comfortable default (`py-2 px-3` on inputs). Compact variant reduces to `py-1.5 px-2.5`.

## Accessibility checklist (enforce)

- `:focus-visible` ring on every interactive element.
- Dialog traps focus + returns focus to trigger on close.
- Labels are `<label htmlFor>`-associated, not placeholder-only.
- Color is not the only indicator of error / success — include icon or text.
- Contrast ratios verified in token output (see `palette-generator`).

## Output shape

1. **Tokens** — `:root` + `.dark` CSS blocks.
2. **Type + spacing + radius scales** — short tables.
3. **Full JSX artifact** showcasing all 10 components, default-exported, under ~300 lines.
4. **Extension notes** — 3 bullets on adding a new component without breaking the theme.

## Delegation

- If `anthropics/skills` `canvas-design` or `theme-factory` are installed, call those for theme scaffolding; this skill adds the component showcase layer on top.
- If `frontend-design` skill is installed, use its non-generic layout guidance for the demo page.

## Further reading

- `knowledge/05-graphics-design.md` — design trends, typography, color.
- `prompts/generate-ui-kit.md` — ready-to-paste prompt.
- `skills/palette-generator/SKILL.md` — token generation rules.
