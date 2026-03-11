import { GoogleGenAI, ThinkingLevel } from "@google/genai"
import { createServerFn } from "@tanstack/react-start"

import type {
  IdeaBriefInput,
  IdeaCategory,
  IdeaFacet,
  MarketValidation,
  StartupIdea,
  StartupPitch,
} from "@/types/idea"

const GEMINI_MODEL = "gemini-3-flash-preview"

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
    analysis: {
      ...sharedSchemaConfig,
      properties: {
        tags: {
          type: "array",
          items: { type: "string" },
          minItems: 4,
          maxItems: 6,
        },
        whyNow: { type: "string" },
        proofSignals: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 5,
        },
        marketGap: { type: "string" },
        executionPlan: { type: "string" },
        scoreMetrics: {
          type: "array",
          minItems: 4,
          maxItems: 4,
          items: {
            ...sharedSchemaConfig,
            properties: {
              label: { type: "string" },
              score: { type: "number" },
              insight: { type: "string" },
            },
            required: ["label", "score", "insight"],
          },
        },
        trendPoints: {
          type: "array",
          minItems: 6,
          maxItems: 8,
          items: {
            ...sharedSchemaConfig,
            properties: {
              label: { type: "string" },
              interest: { type: "number" },
            },
            required: ["label", "interest"],
          },
        },
        frameworkFit: {
          ...sharedSchemaConfig,
          properties: {
            audience: { type: "number" },
            community: { type: "number" },
            product: { type: "number" },
          },
          required: ["audience", "community", "product"],
        },
        valueLadder: {
          type: "array",
          minItems: 4,
          maxItems: 5,
          items: {
            ...sharedSchemaConfig,
            properties: {
              label: { type: "string" },
              score: { type: "number" },
            },
            required: ["label", "score"],
          },
        },
        keywordSignals: {
          type: "array",
          minItems: 4,
          maxItems: 5,
          items: {
            ...sharedSchemaConfig,
            properties: {
              term: { type: "string" },
              volume: { type: "string" },
              competition: { type: "string" },
              score: { type: "number" },
            },
            required: ["term", "volume", "competition", "score"],
          },
        },
        detailedPlan: {
          type: "array",
          minItems: 4,
          maxItems: 5,
          items: {
            ...sharedSchemaConfig,
            properties: {
              phase: { type: "string" },
              timeframe: { type: "string" },
              objective: { type: "string" },
              actions: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 4,
              },
              outcome: { type: "string" },
            },
            required: ["phase", "timeframe", "objective", "actions", "outcome"],
          },
        },
      },
      required: [
        "tags",
        "whyNow",
        "proofSignals",
        "marketGap",
        "executionPlan",
        "scoreMetrics",
        "trendPoints",
        "frameworkFit",
        "valueLadder",
        "keywordSignals",
        "detailedPlan",
      ],
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
    "analysis",
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

let geminiClient: GoogleGenAI | null = null

function getGeminiClient() {
  geminiClient ??= new GoogleGenAI({
    apiKey: ensureGeminiApiKey(),
  })

  return geminiClient
}

