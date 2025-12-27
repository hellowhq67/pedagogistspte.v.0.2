import { generateObject } from 'ai'
import { proModel, fastModel } from './config'
import { getPromptForQuestionType } from './prompts'
import { QuestionType, AIFeedbackData, SpeakingFeedbackData } from '@/lib/types'
import { z } from 'zod'

import { AIFeedbackDataSchema, SpeakingFeedbackDataSchema } from './schemas'

/**
 * Scores a user's response for a given PTE question type using an AI model.
 */
export async function scorePteAttempt(
  type: QuestionType,
  params: {
    promptTopic?: string
    originalText?: string
    userInput?: string
    wordCount?: number
    userTranscript?: string
    questionText?: string
    options?: string[]
    paragraphs?: string[]
    wordBank?: string[]
    answerKey?: any
    userResponse?: any
    audioTranscript?: string
  }
): Promise<AIFeedbackData | SpeakingFeedbackData> {
  const prompt = getPromptForQuestionType(type, params)

  // Use pro model for complex tasks, fast model for simple ones
  const model = [
    QuestionType.WRITE_ESSAY,
    QuestionType.SUMMARIZE_SPOKEN_TEXT,
    QuestionType.READ_ALOUD
  ].includes(type) ? proModel : fastModel;

  let schema: z.ZodType<AIFeedbackData | SpeakingFeedbackData>

  if (type === QuestionType.READ_ALOUD) {
    schema = SpeakingFeedbackDataSchema
  } else {
    schema = AIFeedbackDataSchema
  }

  const { object } = await generateObject({
    model,
    schema,
    prompt,
    temperature: 0.1, // Keep it consistent for scoring
  })

  return object
}