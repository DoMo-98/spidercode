# Subagent UX for the parent control plane

## Goal

Expose subagent activity in the main Spidercode chat without turning the experience into noise.

The user should understand what the system is doing, but the parent conversation must remain calm, readable, and useful.

## UX principle

Show state, not noise.

By default, the parent should expose:
- which subagents exist
- what each one is doing at a high level
- what state each one is in
- what outcome matters to the user

By default, the parent should hide:
- raw tool transcripts
- low-level search chatter
- intermediate worker reasoning
- repetitive step-by-step logs

## Information model

The minimum useful subagent surface in the parent chat is:
- label or short description
- current state
- final outcome summary when finished

## Suggested lifecycle states

Required states:
- queued
- running
- completed
- failed
- cancelled

Possible future states:
- blocked
- retrying
- awaiting_input

## Main-chat behavior

### On dispatch
The parent should acknowledge delegation in a compact way.

Example shape:
- "Launched 2 subagents"
- short labels for each task

### While running
The parent should not spam passive updates.

Instead, show:
- a compact active-task surface in the UI
- explicit updates only when something materially changes

### On completion
The parent should provide a concise synthesis:
- what was completed
- what failed or remains blocked
- what matters next
- a short result preview drawn from the delegated outcome rather than raw worker logs
- if the subagent finished without a usable result summary, show that explicitly instead of presenting task metadata as if it were the outcome

### On user request
If the user asks for status, the parent should summarize active and recent subagents in one compact response.

## TUI/DX goals

The parent session should make it easy to:
- see active child sessions
- see parent/root sessions marked active when delegated child work is still running
- switch into a child when needed
- return to the parent quickly
- understand overall progress without opening every child

## Visibility rules

### Default visible
- active subagent count
- short task labels
- state badges
- final summary per finished task when relevant

### Default hidden
- verbose tool outputs
- repeated success logs
- large dumps of search results
- internal subagent prompt details

### Drill-down
Detailed child-session inspection should remain possible, but it should be opt-in.

## Update policy

Status updates should happen when:
- a subagent is launched
- a subagent changes terminal state
- the user explicitly asks
- a blocker requires user input

Status updates should not happen for every low-level event.

## Tone

The control plane should feel:
- calm
- competent
- low-noise
- informative

It should not feel:
- chatty for the sake of it
- like a build log
- like an autonomous swarm dashboard

## Milestone 1 boundary

For Milestone 1, the UX only needs:
- compact parent awareness of child sessions
- readable status labels
- basic completion summaries
- easy drill-down into subagents when needed

Milestone 1 does not require:
- advanced visualization
- deep hierarchy trees
- rich orchestration dashboards
- speculative observability layers

## Success criteria

This UX is successful if:
- the user knows what is running without asking every time
- the main chat stays readable
- child-session details are available when needed
- subagent activity feels helpful rather than distracting
