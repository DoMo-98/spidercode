export type DelegatedTaskLifecycle = "queued" | "running" | "completed" | "failed" | "cancelled"

export const delegatedTaskLifecycleOrder = ["queued", "running", "completed", "failed", "cancelled"] as const

export type DelegatedTaskLifecycleCounts = Record<DelegatedTaskLifecycle, number>

const TASK_RESULT_TAG = /<task_result>([\s\S]*?)<\/task_result>/i
const TASK_RESULT_LINE_LIMIT = 120
const TASK_METADATA_LINE = /^task_[a-z0-9_-]+:\s/i
const TASK_VERIFICATION_LINE = /^(verification|verified|tests?|checks?):\s/i
const COMPLETED_WITHOUT_RESULT = "Task completed without result summary"

function firstPreviewLine(text?: string) {
  if (!text) return undefined

  const first = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .find((line) => !TASK_METADATA_LINE.test(line) && !TASK_VERIFICATION_LINE.test(line))

  if (!first) return undefined
  if (first.length <= TASK_RESULT_LINE_LIMIT) return first
  return `${first.slice(0, TASK_RESULT_LINE_LIMIT - 1).trimEnd()}…`
}

type TaskToolPart = {
  tool: string
  state: {
    status: "pending" | "running" | "completed" | "error"
    metadata?: Record<string, unknown>
    output?: string
    error?: string
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
  const verificationMissing = parts.filter((part) => {
    const lifecycle = delegatedTaskLifecycle(part)
    return lifecycle === "completed" && !delegatedTaskHasVerificationEvidence(part.state.output)
  }).length

  if (verificationMissing > 0) {
    segments.push(`${verificationMissing} verification missing`)
  }

  return {
    total,
    counts,
    verificationMissing,
    text: `${total} subagent${total === 1 ? "" : "s"} · ${segments.join(" · ")}`,
  }
}

function taskResultBody(output?: string) {
  if (!output) return undefined
  return output.match(TASK_RESULT_TAG)?.[1] ?? output
}

export function delegatedTaskResultPreview(output?: string) {
  return firstPreviewLine(taskResultBody(output))
}

export function delegatedTaskHasVerificationEvidence(output?: string) {
  const body = taskResultBody(output)
  if (!body) return false

  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .some((line) => TASK_VERIFICATION_LINE.test(line))
}

export function delegatedTaskTerminalPreview(part: TaskToolPart) {
  const lifecycle = delegatedTaskLifecycle(part)
  if (!lifecycle) return undefined

  if (lifecycle === "completed") {
    const preview = delegatedTaskResultPreview(part.state.output)
    if (!preview) return COMPLETED_WITHOUT_RESULT
    if (!delegatedTaskHasVerificationEvidence(part.state.output)) {
      return `${preview} · verification missing`
    }
    return preview
  }
  if (lifecycle === "failed") return firstPreviewLine(part.state.error) ?? "Task failed"
  if (lifecycle === "cancelled") return firstPreviewLine(part.state.error) ?? "Task cancelled"

  return undefined
}

export function delegatedTaskLatestTerminalPreview(parts: TaskToolPart[]) {
  const latestTerminal = [...parts]
    .reverse()
    .find((part) => {
      const lifecycle = delegatedTaskLifecycle(part)
      return lifecycle === "completed" || lifecycle === "failed" || lifecycle === "cancelled"
    })

  return latestTerminal ? delegatedTaskTerminalPreview(latestTerminal) : undefined
}
