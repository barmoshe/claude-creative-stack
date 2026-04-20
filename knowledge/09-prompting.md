# 09 — Prompt Engineering for Claude

Docs: `docs.claude.com/en/docs/build-with-claude/prompt-engineering`.

## 9.1 XML tag structuring

Claude is trained with XML-tagged data; XML tags improve parseability and reduce ambiguity. Common tags: `<instructions>`, `<example>`, `<context>`, `<document>`, `<documents>`, `<source>`, `<document_content>`, `<quotes>`, `<thinking>`, `<answer>`. Nest hierarchically. Be consistent.

Grounded-RAG template:

```xml
<documents>
  <document index="1">
    <source>annual_report_2023.pdf</source>
    <document_content>{{DOC_1}}</document_content>
  </document>
  <document index="2">
    <source>competitor_q2.xlsx</source>
    <document_content>{{DOC_2}}</document_content>
  </document>
</documents>

First extract word-for-word quotes relevant to the question and list them
inside <quotes>…</quotes> tags with the document index. If none exist, say
"I can't find any relevant quotes." Then answer inside <answer>…</answer>.
```

## 9.2 Few-shot examples

Use 3–5 diverse examples covering edge cases; wrap each in `<example>` inside `<examples>`. Few-shot dramatically improves structured-output reliability.

## 9.3 Chain of thought

- Append "Think step by step." for quick CoT.
- Structured: `<thinking>…</thinking>` followed by `<answer>…</answer>`.
- Pre-fill the response with `<thinking>` to force structure without verbosity.

## 9.4 System prompts / role assignment

Place persona in `system` parameter, not user message: `"You are a senior patent attorney…"`. Sets tone, vocabulary, domain defaults.

## 9.5 Prompt caching strategies

- Cache order matters: `tools → system → messages`. Higher changes invalidate lower.
- Cache: static instructions, tool defs, long reference docs, few-shot blocks, long stable history.
- Don't cache: the per-request user query or timestamp suffix.
- Up to 4 `cache_control` breakpoints; place on the **last** stable block.
- TTLs: 5 m (default, free refresh on hit) or `"ttl":"1h"` (costs 2× on write). Pricing: 5 m write 1.25×, 1 h write 2×, read 0.1× base input.
- Min cache block: 1024 tokens (Sonnet/Opus), 2048 (Haiku 3.5). Extended-thinking jobs often exceed 5 m — use 1 h.

## 9.6 Extended thinking

- Enable for complex reasoning (math, code, analysis, long-horizon agents). Skip for simple queries.
- Legacy: `thinking={"type":"enabled","budget_tokens":N}`. Start 1024–4096, increase to 16–32k for hard tasks, 64k for research-grade.
- Adaptive (Opus 4.6+, Sonnet 4.6): `thinking={"type":"adaptive"}` + `output_config={"effort":"high"}`.
- Streaming required when `max_tokens > 21333`.
- Can't pre-fill responses when thinking enabled.
- Thinking blocks from prior turns are auto-stripped (not billed again).
- Billed as output tokens at generation time.
- Interleaved thinking beta header: `interleaved-thinking-2025-05-14`.
- Changing thinking params invalidates message cache breakpoints but not system/tools cache.

## 9.7 Long-context techniques (>20k tokens)

1. Put long documents at the top of the prompt, above query/instructions — up to ~30% quality improvement on Anthropic tests.
2. Wrap each doc with `<document>` + `<source>` + `<document_content>`.
3. Grounding quotes first: ask Claude to quote relevant passages, then answer using only those quotes.
4. Instructions and query at the **end** of the prompt.
5. Use 1M-context models (Opus 4.7/4.6, Sonnet 4.6/4.5 w/ beta).

## 9.8 Tool use prompting

- Describe each tool in detail: purpose, when to use, parameter semantics.
- Show concrete invocation examples.
- For agents: supply a verification tool (Playwright MCP, computer use).
- Claude 4+ is less verbose after tool calls by default — add "After completing a task that involves tool use, provide a quick summary." if you want narration.
- For long tool-use chains, enable `interleaved-thinking` to let Claude reason between tool calls.
