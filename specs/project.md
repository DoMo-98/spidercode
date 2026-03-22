# Project and session model

The goal of this surface is to let a single Spidercode instance run sessions for multiple projects while preserving clear execution boundaries between projects, sessions, delegated work, and worktrees.

This matters because orchestrator-first execution only works well when delegated work stays scoped, inspectable, and isolated.

## Why this exists

Spidercode needs to support real daily development across:

- multiple repositories
- multiple sessions within the same repository
- multiple worktrees or directory scopes per project
- parent and delegated execution paths that should not contaminate each other

A project/session model provides those boundaries.

## Conceptual model

### Project
A project is the top-level container for a codebase or working area.
It groups sessions that operate on the same underlying project identity.

### Session
A session is a conversational and execution context within a project.
Sessions may differ by directory, worktree, task, or lineage.

### Parent session
A parent session is the control-plane conversation that interprets requests, coordinates execution, and synthesizes results.

### Delegated session
A delegated session is a child execution context created to perform bounded work on behalf of a parent session.

### Directory / worktree scope
A session is anchored to a directory scope.
That scope may correspond to a project root, worktree, branch-oriented workspace, or other bounded execution surface.

## Product expectations

This model should make it possible to:

- keep unrelated projects isolated
- run multiple sessions for the same project without collapsing them into one thread
- associate delegated work with the correct project and session lineage
- support worktree-aware task execution
- inspect what happened in a given session without losing parent/child relationships

## Design expectations

The API should preserve:

- clear project identity
- explicit session lineage
- bounded directory/worktree scope
- compatibility with parent/subagent orchestration
- room for sharing, compaction, abort, and revert operations without blurring session ownership

## API

```http
GET /project -> Project[]

POST /project/init -> Project

GET /project/:projectID/session -> Session[]
GET /project/:projectID/session/:sessionID -> Session

POST /project/:projectID/session -> Session
{
  id?: string
  parentID?: string
  directory: string
}

DELETE /project/:projectID/session/:sessionID

POST /project/:projectID/session/:sessionID/init
POST /project/:projectID/session/:sessionID/abort
POST /project/:projectID/session/:sessionID/share
DELETE /project/:projectID/session/:sessionID/share
POST /project/:projectID/session/:sessionID/compact

GET /project/:projectID/session/:sessionID/message -> { info: Message, parts: Part[] }[]
GET /project/:projectID/session/:sessionID/message/:messageID -> { info: Message, parts: Part[] }
POST /project/:projectID/session/:sessionID/message -> { info: Message, parts: Part[] }

POST /project/:projectID/session/:sessionID/revert -> Session
POST /project/:projectID/session/:sessionID/unrevert -> Session
POST /project/:projectID/session/:sessionID/permission/:permissionID -> Session

GET /project/:projectID/session/:sessionID/find/file -> string[]
GET /project/:projectID/session/:sessionID/file -> { type: "raw" | "patch", content: string }
GET /project/:projectID/session/:sessionID/file/status -> File[]

POST /log

GET /provider?directory=<resolve path> -> Provider
GET /config?directory=<resolve path> -> Config

GET /project/:projectID/agent?directory=<resolve path> -> Agent
GET /project/:projectID/find/file?directory=<resolve path> -> File
```

## Notes on awkward areas

Some parts of the current surface still feel under-shaped, especially endpoints that resolve provider/config/agent state by directory rather than through a cleaner project/session abstraction.

These should be treated as open design questions rather than settled structure.

## Open questions

- How strongly should session identity be tied to directory versus project lineage?
- What is the right abstraction for worktree-aware delegated sessions?
- Which operations belong to sessions versus projects versus execution runs?
- How should shared sessions interact with delegated lineage and trust/reporting surfaces?
- Which directory-resolved endpoints should be normalized into project/session-native APIs later?
