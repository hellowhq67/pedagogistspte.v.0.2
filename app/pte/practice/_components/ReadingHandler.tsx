'use client'

import React from 'react'
import ReadingQuestionClient from '@/components/pte/reading/ReadingQuestionClient'
import { QuestionType } from '@/lib/types'
import { UniversalPracticeWrapper } from './UniversalPracticeWrapper'

interface ReadingHandlerProps {
  question: any
  questionType: any
  allQuestions: any[]
}

const readingTypeMap = {
  'reading_mc_single': QuestionType.MULTIPLE_CHOICE_SINGLE,
  'reading_mc_multiple': QuestionType.MULTIPLE_CHOICE_MULTIPLE,
  'reorder_paragraphs': QuestionType.REORDER_PARAGRAPHS,
  'reading_fill_blanks_drag': QuestionType.READING_BLANKS,
  'reading_fill_blanks_dropdown': QuestionType.READING_WRITING_BLANKS,
}

export function ReadingHandler({ question, questionType, allQuestions }: ReadingHandlerProps) {
  const type = readingTypeMap[questionType.code as keyof typeof readingTypeMap]
  
  const questionProps = {
    id: question.id,
    type: type || QuestionType.MULTIPLE_CHOICE_SINGLE,
    title: question.title,
    promptText: question.content || '',
    questionData: question.questionData,
  }

  return (
    <UniversalPracticeWrapper
      question={question}
      questionType={questionType}
      allQuestions={allQuestions}
      categoryCode="reading"
    >
      <ReadingQuestionClient question={questionProps} />
    </UniversalPracticeWrapper>
  )
}
