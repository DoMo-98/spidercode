import { BusEvent } from "@/bus/bus-event"
import { Bus } from "@/bus"
import { Instance } from "@/project/instance"
import { SessionID } from "./schema"
import z from "zod"

export namespace SessionStatus {
  export const Info = z
    .union([
      z.object({
        type: z.literal("queued"),
      }),
      z.object({
        type: z.literal("running"),
      }),
      z.object({
        type: z.literal("retry"),
        attempt: z.number(),
        message: z.string(),
        next: z.number(),
      }),
      z.object({
        type: z.literal("completed"),
      }),
      z.object({
        type: z.literal("failed"),
        message: z.string().optional(),
      }),
      z.object({
        type: z.literal("cancelled"),
      }),
    ])
    .meta({
      ref: "SessionStatus",
    })
  export type Info = z.infer<typeof Info>

  export const Event = {
    Status: BusEvent.define(
      "session.status",
      z.object({
        sessionID: SessionID.zod,
        status: Info,
      }),
    ),
  }

  export function isActive(status: { type: string }) {
    return status.type === "queued" || status.type === "running" || status.type === "retry" || status.type === "busy"
  }

  export function isTerminal(status: { type: string }) {
    return (
      status.type === "completed" ||
      status.type === "failed" ||
      status.type === "cancelled" ||
      status.type === "idle"
    )
  }

  const state = Instance.state(() => {
    const data: Record<string, Info> = {}
    return data
  })

  export function get(sessionID: SessionID) {
    return (
      state()[sessionID] ?? {
        type: "completed",
      }
    )
  }

  export function list() {
    return state()
  }

  export function set(sessionID: SessionID, status: Info) {
    Bus.publish(Event.Status, {
      sessionID,
      status,
    })
    state()[sessionID] = status
  }

  export function clear(sessionID: SessionID) {
    delete state()[sessionID]
  }
}
