'use client'

import React from 'react'
import WritingQuestionClient from '@/components/pte/writing/WritingQuestionClient'
import { QuestionType } from '@/lib/types'
import { UniversalPracticeWrapper } from './UniversalPracticeWrapper'

interface WritingHandlerProps {
  question: any
  questionType: any
  allQuestions: any[]
}

const writingTypeMap = {
  'summarize_written_text': QuestionType.SUMMARIZE_WRITTEN_TEXT,
  'essay': QuestionType.WRITE_ESSAY,
}

export function WritingHandler({ question, questionType, allQuestions }: WritingHandlerProps) {
  const type = writingTypeMap[questionType.code as keyof typeof writingTypeMap]
  
  const questionProps = {
    id: question.id,
    title: question.title,
    promptText: question.content || '',
    type: type || QuestionType.WRITE_ESSAY,
  }

  return (
    <UniversalPracticeWrapper
      question={question}
      questionType={questionType}
      allQuestions={allQuestions}
      categoryCode="writing"
    >
      <WritingQuestionClient question={questionProps} />
    </UniversalPracticeWrapper>
  )
}
