import { describe, expect, test } from "bun:test"
import {
  delegatedTaskLifecycle,
  delegatedTaskLifecycleCounts,
  delegatedTaskLifecycleLabel,
  delegatedTaskLifecycleSummary,
} from "../../src/session/task-state"

function taskPart(state: any) {
  return {
    tool: "task",
    state,
  } as any
}

describe("delegated task lifecycle", () => {
  test("maps tool states to delegated task lifecycle", () => {
    expect(delegatedTaskLifecycle(taskPart({ status: "pending", input: {}, raw: "task" }))).toBe("queued")
    expect(
      delegatedTaskLifecycle(taskPart({ status: "running", input: {}, time: { start: Date.now() } })),
    ).toBe("running")
    expect(
      delegatedTaskLifecycle(
        taskPart({
          status: "completed",
          input: {},
          output: "done",
          title: "Do thing",
          metadata: {},
          time: { start: 1, end: 2 },
        }),
      ),
    ).toBe("completed")
    expect(
      delegatedTaskLifecycle(taskPart({ status: "error", input: {}, error: "boom", time: { start: 1, end: 2 } })),
    ).toBe("failed")
  })

  test("prefers cancelled metadata over generic tool error/completion state", () => {
    expect(
      delegatedTaskLifecycle(
        taskPart({
          status: "error",
          input: {},
          error: "aborted",
          metadata: { cancelled: true },
          time: { start: 1, end: 2 },
        }),
      ),
    ).toBe("cancelled")

    expect(
      delegatedTaskLifecycle(
        taskPart({
          status: "completed",
          input: {},
          output: "",
          title: "Do thing",
          metadata: { lifecycle: "cancelled" },
          time: { start: 1, end: 2 },
        }),
      ),
    ).toBe("cancelled")
  })

  test("returns labels for delegated task lifecycle", () => {
    expect(delegatedTaskLifecycleLabel("queued")).toBe("Queued")
    expect(delegatedTaskLifecycleLabel("running")).toBe("Running")
    expect(delegatedTaskLifecycleLabel("completed")).toBe("Completed")
    expect(delegatedTaskLifecycleLabel("failed")).toBe("Failed")
    expect(delegatedTaskLifecycleLabel("cancelled")).toBe("Cancelled")
  })

  test("counts delegated task lifecycle states", () => {
    expect(
      delegatedTaskLifecycleCounts([
        taskPart({ status: "pending" }),
        taskPart({ status: "running" }),
        taskPart({ status: "completed" }),
        taskPart({ status: "error" }),
        taskPart({ status: "completed", metadata: { lifecycle: "cancelled" } }),
        { tool: "bash", state: { status: "completed" } },
      ] as any),
    ).toEqual({
      queued: 1,
      running: 1,
      completed: 1,
      failed: 1,
      cancelled: 1,
    })
  })

  test("formats a compact delegated task summary", () => {
    expect(
      delegatedTaskLifecycleSummary([
        taskPart({ status: "pending" }),
        taskPart({ status: "running" }),
        taskPart({ status: "completed" }),
        taskPart({ status: "error" }),
      ] as any),
    ).toEqual({
      total: 4,
      counts: {
        queued: 1,
        running: 1,
        completed: 1,
        failed: 1,
        cancelled: 0,
      },
      text: "4 subagents · 1 queued · 1 running · 1 completed · 1 failed",
    })

    expect(delegatedTaskLifecycleSummary([{ tool: "bash", state: { status: "completed" } }] as any)).toBeUndefined()
  })
})
