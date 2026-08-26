import { useTheme } from "@/catalog/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { Landing } from "@/pages/Landing"
import { MqsPrototype } from "@/pages/MqsPrototype"

export function App() {
  const { theme } = useTheme()
  const prototype = new URLSearchParams(window.location.search).get("prototype")

  return (
    <>
      {prototype === "mqs" ? <MqsPrototype /> : <Landing />}
      <Toaster theme={theme} />
    </>
  )
}

export default App
