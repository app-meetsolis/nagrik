export const WASTE_TYPE_LABELS: Record<string, string> = {
  wet_organic:    'Wet Organic',
  dry_paper:      'Dry Paper',
  dry_plastic:    'Dry Plastic',
  dry_metal:      'Metal',
  dry_glass:      'Glass',
  e_waste:        'E-Waste',
  hazardous:      'Hazardous',
  textile:        'Textile',
  non_recyclable: 'Non-Recyclable',
}

export const WASTE_TYPE_DB: Record<string, string> = {
  'Wet Organic':     'wet_organic',
  'Dry Paper':       'dry_paper',
  'Dry Plastic':     'dry_plastic',
  'Metal':           'dry_metal',
  'Glass':           'dry_glass',
  'E-Waste':         'e_waste',
  'Hazardous':       'hazardous',
  'Hazardous Waste': 'hazardous',
  'Textile':         'textile',
  'Non-Recyclable':  'non_recyclable',
}

export const BIN_COLOR_HEX: Record<string, string> = {
  green: '#22C55E',
  blue:  '#3B82F6',
  red:   '#EF4444',
  grey:  '#6B7280',
}

export const BIN_LABELS: Record<string, string> = {
  green: 'Green Bin – Wet Waste',
  blue:  'Blue Bin – Dry Recyclables',
  red:   'Red Bin – Hazardous',
  grey:  'Grey Bin – Non-Recyclable',
}
