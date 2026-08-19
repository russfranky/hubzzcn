import { useState, useEffect } from "react"
import { Landing } from "@/pages/Landing"
import { SidebarApp } from "@/pages/SidebarApp"
import { Toaster } from "@/components/ui/sonner"

function usePathRoute() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  return path
}

export function App() {
  const path = usePathRoute()

  if (path === "/shadcn/app" || path === "/shadcn/app/") {
    return (
      <>
        <SidebarApp />
        <Toaster />
      </>
    )
  }

  return (
    <>
      <Landing />
      <Toaster />
    </>
  )
}

export default App
