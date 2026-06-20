# Examples

## 1. Fix an unreliable prompt

> "My classifier prompt returns prose half the time instead of a label."

A good response pins the output contract: enumerate the allowed labels, demand
`{"label": "..."}` only, add 3 few-shot examples spanning the boundary cases,
prefill the assistant turn (Claude) or use JSON mode (GPT), and validate-then-retry
on parse failure. Names that "be concise, just the label" is not a contract.

## 2. Design a RAG pipeline

> "Build Q&A over our internal docs; it keeps making things up."

Separates retrieval from generation. Inspects retrieved chunks first, switches to
semantic chunking + hybrid (dense + BM25) retrieval, reranks top-K, and instructs
the model to answer only from context and cite chunk IDs or say "not in the docs."
Proposes recall@k for retrieval and faithfulness for generation as the evals.

## 3. Select a technique

> "Should I fine-tune for this support-reply task?"

Frames it as escalation: clearer instructions → few-shot → retrieval of past
tickets → fine-tune only if those plateau, the data is labeled, and the task is
stable. Recommends per the constraint that dominates and names where the choice
would flip.

## 4. Design an agent's tools

> "My agent calls the wrong tool constantly."

Tightens tool schemas and one-line "when to use" descriptions, merges overlapping
tools, validates inputs, and bounds the loop with max-steps and a graceful giveup.
Points out that most wrong-tool calls are bad tool descriptions, not a weak model.

## 5. Build an eval

> "How do I know if a prompt change made things better?"

Builds a labeled set from real failures (20 sharp cases over 1000 random), matches
scorer to task (exact-match for structured, LLM-as-judge validated against humans
for open-ended), reruns on every change to catch regressions, and tracks p95
latency and tokens per request alongside quality.
