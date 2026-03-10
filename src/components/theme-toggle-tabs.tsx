"use client"

import { useEffect, useState } from "react"
import { LaptopMinimal, MoonStar, SunMedium } from "lucide-react"
import { useTheme } from "next-themes"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ThemeToggleTabs() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-10 w-32 rounded-full border border-border/70 bg-background/80 shadow-sm" />
    )
  }

  return (
    <Tabs value={theme ?? "system"} onValueChange={setTheme} className="gap-0">
      <TabsList className="h-10 rounded-full border border-border/70 bg-background/85 p-1 shadow-sm backdrop-blur">
        <TabsTrigger
          value="system"
          className="rounded-full px-3"
          title="System"
          aria-label="System theme"
        >
          <LaptopMinimal className="size-4" />
        </TabsTrigger>
        <TabsTrigger
          value="light"
          className="rounded-full px-3"
          title="Light"
          aria-label="Light theme"
        >
          <SunMedium className="size-4" />
        </TabsTrigger>
        <TabsTrigger
          value="dark"
          className="rounded-full px-3"
          title="Dark"
          aria-label="Dark theme"
        >
          <MoonStar className="size-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
