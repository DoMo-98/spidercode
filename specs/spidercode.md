# Spidercode

## Vision

Spidercode is an orchestration-first coding environment designed to separate conversation from execution on purpose.

The top-level agent is not the main worker. It is the orchestrator.

Its job is to:
- understand the user's request
- decompose the work
- dispatch subagents
- track execution state
- synthesize results
- remain available in the same chat as the control plane

This model exists to avoid familiar agent failure modes:
- degraded performance from excess context
- chat noise mixing planning, execution, and user conversation
- weak isolation between unrelated tasks
- poor visibility into what the system is doing
- shallow trust signals around delegated results

## Core product thesis

A developer should be able to stay in one main conversation while Spidercode delegates real work to subagents in the background.

That main conversation should remain useful for:
- clarifications
- priority changes
- cancellations
- follow-up questions
- status checks
- result synthesis

The main conversation should not become the place where execution noise accumulates.

## What Spidercode is optimizing for

Spidercode is optimizing for:

- clarity over raw activity
- delegation over overloaded chats
- supervision over blind autonomy
- synthesis over log dumping
- trustable outcomes over superficial completion

These priorities should guide product and architecture decisions.

## Product principles

### 1. Parent chat is the control plane
The top-level parent agent should remain cognitively available to the user throughout the task.
It should coordinate execution, not absorb execution noise.

### 2. Meaningful work should be delegated
The parent should not become the default place where substantial implementation, inspection, or validation happens.
Delegation is the default for non-trivial task work.

### 3. Decompose before execution
Complex work should be broken into bounded subtasks before execution starts whenever that improves clarity, reliability, or supervision.

### 4. Isolate work to improve performance
Subagents exist to keep context smaller, roles clearer, and execution more focused.
Isolation is a practical DX tool, not a theoretical purity rule.

### 5. Visibility without spam
Users should be able to understand what is running, what completed, and what failed without reading raw worker output by default.

### 6. Trust is not the same as completion
A delegated task may be finished at the process level while still lacking evidence, verification, or a trustworthy outcome summary.
Spidercode should keep that distinction visible.

### 7. DX over spectacle
The system should reduce friction for developers, not impress them with unnecessary hierarchy or agent theater.

### 8. No hellcode
Changes should be incremental, understandable, and easy to reason about.
Architecture must earn its complexity.

## Immediate scope

The first implementation target is not full hierarchy.

The immediate target is:
- one top-level parent agent
- mandatory delegation for non-trivial work
- one main chat that remains active while subagents run
- explicit runtime units for delegated work
- compact status visibility for delegated execution
- final synthesized reporting with an evidence/confidence signal when relevant

## Operating consequences

If Spidercode is implemented correctly, the following should be true:

- the parent asks fewer execution-heavy follow-up questions because it can delegate bounded work
- delegated work is represented explicitly instead of being hidden inside one overloaded thread
- status reporting stays compact unless the user asks to inspect deeper traces
- final reporting distinguishes task completion from task confidence
- deeper hierarchy remains bounded and legible rather than recursive by default

## Future direction

Once top-level orchestration is solid, Spidercode can expand into deeper hierarchy:
- subagents delegating to subagents
- bounded recursive task decomposition
- role-specific agent layers
- project/session/worktree-aware execution planning

But hierarchy should only expand after the top-level orchestration model proves stable and pleasant to use.

## Explicit non-goals

For the current stage, Spidercode is not trying to be:
- a generic autonomous swarm platform
- a maximalist research sandbox
- a feature pile of governance systems before core execution works
- a rewrite driven by theory rather than developer usage
- a system that hides meaningful work behind opaque autonomy

## Relationship to agent-ops-framework

`agent-ops-framework` served as the concept lab for many of these ideas.

Spidercode is the product vehicle.

The framework's role is now primarily historical and reference-oriented. Active product evolution should happen in Spidercode.
