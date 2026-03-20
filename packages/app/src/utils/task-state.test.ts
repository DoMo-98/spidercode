import { describe, expect, test } from "bun:test"
import {
  delegatedTaskLifecycle,
  delegatedTaskLifecycleCounts,
  delegatedTaskLifecycleLabel,
  delegatedTaskLifecycleSummary,
} from "./task-state"

function taskPart(state: Record<string, unknown>) {
  return {
    tool: "task",
    state,
  } as any
}

describe("task-state", () => {
  test("maps task tool states into delegated lifecycle values", () => {
    expect(delegatedTaskLifecycle(taskPart({ status: "pending", input: {} }))).toBe("queued")
    expect(delegatedTaskLifecycle(taskPart({ status: "running", input: {}, time: { start: Date.now() } }))).toBe(
      "running",
    )
    expect(
      delegatedTaskLifecycle(
        taskPart({
          status: "completed",
          input: {},
          output: "done",
          time: { start: 1, end: 2 },
        }),
      ),
    ).toBe("completed")
    expect(
      delegatedTaskLifecycle(taskPart({ status: "error", input: {}, error: "boom", time: { start: 1, end: 2 } })),
    ).toBe("failed")
  })

  test("treats cancelled task metadata as cancelled lifecycle", () => {
    expect(
      delegatedTaskLifecycle(
        taskPart({
          status: "completed",
          input: {},
          metadata: { cancelled: true },
          time: { start: 1, end: 2 },
        }),
      ),
    ).toBe("cancelled")
  })

  test("ignores non-task tool parts", () => {
    expect(
      delegatedTaskLifecycle({
        tool: "bash",
        state: { status: "completed" },
      } as any),
    ).toBeUndefined()
  })

  test("formats labels and summary text", () => {
    expect(delegatedTaskLifecycleLabel("queued")).toBe("Queued")
    expect(delegatedTaskLifecycleLabel("running")).toBe("Running")
    expect(delegatedTaskLifecycleLabel("completed")).toBe("Completed")
    expect(delegatedTaskLifecycleLabel("failed")).toBe("Failed")
    expect(delegatedTaskLifecycleLabel("cancelled")).toBe("Cancelled")

    expect(
      delegatedTaskLifecycleCounts([
        taskPart({ status: "pending", input: {} }),
        taskPart({ status: "running", input: {}, time: { start: 1 } }),
        taskPart({ status: "completed", input: {}, output: "done", time: { start: 1, end: 2 } }),
        taskPart({ status: "error", input: {}, error: "boom", time: { start: 1, end: 2 } }),
        taskPart({
          status: "completed",
          input: {},
          metadata: { lifecycle: "cancelled" },
          time: { start: 1, end: 2 },
        }),
      ]),
    ).toEqual({
      queued: 1,
      running: 1,
      completed: 1,
      failed: 1,
      cancelled: 1,
    })

    expect(
      delegatedTaskLifecycleSummary([
        taskPart({ status: "pending", input: {} }),
        taskPart({ status: "running", input: {}, time: { start: 1 } }),
        taskPart({ status: "completed", input: {}, output: "done", time: { start: 1, end: 2 } }),
      ]),
    ).toEqual({
      total: 3,
      counts: {
        queued: 1,
        running: 1,
        completed: 1,
        failed: 0,
        cancelled: 0,
      },
      text: "3 subagents · 1 queued · 1 running · 1 completed",
    })
  })
})
