import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"

import appCss from "../styles.css?url"
import { AppShell } from "@/components/app-shell"
import { NotFoundPage } from "@/components/not-found-page"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { defaultSeo, getCanonicalUrl, getOgImageUrl } from "@/lib/seo"

const siteName = "Ketch"
const pageTitle = defaultSeo.title
const description = defaultSeo.description
const canonicalUrl = getCanonicalUrl("/")
const brandImageUrl = getOgImageUrl("/Sparkle.webp")
const ogImageUrl = getOgImageUrl()
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${canonicalUrl}#organization`,
      name: siteName,
      url: canonicalUrl,
      logo: brandImageUrl,
      image: brandImageUrl,
      founder: {
        "@type": "Person",
        name: "Kurt Calacday",
      },
      sameAs: [
        "https://github.com/KurutoDenzeru/Ketch",
        "https://linkedin.com/in/kurtcalacday/",
        "https://instagram.com/krtclcdy",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${canonicalUrl}#website`,
      url: canonicalUrl,
      name: siteName,
      description,
      publisher: {
        "@id": `${canonicalUrl}#organization`,
      },
      inLanguage: "en-US",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${canonicalUrl}#app`,
      name: pageTitle,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: canonicalUrl,
      image: ogImageUrl,
      description,
      author: {
        "@type": "Person",
        name: "Kurt Calacday",
      },
      creator: {
        "@id": `${canonicalUrl}#organization`,
      },
      publisher: {
        "@id": `${canonicalUrl}#organization`,
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: pageTitle },
      { name: "author", content: "Kurt Calacday" },
      { name: "authors", content: "Kurt Calacday" },
      { name: "creator", content: "Kurt Calacday" },
      { name: "publisher", content: siteName },
      { name: "theme-color", content: "#faf9f5" },
      { name: "color-scheme", content: "light dark" },
    ],
    links: [
      { rel: "icon", type: "image/webp", href: "/Sparkle.webp" },
      { rel: "apple-touch-icon", href: "/Sparkle.webp" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://api.fonts.coollabs.io" },
      {
        rel: "stylesheet",
        href: "https://api.fonts.coollabs.io/css2?family=Geist:wght@400..700&family=Satoshi:wght@400..700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className="min-h-svh bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AppShell>{children}</AppShell>
          <Toaster
            position="bottom-right"
            expand={false}
            richColors
            toastOptions={{
              classNames: {
                toast:
                  "rounded-2xl border border-border/70 bg-background/95 shadow-xs backdrop-blur-xl",
                title: "text-sm font-medium",
                description: "text-sm leading-6 text-muted-foreground",
                actionButton:
                  "rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground",
                cancelButton:
                  "rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground",
              },
            }}
          />
        </ThemeProvider>
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        {/* Proton Pass marks its detected form before React hydrates, so strip the marker as it lands. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var marker="data-protonpass-form";function strip(){document.querySelectorAll("["+marker+"]").forEach(function(el){el.removeAttribute(marker)})}var observer=new MutationObserver(strip);observer.observe(document,{attributes:true,attributeFilter:[marker],subtree:true});window.addEventListener("load",function(){requestAnimationFrame(function(){observer.disconnect()})},{once:true})})()`,
          }}
        />
        <Scripts />
      </body>
    </html>
  )
}
