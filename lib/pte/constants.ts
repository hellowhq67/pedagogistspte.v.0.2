export type QuestionSection = 'Speaking & Writing' | 'Reading' | 'Listening'

export interface QuestionTypeScoreInfo {
  sequence: number
  section: QuestionSection
  questionType: string
  abbreviation: string
  numbers: string
  timeForAnswering: string
  speaking?: number
  writing?: number
  reading?: number
  listening?: number
}

export const sectionSummaries: Record<
  QuestionSection,
  { duration: string; questionCount: number; totalQuestions: number }
> = {
  'Speaking & Writing': {
    duration: '54–67 mins',
    questionCount: 6,
    totalQuestions: 28,
  },
  Reading: {
    duration: '29–30 mins',
    questionCount: 5,
    totalQuestions: 13,
  },
  Listening: {
    duration: '30–43 mins',
    questionCount: 8,
    totalQuestions: 15,
  },
}

// Simplified score contribution table based on public PTE patterns.
// Values are approximate but sufficient for UI display.
export const pteScoreBreakdown: QuestionTypeScoreInfo[] = [
  // Speaking & Writing
  {
    sequence: 1,
    section: 'Speaking & Writing',
    questionType: 'Read Aloud',
    abbreviation: 'RA',
    numbers: '6–7',
    timeForAnswering: '40s per item',
    speaking: 22,
    reading: 10,
  },
  {
    sequence: 2,
    section: 'Speaking & Writing',
    questionType: 'Repeat Sentence',
    abbreviation: 'RS',
    numbers: '10–12',
    timeForAnswering: '15s per item',
    speaking: 30,
    listening: 10,
  },
  {
    sequence: 3,
    section: 'Speaking & Writing',
    questionType: 'Describe Image',
    abbreviation: 'DI',
    numbers: '3–4',
    timeForAnswering: '40s per item',
    speaking: 10,
  },
  {
    sequence: 4,
    section: 'Speaking & Writing',
    questionType: 'Re-tell Lecture',
    abbreviation: 'RL',
    numbers: '1–2',
    timeForAnswering: '40s per item',
    speaking: 8,
    listening: 6,
  },
  {
    sequence: 5,
    section: 'Speaking & Writing',
    questionType: 'Answer Short Question',
    abbreviation: 'ASQ',
    numbers: '5–6',
    timeForAnswering: '10s per item',
    speaking: 5,
    listening: 4,
  },
  {
    sequence: 6,
    section: 'Speaking & Writing',
    questionType: 'Write Essay',
    abbreviation: 'WE',
    numbers: '1–2',
    timeForAnswering: '20 mins per item',
    writing: 25,
    reading: 5,
  },
  // Reading
  {
    sequence: 7,
    section: 'Reading',
    questionType: 'Reading & Writing: Fill in the Blanks',
    abbreviation: 'FIB-RW',
    numbers: '5–6',
    timeForAnswering: '2 mins per item',
    reading: 12,
    writing: 5,
  },
  {
    sequence: 8,
    section: 'Reading',
    questionType: 'Multiple Choice, Multiple Answers',
    abbreviation: 'MCM-R',
    numbers: '1–2',
    timeForAnswering: '2 mins per item',
    reading: 2,
  },
  {
    sequence: 9,
    section: 'Reading',
    questionType: 'Re-order Paragraphs',
    abbreviation: 'RO',
    numbers: '2–3',
    timeForAnswering: '2 mins per item',
    reading: 6,
  },
  {
    sequence: 10,
    section: 'Reading',
    questionType: 'Reading: Fill in the Blanks',
    abbreviation: 'FIB-R',
    numbers: '4–5',
    timeForAnswering: '2 mins per item',
    reading: 8,
  },
  {
    sequence: 11,
    section: 'Reading',
    questionType: 'Multiple Choice, Single Answer',
    abbreviation: 'MCS-R',
    numbers: '1–2',
    timeForAnswering: '2 mins per item',
    reading: 2,
  },
  // Listening
  {
    sequence: 12,
    section: 'Listening',
    questionType: 'Summarize Spoken Text',
    abbreviation: 'SST',
    numbers: '1–2',
    timeForAnswering: '10 mins per item',
    writing: 10,
    listening: 8,
  },
  {
    sequence: 13,
    section: 'Listening',
    questionType: 'Multiple Choice, Multiple Answers',
    abbreviation: 'MCM-L',
    numbers: '1–2',
    timeForAnswering: '3 mins per item',
    listening: 2,
  },
  {
    sequence: 14,
    section: 'Listening',
    questionType: 'Fill in the Blanks',
    abbreviation: 'FIB-L',
    numbers: '2–3',
    timeForAnswering: '3 mins per item',
    listening: 8,
    writing: 4,
  },
  {
    sequence: 15,
    section: 'Listening',
    questionType: 'Highlight Correct Summary',
    abbreviation: 'HCS',
    numbers: '1–2',
    timeForAnswering: '3 mins per item',
    listening: 4,
    reading: 2,
  },
  {
    sequence: 16,
    section: 'Listening',
    questionType: 'Multiple Choice, Single Answer',
    abbreviation: 'MCS-L',
    numbers: '1–2',
    timeForAnswering: '3 mins per item',
    listening: 2,
  },
  {
    sequence: 17,
    section: 'Listening',
    questionType: 'Select Missing Word',
    abbreviation: 'SMW',
    numbers: '1–2',
    timeForAnswering: '3 mins per item',
    listening: 3,
  },
  {
    sequence: 18,
    section: 'Listening',
    questionType: 'Highlight Incorrect Words',
    abbreviation: 'HIW',
    numbers: '2–3',
    timeForAnswering: '3 mins per item',
    listening: 6,
    reading: 4,
  },
  {
    sequence: 19,
    section: 'Listening',
    questionType: 'Write from Dictation',
    abbreviation: 'WFD',
    numbers: '3–4',
    timeForAnswering: '7s per word',
    listening: 12,
    writing: 8,
  },
]
