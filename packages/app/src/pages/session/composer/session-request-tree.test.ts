import { describe, expect, test } from "bun:test"
import type { PermissionRequest, QuestionRequest, Session } from "@opencode-ai/sdk/v2/client"
import {
  sessionDescendantID,
  sessionDescendantIDs,
  sessionLatestDescendantID,
  sessionPermissionRequest,
  sessionQuestionRequest,
  sessionTreeIDs,
} from "./session-request-tree"

const session = (input: { id: string; parentID?: string; created?: number; updated?: number }) =>
  ({
    id: input.id,
    parentID: input.parentID,
    time:
      input.created || input.updated
        ? {
            created: input.created ?? input.updated ?? 0,
            updated: input.updated,
          }
        : undefined,
  }) as Session

const permission = (id: string, sessionID: string) =>
  ({
    id,
    sessionID,
  }) as PermissionRequest

const question = (id: string, sessionID: string) =>
  ({
    id,
    sessionID,
    questions: [],
  }) as QuestionRequest

describe("session request tree", () => {
  test("prefers the current session permission", () => {
    const sessions = [session({ id: "root" }), session({ id: "child", parentID: "root" })]
    const permissions = {
      root: [permission("perm-root", "root")],
      child: [permission("perm-child", "child")],
    }

    expect(sessionPermissionRequest(sessions, permissions, "root")?.id).toBe("perm-root")
  })

  test("returns a nested child question", () => {
    const sessions = [
      session({ id: "root" }),
      session({ id: "child", parentID: "root" }),
      session({ id: "grand", parentID: "child" }),
    ]
    const questions = {
      grand: [question("q-grand", "grand")],
    }

    expect(sessionQuestionRequest(sessions, questions, "root")?.id).toBe("q-grand")
  })

  test("returns breadth-first tree ids including the root", () => {
    const sessions = [
      session({ id: "root" }),
      session({ id: "child-a", parentID: "root" }),
      session({ id: "child-b", parentID: "root" }),
      session({ id: "grand", parentID: "child-a" }),
      session({ id: "other" }),
    ]

    expect(sessionTreeIDs(sessions, "root")).toEqual(["root", "child-a", "child-b", "grand"])
  })

  test("returns descendant ids without the root", () => {
    const sessions = [
      session({ id: "root" }),
      session({ id: "child", parentID: "root" }),
      session({ id: "grand", parentID: "child" }),
    ]

    expect(sessionDescendantIDs(sessions, "root")).toEqual(["child", "grand"])
  })

  test("returns the first matching descendant id in breadth-first order", () => {
    const sessions = [
      session({ id: "root" }),
      session({ id: "child-a", parentID: "root" }),
      session({ id: "child-b", parentID: "root" }),
      session({ id: "grand", parentID: "child-a" }),
    ]

    expect(sessionDescendantID(sessions, "root", (id) => id.startsWith("child"))).toBe("child-a")
    expect(sessionDescendantID(sessions, "root", (id) => id === "grand")).toBe("grand")
    expect(sessionDescendantID(sessions, "root", (id) => id === "missing")).toBeUndefined()
  })

  test("returns the most recently updated descendant id", () => {
    const sessions = [
      session({ id: "root", created: 1 }),
      session({ id: "child-a", parentID: "root", created: 2, updated: 4 }),
      session({ id: "child-b", parentID: "root", created: 3, updated: 9 }),
      session({ id: "grand", parentID: "child-a", created: 8 }),
    ]

    expect(sessionLatestDescendantID(sessions, "root")).toBe("child-b")
    expect(sessionLatestDescendantID(sessions, "child-a")).toBe("grand")
    expect(sessionLatestDescendantID(sessions, "missing")).toBeUndefined()
  })
})
