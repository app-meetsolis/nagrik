'use server'

import OpenAI from 'openai'
import type { ActionResult, CategorizePhotoData } from '@/types/actions'

const VALID_CATEGORIES = ['garbage', 'pothole', 'drainage', 'streetlight', 'other'] as const
const VALID_SEVERITIES  = ['minor', 'moderate', 'critical'] as const

const PROMPT = `You are analyzing a civic issue photo from Jaipur, India.
Respond with ONLY valid JSON — no markdown, no explanation:
{
  "category": "garbage" | "pothole" | "drainage" | "streetlight" | "other",
  "severity": "minor" | "moderate" | "critical",
  "isValidCivicIssue": true | false
}

Category definitions:
- garbage: waste, trash, litter, illegal dumping
- pothole: road damage, cracks, broken surface
- drainage: blocked drain, sewage overflow, waterlogging
- streetlight: broken or missing street light or pole
- other: any other civic infrastructure problem

isValidCivicIssue = false if the image is NOT a civic issue (selfie, food, random interior, etc.)
severity: minor = small/manageable, moderate = impacts daily life, critical = dangerous/urgent`

const FALLBACK: CategorizePhotoData = {
  category: 'other',
  severity: 'moderate',
  isValidCivicIssue: true,
}

export async function categorizePhoto(
  photoUrl: string
): Promise<ActionResult<CategorizePhotoData>> {
  if (!process.env.OPENAI_API_KEY) {
    return { success: true, data: FALLBACK }
  }

  const client     = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const controller = new AbortController()
  const timeout    = setTimeout(() => controller.abort(), 5_000)

  try {
    const response = await client.chat.completions.create(
      {
        model:       'gpt-4o-mini',
        max_tokens:  120,
        temperature: 0,
        messages: [{
          role: 'user',
          content: [
            { type: 'text',      text: PROMPT },
            { type: 'image_url', image_url: { url: photoUrl, detail: 'low' } },
          ],
        }],
      },
      { signal: controller.signal }
    )
    clearTimeout(timeout)

    const raw    = response.choices[0]?.message?.content?.trim() ?? ''
    const parsed = JSON.parse(raw)

    return {
      success: true,
      data: {
        category:        VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'other',
        severity:        VALID_SEVERITIES.includes(parsed.severity)  ? parsed.severity  : 'moderate',
        isValidCivicIssue: typeof parsed.isValidCivicIssue === 'boolean' ? parsed.isValidCivicIssue : true,
      },
    }
  } catch {
    clearTimeout(timeout)
    // Timeout or JSON parse failure — silently fall back so the user can still submit
    return { success: true, data: FALLBACK }
  }
}
