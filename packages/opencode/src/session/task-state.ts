export type DelegatedTaskLifecycle = "queued" | "running" | "completed" | "failed" | "cancelled"

export const delegatedTaskLifecycleOrder = ["queued", "running", "completed", "failed", "cancelled"] as const

export type DelegatedTaskLifecycleCounts = Record<DelegatedTaskLifecycle, number>

type TaskToolPart = {
  tool: string
  state: {
    status: "pending" | "running" | "completed" | "error"
    metadata?: Record<string, unknown>
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
