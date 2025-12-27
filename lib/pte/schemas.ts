import { z } from 'zod'

export const speakingScoreSchema = z.object({
  overallScore: z.number().min(0).max(90),
  pronunciationScore: z.number().min(0).max(90),
  fluencyScore: z.number().min(0).max(90),
  contentScore: z.number().min(0).max(90),
  pronunciation: z.object({
    score: z.number().min(0).max(90),
    feedback: z.string()
  }).optional(),
  fluency: z.object({
    score: z.number().min(0).max(90),
    feedback: z.string()
  }).optional(),
  content: z.object({
    score: z.number().min(0).max(90),
    feedback: z.string()
  }).optional(),
  suggestions: z.array(z.string()),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  detailedAnalysis: z.object({
    pronunciation: z.string().optional(),
    fluency: z.string().optional(),
    content: z.string().optional(),
    coherence: z.string().optional(),
  }).optional(),
})

export const writingScoreSchema = z.object({
  overallScore: z.number().min(0).max(90),
  contentScore: z.number().min(0).max(90),
  grammarScore: z.number().min(0).max(90),
  vocabularyScore: z.number().min(0).max(90),
  spellingScore: z.number().min(0).max(90),
  structureScore: z.number().min(0).max(90),
  content: z.object({
    score: z.number().min(0).max(90),
    feedback: z.string()
  }).optional(),
  grammar: z.object({
    score: z.number().min(0).max(90),
    feedback: z.string()
  }).optional(),
  vocabulary: z.object({
    score: z.number().min(0).max(90),
    feedback: z.string()
  }).optional(),
  spelling: z.object({
    score: z.number().min(0).max(90),
    feedback: z.string()
  }).optional(),
  structure: z.object({
    score: z.number().min(0).max(90),
    feedback: z.string()
  }).optional(),
  suggestions: z.array(z.string()),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  detailedAnalysis: z.object({
    content: z.string().optional(),
    form: z.string().optional(),
    grammar: z.string().optional(),
    vocabulary: z.string().optional(),
    mechanics: z.string().optional(),
  }).optional(),
})

export type SpeakingScoreData = z.infer<typeof speakingScoreSchema>
export type WritingScoreData = z.infer<typeof writingScoreSchema>