export type DelegatedTaskLifecycle = "queued" | "running" | "completed" | "failed" | "cancelled"

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
