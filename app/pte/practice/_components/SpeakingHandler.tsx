'use client'

import React from 'react'
import { ReadAloud } from '@/components/pte/speaking/read-aloud'
import { RepeatSentence } from '@/components/pte/speaking/repeat-sentence'
import { DescribeImage } from '@/components/pte/speaking/describe-image'
import { RetellLecture } from '@/components/pte/speaking/retell-lecture'
import { AnswerShortQuestion } from '@/components/pte/speaking/answer-short-question'
import { RespondToSituation } from '@/components/pte/speaking/respond-to-situation'
import { SummarizeGroupDiscussion } from '@/components/pte/speaking/summarize-group-discussion'
import { QuestionType } from '@/lib/types'
import { UniversalPracticeWrapper } from './UniversalPracticeWrapper'

interface SpeakingHandlerProps {
  question: any
  questionType: any
  allQuestions: any[]
}

const speakingComponentMap = {
  'read_aloud': { component: ReadAloud, type: QuestionType.READ_ALOUD },
  'repeat_sentence': { component: RepeatSentence, type: QuestionType.REPEAT_SENTENCE },
  'describe_image': { component: DescribeImage, type: QuestionType.DESCRIBE_IMAGE },
  'retell_lecture': { component: RetellLecture, type: QuestionType.RE_TELL_LECTURE },
  'answer_short_question': { component: AnswerShortQuestion, type: QuestionType.ANSWER_SHORT_QUESTION },
  'respond_to_situation': { component: RespondToSituation, type: null },
  'summarize_group_discussion': { component: SummarizeGroupDiscussion, type: QuestionType.SUMMARIZE_GROUP_DISCUSSION },
  // Map slugs with dashes to underscores if necessary
  'respond_to_a_situation': { component: RespondToSituation, type: null },
}

export function SpeakingHandler({ question, questionType, allQuestions }: SpeakingHandlerProps) {
  const componentConfig = speakingComponentMap[questionType.code as keyof typeof speakingComponentMap]
  if (!componentConfig) return <div>Unsupported speaking question type: {questionType.code}</div>

  const Component = componentConfig.component

  const questionProps = {
    id: question.id,
    title: question.title,
    promptText: question.content || '',
    promptMediaUrl: question.imageUrl || question.audioUrl,
    difficulty: question.difficulty,
    type: componentConfig.type,
    ...question.speakingDetails,
  }

  return (
    <UniversalPracticeWrapper
      question={question}
      questionType={questionType}
      allQuestions={allQuestions}
      categoryCode="speaking"
    >
      <Component question={questionProps} />
    </UniversalPracticeWrapper>
  )
}
