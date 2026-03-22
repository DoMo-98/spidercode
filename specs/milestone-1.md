# Milestone 1 — Top-level parent as pure orchestrator

## Objective

Make the top-level Spidercode chat behave as a pure orchestrator.

For meaningful work, the parent agent should not execute the task itself. It should decompose the request, delegate execution to subagents, remain available in the same chat, and synthesize results back to the user.

## Why this milestone exists

A single overloaded chat mixes together:
- user conversation
- planning
- tool execution
- retries
- partial results
- coordination noise

That makes performance worse over time and degrades DX.

Milestone 1 isolates execution from the parent chat so the main conversation can remain a stable control plane.

## Scope

This milestone covers only the top-level parent behavior.

It does not require:
- recursive delegation by lower-level subagents
- deep hierarchy policies
- broad autonomy experiments
- full observability architecture

## Parent role

The top-level parent agent may:
- interpret the user request
- ask clarifying questions when necessary
- decompose work into subtasks
- launch subagents
- monitor subagent state
- report compact progress updates
- summarize results
- accept steering from the user while work is active

The top-level parent agent must not:
- perform meaningful task execution directly
- accumulate raw execution chatter in the main conversation
- bypass delegation for convenience when the task is non-trivial

## Delegation rule

### Mandatory delegation
The top-level parent must delegate all non-trivial work.

Examples:
- code changes
- codebase investigation across multiple files
- implementation planning that needs broad repo inspection
- debugging requiring iterative search and validation
- tests, verification, or reproducibility work
- multi-step documentation updates

### Allowed direct actions
The top-level parent may act directly only for control-plane tasks such as:
- greeting the user
- asking clarifying questions
- presenting options
- summarizing state
- synthesizing final results
- acknowledging cancellation, reprioritization, or steering

### Default bias
If there is any doubt about whether work is meaningful, delegate it.

## Execution model

### 1. Intake
The user sends a request in the main chat.

### 2. Triage
The parent decides whether clarification is needed.

### 3. Decomposition
The parent turns the request into one or more bounded execution units.

### 4. Delegation
The parent launches subagents using the task execution path.

### 5. Supervision
The parent remains available while subagents work.

### 6. Consolidation
The parent receives outcomes from subagents and turns them into a clear user-facing response.

## Initial simplifications

For Milestone 1, the system should prefer:
- one subagent for one bounded task
- serial delegation unless there is a clear reason to fan out
- compact status over rich visualization
- minimal new abstractions

## UX requirements

### Same-chat control plane
The user must stay in the same parent conversation while delegated work runs.

### Compact active-state visibility
The user should be able to see:
- what is running
- what finished
- what failed
without reading worker noise.

### Steering
The user should be able to:
- ask for status
- reprioritize
- cancel active work
- follow up on results

### Calmness
The parent chat should not stream raw worker internals by default.

## Engineering constraints

- Prefer small, legible changes
- Reuse existing parent/child session mechanics where possible
- Avoid architecture expansion that is only needed for later hierarchy phases
- Do not optimize for recursive multi-level delegation yet

## Success criteria

Milestone 1 is successful when all of the following are true:
- the top-level parent no longer performs meaningful work directly
- non-trivial requests are delegated by default
- the parent remains responsive while subagents run
- the user can understand active work at a glance
- the experience feels better than a single overloaded chat

## Failure signs

Milestone 1 is not done if any of these remain true:
- the parent still regularly executes real task work directly
- the main chat fills with tool-level execution noise
- subagent status is hard to understand
- the user cannot steer or interrupt delegated work cleanly
- the implementation adds fragile complexity without improving DX
