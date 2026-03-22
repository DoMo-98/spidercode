# Spidercode

Spidercode is an orchestration-first coding environment for developers who want to keep the main chat clean while real work happens in delegated execution threads.

Its core idea is simple:

**the main chat is the control plane, not the default worker.**

The top-level parent agent should stay available in a single conversation, interpret requests, coordinate work, and delegate meaningful execution to subagents.

## Why Spidercode exists

Most coding-agent tools collapse planning, execution, logging, and conversation into the same thread.
That works for small tasks, but it breaks down fast as complexity grows:

- user conversation gets buried under execution noise
- planning and implementation contaminate each other
- status updates become log spam
- complex work becomes harder to supervise
- the main agent accumulates too much context and gets worse over time

Spidercode separates those concerns on purpose.

## What Spidercode is for

Spidercode is for developers who:

- use coding agents regularly and want less context overload
- want delegation without losing control
- need execution to stay visible without flooding the interface
- want multi-step work to feel coordinated instead of chaotic
- care more about clarity, trust, and DX than agent theatrics

## Intended operating model

Spidercode is built around a simple execution model:

1. the user stays in one main conversation
2. the parent agent interprets the request
3. the parent decomposes the work into meaningful subtasks
4. the parent dispatches subagents to execute those tasks
5. the parent reports compact runtime state and progress
6. the parent synthesizes outcomes back into a clean user-facing result

The goal is not to make the parent do everything more efficiently.
The goal is to make the parent do less execution work directly.

## Core principles

- **The control plane stays readable**
  - The main chat should remain useful to the human throughout the task.

- **Execution belongs to workers**
  - Real implementation, inspection, testing, and heavy task work should happen in delegated execution paths.

- **Delegation must remain legible**
  - Users should be able to understand what is running, why it is running, and what came back.

- **Results should come back distilled**
  - The parent should return synthesis, outcomes, risks, and next steps — not dump raw noise by default.

- **Hierarchy is a tool, not a gimmick**
  - Multi-level delegation only matters when it improves clarity, reliability, or developer experience.

## What “meaningful work” means

In Spidercode, meaningful work usually means substantial implementation, inspection, validation, or synthesis that would otherwise pollute the control plane. That typically includes:

- multi-file code changes
- repository inspection and diagnosis
- running tests, builds, or validation steps
- documentation drafting or restructuring
- implementation of scoped subtasks
- synthesizing findings from deeper execution threads

The parent agent may still do lightweight coordination work directly, but it should not become the default place where substantial execution happens.

## What success looks like

Spidercode is successful when:

- the main chat stays readable during real work
- delegated execution is reliable enough for daily use
- users can see progress without being flooded by logs
- multi-step tasks feel lighter, not heavier
- the parent behaves like an orchestrator instead of a noisy all-purpose worker

## Current direction

Current product priority order:

1. Make the top-level parent agent a true orchestrator
2. Make delegated execution reliable for real work
3. Add controlled hierarchical execution where it improves outcomes
4. Harden trust, observability, and developer experience

## Example workflow

A typical Spidercode flow looks like this:

1. the user asks for a feature, fix, refactor, or investigation
2. the parent agent scopes the work and decides what should be delegated
3. one or more subagents execute the implementation or analysis
4. the parent shows compact progress and runtime state
5. the parent returns an executive summary with results, evidence, risks, and next steps

This keeps the human in one place while still allowing real execution depth behind the scenes.

## Terminal-first by design

Spidercode is currently terminal-first by design.

That is a deliberate product choice, not just a temporary constraint:

- terminal workflows make orchestration easier to inspect
- iteration is faster when the control surface is compact
- automation is easier to compose in a text-first environment
- execution traces are easier to reason about

A richer interface may grow over time, but the core model should remain useful even without one.

## Non-goals

Spidercode is intentionally not trying to become:

- a generic autonomous swarm playground
- a chat-as-IDE noise machine
- a maximalist framework built ahead of proven value
- a feature pile optimized for demos over daily usefulness
- a system that removes human oversight from meaningful coding work

## Project status

**Status:** active exploration and phase-1 foundation building around orchestrator-first execution.

The project is currently focused on making the model real and usable before broadening scope.

## Key docs

- `ROADMAP.md` — product roadmap and delivery phases
- `specs/spidercode.md` — product vision, principles, and non-goals
- `specs/orchestrator.md` — top-level orchestrator execution model
- `specs/project.md` — multi-project and worktree-oriented project/session API notes

## Relationship to OpenCode

Spidercode started as a fork of OpenCode.

OpenCode provided a strong product and runtime base.
Spidercode builds from that foundation while diverging where necessary to pursue a more explicit orchestrator-first model centered on delegated execution, hierarchical work, and a cleaner control-plane experience.

## Working rule

Until proven otherwise:

**the top-level parent agent should delegate meaningful work.**
