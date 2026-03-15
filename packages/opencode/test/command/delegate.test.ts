import { describe, expect, test } from "bun:test"
import path from "path"
import { mkdir } from "fs/promises"
import { tmpdir } from "../fixture/fixture"
import { Instance } from "../../src/project/instance"
import { Command } from "../../src/command"

describe("delegate command", () => {
  test("loads a markdown command as a general subtask", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        const commandDir = path.join(dir, ".opencode", "command")
        await mkdir(commandDir, { recursive: true })
        await Bun.write(
          path.join(commandDir, "delegate.md"),
          `---
description: Delegate a bounded task to the general subagent
agent: general
subtask: true
---
You are the delegated worker for the parent control plane.

Execute the following bounded task autonomously:

$ARGUMENTS
`,
        )
      },
    })

    await Instance.provide({
      directory: tmp.path,
      fn: async () => {
        const command = await Command.get("delegate")
        expect(command).toBeDefined()
        expect(command?.description).toBe("Delegate a bounded task to the general subagent")
        expect(command?.agent).toBe("general")
        expect(command?.subtask).toBe(true)
        expect(command?.source).toBe("command")
        expect(command?.hints).toEqual(["$ARGUMENTS"])
        await expect(command?.template).resolves.toContain("Execute the following bounded task autonomously:")
      },
    })
  })
})
