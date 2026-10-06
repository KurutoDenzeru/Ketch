"use client"

import { useEffect, useState } from "react"
import { LaptopMinimal, MoonStar, SunMedium } from "lucide-react"
import { useTheme } from "next-themes"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const triggers = [
  { value: "system", label: "System theme", Icon: LaptopMinimal },
  { value: "light", label: "Light theme", Icon: SunMedium },
  { value: "dark", label: "Dark theme", Icon: MoonStar },
] as const

export function ThemeToggleTabs() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-10 w-[7.5rem] rounded-full border border-border/60 bg-muted/40" />
    )
  }

  return (
    <Tabs value={theme ?? "system"} onValueChange={setTheme} className="gap-0">
      <TabsList className="h-10 gap-0.5 rounded-full border border-border/60 bg-muted/40 p-1">
        {triggers.map(({ value, label, Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="inline-flex size-8 items-center justify-center rounded-full px-0 text-muted-foreground transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground"
            title={label}
            aria-label={label}
          >
            <Icon className="size-4" aria-hidden="true" />
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}