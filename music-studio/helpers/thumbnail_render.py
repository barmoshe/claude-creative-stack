#!/usr/bin/env python3
"""thumbnail_render.py — render a thumbnail mock from a spec JSON.

CLI contract (Spec 04 §6.1):

    thumbnail_render.py --spec <spec.json> -o <out.png> [--preview <px>]

Spec JSON shape:

    {
      "size": [1280, 720],
      "background": "#1a1a1a" | [r, g, b],
      "screenshot": {
        "path": "workspace/video-projects/<slug>/screenshots/app.png",
        "box": [x, y, w, h]            // optional placement
      },
      "headline": {
        "text": "IMPOSSIBLE DRUMS",
        "font": "/path/to/font.ttf",   // optional; falls back to PIL default
        "size": 96,
        "color": "#ffd400" | [r, g, b],
        "position": [x, y],
        "anchor": "lt"                 // PIL anchor; default "lt"
      },
      "accents": [                      // optional list of arrows/circles
        {
          "type": "arrow" | "circle" | "rectangle",
          "color": "#ff3366" | [r, g, b],
          "width": 6,
          "points": [[x1,y1],[x2,y2]] | [cx,cy,r] | [x,y,w,h]
        }
      ]
    }

When --preview <px> is given, also writes a downscaled copy beside the
output named "<out-stem>.preview-<px>.png".

Requires Pillow (`pip install Pillow`).
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # pragma: no cover
    sys.stderr.write(
        "[thumbnail_render] Pillow is required. Install with: pip install Pillow\n"
    )
    sys.exit(1)


def parse_color(value):
    if isinstance(value, str):
        return value
    if isinstance(value, (list, tuple)):
        return tuple(int(v) for v in value)
    raise ValueError(f"unrecognised color: {value!r}")


def load_font(font_path: str | None, size: int):
    if font_path:
        try:
            return ImageFont.truetype(font_path, size=size)
        except OSError:
            sys.stderr.write(
                f"[thumbnail_render] font not found at {font_path}; "
                f"falling back to default.\n"
            )
    return ImageFont.load_default()


def draw_arrow(draw: "ImageDraw.ImageDraw", points, color, width):
    (x1, y1), (x2, y2) = points
    draw.line([(x1, y1), (x2, y2)], fill=color, width=width)
    # arrowhead — simple two-line wedge
    head_size = max(width * 4, 12)
    import math

    angle = math.atan2(y2 - y1, x2 - x1)
    for offset in (math.pi - 0.4, math.pi + 0.4):
        hx = x2 + head_size * math.cos(angle + offset)
        hy = y2 + head_size * math.sin(angle + offset)
        draw.line([(x2, y2), (hx, hy)], fill=color, width=width)


def render(spec: dict, out_path: Path, preview: int | None) -> None:
    size = tuple(spec.get("size", [1280, 720]))
    background = parse_color(spec.get("background", [20, 20, 20]))
    image = Image.new("RGB", size, background)

    screenshot = spec.get("screenshot")
    if screenshot:
        try:
            shot = Image.open(screenshot["path"]).convert("RGB")
            box = screenshot.get("box")
            if box:
                x, y, w, h = box
                shot = shot.resize((w, h))
                image.paste(shot, (x, y))
            else:
                image.paste(shot, (0, 0))
        except FileNotFoundError:
            sys.stderr.write(
                f"[thumbnail_render] screenshot not found: {screenshot['path']}\n"
            )

    draw = ImageDraw.Draw(image)

    for accent in spec.get("accents", []):
        kind = accent.get("type", "rectangle")
        color = parse_color(accent.get("color", "#ffffff"))
        width = int(accent.get("width", 4))
        pts = accent.get("points", [])
        if kind == "arrow" and len(pts) == 2:
            draw_arrow(draw, pts, color, width)
        elif kind == "circle" and len(pts) == 3:
            cx, cy, r = pts
            draw.ellipse(
                [cx - r, cy - r, cx + r, cy + r], outline=color, width=width
            )
        elif kind == "rectangle" and len(pts) == 4:
            x, y, w, h = pts
            draw.rectangle([x, y, x + w, y + h], outline=color, width=width)

    headline = spec.get("headline")
    if headline:
        font = load_font(headline.get("font"), int(headline.get("size", 96)))
        text = headline.get("text", "")
        color = parse_color(headline.get("color", "#ffffff"))
        position = tuple(headline.get("position", [80, 80]))
        anchor = headline.get("anchor", "lt")
        try:
            draw.text(position, text, fill=color, font=font, anchor=anchor)
        except (TypeError, ValueError):
            draw.text(position, text, fill=color, font=font)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(out_path, "PNG")
    sys.stdout.write(f"{out_path}\n")

    if preview:
        ratio = preview / size[0]
        preview_size = (preview, max(1, int(size[1] * ratio)))
        preview_image = image.resize(preview_size, Image.LANCZOS)
        preview_path = out_path.with_name(
            f"{out_path.stem}.preview-{preview}{out_path.suffix}"
        )
        preview_image.save(preview_path, "PNG")
        sys.stdout.write(f"{preview_path}\n")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--spec", required=True, type=Path)
    parser.add_argument("-o", "--output", required=True, type=Path)
    parser.add_argument("--preview", type=int, default=None,
                        help="also write a preview at this width (px)")
    args = parser.parse_args(argv)

    spec = json.loads(args.spec.read_text())
    render(spec, args.output, args.preview)
    return 0


if __name__ == "__main__":
    sys.exit(main())
