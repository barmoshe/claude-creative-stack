# R1 — Whisper Variant Comparison

> Status: draft
> Owner: Wave-1 agent  Last updated: 2026-05-07

## TL;DR (≤150 words)

For the Israeli newsroom weather pipeline, the Hebrew lane and the English lane behave like two different problems. On Hebrew, stock OpenAI Whisper sits in the 16–27% WER range while ivrit-ai's `whisper-large-v3-turbo-ct2` and `whisper-large-v3-ct2` sit at the top of the public Hebrew Speech Recognition Leaderboard, with the Interspeech 2025 paper reporting up to a **29% relative WER reduction** over OpenAI baselines [1][2]. On English, vanilla Whisper large-v3 is already at ~1.8–2.0% WER on LibriSpeech test-clean [3], and OpenAI's hosted `gpt-4o-transcribe` ($0.006/min) and `gpt-4o-mini-transcribe` ($0.003/min) raise that bar further [4]. Word-level timestamps are uniformly the weak link: faster-whisper, whisper.cpp, and ivrit-ai checkpoints all benefit from `whisperX` or `stable-ts` post-alignment when frame-accurate timing matters [5][6][7].

## Scope & questions

This report compares nine Whisper variants on dimensions that matter to the keyword-extractor-voiceover pipeline: WER on EN news, WER on HE, word-timestamp drift, $/min at the project's volume (5 × ≤2 min ≈ 10 min/day, ~300 min/month), latency on a 60s clip, local hardware footprint, HE-EN code-switch handling, and licence. **No final pick is made — that's R9's job.** This report only flags candidates per lane.

## Findings

### Comparison table

| Variant | EN WER (LibriSpeech / FLEURS) | HE WER (ivrit-ai LB) | Word-ts | $/min (300 min/mo) | 60s latency | Footprint | HE-EN code-switch | Licence |
|---|---|---|---|---|---|---|---|---|
| OpenAI cloud `whisper-1` | ~2.0% LS-clean [3] | ~16–27% [8][9] | coarse, ~hundreds ms drift [5] | $0.006 → ~$1.80/mo [4] | 3–8 s cloud | none | weak; first-30s lang lock [10] | API ToS |
| `gpt-4o-transcribe` | best-in-class on FLEURS, beats Whisper [11] | not separately published; "improved over Whisper" [11] | not exposed natively | $0.006 → ~$1.80/mo [4] | 3–8 s cloud | none | better but undocumented for HE | API ToS |
| ★ EN `gpt-4o-mini-transcribe` | between whisper-1 and gpt-4o-transcribe [11] | weaker than tuned models | not exposed natively | $0.003 → ~$0.90/mo [4] | 2–5 s cloud | none | weak | API ToS |
| `faster-whisper` (CT2) large-v3 | ~2.0% LS-clean [3] | ~same as base Whisper [9] | ts known-buggy; start>end edge cases [5] | $0 (self-host) | ~6–10 s on RTX 3060 INT8 (RTF ~0.15) [12] | 4–6 GB VRAM int8 [12] | base Whisper behaviour [10] | MIT |
| `whisper.cpp` | comparable to base Whisper at same size [13] | comparable to base Whisper | forced-align ts; **300–800 ms drift** on hard utterances [6] | $0 | ~7 s on M2 Pro [13] | CPU-only ok; ~1.5 GB RAM | base Whisper behaviour | MIT |
| `whisperX` | wraps faster-whisper | wraps faster-whisper | **best open-source word-ts** via wav2vec2 forced alignment [7] | $0 | adds 2–4 s alignment pass | +wav2vec2 model VRAM | inherits | BSD-4 + wav2vec2 |
| ivrit-ai `whisper-large-v3-turbo` (transformers) | English unchanged from base [1] | top-tier on HE LB; Interspeech '25 reports up to −29% WER vs OpenAI [1][2] | inherits Whisper coarse ts; v2-tuned needed `stable-ts` historically [14] | $0 | slower than CT2 (transformers runtime) | ~6 GB VRAM fp16 | HE-locked when forced | MIT (weights) + ivrit "specially crafted" data licence [15] |
| ★ HE `ivrit-ai/whisper-large-v3-turbo-ct2` | base Whisper for EN | top-tier HE; same checkpoint as turbo, CT2-converted [1] | inherits Whisper ts (still coarse) [14] | $0 | RTF ~0.15 → ~9s on RTX 3060 [12] | ~3.5 GB VRAM int8 | best-in-class for HE primary | MIT weights, see [15] |
| `ivrit-ai/whisper-large-v3-ct2` | base Whisper for EN | slightly higher accuracy than turbo, slower [1][2] | inherits Whisper ts | $0 | RTF ~0.20 on RTX 3060 [12] | ~5 GB VRAM int8 | HE-locked | MIT weights |

