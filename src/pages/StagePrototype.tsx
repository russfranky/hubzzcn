import { StageShell } from "@/components/stage/StageShell"

import "./stage-hud.css"

export function StagePrototype() {
  return (
    <main className="bg-stage-bg h-dvh overflow-hidden">
      <StageShell />
    </main>
  )
}
