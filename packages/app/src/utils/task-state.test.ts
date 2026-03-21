import { describe, expect, test } from "bun:test"
import {
  delegatedTaskHasVerificationEvidence,
  delegatedTaskLatestTerminalPreview,
  delegatedTaskLifecycle,
  delegatedTaskLifecycleCounts,
  delegatedTaskLifecycleLabel,
  delegatedTaskLifecycleSummary,
  delegatedTaskResultPreview,
  delegatedTaskTerminalPreview,
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
      verificationMissing: 1,
      text: "3 subagents · 1 queued · 1 running · 1 completed · 1 verification missing",
    })
  })

  test("tracks verification gaps in compact lifecycle summaries", () => {
    expect(
      delegatedTaskLifecycleSummary([
        taskPart({
          status: "completed",
          input: {},
          output: ["<task_result>", "Verified result", "Verification: bun test", "</task_result>"].join("\n"),
          time: { start: 1, end: 2 },
        }),
        taskPart({
          status: "completed",
          input: {},
          output: ["<task_result>", "Unverified result", "</task_result>"].join("\n"),
          time: { start: 3, end: 4 },
        }),
      ]),
    ).toEqual({
      total: 2,
      counts: {
        queued: 0,
        running: 0,
        completed: 2,
        failed: 0,
        cancelled: 0,
      },
      verificationMissing: 1,
      text: "2 subagents · 2 completed · 1 verification missing",
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
    expect(delegatedTaskResultPreview("task_id: session_123\n\nTask did the thing")).toBe("Task did the thing")
    expect(delegatedTaskResultPreview("task_id: session_123\n\n")).toBeUndefined()

    expect(
      delegatedTaskResultPreview(`<task_result>${"x".repeat(140)}</task_result>`),
    ).toBe(`${"x".repeat(119)}…`)
  })

  test("detects verification evidence in delegated task results", () => {
    expect(
      delegatedTaskHasVerificationEvidence([
        "<task_result>",
        "Implemented compact task result previews",
        "Verification: bun test packages/app/src/utils/task-state.test.ts",
        "</task_result>",
      ].join("\n")),
    ).toBe(true)

    expect(
      delegatedTaskHasVerificationEvidence([
        "<task_result>",
        "Implemented compact task result previews",
        "Tests: bun test packages/app/src/utils/task-state.test.ts",
        "</task_result>",
      ].join("\n")),
    ).toBe(true)

    expect(delegatedTaskHasVerificationEvidence("<task_result>Done</task_result>")).toBe(false)
  })

  test("builds terminal previews for completed, failed, and cancelled delegated tasks", () => {
    expect(
      delegatedTaskTerminalPreview(
        taskPart({
          status: "completed",
          input: {},
          output: ["<task_result>", "Done", "Verification: bun test", "</task_result>"].join("\n"),
        }),
      ),
    ).toBe("Done")

    expect(
      delegatedTaskTerminalPreview(taskPart({ status: "completed", input: {}, output: "<task_result>Done</task_result>" })),
    ).toBe("Done · verification missing")

    expect(
      delegatedTaskTerminalPreview(taskPart({ status: "completed", input: {}, output: "task_id: session_123\n\n" })),
    ).toBe("Task completed without result summary")

    expect(delegatedTaskTerminalPreview(taskPart({ status: "error", input: {}, error: "boom" }))).toBe("boom")

    expect(
      delegatedTaskTerminalPreview(
        taskPart({
          status: "error",
          input: {},
          error: "task_id: session_123\n\nError: boom\n    at worker.ts:1:1",
        }),
      ),
    ).toBe("Error: boom")

    expect(
      delegatedTaskTerminalPreview(taskPart({ status: "error", input: {}, error: "aborted", metadata: { cancelled: true } })),
    ).toBe("aborted")
  })

  test("picks the latest terminal delegated task preview", () => {
    expect(
      delegatedTaskLatestTerminalPreview([
        taskPart({ status: "pending", input: {} }),
        taskPart({
          status: "completed",
          input: {},
          output: "<task_result>First result\nVerification: bun test</task_result>",
        }),
        taskPart({ status: "running", input: {} }),
        taskPart({ status: "error", input: {}, error: "Latest failure" }),
      ]),
    ).toBe("Latest failure")

    expect(
      delegatedTaskLatestTerminalPreview([
        taskPart({ status: "running", input: {} }),
        taskPart({
          status: "completed",
          input: {},
          output: "<task_result>Latest result\nVerification: bun test</task_result>",
        }),
      ]),
    ).toBe("Latest result")

    expect(delegatedTaskLatestTerminalPreview([taskPart({ status: "running", input: {} })])).toBeUndefined()
  })
})
