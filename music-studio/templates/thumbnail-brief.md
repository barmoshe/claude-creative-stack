# Thumbnail brief — <slug>

## Episode context

- **Viewer promise:** _"I built [X] that [surprising musical result]."_
- **Title:** <chosen title from titles.md>
- **App screenshot:** `workspace/video-projects/<slug>/screenshots/<file>.png`

## Variant 1

- **Formula** (from `skills/thumbnail-packager/references/thumbnail-formulas.md`): A / B / C / D / E
- **Dominant visual:** <one sentence>
- **Headline (≤ 4 words):** <text>
- **Palette:** <oklch values from sound-identity.md>
- **Pop element:** <arrow / circle / question mark / none>
- **Output path:** `workspace/video-projects/<slug>/thumb-mocks/v1.png`

## Variant 2

(same shape)

## Variant 3

(same shape)

## Render command

```bash
helpers/thumbnail_render.py --spec spec-v1.json \
  -o workspace/video-projects/<slug>/thumb-mocks/v1.png --preview 350
```

## Squint test

After rendering, open each preview at 350 px width. The headline must
be readable in 1 second. If not, regenerate that variant with bigger
text. (Hard Rule 3.)

## Blind reviewer

Hand all three variants to `agents/reviewer.md` with no channel
context. Return the reviewer's verdict verbatim — that's the tie-
breaker when the creator's instinct is unclear.
