'use client'

import React from 'react'
import ListeningQuestionClient from '@/components/pte/listening/ListeningQuestionClient'
import { QuestionType } from '@/lib/types'
import { UniversalPracticeWrapper } from './UniversalPracticeWrapper'

interface ListeningHandlerProps {
  question: any
  questionType: any
  allQuestions: any[]
}

const listeningTypeMap = {
  'summarize_spoken_text': QuestionType.SUMMARIZE_SPOKEN_TEXT,
  'listening_mc_multiple': QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE,
  'listening_fill_blanks': QuestionType.LISTENING_BLANKS,
  'highlight_correct_summary': QuestionType.HIGHLIGHT_CORRECT_SUMMARY,
  'listening_mc_single': QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE,
  'select_missing_word': QuestionType.SELECT_MISSING_WORD,
  'highlight_incorrect_words': QuestionType.HIGHLIGHT_INCORRECT_WORDS,
  'write_from_dictation': QuestionType.WRITE_FROM_DICTATION,
}

export function ListeningHandler({ question, questionType, allQuestions }: ListeningHandlerProps) {
  const type = listeningTypeMap[questionType.code as keyof typeof listeningTypeMap]
  
  const questionProps = {
    id: question.id,
    type: type || QuestionType.SUMMARIZE_SPOKEN_TEXT,
    title: question.title,
    promptText: question.content || '',
    promptMediaUrl: question.audioUrl || question.imageUrl,
    questionData: question.questionData,
  }

  return (
    <UniversalPracticeWrapper
      question={question}
      questionType={questionType}
      allQuestions={allQuestions}
      categoryCode="listening"
    >
      <ListeningQuestionClient question={questionProps} />
    </UniversalPracticeWrapper>
  )
}
