# Orchestrator-first execution model

## Goal

Turn the main Spidercode chat into a true orchestrator that delegates all meaningful task work to subagents.

## Core rule

The top-level parent agent must not perform the task itself.

It may:
- interpret the request
- ask clarifying questions when necessary
- break work into subtasks
- create and steer subagents
- report status
- summarize results
- do lightweight coordination reasoning needed to supervise execution

It must not become the default execution surface for the work it orchestrates.

## What should usually be delegated

Meaningful task work means substantial implementation, inspection, validation, or synthesis that would otherwise pollute the control plane. That typically includes:
- code edits
- repository inspection and diagnosis
- tests, builds, and validation steps
- multi-step documentation work
- scoped implementation subtasks
- deeper investigation work that would otherwise pollute the control plane

The parent may still do minimal coordination work directly, but substantial execution should not stay in the parent thread by default.

## Why

This keeps the parent chat useful as a control plane and reduces the context pollution that makes long-running agent sessions worse over time.

## Desired user experience

A developer should be able to:
- ask for work in the main chat
- see that Spidercode decomposed and delegated it
- continue talking to the parent while work is running
- inspect compact status for active subagents
- redirect or cancel work without losing the conversation
- receive a final synthesis when delegated work completes
- understand active work without opening worker transcripts by default

## Lifecycle

### 1. Intake
The parent receives the user request.

### 2. Decomposition
The parent turns the request into one or more execution units.

### 3. Dispatch
The parent launches subagents with bounded scope.

### 4. Supervision
The parent tracks lifecycle state and remains available in the same chat.

### 5. Consolidation
The parent collects subagent outcomes and turns them into a useful response.

## State model

The minimum useful state surface is:
- queued
- running
- completed
- failed
- cancelled

A delegated task marked `completed` should still surface caution when its returned summary lacks verification evidence or a usable result summary. The parent must avoid presenting bare process exit as equivalent to a trustworthy outcome.

Execution status and result trustworthiness are related but not identical signals.
That distinction should remain visible even in compact status surfaces.
A glanceable summary may stay terse, but it should still signal when one or more completed delegated results are missing verification evidence.

Optional future states:
- blocked
- retrying
- awaiting_input

## UX constraints

### Compactness
Status should be readable at a glance.

### Interruptibility
The user must be able to redirect or stop active work.

### Calmness
The interface should avoid flooding the main chat with raw worker output.

### Traceability
It should remain possible to inspect what happened when needed.

### Legibility
Delegation should be explicit enough that users understand what the system is doing without needing to reconstruct it from logs.

## Phase 1 implementation boundary

Phase 1 should support:
- one parent chat as orchestrator
- mandatory delegation for non-trivial work
- compact active task visibility
- final synthesized reporting
- visible distinction between execution completion and trustworthy outcome reporting when relevant

Phase 1 should not require:
- deep recursive hierarchies
- broad autonomy experiments
- complex policy engines
- speculative abstractions beyond what the parent/subagent model needs now

## Evaluation questions

A Phase 1 implementation is successful if the answer is yes to these:
- Can the parent stay responsive while delegated work runs?
- Does the parent avoid doing the real task itself?
- Can the user understand what is running without reading noise?
- Does task isolation improve reliability and clarity?
- Does the experience feel better than a single overloaded chat?
- Is completion kept meaningfully distinct from confidence in the returned result?
