---
name: youtube-metadata
description: |
  Generates the YouTube upload package: description, tags, hashtags,
  chapters, pinned comment, playlist suggestion. Use whenever the user
  asks for the description, tags, metadata, or upload package.
allowed-tools: Read, Write
model: claude-haiku-4-5-20251001
---

# YouTube Metadata

## Inputs

- `workspace/video-projects/<slug>/script.md`
- `workspace/video-projects/<slug>/edit-notes.md` (chapter timestamps)
- Episode brief (viewer promise from `workspace/episode-ideas/<slug>.md`)
- Build links: live app URL, GitHub repo URL.

## Process

1. **Description.**
   - Hook line (1 sentence — restates the viewer promise).
   - Spacer.
   - Chapters block (auto-extracted from `edit-notes.md` timestamps).
   - Spacer.
   - Build link (live app), source link (GitHub).
   - Channel/social links.
   - Credits (any libraries / samples / collaborators).
2. **Tags.** 10–15. Mix broad (`music tech`, `web audio`, `claude code`)
   with specific (`euclidean sequencer`, `tone.js`). No tag-spam.
3. **Hashtags in description (top of description, ≤ 3).**
   - One channel-defining: `#musictech`.
   - One episode-specific.
   - Optional third for trend-of-the-month.
4. **Pinned comment.** 1–2 sentences inviting feedback or feature
   requests. Reads as the creator, not as marketing copy.
5. **Playlist.** Choose from existing channel playlists or propose a
   new one. List the rationale.

## Outputs

`workspace/video-projects/<slug>/upload-package.md`. Use
`templates/youtube-description-template.md` as the shape.

## Hard Rules (skill-specific)

- **Chapter timestamps must match the edit-notes.** If the edit-notes
  say the demo starts at `04:30`, the description's chapter block
  cannot say `04:25`.
- **No tag spam.** YouTube ignores irrelevant tags and rewards
  consistency. Don't pad with `music`, `cool`, `fun`.
- **Description's first 150 chars are the search-result preview.**
  Lead with the viewer promise, not housekeeping.
- **Build link in the description must be a live, working URL.** If
  the build isn't deployed, surface that to the user — don't ship the
  episode without the live app.

## References

- `templates/youtube-description-template.md`

## Anti-patterns

- A 30-line description with the build link buried.
- Tags that don't appear in the title or description (YouTube
  considers it gaming).
- Pinned comments that read as marketing ("Subscribe for more!"). Make
  them genuine ("If you build something with this, send it — pinning
  the best ones").
- Generic playlist proposals ("All my videos") — playlists are for
  retention, name them by topic.
