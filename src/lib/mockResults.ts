export interface ScanResult {
  wasteType: string;
  recyclable: boolean;
  binColor: string;
  binColorHex: string;
  binLabel: string;
  prepSteps: string[];
  tip: string;
  points: number;
}

export const MOCK_RESULTS: ScanResult[] = [
  {
    wasteType: 'Dry Plastic',
    recyclable: true,
    binColor: 'blue',
    binColorHex: '#3B82F6',
    binLabel: 'Blue Bin',
    prepSteps: [
      'Rinse the container thoroughly',
      'Remove labels if possible',
      'Flatten to save space in the bin',
    ],
    tip: 'Recycling one plastic bottle saves enough energy to power a lightbulb for 3 hours.',
    points: 10,
  },
  {
    wasteType: 'Wet Organic',
    recyclable: true,
    binColor: 'green',
    binColorHex: '#22C55E',
    binLabel: 'Green Bin',
    prepSteps: [
      'Remove any plastic packaging first',
      'Drain excess liquid before disposal',
      'Place directly in the green bin',
    ],
    tip: 'Composting food waste reduces methane emissions by up to 95%.',
    points: 10,
  },
  {
    wasteType: 'E-Waste',
    recyclable: false,
    binColor: 'red',
    binColorHex: '#EF4444',
    binLabel: 'Red Bin',
    prepSteps: [
      'Remove batteries if possible',
      'Do not break or dismantle the device',
      'Take to the nearest e-waste collection center',
    ],
    tip: 'One recycled phone recovers enough gold to plate 3 jewelry pieces.',
    points: 15,
  },
  {
    wasteType: 'Dry Paper',
    recyclable: true,
    binColor: 'blue',
    binColorHex: '#3B82F6',
    binLabel: 'Blue Bin',
    prepSteps: [
      'Remove all staples and metal clips',
      'Keep dry — wet paper cannot be recycled',
      'Stack neatly before placing in bin',
    ],
    tip: 'Recycling 1 tonne of paper saves 17 trees and 26,000 liters of water.',
    points: 10,
  },
  {
    wasteType: 'Hazardous Waste',
    recyclable: false,
    binColor: 'red',
    binColorHex: '#EF4444',
    binLabel: 'Red Bin',
    prepSteps: [
      'Do NOT mix with regular household waste',
      'Keep in original sealed container',
      'Drop at designated hazardous waste center',
    ],
    tip: 'Improper disposal of hazardous waste contaminates groundwater for decades.',
    points: 15,
  },
];
