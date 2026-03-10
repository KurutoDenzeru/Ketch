import { createServerFn } from "@tanstack/react-start"

import type {
  IdeaCategory,
  IdeaFacet,
  MarketValidation,
  StartupIdea,
  StartupPitch,
} from "@/types/idea"

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent"

const sharedSchemaConfig = {
  type: "object",
  additionalProperties: false,
} as const

const ideaResponseSchema = {
  ...sharedSchemaConfig,
  properties: {
    name: { type: "string" },
    tagline: { type: "string" },
    description: { type: "string" },
    audience: { type: "string" },
    twist: { type: "string" },
    monetization: { type: "string" },
    validationScore: { type: "number" },
    alternativeNames: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 3,
    },
  },
  required: [
    "name",
    "tagline",
    "description",
    "audience",
    "twist",
    "monetization",
    "validationScore",
    "alternativeNames",
  ],
} as const

const pitchResponseSchema = {
  ...sharedSchemaConfig,
  properties: {
    problem: { type: "string" },
    solution: { type: "string" },
    market: { type: "string" },
    businessModel: { type: "string" },
  },
  required: ["problem", "solution", "market", "businessModel"],
} as const

const facetResponseSchema = {
  ...sharedSchemaConfig,
  properties: {
    value: { type: "string" },
  },
  required: ["value"],
} as const

const marketValidationSchema = {
  ...sharedSchemaConfig,
  properties: {
    competition: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 3,
    },
    risks: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 3,
    },
    potentialUsers: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 3,
    },
    verdict: { type: "string" },
  },
  required: ["competition", "risks", "potentialUsers", "verdict"],
} as const

function ensureGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in the server environment.")
  }

  return apiKey
}

async function callGemini<T>({
  prompt,
  schema,
}: {
  prompt: string
  schema: object
}) {
  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": ensureGeminiApiKey(),
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: schema,
        temperature: 1,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Gemini request failed with ${response.status}: ${errorText || "Unknown error"}`
    )
  }

  const payload = await response.json()
  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? "")
    .join("")
    .trim()

  if (!text) {
    throw new Error("Gemini returned an empty response.")
  }

  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error("Gemini returned malformed JSON.")
  }
}

function clampScore(value: number) {
  return Math.max(1, Math.min(10, Math.round(value)))
}

function assertString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Gemini returned an invalid ${fieldName}.`)
  }

  return value.trim()
}

function assertStringArray(value: unknown, fieldName: string) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`Gemini returned an invalid ${fieldName}.`)
  }

  return value.map((item) => item.trim()).filter(Boolean)
}

function normalizeIdea(payload: unknown, category: IdeaCategory): StartupIdea {
  if (!payload || typeof payload !== "object") {
    throw new Error("Gemini returned an invalid idea payload.")
  }

  const candidate = payload as Record<string, unknown>

  return {
    name: assertString(candidate.name, "name"),
    tagline: assertString(candidate.tagline, "tagline"),
    description: assertString(candidate.description, "description"),
    audience: assertString(candidate.audience, "audience"),
    twist: assertString(candidate.twist, "twist"),
    monetization: assertString(candidate.monetization, "monetization"),
    validationScore: clampScore(Number(candidate.validationScore)),
    alternativeNames: assertStringArray(
      candidate.alternativeNames,
      "alternativeNames"
    ).slice(0, 3),
    category,
  }
}

function normalizePitch(payload: unknown): StartupPitch {
  if (!payload || typeof payload !== "object") {
    throw new Error("Gemini returned an invalid pitch payload.")
  }

  const candidate = payload as Record<string, unknown>

  return {
    problem: assertString(candidate.problem, "problem"),
    solution: assertString(candidate.solution, "solution"),
    market: assertString(candidate.market, "market"),
    businessModel: assertString(candidate.businessModel, "businessModel"),
  }
}

function normalizeMarketValidation(payload: unknown): MarketValidation {
  if (!payload || typeof payload !== "object") {
    throw new Error("Gemini returned an invalid market validation payload.")
  }

  const candidate = payload as Record<string, unknown>

  return {
    competition: assertStringArray(candidate.competition, "competition").slice(
      0,
      3
    ),
    risks: assertStringArray(candidate.risks, "risks").slice(0, 3),
    potentialUsers: assertStringArray(
      candidate.potentialUsers,
      "potentialUsers"
    ).slice(0, 3),
    verdict: assertString(candidate.verdict, "verdict"),
  }
}

export const generateIdea = createServerFn({ method: "POST" })
  .inputValidator((input: { category: IdeaCategory }) => input)
  .handler(async ({ data }) => {
    const prompt = `Generate a creative tech startup idea in the ${data.category} category.

Return ONLY JSON with:
- name
- tagline
- description
- audience
- twist
- monetization
- validationScore
- alternativeNames (array of 3)

Make the idea modern, realistic, and portfolio-worthy for an ambitious founder.`

    const result = await callGemini<StartupIdea>({
      prompt,
      schema: ideaResponseSchema,
    })

    return normalizeIdea(result, data.category)
  })

export const generatePitch = createServerFn({ method: "POST" })
  .inputValidator((input: { idea: StartupIdea }) => input)
  .handler(async ({ data }) => {
    const prompt = `Expand this startup concept into a concise investor-style mini pitch.

Startup JSON:
${JSON.stringify(data.idea, null, 2)}

Return ONLY JSON with:
- problem
- solution
- market
- businessModel

Keep each field specific and practical.`

    const result = await callGemini<StartupPitch>({
      prompt,
      schema: pitchResponseSchema,
    })

    return normalizePitch(result)
  })

export const regenerateIdeaFacet = createServerFn({ method: "POST" })
  .inputValidator((input: { idea: StartupIdea; facet: IdeaFacet }) => input)
  .handler(async ({ data }) => {
    const fieldLabel = data.facet === "tagline" ? "tagline" : "unique twist"

    const prompt = `Improve only the ${fieldLabel} for this startup idea.

Startup JSON:
${JSON.stringify(data.idea, null, 2)}

Return ONLY JSON with:
- value

The new ${fieldLabel} should feel more specific, sharper, and more memorable.`

    const result = await callGemini<{ value: string }>({
      prompt,
      schema: facetResponseSchema,
    })

    return {
      facet: data.facet,
      value: assertString(result.value, data.facet),
    }
  })

export const generateMarketValidation = createServerFn({ method: "POST" })
  .inputValidator((input: { idea: StartupIdea }) => input)
  .handler(async ({ data }) => {
    const prompt = `Analyze this startup concept like an early-stage market validator.

Startup JSON:
${JSON.stringify(data.idea, null, 2)}

Return ONLY JSON with:
- competition (array of 3 concise competitive forces or comparable products)
- risks (array of 3 concise launch or growth risks)
- potentialUsers (array of 3 specific early user groups)
- verdict

Keep the output practical and grounded in realistic startup advice.`

    const result = await callGemini<MarketValidation>({
      prompt,
      schema: marketValidationSchema,
    })

    return normalizeMarketValidation(result)
  })
