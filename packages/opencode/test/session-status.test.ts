import { describe, expect, test } from "bun:test"
import { SessionStatus } from "../src/session/status"

describe("SessionStatus", () => {
  test("recognizes active lifecycle states", () => {
    expect(SessionStatus.isActive({ type: "queued" })).toBe(true)
    expect(SessionStatus.isActive({ type: "running" })).toBe(true)
    const retryStatus = { type: "retry", attempt: 1, message: "retrying", next: Date.now() }
    expect(SessionStatus.isActive(retryStatus)).toBe(true)
  })

  test("recognizes terminal lifecycle states", () => {
    expect(SessionStatus.isTerminal({ type: "completed" })).toBe(true)
    const failedStatus = { type: "failed", message: "boom" }
    expect(SessionStatus.isTerminal(failedStatus)).toBe(true)
    expect(SessionStatus.isTerminal({ type: "cancelled" })).toBe(true)
  })

  test("does not misclassify active and terminal states", () => {
    expect(SessionStatus.isActive({ type: "completed" })).toBe(false)
    expect(SessionStatus.isTerminal({ type: "running" })).toBe(false)
  })

  test("detects active delegated work across a session tree", () => {
    expect(
      SessionStatus.hasActiveInTree("root", {
        sessions: [
          { id: "root" },
          { id: "child-1", parentID: "root" },
          { id: "child-2", parentID: "root" },
          { id: "grandchild", parentID: "child-1" },
        ],
        statuses: {
          "child-2": { type: "completed" },
          grandchild: { type: "running" },
        },
      }),
    ).toBe(true)
  })

  test("ignores terminal delegated work when checking a session tree", () => {
    expect(
      SessionStatus.hasActiveInTree("root", {
        sessions: [
          { id: "root" },
          { id: "child-1", parentID: "root" },
        ],
        statuses: {
          root: { type: "completed" },
          "child-1": { type: "failed", message: "boom" },
        },
      }),
    ).toBe(false)
  })
})
