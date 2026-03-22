# Spidercode Roadmap

Spidercode is an orchestration-first coding environment.

Its near-term roadmap is focused on one outcome above all others:

**the main chat should remain a clean control plane while meaningful work runs through delegated execution.**

## Product direction

Spidercode is being built around a simple operating model:

- the top-level chat is the control plane, not the default worker
- the parent agent interprets requests and coordinates execution
- meaningful work is delegated to subagents
- users stay in one main conversation while delegated work runs
- runtime state stays visible without turning the interface into noise

## Strategic goal

Improve developer DX by reducing agent failure modes caused by:

- bloated context
- chat noise
- weak task decomposition
- poor execution isolation
- unclear trust signals around delegated work

## What this roadmap is optimizing for

Across all phases, Spidercode is optimizing for:

- clarity over raw activity
- delegation over overloaded chats
- supervision over blind autonomy
- synthesis over log dumping
- trustable outcomes over process theater

## Non-goals (for now)

Spidercode is not currently trying to become:

- a generic multi-agent research playground
- a hierarchy-heavy system before top-level delegation works well
- a broad governance/policy platform before execution UX is solid
- a large speculative rewrite without proven developer value

## Phase 1 — Parent agent as true orchestrator

**Goal:** make the main chat a control plane that does not perform meaningful task work directly.

### Deliverables

**Orchestration behavior**
- clear delegation rule for the top-level parent agent
- task intake -> decomposition -> subagent dispatch flow
- same-chat control plane while subagents run
- consolidation of current parent/subagent behavior to reduce inconsistencies between worktrees, branches, and partially landed surfaces

**Runtime visibility**
- user-visible subagent state in a compact form
- cross-surface consistency across web, TUI, and parent-side summaries so delegated state feels coherent everywhere

**Trust and reporting**
- result synthesis back into the parent conversation
- trust/verification UX that makes it explicit when a delegated result is verified, incomplete, or needs review

**Onboarding**
- a “Get Started” / first-run guide explaining how to use Spidercode, what to expect from the parent vs subagents, current limitations, and how to give useful feedback

### User-visible outcome

When Phase 1 works, users should experience:

- a main chat that stays readable during real work
- delegated runs that are visible without flooding the interface
- a parent that stays available for clarifications and steering
- final results that come back synthesized instead of buried in execution chatter

### Exit criteria

- non-trivial tasks are always delegated
- the user can continue chatting with the parent while subagents work
- the parent can report active/running/completed/failed subagents
- the parent does not silently fall back into being the default worker
- the user can understand active delegated work at a glance
- the parent no longer accumulates execution noise from doing the task itself

## Phase 2 — Structured delegation

**Goal:** make delegated execution reliable enough for daily use.

### Deliverables
- explicit task and subtask contracts
- serial-by-default dispatch for safety and determinism
- cancellation, reprioritization, and retry rules
- scoped result handoff from subagent -> parent
- minimal verification rules before reporting success

### User-visible outcome

When Phase 2 works, users should experience:

- more predictable delegated runs
- clearer lifecycle transitions
- safer retries and redirects
- completion states that mean more than “the process ended”

### Exit criteria

- delegated runs have predictable lifecycle states
- parent summaries stay concise and useful
- failed subtasks can be retried or replaced without losing the control plane
- success reporting distinguishes completion from verification confidence

## Phase 3 — Hierarchical execution

**Goal:** evolve from one parent + workers into a controlled execution hierarchy.

### Deliverables
- child agents may decompose work further when policy allows
- parent/child role boundaries per depth level
- bounded hierarchy rules to avoid chaos and runaway delegation
- aggregation of status from lower levels into readable parent updates

### User-visible outcome

When Phase 3 works, users should experience:

- deeper task decomposition for larger problems
- more execution depth without losing interface clarity
- hierarchy that feels useful, not theatrical

### Exit criteria

- complex tasks can be split recursively without destroying DX
- hierarchy depth improves focus and throughput instead of adding confusion
- runtime visibility still feels calm and usable

## Phase 4 — Trust, observability, and DX hardening

**Goal:** make Spidercode calm, trustworthy, and pleasant in everyday development.

### Deliverables
- compact runtime activity surface
- evidence-oriented completion summaries
- interruption and steering UX
- project/session/worktree awareness aligned with orchestration
- performance tuning around context control and execution isolation

### User-visible outcome

When Phase 4 works, users should experience:

- better confidence in what happened and why
- easier review of delegated outcomes
- lower coordination overhead in daily development

### Exit criteria

- users can see what is happening without being spammed
- task outcomes are easier to trust and review
- the system improves developer leverage instead of adding coordination burden

## Current priority

Build Phase 1 first.

The first milestone is not “multi-agent intelligence” in the abstract.
It is:

**one parent chat that always delegates real work to subagents while remaining available as the live control plane.**