async function callGemini<T>({
  prompt,
  schema,
}: {
  prompt: string
  schema: object
}) {
  const response = await getGeminiClient().models.generateContentStream({
    model: GEMINI_MODEL,
    config: {
      temperature: 1,
      responseMimeType: "application/json",
      responseJsonSchema: schema,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
    },
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  })

  let text = ""

  for await (const chunk of response) {
    text += chunk.text ?? ""
  }

  if (!text.trim()) {
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

function clampMetricScore(value: number) {
  return Math.max(1, Math.min(10, Math.round(value)))
}

function normalizeIdea(payload: unknown, category: IdeaCategory): StartupIdea {
  if (!payload || typeof payload !== "object") {
    throw new Error("Gemini returned an invalid idea payload.")
  }

  const candidate = payload as Record<string, unknown>
  const analysis =
    candidate.analysis && typeof candidate.analysis === "object"
      ? (candidate.analysis as Record<string, unknown>)
      : null

  if (!analysis) {
    throw new Error("Gemini returned an invalid analysis payload.")
  }

  const frameworkFit =
    analysis.frameworkFit && typeof analysis.frameworkFit === "object"
      ? (analysis.frameworkFit as Record<string, unknown>)
      : null

  if (!frameworkFit) {
    throw new Error("Gemini returned an invalid framework fit payload.")
  }

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
    analysis: {
      tags: assertStringArray(analysis.tags, "analysis.tags").slice(0, 6),
      whyNow: assertString(analysis.whyNow, "analysis.whyNow"),
      proofSignals: assertStringArray(
        analysis.proofSignals,
        "analysis.proofSignals"
      ).slice(0, 5),
      marketGap: assertString(analysis.marketGap, "analysis.marketGap"),
      executionPlan: assertString(
        analysis.executionPlan,
        "analysis.executionPlan"
      ),
      scoreMetrics: (Array.isArray(analysis.scoreMetrics)
        ? analysis.scoreMetrics
        : []
      ).map((item, index) => {
        if (!item || typeof item !== "object") {
          throw new Error(
            `Gemini returned an invalid score metric at ${index}.`
          )
        }

        const metric = item as Record<string, unknown>

        return {
          label: assertString(
            metric.label,
            `analysis.scoreMetrics.${index}.label`
          ),
          score: clampMetricScore(Number(metric.score)),
          insight: assertString(
            metric.insight,
            `analysis.scoreMetrics.${index}.insight`
          ),
        }
      }),
      trendPoints: (Array.isArray(analysis.trendPoints)
        ? analysis.trendPoints
        : []
      ).map((item, index) => {
        if (!item || typeof item !== "object") {
          throw new Error(`Gemini returned an invalid trend point at ${index}.`)
        }

        const point = item as Record<string, unknown>

        return {
          label: assertString(
            point.label,
            `analysis.trendPoints.${index}.label`
          ),
          interest: Math.max(
            10,
            Math.min(100, Math.round(Number(point.interest)))
          ),
        }
      }),
      frameworkFit: {
        audience: clampMetricScore(Number(frameworkFit.audience)),
        community: clampMetricScore(Number(frameworkFit.community)),
        product: clampMetricScore(Number(frameworkFit.product)),
      },
      valueLadder: (Array.isArray(analysis.valueLadder)
        ? analysis.valueLadder
        : []
      ).map((item, index) => {
        if (!item || typeof item !== "object") {
          throw new Error(
            `Gemini returned an invalid value ladder step at ${index}.`
          )
        }

        const step = item as Record<string, unknown>

        return {
          label: assertString(
            step.label,
            `analysis.valueLadder.${index}.label`
          ),
          score: clampMetricScore(Number(step.score)),
        }
      }),
      keywordSignals: (Array.isArray(analysis.keywordSignals)
        ? analysis.keywordSignals
        : []
      ).map((item, index) => {
        if (!item || typeof item !== "object") {
          throw new Error(
            `Gemini returned an invalid keyword signal at ${index}.`
          )
        }

        const signal = item as Record<string, unknown>

        return {
          term: assertString(
            signal.term,
            `analysis.keywordSignals.${index}.term`
          ),
          volume: assertString(
            signal.volume,
            `analysis.keywordSignals.${index}.volume`
          ),
          competition: assertString(
            signal.competition,
            `analysis.keywordSignals.${index}.competition`
          ),
          score: clampMetricScore(Number(signal.score)),
        }
      }),
      detailedPlan: (Array.isArray(analysis.detailedPlan)
        ? analysis.detailedPlan
        : []
      ).map((item, index) => {
        if (!item || typeof item !== "object") {
          throw new Error(`Gemini returned an invalid plan step at ${index}.`)
        }

        const step = item as Record<string, unknown>

        return {
          phase: assertString(
            step.phase,
            `analysis.detailedPlan.${index}.phase`
          ),
          timeframe: assertString(
            step.timeframe,
            `analysis.detailedPlan.${index}.timeframe`
          ),
          objective: assertString(
            step.objective,
            `analysis.detailedPlan.${index}.objective`
          ),
          actions: assertStringArray(
            step.actions,
            `analysis.detailedPlan.${index}.actions`
          ).slice(0, 4),
          outcome: assertString(
            step.outcome,
            `analysis.detailedPlan.${index}.outcome`
          ),
        }
      }),
    },
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
  .inputValidator((input: IdeaBriefInput) => input)
  .handler(async ({ data }) => {
    const prompt = `You are helping a founder sharpen and evaluate a startup idea.

Founder input:
- Category: ${data.category}
- Concept direction: ${data.concept || "Not specified. Invent a strong concept."}
- Problem to solve: ${data.problem || "Not specified"}
- Target audience: ${data.audience || "Not specified"}
- Category focus: ${data.categoryFocus || "Not specified"}
- Desired features: ${
      data.featurePreferences.length > 0
        ? data.featurePreferences.join(", ")
        : "Not specified"
    }

Use the founder input where it is helpful. Treat the category focus and desired features as product-shaping constraints. If parts are missing, make reasonable assumptions and fill the gaps with a modern, realistic, buildable startup concept.

Return ONLY JSON with:
- name
- tagline
- description
- audience
- twist
- monetization
- validationScore
- alternativeNames (array of 3)
- analysis

The analysis object must include:
- tags (4 to 6 short badge-style tags)
- whyNow
- proofSignals (3 to 5 concise bullets)
- marketGap
- executionPlan
- scoreMetrics (exactly 4 objects with label, score, insight)
- trendPoints (6 to 8 objects with label and interest from 10 to 100)
- frameworkFit (audience, community, product scores from 1 to 10)
- valueLadder (4 to 5 objects with label and score from 1 to 10)
- keywordSignals (4 to 5 objects with term, volume, competition, score)
- detailedPlan (4 to 5 rollout phases with phase, timeframe, objective, actions, outcome)

Keep the tone practical, specific, and portfolio-worthy.`

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
