import { describe, expect, test } from "bun:test"
import { delegatedTaskLifecycle, delegatedTaskLifecycleLabel } from "../../src/session/task-state"

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
})