★ = leading candidate per language lane (HE / EN).

### Per-variant notes

- **OpenAI hosted (`whisper-1`, `gpt-4o-transcribe`, `gpt-4o-mini-transcribe`)** — $0.006/min, mini at $0.003/min, billed to the second [4][16]. `gpt-4o-transcribe` and mini do **not** expose word-level timestamps the way classic Whisper segments do — text + segment-level only [11].
- **faster-whisper** — de facto local runtime; CTranslate2 INT8 cuts memory ~3× and runs ~2× faster than reference Whisper on the same GPU [12]. Native `word_timestamps=True` misorders start/end at segment boundaries [5].
- **whisper.cpp** — only fully air-gapped option small enough to ship on a producer laptop; CoreML on Apple Silicon gives 8–12× speedup vs CPU [13]. Word timestamps drift 300–800 ms on rough utterances [6].
- **whisperX** — not a model, a pipeline: faster-whisper transcript + wav2vec2 forced alignment for word timing [7]. Cleanest open-source path to frame-accurate timestamps, which matters because scene segmentation hinges on exact word offsets.

### ivrit-ai sub-section (Hebrew lane)

The Hebrew Speech Recognition Leaderboard at `huggingface.co/spaces/ivrit-ai/hebrew-transcription-leaderboard` is the canonical evaluation surface, benchmarking every public Hebrew Whisper variant on multiple HE corpora [9]. `whisper-large-v3-turbo-ct2` is trained on 295 h of `crowd-transcribe-v5` plus 93 h of professional transcriptions [1]. Marmor et al. (Interspeech 2025) report up to **29% relative WER reduction** vs Whisper baselines on Hebrew [2].

**Word-timestamp caveat (verified):** earlier ivrit-ai checkpoints (large-v2-tuned) had coarse segmentation and required `stable-ts` post-processing [14]. The `whisper-large-v3-turbo-ct2` card does not claim improved word-level timing — it inherits Whisper's coarse timestamp behaviour. Documented fallback: **ivrit-ai for transcript + whisperX or stable-ts for forced alignment** [7][14].

**Licence (verified):** model weights inherit Whisper's MIT licence; the datasets (crowd-transcribe-v5) ship under ivrit.ai's "specially crafted" CC-BY-derivative that explicitly permits commercial AI training [15]. Re-confirm per release.

### Word-timestamp drift across variants

In rough order of word-ts quality (best→worst): **whisperX (forced align with wav2vec2)** > stable-ts post-pass > faster-whisper native > whisper.cpp (300–800 ms drift on hard utterances [6]) > gpt-4o-transcribe (segment-only, no word offsets [11]). Even on the best open option, MFA still beats whisperX in absolute alignment accuracy [7] — a relevant flag if scene-cut precision needs to be sub-100 ms.

### Cost & latency

At ~10 min/day (~300 min/mo): cloud Whisper/`gpt-4o-transcribe` = **$1.80/month**, mini = **$0.90/month** [4]. Local options are $0 marginal but require a GPU box (RTX 3060 12 GB minimum for real-time large-v3 [12]) or an Apple Silicon Mac for whisper.cpp [13]. 60-second clip latency: ~3–8 s round-trip cloud, ~9 s on RTX 3060 with `large-v3-turbo-ct2` int8, ~7 s on M2 Pro with whisper.cpp medium [12][13].

## Implications for keyword-extractor-voiceover

- **Default candidate for the HE lane:** `ivrit-ai/whisper-large-v3-turbo-ct2` — top of the HE leaderboard, drops into faster-whisper directly, MIT weights [1][9].
- **Default candidate for the EN lane:** `gpt-4o-mini-transcribe` (cost) or `gpt-4o-transcribe` (accuracy) — both <$2/month at this volume [4]; `whisper-1` remains a known-good fallback.
- **Word-timestamp layer (regardless of ASR pick):** wrap with **whisperX** or **stable-ts** because every variant above produces coarse word offsets natively [5][6][7][14].
- **Fully-offline candidate:** `whisper.cpp` + CoreML on Apple Silicon for an air-gapped producer laptop [13].
- **HE-EN code-switch is unsolved at the model layer:** stock Whisper locks language from the first 30 s [10]. For mixed segments, splitting audio by language *before* ASR (or running both lanes in parallel) is the documented workaround.

