import { useTheme } from "@/catalog/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { Landing } from "@/pages/Landing"
import { MqsPrototype } from "@/pages/MqsPrototype"
import { PortalPrototypeDemo } from "@/pages/PortalPrototype"
import { StagePrototype } from "@/pages/StagePrototype"

export function App() {
  const { theme } = useTheme()
  const prototype = new URLSearchParams(window.location.search).get("prototype")
  const pathname = window.location.pathname.replace(/\/+$/, "")
  const portalPrototype =
    pathname === "/cn/portal" ||
    pathname === "/portal" ||
    prototype === "portal"
  const stagePrototype =
    pathname === "/cn/stage" || pathname === "/stage" || prototype === "stage"

  return (
    <>
      {portalPrototype ? (
        <PortalPrototypeDemo />
      ) : stagePrototype ? (
        <StagePrototype />
      ) : prototype === "mqs" ? (
        <MqsPrototype />
      ) : (
        <Landing />
      )}
      <Toaster theme={theme} />
    </>
  )
}

export default App
