# R5 — Matching Algorithm

> Status: draft
> Owner: Wave-3 agent  Last updated: 2026-05-07

## TL;DR (≤150 words)

Per `broll`/`broll_montage` scene, score `(visual_concept, clip) → s ∈ [0,1]` in three cheapest-first layers: (1) **tag match** at the source API ($0, ~50 ms; rigid vocab), (2) **CLIP / SigLIP-2 rerank** of top-N thumbnails (~3 ms/embed on GPU, 50–200 ms on INT8 CPU) ([open_clip](https://github.com/mlfoundations/open_clip), [SigLIP-2](https://arxiv.org/abs/2502.14786)), (3) **Claude-as-judge** on low-confidence residuals (~$0.0006/call at Haiku 4.5 vision; [pricing](https://platform.claude.com/docs/en/about-claude/pricing)). A mandatory `crop_safety` multiplier {1.0, 0.6, 0.0} from a MediaPipe/U²-Net saliency pass ([AutoFlip](https://mediapipe.readthedocs.io/en/latest/solutions/autoflip.html), [U²-Net](https://github.com/xuebinqin/U-2-Net)) drops edge-anchored horizontals before scoring. Hebrew rule: query only with `visual_concept` (English per R2), never `term`/`lemma`. End-to-end **~$0.02–0.05 per voiceover-minute** worst case; under a cent with cache warm.

## Scope & questions

B-roll scenes only — graphic scenes are template-driven (R-graphics). Per `PRE-RESEARCH.md` §4 R5 + `HANDOFF.md` §5: three matcher options, a cascaded pipeline with cost ceiling, vertical `crop_safety` with concrete bbox numbers, the Hebrew query rule, $/minute, embedding cache. R9 locks.

## Findings

### Three matching approaches

**1. Tag string match.** Pexels and Pixabay expose `?query=` over uploader-authored tag vocabularies ([Pexels](https://www.pexels.com/api/documentation/), [Pixabay](https://pixabay.com/api/docs/)). Cost $0, latency ~50–300 ms. High recall on common nouns, brittle on compound concepts — failure mode is rigid vocab ([Plainly review](https://www.plainlyvideos.com/blog/stock-video-api)). **Use as candidate generator only.**

**2. CLIP / SigLIP-2 similarity.** Encode `visual_concept` and a sampled thumbnail; rank by cosine. **Open-CLIP ViT-L/14**: ~300 samples/s on a 3080 (~3.3 ms/embed) ([open_clip](https://github.com/mlfoundations/open_clip), [LAION](https://laion.ai/blog/large-openclip/)); CPU INT8 via OpenVINO is 50–200 ms with <1% accuracy drop ([2026 CPU embeddings](https://www.huuphan.com/2026/02/cpu-optimized-embeddings-cut-rag-costs.html)). **SigLIP-2** (Feb 2025; multilingual incl. Hebrew on the Gemma 256k tokenizer; sigmoid loss) beats SigLIP and even surpasses larger OpenCLIP-G/14 at L/16 ([paper](https://arxiv.org/abs/2502.14786), [HF](https://huggingface.co/blog/siglip2)); ViT-L emb=1024, ViT-B=768 ([docs](https://huggingface.co/docs/transformers/main/model_doc/siglip2)). **CLIPRerank** shows a thin tag→CLIP rerank lifts ad-hoc-video-search precision as a plug-in ([paper](https://www.emergentmind.com/papers/2401.08449)). **Use as the default reranker.**

**3. LLM-as-judge.** Pass 3 thumbnails as `image` blocks to Claude Haiku 4.5 / Sonnet 4.6 with `visual_concept` + scene context; model returns chosen index + 1-sentence reason. Multimodal-judge research finds pair / small-triple ranking aligns with humans; large-batch scoring drifts ([MLLM-as-a-Judge](https://mllm-judge.github.io/), [2026 guide](https://labelyourdata.com/articles/llm-as-a-judge)). Cost (Anthropic `w×h/750` rule): three 256×256 thumbs ≈ 260 vision tokens + 300 prompt tokens ≈ **$0.0006 Haiku / $0.0018 Sonnet** per call ([Vision](https://platform.claude.com/docs/en/build-with-claude/vision), [pricing](https://platform.claude.com/docs/en/about-claude/pricing)). Latency 1–3 s. **Use only on low-confidence residuals.**

### Default pipeline (tag → CLIP rerank → LLM-judge fallback)

```
1. Tag-match: stock API search on visual_concept → top-10 (orientation=portrait).
2. crop_safety pass → drop candidates scoring 0.0.
3. CLIP/SigLIP-2 rerank: cosine × crop_safety on remaining; take top-3.
4. If max_score < 0.28: Claude Haiku-as-judge picks among top-3.
   Else: take CLIP top-1.
5. Cache thumb_emb keyed by (source, clip_id).
```

`0.28` is a placeholder; R9 calibrates per stock source. CLIPRerank reports robust gains with similar cutoffs ([paper](https://www.emergentmind.com/papers/2401.08449)).

### Vertical-aware crop_safety term

Mandatory score multiplier (`PRE-RESEARCH.md` §1, §4 R5; `02-scene-and-keyword-schema.md` `crop_safety_priority`):

| Condition | crop_safety | Action |
|---|---|---|
| `w/h ≤ 0.6` (natively-vertical) | **1.0** | Pass |
| Horizontal but every salient bbox sits within centre 56% of width | **0.6** | Penalised |
| Any salient/face bbox crosses the centre-crop window | **0.0** | **Drop** |

The 56% comes from canvas math: a 1920 px-wide source centre-cropped to 1080 px keeps `1080/1920 = 56.25%` (R6 vertical canvas).

**Cheap implementations** (R9 picks):

- **MediaPipe Face Detection / BlazeFace** — millisecond-class face bboxes; most newsroom B-roll has people ([Face Detector docs](https://ai.google.dev/edge/mediapipe/solutions/vision/face_detector)).
- **MediaPipe AutoFlip** — purpose-built saliency-aware reframer; legacy (support ended Mar 2023) but algorithm still applies ([AutoFlip docs](https://mediapipe.readthedocs.io/en/latest/solutions/autoflip.html)).
- **U²-Net** — 4.7 MB portable variant @ 40 fps on consumer GPU; mask→bbox is one numpy line ([repo](https://github.com/xuebinqin/U-2-Net), [paper](https://arxiv.org/abs/2005.09007)).
- **rembg** wraps U²-Net in a one-line Python API ([PyPI](https://pypi.org/project/rembg/)) — fastest path to a pre-screen.
- OpenCV Haar cascade — last-resort, face-only.

### Hebrew handling — visual_concept only, never term/lemma

R4 confirms **no stock source supports `he-IL`** ([Pexels help](https://help.pexels.com/hc/en-us/articles/47678194141337); [Pixabay docs](https://pixabay.com/api/docs/)). R2 enforces `visual_concept` always-English; `term`/`lemma` stay Hebrew. **Matcher rule: feed `visual_concept` to both tag-query and CLIP text encoder; never `term`/`lemma`.** SigLIP-2 *can* encode HE natively ([paper](https://arxiv.org/abs/2502.14786)) — bypass logged below.

### Cost-per-minute estimate

1 min ≈ **6 broll scenes × 3 candidates = 18 fetches** (`PRE-RESEARCH.md` §4 R5):

| Pipeline | $/min (warm cache) |
|---|---|
| Tag-only (Pexels free) | **$0.00** ([Pexels](https://www.pexels.com/api/documentation/)) |
| + CLIP rerank (cached) | **~$0.00–0.01** GPU-second |
| + Haiku judge on 30% | **~$0.001–0.005** ([pricing](https://platform.claude.com/docs/en/about-claude/pricing)) |
| + Sonnet judge on 30% | **~$0.003–0.012** ([Vision](https://platform.claude.com/docs/en/build-with-claude/vision)) |
| Worst case (all-Sonnet, cold cache) | **~$0.02–0.05** |

At 5 voiceovers/day × ≤2 min, the worst case is ≤ **$0.50/day** — negligible vs Whisper + stock in R1/R4. The matcher is never the cost bottleneck.

### Embedding cache strategy

R4 confirms Pexels/Pixabay licences allow local persistence (Pixabay mandates a 24-hr cache; `04-background-video-sourcing.md`). Key `(source, clip_id)` → embedding + bbox + model SHA. **Size**: 2,000 × 768 f × 4 B ≈ **6 MB** (ViT-B); ~8 MB at 1024 f for ViT-L ([SigLIP-2 dims](https://huggingface.co/docs/transformers/main/model_doc/siglip2)). 20,000 clips still <100 MB — flat ndarray + SQLite suffices; FAISS-IVF only past ~50k ([clip-retrieval](https://github.com/rom1504/clip-retrieval)).

## Implications for keyword-extractor-voiceover

Options for R9:

1. **Pipeline** — tag-only / tag+CLIP rerank / tag+CLIP+LLM-judge fallback (all <$0.05/min).
2. **Embedding model** — OpenCLIP ViT-L/14 (mature, EN-first) or SigLIP-2 ViT-L (multilingual incl. HE, retrieval-stronger).
3. **Saliency backend** — MediaPipe face-only / U²-Net via rembg / AutoFlip (legacy).
4. **LLM-judge model** — Haiku 4.5 default, Sonnet 4.6 escalation.
5. **Cache layout** — flat ndarray + SQLite (MVP) or FAISS-IVF (past 50k).

R5 takes no recommendation per `HANDOFF.md` §2.

## Open questions

- **CLIP threshold calibration**: `0.28` is a placeholder; measure on a held-out HE weather set, expect per-source retuning.
- **Multi-frame embeddings**: sampling 3–5 frames per clip lifts retrieval ([CLIPRerank](https://www.emergentmind.com/papers/2401.08449)) but doubles embed budget.
- **HE-native SigLIP-2 query**: bypass HE→EN translation? Echoes R4's open question.
- **Saliency backend pick**: face-only misses object-only B-roll (rain on a window has no face). U²-Net covers both — benchmark in R9.
- **`broll_montage` scoring**: per-clip or aggregate? Defer to R6 (shapes the EDL).
- **MLLM-judge bias**: batch-ranking drift in vision LLMs ([MLLM-as-a-Judge](https://mllm-judge.github.io/)); at N=3 we're in the safe regime — verify on real scenes.

## Sources

- `research/keyword-extractor-voiceover/PRE-RESEARCH.md` §1, §4 R5, §6.
- `research/keyword-extractor-voiceover/HANDOFF.md` §1, §5.
- `research/keyword-extractor-voiceover/02-scene-and-keyword-schema.md` — `crop_safety_priority`, bilingual rule.
- `research/keyword-extractor-voiceover/04-background-video-sourcing.md` — source order, HE not supported.
- Pexels API — https://www.pexels.com/api/documentation/
- Pexels search-language help — https://help.pexels.com/hc/en-us/articles/47678194141337
- Pixabay API docs — https://pixabay.com/api/docs/
- OpenCLIP repo — https://github.com/mlfoundations/open_clip
- LAION large-OpenCLIP blog — https://laion.ai/blog/large-openclip/
- SigLIP-2 paper (arXiv 2502.14786) — https://arxiv.org/abs/2502.14786
- SigLIP-2 HF blog — https://huggingface.co/blog/siglip2
- SigLIP-2 transformers docs — https://huggingface.co/docs/transformers/main/model_doc/siglip2
- CLIPRerank paper — https://www.emergentmind.com/papers/2401.08449
- clip-retrieval (rom1504) — https://github.com/rom1504/clip-retrieval
- CPU-optimized embeddings (2026) — https://www.huuphan.com/2026/02/cpu-optimized-embeddings-cut-rag-costs.html
- Multimodal video retrieval with CLIP (Springer) — https://link.springer.com/article/10.1007/s10791-023-09425-2
- MediaPipe AutoFlip — https://mediapipe.readthedocs.io/en/latest/solutions/autoflip.html
- MediaPipe Face Detector — https://ai.google.dev/edge/mediapipe/solutions/vision/face_detector
- U²-Net repo — https://github.com/xuebinqin/U-2-Net
- U²-Net paper (arXiv 2005.09007) — https://arxiv.org/abs/2005.09007
- rembg PyPI — https://pypi.org/project/rembg/
- Anthropic Vision docs — https://platform.claude.com/docs/en/build-with-claude/vision
- Anthropic pricing — https://platform.claude.com/docs/en/about-claude/pricing
- MLLM-as-a-Judge benchmark — https://mllm-judge.github.io/
- LLM-as-a-judge guide 2026 — https://labelyourdata.com/articles/llm-as-a-judge
- Plainly stock-video API review — https://www.plainlyvideos.com/blog/stock-video-api
