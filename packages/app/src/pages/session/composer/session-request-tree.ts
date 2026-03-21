import type { PermissionRequest, QuestionRequest, Session } from "@opencode-ai/sdk/v2/client"

function sessionChildrenMap(session: Session[]) {
  return session.reduce((acc, item) => {
    if (!item.parentID) return acc
    const list = acc.get(item.parentID)
    if (list) list.push(item.id)
    if (!list) acc.set(item.parentID, [item.id])
    return acc
  }, new Map<string, string[]>())
}

export function sessionTreeIDs(session: Session[], sessionID?: string) {
  if (!sessionID) return []

  const map = sessionChildrenMap(session)
  const seen = new Set([sessionID])
  const ids = [sessionID]

  for (const id of ids) {
    const list = map.get(id)
    if (!list) continue
    for (const child of list) {
      if (seen.has(child)) continue
      seen.add(child)
      ids.push(child)
    }
  }

  return ids
}

export function sessionDescendantIDs(session: Session[], sessionID?: string) {
  const ids = sessionTreeIDs(session, sessionID)
  return ids.slice(1)
}

export function sessionDescendantID(session: Session[], sessionID: string | undefined, include: (id: string) => boolean) {
  return sessionDescendantIDs(session, sessionID).find(include)
}

function sessionTreeRequest<T>(
  session: Session[],
  request: Record<string, T[] | undefined>,
  sessionID?: string,
  include: (item: T) => boolean = () => true,
) {
  const ids = sessionTreeIDs(session, sessionID)
  const id = ids.find((id) => request[id]?.some(include))
  if (!id) return
  return request[id]?.find(include)
}

export function sessionPermissionRequest(
  session: Session[],
  request: Record<string, PermissionRequest[] | undefined>,
  sessionID?: string,
  include?: (item: PermissionRequest) => boolean,
) {
  return sessionTreeRequest(session, request, sessionID, include)
}

export function sessionQuestionRequest(
  session: Session[],
  request: Record<string, QuestionRequest[] | undefined>,
  sessionID?: string,
  include?: (item: QuestionRequest) => boolean,
) {
  return sessionTreeRequest(session, request, sessionID, include)
}