## Open questions

- Does `gpt-4o-transcribe` expose word-level timestamps in any 2026 API revision, or is segment-level still the ceiling? [11]
- Current-as-of-today HE WER deltas between `whisper-large-v3-ct2` (non-turbo) and `whisper-large-v3-turbo-ct2` on the live leaderboard — couldn't fetch live numbers from the HF Space (403). R6 should pull these directly when it can hit the Space.
- Does whisperX forced alignment work cleanly on Hebrew (wav2vec2 alignment models for HE)? Documented gap.
- Is there a published HE WER for `gpt-4o-transcribe` specifically, or only aggregate FLEURS? [11]

## Sources

1. ivrit-ai/whisper-large-v3-turbo-ct2 model card — `https://huggingface.co/ivrit-ai/whisper-large-v3-turbo-ct2` (training data, CT2 integration; HF Space 403 from this client — content via search snippet)
2. Marmor et al., "Building an Accurate Open-Source Hebrew ASR System through Crowdsourcing," Interspeech 2025 — `https://www.isca-archive.org/interspeech_2025/marmor25_interspeech.pdf`
3. Whisper large-v3 LibriSpeech results — OpenAI Whisper repo / paper, `https://github.com/openai/whisper`, `https://cdn.openai.com/papers/whisper.pdf`
4. OpenAI API pricing (as of 2026-05-07) — `https://openai.com/api/pricing/`, corroborated `https://costgoat.com/pricing/openai-transcription`, `https://tokenmix.ai/blog/whisper-api-pricing`
5. faster-whisper word_timestamps issue — `https://github.com/SYSTRAN/faster-whisper/issues/759`, `https://github.com/guillaumekln/faster-whisper/issues/294`
6. whisper.cpp word-timestamp drift discussion — `https://github.com/ggml-org/whisper.cpp`, "Choosing between Whisper variants" `https://modal.com/blog/choosing-whisper-variants`
7. whisperX (Bain et al., 2023) — `https://arxiv.org/abs/2303.00747`, `https://github.com/m-bain/whisperX`; comparative alignment paper `https://arxiv.org/html/2406.19363v1`
8. Dorman, "Comparing Whisper, Whisper Ivrit and Amazon Transcribe for Hebrew" — `https://medium.com/@DormanDaniel/comparing-whisper-whisper-ft-and-amazon-transcribe-for-hebrew-e297846bdd24`
9. Hebrew Transcription Leaderboard — `https://huggingface.co/spaces/ivrit-ai/hebrew-transcription-leaderboard` (HF Space; live numbers not retrievable from this client)
10. Whisper code-switching / language detection — `https://github.com/openai/whisper/discussions/2167`, `https://huggingface.co/blog/danielrosehill/whisper-hebrish`
11. OpenAI "Introducing next-generation audio models" — `https://openai.com/index/introducing-our-next-generation-audio-models/`; FLEURS reproduction thread `https://community.openai.com/t/reproducing-gpt-4o-transcribe-fleurs-results/1151187`
12. faster-whisper benchmarks — SYSTRAN repo `https://github.com/SYSTRAN/faster-whisper`, Salad blog `https://blog.salad.com/whisper-large-v3/`, Baseten `https://www.baseten.co/blog/the-fastest-most-accurate-and-cost-efficient-whisper-transcription/`
13. whisper.cpp + CoreML — `https://github.com/ggml-org/whisper.cpp`, Neosophie blog `https://neosophie.com/en/blog/20260218-local-whisper`
14. ivrit.ai "Training Whisper Turbo" blog (segmentation + stable-ts history) — `https://www.ivrit.ai/en/2025/02/13/training-whisper/`
15. ivrit.ai dataset licence — `https://www.ivrit.ai/en/the-license/`, `https://www.ivrit.ai/en/license-faqs/`, `https://huggingface.co/datasets/ivrit-ai/crowd-transcribe-v5`
16. Per-minute billing detail — `https://platform.openai.com/docs/guides/speech-to-text` / `https://developers.openai.com/api/docs/pricing`
