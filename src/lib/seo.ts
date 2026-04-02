const defaultSiteUrl = "https://ketch.krtclcdy.workers.dev"

const normalizedSiteUrl = (
  import.meta.env.VITE_PUBLIC_SITE_URL ?? defaultSiteUrl
).replace(/\/$/, "")

const metadataBase = new URL(`${normalizedSiteUrl}/`)

const defaultTitle = "Ketch | AI Startup Idea Lab"
const defaultDescription =
  "✨ Idea workshop for instant brainstorming, local save/slug sharing, powered by React, TypeScript, Tailwind, TanStack Router, and shadcn/ui."
const defaultKeywords = [
  "startup idea generator",
  "AI startup ideas",
  "startup validation tool",
  "founder pitch generator",
  "market validation app",
  "Gemini startup app",
  "idea lab",
  "Ketch",
].join(", ")

type SeoConfig = {
  path: string
  title?: string
  description?: string
  keywords?: string
  type?: "website" | "article"
  imagePath?: string
  imageAlt?: string
  robots?: string
}

export function getCanonicalUrl(path: string) {
  return new URL(path, metadataBase).toString()
}

export function getOgImageUrl(imagePath = "/OpenGraph.png") {
  return new URL(imagePath, metadataBase).toString()
}

function getImageMimeType(imagePath: string) {
  if (imagePath.endsWith(".png")) {
    return "image/png"
  }

  if (imagePath.endsWith(".jpg") || imagePath.endsWith(".jpeg")) {
    return "image/jpeg"
  }

  if (imagePath.endsWith(".webp")) {
    return "image/webp"
  }

  return "image/png"
}

export function buildSeoHead({
  path,
  title = defaultTitle,
  description = defaultDescription,
  keywords = defaultKeywords,
  type = "website",
  imagePath = "/OpenGraph.png",
  imageAlt = "Ketch Open Graph preview",
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
}: SeoConfig) {
  const canonicalUrl = getCanonicalUrl(path)
  const ogImageUrl = getOgImageUrl(imagePath)
  const imageMimeType = getImageMimeType(imagePath)

  return {
    meta: [
      {
        title,
      },
      {
        name: "description",
        content: description,
      },
      {
        name: "keywords",
        content: keywords,
      },
      {
        name: "robots",
        content: robots,
      },
      {
        name: "googlebot",
        content: robots,
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: title,
      },
      {
        name: "twitter:description",
        content: description,
      },
      {
        name: "twitter:url",
        content: canonicalUrl,
      },
      {
        name: "twitter:image",
        content: ogImageUrl,
      },
      {
        name: "twitter:image:src",
        content: ogImageUrl,
      },
      {
        name: "twitter:image:alt",
        content: imageAlt,
      },
      {
        property: "og:type",
        content: type,
      },
      {
        property: "og:site_name",
        content: "Ketch",
      },
      {
        property: "og:title",
        content: title,
      },
      {
        property: "og:description",
        content: description,
      },
      {
        property: "og:url",
        content: canonicalUrl,
      },
      {
        property: "og:image",
        content: ogImageUrl,
      },
      {
        property: "og:image:url",
        content: ogImageUrl,
      },
      {
        property: "og:image:secure_url",
        content: ogImageUrl,
      },
      {
        property: "og:image:type",
        content: imageMimeType,
      },
      {
        property: "og:image:width",
        content: "3456",
      },
      {
        property: "og:image:height",
        content: "2160",
      },
      {
        property: "og:image:alt",
        content: imageAlt,
      },
      {
        property: "og:locale",
        content: "en_US",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: canonicalUrl,
      },
      {
        rel: "alternate",
        hrefLang: "en-US",
        href: canonicalUrl,
      },
      {
        rel: "alternate",
        hrefLang: "x-default",
        href: canonicalUrl,
      },
    ],
  }
}

export const defaultSeo = {
  title: defaultTitle,
  description: defaultDescription,
  keywords: defaultKeywords,
}
