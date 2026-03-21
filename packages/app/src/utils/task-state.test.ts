import { describe, expect, test } from "bun:test"
import {
  delegatedTaskLatestCompletedPreview,
  delegatedTaskLifecycle,
  delegatedTaskLifecycleCounts,
  delegatedTaskLifecycleLabel,
  delegatedTaskLifecycleSummary,
  delegatedTaskResultPreview,
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

  test("extracts a concise task result preview", () => {
    expect(
      delegatedTaskResultPreview([
        "task_id: session_123",
        "",
        "<task_result>",
        "Implemented compact task result previews",
        "Verification: bun test packages/opencode/test/session/task-state.test.ts",
        "</task_result>",
      ].join("\n")),
    ).toBe("Implemented compact task result previews")

    expect(delegatedTaskResultPreview("\n\nPlain result without tags\nSecond line")).toBe("Plain result without tags")

    expect(
      delegatedTaskResultPreview(`<task_result>${"x".repeat(140)}</task_result>`),
    ).toBe(`${"x".repeat(119)}…`)
  })

  test("builds a compact active delegated task preview from task descriptions", () => {
    expect(
      delegatedTaskActivePreview([
        taskPart({ status: "pending", input: { description: "Index repo" } }),
        taskPart({ status: "running", input: { description: "Run tests" } }),
        taskPart({ status: "completed", input: { description: "Ignored done" }, output: "done" }),
      ]),
    ).toBe("Index repo · Run tests")

    expect(
      delegatedTaskActivePreview([
        taskPart({ status: "running", input: { description: "Run tests" } }),
        taskPart({ status: "running", input: { description: "Run tests" } }),
        taskPart({ status: "pending", input: { description: "Update docs" } }),
        taskPart({ status: "pending", input: { description: "Ship release" } }),
      ]),
    ).toBe("Run tests · Update docs +1 more")

    expect(delegatedTaskActivePreview([taskPart({ status: "running", input: {} })])).toBe("1 active subagent")
    expect(delegatedTaskActivePreview([taskPart({ status: "completed", input: { description: "Done" } })])).toBeUndefined()
  })

  test("picks the latest successfully completed delegated task preview", () => {
    expect(
      delegatedTaskLatestCompletedPreview([
        taskPart({ status: "pending", input: {} }),
        taskPart({ status: "completed", input: {}, output: "<task_result>First result</task_result>" }),
        taskPart({ status: "running", input: {} }),
        taskPart({ status: "completed", input: {}, output: "<task_result>Latest result</task_result>" }),
      ]),
    ).toBe("Latest result")

    expect(
      delegatedTaskLatestCompletedPreview([
        taskPart({ status: "completed", input: {}, output: "<task_result>Good result</task_result>" }),
        taskPart({
          status: "completed",
          input: {},
          output: "<task_result>Cancelled result</task_result>",
          metadata: { lifecycle: "cancelled" },
        }),
      ]),
    ).toBe("Good result")

    expect(delegatedTaskLatestCompletedPreview([taskPart({ status: "running", input: {} })])).toBeUndefined()
  })
})
