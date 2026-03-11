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
      <div className="h-[38px] w-[10.5rem] rounded-full border border-border/70 bg-background/80 shadow-sm" />
    )
  }

  return (
    <Tabs value={theme ?? "system"} onValueChange={setTheme} className="gap-0">
      <TabsList className="h-[38px] rounded-full border border-border/70 bg-background/85 p-[2px] shadow-sm backdrop-blur">
        <TabsTrigger
          value="system"
          className="size-[32px] rounded-full border border-transparent px-0 data-[state=active]:border-border/70 data-[state=active]:shadow-sm"
          title="System"
          aria-label="System theme"
        >
          <LaptopMinimal className="size-4" />
        </TabsTrigger>
        <TabsTrigger
          value="light"
          className="size-[32px] rounded-full border border-transparent px-0 data-[state=active]:border-border/70 data-[state=active]:shadow-sm"
          title="Light"
          aria-label="Light theme"
        >
          <SunMedium className="size-4" />
        </TabsTrigger>
        <TabsTrigger
          value="dark"
          className="size-[32px] rounded-full border border-transparent px-0 data-[state=active]:border-border/70 data-[state=active]:shadow-sm"
          title="Dark"
          aria-label="Dark theme"
        >
          <MoonStar className="size-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
