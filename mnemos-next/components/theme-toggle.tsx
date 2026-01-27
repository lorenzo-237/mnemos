"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon02Icon, Sun03Icon, ComputerIcon } from "@hugeicons/core-free-icons"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-full justify-start">
        <HugeiconsIcon icon={ComputerIcon} strokeWidth={2} className="mr-2 size-4" />
        Thème
      </Button>
    )
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getIcon = () => {
    if (theme === "light") return Sun03Icon
    if (theme === "dark") return Moon02Icon
    return ComputerIcon
  }

  const getLabel = () => {
    if (theme === "light") return "Clair"
    if (theme === "dark") return "Sombre"
    return "Système"
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="w-full justify-start"
    >
      <HugeiconsIcon icon={getIcon()} strokeWidth={2} className="mr-2 size-4" />
      {getLabel()}
    </Button>
  )
}
