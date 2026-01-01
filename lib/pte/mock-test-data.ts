export type MockTestStatus = 'completed' | 'reviewed' | 'in_progress'

export interface MockTestSectionScore {
  name: string
  score: number
}

export interface MockTest {
  id: string
  title: string
  date: string
  status: MockTestStatus
  score: number | { overall: number }
  sections: MockTestSectionScore[]
}

// Simple deterministic mock data used only for analytics and demo UIs
export function generateMockTestData(): MockTest[] {
  const base: Omit<MockTest, 'id'>[] = [
    {
      title: 'Full Mock Test A',
      date: '2025-01-10',
      status: 'completed',
      score: { overall: 78 },
      sections: [
        { name: 'Speaking', score: 74 },
        { name: 'Writing', score: 80 },
        { name: 'Reading', score: 79 },
        { name: 'Listening', score: 77 },
      ],
    },
    {
      title: 'Mini Mock Test B',
      date: '2025-01-18',
      status: 'reviewed',
      score: { overall: 82 },
      sections: [
        { name: 'Speaking', score: 80 },
        { name: 'Writing', score: 84 },
        { name: 'Reading', score: 81 },
        { name: 'Listening', score: 83 },
      ],
    },
    {
      title: 'Full Mock Test C',
      date: '2025-01-24',
      status: 'completed',
      score: { overall: 71 },
      sections: [
        { name: 'Speaking', score: 69 },
        { name: 'Writing', score: 73 },
        { name: 'Reading', score: 72 },
        { name: 'Listening', score: 70 },
      ],
    },
  ]

  return base.map((t, index) => ({ ...t, id: `mock-${index + 1}` }))
}
