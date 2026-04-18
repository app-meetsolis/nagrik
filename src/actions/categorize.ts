'use server'

import OpenAI from 'openai'
import type { ActionResult, ClassifyWasteData } from '@/types/actions'

const VALID_WASTE_TYPES = [
  'wet_organic', 'dry_paper', 'dry_plastic', 'dry_metal',
  'dry_glass', 'e_waste', 'hazardous', 'textile', 'non_recyclable',
] as const

const VALID_BIN_COLORS = ['green', 'blue', 'red', 'grey'] as const

const PROMPT = `You are a waste classification AI for India.
Analyze the photo and respond with ONLY valid JSON — no markdown, no explanation:
{
  "wasteType": "wet_organic"|"dry_paper"|"dry_plastic"|"dry_metal"|"dry_glass"|"e_waste"|"hazardous"|"textile"|"non_recyclable",
  "recyclable": true|false,
  "binColor": "green"|"blue"|"red"|"grey",
  "prepSteps": ["string", ...],
  "tip": "string",
  "isWaste": true|false
}

Bin colors: green=wet organic, blue=dry recyclables, red=hazardous/e-waste, grey=non-recyclable
prepSteps: max 3 practical steps to prepare this waste for disposal (e.g. "Rinse the container")
tip: one short eco-tip relevant to this waste type
isWaste: false if the photo is not waste at all (selfie, food being eaten, random interior, etc.)`

const FALLBACK: ClassifyWasteData = {
  wasteType:  'non_recyclable',
  recyclable: false,
  binColor:   'grey',
  prepSteps:  [],
  tip:        'When in doubt, place in the grey bin.',
  isWaste:    true,
}

function pointsForType(wasteType: ClassifyWasteData['wasteType'], recyclable: boolean): number {
  if (wasteType === 'e_waste' || wasteType === 'hazardous') return 15
  if (recyclable) return 10
  return 2
}

export async function classifyWaste(
  photoUrl: string
): Promise<ActionResult<ClassifyWasteData & { pointsEarned: number }>> {
  if (!process.env.OPENAI_API_KEY) {
    return { success: true, data: { ...FALLBACK, pointsEarned: pointsForType(FALLBACK.wasteType, FALLBACK.recyclable) } }
  }

  const client     = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const controller = new AbortController()
  const timeout    = setTimeout(() => controller.abort(), 8_000)

  try {
    const response = await client.chat.completions.create(
      {
        model:       'gpt-4o-mini',
        max_tokens:  200,
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

    const wasteType = VALID_WASTE_TYPES.includes(parsed.wasteType) ? parsed.wasteType : 'non_recyclable'
    const recyclable = typeof parsed.recyclable === 'boolean' ? parsed.recyclable : false
    const binColor   = VALID_BIN_COLORS.includes(parsed.binColor) ? parsed.binColor : 'grey'
    const prepSteps  = Array.isArray(parsed.prepSteps) ? parsed.prepSteps.slice(0, 3) : []
    const tip        = typeof parsed.tip === 'string' ? parsed.tip : FALLBACK.tip
    const isWaste    = typeof parsed.isWaste === 'boolean' ? parsed.isWaste : true

    const data: ClassifyWasteData & { pointsEarned: number } = {
      wasteType,
      recyclable,
      binColor,
      prepSteps,
      tip,
      isWaste,
      pointsEarned: pointsForType(wasteType, recyclable),
    }

    return { success: true, data }
  } catch {
    clearTimeout(timeout)
    return { success: true, data: { ...FALLBACK, pointsEarned: pointsForType(FALLBACK.wasteType, FALLBACK.recyclable) } }
  }
}
