import { useTheme } from "@/catalog/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { Landing } from "@/pages/Landing"

export function App() {
  const { theme } = useTheme()

  return (
    <>
      <Landing />
      <Toaster theme={theme} />
    </>
  )
}

export default App
