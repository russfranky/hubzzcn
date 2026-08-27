import { useTheme } from "@/catalog/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { Landing } from "@/pages/Landing"
import { MqsPrototype } from "@/pages/MqsPrototype"
import { PortalPrototype } from "@/pages/PortalPrototype"

export function App() {
  const { theme } = useTheme()
  const prototype = new URLSearchParams(window.location.search).get("prototype")
  const pathname = window.location.pathname.replace(/\/+$/, "")
  const portalPrototype =
    pathname === "/cn/portal" ||
    pathname === "/portal" ||
    prototype === "portal"

  return (
    <>
      {portalPrototype ? (
        <PortalPrototype />
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
