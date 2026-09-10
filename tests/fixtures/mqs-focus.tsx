import * as React from "react"
import { createRoot } from "react-dom/client"

import {
  MqsQueueWindow,
  type MqsQueueItem,
} from "../../src/components/hubzz/mqs-queue-window"
import "../../src/index.css"

type Fixture = {
  ids: string[]
  currentIndex: number
  load: boolean
  close: boolean
  mounted: boolean
  live: boolean
}

const initial: Fixture = {
  ids: ["a", "b", "c", "d"],
  currentIndex: 1,
  load: true,
  close: true,
  mounted: true,
  live: false,
}

function items(ids: string[], live = false): MqsQueueItem[] {
  return ids.map((id) => ({
    id,
    title: "Duplicate title",
    type: "native",
    url: "",
    addedBy: "test",
    addedByName: "Test",
    duration: live ? undefined : 5,
  }))
}

function FocusFixture() {
  const [state, setState] = React.useState(initial)
  const [commands, setCommands] = React.useState<string[]>([])
  const draft = React.useRef<HTMLTextAreaElement>(null)
  const onCommand = (value: string) =>
    setCommands((current) => [...current, value])

  return (
    <main className="dark min-h-svh bg-background p-4 text-foreground">
      <h1>Controlled focus fixture</h1>
      <label>
        Outside field
        <input aria-label="Outside field" />
      </label>
      <textarea aria-label="Host snapshot" ref={draft} defaultValue="{}" />
      <button
        type="button"
        data-testid="apply-snapshot"
        onClick={() => {
          const next: Partial<Fixture> = JSON.parse(draft.current?.value ?? "{}")
          setState((current) => ({ ...current, ...next }))
        }}
      >
        Apply snapshot
      </button>
      <output data-testid="commands">{JSON.stringify(commands)}</output>
      {state.mounted && (
        <MqsQueueWindow
          title="Controlled"
          items={items(state.ids, state.live)}
          currentIndex={state.currentIndex}
          elapsed={60}
          isPlaying
          onCommand={onCommand}
          onImportSetlist={state.load ? () => {} : undefined}
          onClose={
            state.close
              ? () => setState((current) => ({ ...current, mounted: false }))
              : undefined
          }
        />
      )}
      <MqsQueueWindow
        title="Other"
        items={items(initial.ids)}
        currentIndex={1}
        isPlaying
        onCommand={onCommand}
      />
    </main>
  )
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FocusFixture />
  </React.StrictMode>
)
