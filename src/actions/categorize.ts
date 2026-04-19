'use server'

import OpenAI from 'openai'
import type { ActionResult, ClassifyWasteData } from '@/types/actions'

const VALID_WASTE_TYPES = [
  'wet_organic', 'dry_paper', 'dry_plastic', 'dry_metal',
  'dry_glass', 'e_waste', 'hazardous', 'textile', 'non_recyclable',
] as const

const VALID_BIN_COLORS = ['green', 'blue', 'red', 'grey'] as const

const PROMPT = `You are an expert waste classification AI for Nagrik, an Indian civic waste management platform.

Look at the image and output ONLY a JSON object — no markdown, no explanation, no code fences.

First decide: is this actually waste/garbage/trash that needs disposal?
WASTE = items people discard: food scraps, empty packaging, bottles, cans, wrappers, broken items, old electronics, paper, garden cuttings, used clothes, bags of trash.
NOT WASTE = people, animals, live plants, clean objects actively in use, furniture, buildings, nature scenery, selfies, food being eaten.

{
  "isWaste": true or false,
  "reason": "short phrase if isWaste=false explaining what was seen, else empty string",
  "wasteType": one of "wet_organic"|"dry_paper"|"dry_plastic"|"dry_metal"|"dry_glass"|"e_waste"|"hazardous"|"textile"|"non_recyclable",
  "recyclable": true or false,
  "binColor": one of "green"|"blue"|"red"|"grey",
  "prepSteps": array of 2–3 short action strings,
  "tip": one concise eco-tip under 15 words,
  "confidence": one of "high"|"medium"|"low"
}

Bin color rules:
- green  → wet organic (food scraps, peels, garden waste, biodegradable)
- blue   → dry recyclables (clean paper, cardboard, plastic bottles, metal cans, glass)
- red    → hazardous or e-waste (batteries, paint, chemicals, syringes, electronics, phones, wires)
- grey   → non-recyclable (soiled packaging, styrofoam, multilayer plastics, mixed waste)

Classification hints for common Indian waste:
- Plastic bottle/bag → dry_plastic, blue, recyclable
- Newspaper/cardboard → dry_paper, blue, recyclable
- Food leftovers/peels → wet_organic, green, recyclable
- Old mobile/laptop → e_waste, red
- Used battery/bulb → hazardous, red
- Old cloth/garment → textile, grey or blue (clean = blue)
- Polystyrene/thermocol → non_recyclable, grey
- Mixed household bag → non_recyclable, grey
- Glass bottle → dry_glass, blue, recyclable

If the image is blurry or dark, make your best classification and set confidence="low".
If isWaste=false, still fill wasteType/binColor/recyclable with sensible defaults.`

const FALLBACK: ClassifyWasteData = {
  wasteType:  'non_recyclable',
  recyclable: false,
  binColor:   'grey',
  prepSteps:  ['Place in grey bin', 'Do not mix with recyclables'],
  tip:        'When unsure, always use the grey bin.',
  isWaste:    true,
}

function pointsForType(wasteType: ClassifyWasteData['wasteType'], recyclable: boolean): number {
  if (wasteType === 'e_waste' || wasteType === 'hazardous') return 15
  if (recyclable) return 10
  return 2
}

export async function classifyWaste(
  photoUrl: string
): Promise<ActionResult<ClassifyWasteData & { pointsEarned: number; reason: string; confidence: string }>> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: true,
      data: { ...FALLBACK, pointsEarned: pointsForType(FALLBACK.wasteType, FALLBACK.recyclable), reason: '', confidence: 'high' },
    }
  }

  const client     = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const controller = new AbortController()
  const timeout    = setTimeout(() => controller.abort(), 15_000)

  try {
    const response = await client.chat.completions.create(
      {
        model:       'gpt-4o-mini',
        max_tokens:  300,
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

    const raw = response.choices[0]?.message?.content?.trim() ?? ''

    // Strip accidental markdown fences if the model disobeys
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed  = JSON.parse(cleaned)

    const isWaste    = typeof parsed.isWaste === 'boolean' ? parsed.isWaste : true
    const reason     = typeof parsed.reason === 'string' ? parsed.reason : ''
    const wasteType  = VALID_WASTE_TYPES.includes(parsed.wasteType) ? parsed.wasteType : 'non_recyclable'
    const recyclable = typeof parsed.recyclable === 'boolean' ? parsed.recyclable : false
    const binColor   = VALID_BIN_COLORS.includes(parsed.binColor) ? parsed.binColor : 'grey'
    const prepSteps  = Array.isArray(parsed.prepSteps) ? parsed.prepSteps.slice(0, 3) : []
    const tip        = typeof parsed.tip === 'string' ? parsed.tip : FALLBACK.tip
    const confidence = ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'medium'

    return {
      success: true,
      data: { wasteType, recyclable, binColor, prepSteps, tip, isWaste, reason, confidence, pointsEarned: pointsForType(wasteType, recyclable) },
    }
  } catch {
    clearTimeout(timeout)
    return {
      success: true,
      data: { ...FALLBACK, pointsEarned: pointsForType(FALLBACK.wasteType, FALLBACK.recyclable), reason: '', confidence: 'high' },
    }
  }
}
