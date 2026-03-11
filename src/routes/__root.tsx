import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"

import { AppFooter } from "@/components/app-footer"
import { AppNavbar } from "@/components/app-navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import appCss from "../styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "AI Startup Idea Lab",
      },
      {
        name: "description",
        content:
          "Generate startup ideas, mini pitches, and AI market validation snapshots with Gemini.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://api.fonts.coollabs.io",
      },
      {
        rel: "stylesheet",
        href: "https://api.fonts.coollabs.io/css2?family=Fraunces:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-svh bg-background text-foreground antialiased">
        <ThemeProvider>
          <div className="flex min-h-svh flex-col">
            <AppNavbar />
            <div className="flex-1 px-0 pt-20 pb-24 md:pt-24 md:pb-0">
              {children}
            </div>
            <AppFooter />
          </div>
          <Toaster
            position="bottom-right"
            expand={false}
            richColors
            toastOptions={{
              classNames: {
                toast:
                  "rounded-2xl border border-border/70 bg-background/95 shadow-sm backdrop-blur-xl",
                title: "text-sm font-medium",
                description: "text-sm text-muted-foreground",
              },
            }}
          />
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
