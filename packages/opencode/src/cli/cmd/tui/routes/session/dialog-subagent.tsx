import { createMemo } from "solid-js"
import { DialogSelect, type DialogSelectOption } from "@tui/ui/dialog-select"
import { useRoute } from "@tui/context/route"
import { useSync } from "@tui/context/sync"
import { useSDK } from "@tui/context/sdk"
import { SessionStatus } from "@/session/status"

export function DialogSubagent(props: { sessionID: string }) {
  const route = useRoute()
  const sync = useSync()
  const sdk = useSDK()
  const status = createMemo(() => sync.data.session_status?.[props.sessionID] ?? { type: "completed" as const })
  const statusLabel = createMemo(() => status().type.charAt(0).toUpperCase() + status().type.slice(1))
  const active = createMemo(() => SessionStatus.isActive(status()))

  const options = createMemo<DialogSelectOption<string>[]>(() => [
    {
      title: "Open",
      value: "subagent.view",
      description: "the subagent's session",
      onSelect: (dialog) => {
        route.navigate({
          type: "session",
          sessionID: props.sessionID,
        })
        dialog.clear()
      },
    },
    ...(active()
      ? [
          {
            title: "Cancel",
            value: "subagent.cancel",
            description: "interrupt this active subagent",
            onSelect: async (dialog) => {
              await sdk.client.session.abort({
                sessionID: props.sessionID,
              })
              dialog.clear()
            },
          } satisfies DialogSelectOption<string>,
        ]
      : []),
  ])

  return <DialogSelect title={`Subagent Actions · ${statusLabel()}`} options={options()} />
}
