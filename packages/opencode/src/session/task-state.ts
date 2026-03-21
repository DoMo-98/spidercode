export type DelegatedTaskLifecycle = "queued" | "running" | "completed" | "failed" | "cancelled"

export const delegatedTaskLifecycleOrder = ["queued", "running", "completed", "failed", "cancelled"] as const

export type DelegatedTaskLifecycleCounts = Record<DelegatedTaskLifecycle, number>

const TASK_RESULT_TAG = /<task_result>([\s\S]*?)<\/task_result>/i
const TASK_RESULT_LINE_LIMIT = 120

type TaskToolPart = {
  tool: string
  state: {
    status: "pending" | "running" | "completed" | "error"
    metadata?: Record<string, unknown>
    output?: string
  }
}

function cancelledMetadata(part: TaskToolPart) {
  const state = part.state
  if (!("metadata" in state) || !state.metadata) return false
  return state.metadata.cancelled === true || state.metadata.lifecycle === "cancelled"
}

export function delegatedTaskLifecycle(part: TaskToolPart): DelegatedTaskLifecycle | undefined {
  if (part.tool !== "task") return undefined

  if (cancelledMetadata(part)) return "cancelled"

  switch (part.state.status) {
    case "pending":
      return "queued"
    case "running":
      return "running"
    case "completed":
      return "completed"
    case "error":
      return "failed"
  }
}

export function delegatedTaskLifecycleLabel(lifecycle: DelegatedTaskLifecycle) {
  switch (lifecycle) {
    case "queued":
      return "Queued"
    case "running":
      return "Running"
    case "completed":
      return "Completed"
    case "failed":
      return "Failed"
    case "cancelled":
      return "Cancelled"
  }
}

export function delegatedTaskLifecycleCounts(parts: TaskToolPart[]): DelegatedTaskLifecycleCounts {
  const counts: DelegatedTaskLifecycleCounts = {
    queued: 0,
    running: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  }

  for (const part of parts) {
    const lifecycle = delegatedTaskLifecycle(part)
    if (!lifecycle) continue
    counts[lifecycle] += 1
  }

  return counts
}

export function delegatedTaskLifecycleSummary(parts: TaskToolPart[]) {
  const counts = delegatedTaskLifecycleCounts(parts)
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0)
  if (total === 0) return undefined

  const segments = delegatedTaskLifecycleOrder.flatMap((lifecycle) => {
    const count = counts[lifecycle]
    if (count === 0) return []
    return `${count} ${delegatedTaskLifecycleLabel(lifecycle).toLowerCase()}`
  })

  return {
    total,
    counts,
    text: `${total} subagent${total === 1 ? "" : "s"} · ${segments.join(" · ")}`,
  }
}

export function delegatedTaskResultPreview(output?: string) {
  if (!output) return undefined

  const tagged = output.match(TASK_RESULT_TAG)?.[1] ?? output
  const normalized = tagged
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const first = normalized[0]
  if (!first) return undefined

  if (first.length <= TASK_RESULT_LINE_LIMIT) return first
  return `${first.slice(0, TASK_RESULT_LINE_LIMIT - 1).trimEnd()}…`
}

export function delegatedTaskLatestCompletedPreview(parts: TaskToolPart[]) {
  const latestCompleted = [...parts].reverse().find((part) => delegatedTaskLifecycle(part) === "completed")

  return delegatedTaskResultPreview(latestCompleted?.state.output)
}
