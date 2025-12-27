import { notFound } from 'next/navigation'
import { db } from '@/lib/db/drizzle'
import { pteQuestions, pteQuestionTypes, pteCategories, pteSpeakingQuestions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { SpeakingHandler } from '../../../_components/SpeakingHandler'
import { WritingHandler } from '../../../_components/WritingHandler'
import { ReadingHandler } from '../../../_components/ReadingHandler'
import { ListeningHandler } from '../../../_components/ListeningHandler'

interface PracticeTaskPageProps {
  params: {
    category: string
    slug: string
    id: string
  }
}

export default async function PracticeTaskPage({ params }: PracticeTaskPageProps) {
  const { category, slug, id } = params

  // Fetch the specific question
  const question = await db.query.pteQuestions.findFirst({
    where: eq(pteQuestions.id, id),
    with: {
      questionType: {
        with: {
          category: true
        }
      },
      speakingDetails: true,
      writingDetails: true,
      readingDetails: true,
      listeningDetails: true,
    }
  })

  if (!question || 
      question.questionType.category?.code !== category || 
      question.questionType.code !== slug) {
    notFound()
  }

  // Fetch all questions of this type for the drawer
  const allQuestions = await db.query.pteQuestions.findMany({
    where: and(
      eq(pteQuestions.questionTypeId, question.questionTypeId),
      eq(pteQuestions.isActive, true)
    ),
    columns: {
      id: true,
      title: true,
      difficulty: true,
    },
    orderBy: (q, { desc }) => [desc(q.createdAt)],
    limit: 100
  })

  // Conditional rendering based on category
  switch (category) {
    case 'speaking':
      return <SpeakingHandler question={question} questionType={question.questionType} allQuestions={allQuestions} />
    case 'writing':
      return <WritingHandler question={question} questionType={question.questionType} allQuestions={allQuestions} />
    case 'reading':
      return <ReadingHandler question={question} questionType={question.questionType} allQuestions={allQuestions} />
    case 'listening':
      return <ListeningHandler question={question} questionType={question.questionType} allQuestions={allQuestions} />
    default:
      notFound()
  }
}
