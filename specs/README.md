# Spidercode specs

This directory contains the minimum product docs needed to guide implementation.

## Read order

1. `spidercode.md`
   - product vision
   - principles
   - non-goals
   - relationship to the older framework work

2. `orchestrator.md`
   - target execution model
   - parent/subagent role split
   - UX constraints
   - Phase 1 success criteria

3. `milestone-1.md`
   - exact implementation target for the first milestone
   - mandatory delegation rules
   - allowed direct parent actions
   - success and failure signs

4. `daily-implementation-plan.md`
   - readiness verdict for starting daily execution cycles
   - what the cycles should optimize for
   - what to avoid
   - recommended near-term implementation sequence

5. `subagent-ux.md`
   - what the parent should show about subagents
   - what should stay hidden
   - calm control-plane behavior

6. `project.md`
   - project/session/worktree API notes
   - useful when aligning orchestration with multi-project execution

## Current focus

The current implementation focus is top-level orchestration:
- one main chat
- parent agent as control plane only
- real work delegated to subagents
- compact runtime visibility

Hierarchy below the top-level parent is a later phase, not the starting point.
