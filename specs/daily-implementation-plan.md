# Daily implementation plan — Spidercode Phase 1

## Purpose

This document exists to make daily execution cycles unambiguous.

Spidercode is already past the "keep thinking about the direction" stage.
The current job of the daily cycles is to turn the orchestrator-first strategy into a working product incrementally.

## Current readiness verdict

## Status: READY TO START IMPLEMENTING

Spidercode is ready for daily implementation cycles because:

- the product direction is clear
- the Phase 1 target is clear
- Milestone 1 is specific enough to build against
- the repo already defines the core operating model
- the current risk is no longer lack of strategy, but lack of implementation throughput

Spidercode is **not** "feature-complete" or "execution-mature" yet.
It is ready in the sense that the next useful step is repeated implementation work, not more strategic exploration.

## What is already decided

The following points are considered stable enough to guide implementation:

- Spidercode is terminal-first
- the top-level parent chat is a control plane
- the parent agent should remain available in the same chat
- the parent agent should delegate all meaningful work to subagents
- compact status is required
- raw worker noise should stay out of the main chat by default
- hierarchy below the top-level parent is a later phase
- serial-by-default execution is acceptable for the first milestone

If a proposed implementation conflicts with any of those rules, it is probably out of scope for the current phase.

## What daily cycles should optimize for

Daily cycles should optimize for:

1. working end-to-end behavior over abstract architecture
2. small mergeable increments over broad rewrites
3. visible developer UX improvement over internal cleverness
4. parent-orchestrator purity over convenience shortcuts
5. reliability and clarity over parallelism or novelty

## What daily cycles should avoid

Avoid spending cycles on:

- speculative deep hierarchy systems
- broad agent policy/governance layers
- rich visual surfaces before compact state works
- feature expansion that weakens the parent-as-orchestrator rule
- documentation-only work unless it directly unblocks implementation
- large refactors without a Phase 1 payoff

## Definition of progress

A daily cycle counts as meaningful progress if it improves at least one of these:

- mandatory delegation behavior
- task intake and bounded decomposition
- subagent dispatch lifecycle
- compact active-state visibility
- steering, cancellation, or retry behavior
- result consolidation back to the parent chat
- confidence through tests or verification

A cycle should preferably produce one or more of:

- code changes
- tests
- a runnable flow
- improved operator UX
- tighter implementation docs directly tied to code

## Phase 1 implementation sequence

The recommended sequence for daily cycles is:

### Track A — minimal orchestrator skeleton
Build the smallest working parent-orchestrator path.

Target outcomes:
- a request can be triaged by the parent
- a bounded execution unit can be created
- a subagent can be launched through the intended path
- lifecycle state is visible to the parent

### Track B — happy-path end-to-end flow
Make one delegated task flow feel real.

Target outcomes:
- the parent accepts a non-trivial task
- the parent delegates instead of doing the work
- the user stays in the same chat
- the parent can report running/completed/failed
- the parent can synthesize a final answer from delegated output

### Track C — control-plane UX
Make the system calm and steerable.

Target outcomes:
- status is glanceable
- worker noise stays hidden by default
- cancellation and reprioritization are possible
- follow-up requests can be handled while work is active

### Track D — hardening
Make the flow trustworthy enough for daily real use.

Target outcomes:
- tests cover key lifecycle behavior
- failure handling is predictable
- verification before success reporting exists
- documentation matches actual behavior

## Recommended near-term cycle plan

The next daily cycles should roughly follow this order.
Adjust only if implementation discoveries force a different dependency order.

### Cycle 1
Define or implement the smallest executable parent -> subagent dispatch path.

Expected output:
- code path exists for delegation
- one simple non-trivial task can be handed off
- implementation notes updated if needed

### Cycle 2
Add minimum lifecycle state tracking.

Expected output:
- queued/running/completed/failed are represented
- parent can inspect and surface current state

### Cycle 3
Implement compact main-chat status output.

Expected output:
- user can see active delegated work at a glance
- no raw worker noise leaks by default

### Cycle 4
Implement result consolidation.

Expected output:
- parent can convert delegated output into a clean user-facing synthesis
- evidence/result boundaries are clear

### Cycle 5
Implement steering controls.

Expected output:
- status query works cleanly
- cancellation or reprioritization path exists
- parent remains responsive during active work

### Cycle 6
Add basic verification and failure behavior.

Expected output:
- failed delegated work is distinguishable from completed work
- retry or replacement path starts to exist
- parent does not overclaim success

### Cycle 7
Add tests and tighten docs around real implemented behavior.

Expected output:
- core Phase 1 path is protected by tests
- docs reflect the actual interaction model

## Decision rule for each cycle

Before starting a daily cycle, ask:

1. Does this move Milestone 1 forward directly?
2. Does this preserve the parent as a pure orchestrator?
3. Does this improve real user DX in the main chat?
4. Is this small enough to complete or land meaningfully in one cycle?

If the answer to any of the first three is no, the task is probably not the right next daily-cycle target.

## Definition of done for the current phase

Phase 1 is done when Spidercode can reliably demonstrate this experience:

- the user asks for non-trivial work in the main chat
- the parent does not do the task itself
- the parent delegates bounded execution to subagents
- the parent stays available during execution
- the user can understand active work without noise
- the parent reports outcomes clearly and credibly

Until that experience exists, daily cycles should stay focused on Phase 1.
