import { notFound, redirect } from 'next/navigation'
import { db } from '@/lib/db/drizzle'
import { pteQuestions, pteQuestionTypes, pteCategories } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

interface PracticeTypePageProps {
  params: {
    category: string
    slug: string
  }
}

export default async function PracticeTypePage({ params }: PracticeTypePageProps) {
  const { category, slug } = params

  // Get the question type details
  const questionType = await db.query.pteQuestionTypes.findFirst({
    where: eq(pteQuestionTypes.code, slug as any),
    with: {
      category: true
    }
  })

  if (!questionType || questionType.category?.code !== category) {
    notFound()
  }

  // Fetch a random question for this type
  const questions = await db.query.pteQuestions.findMany({
    where: and(
      eq(pteQuestions.questionTypeId, questionType.id),
      eq(pteQuestions.isActive, true)
    ),
    columns: {
        id: true
    },
    limit: 10
  })

  if (questions.length === 0) {
    // If no questions found, we could show a "no questions" page or redirect to category
    redirect(`/pte/practice/${category}`)
  }

  // Pick a random one
  const randomIndex = Math.floor(Math.random() * questions.length)
  const randomQuestion = questions[randomIndex]

  // Redirect to the specific question page
  redirect(`/pte/practice/${category}/${slug}/${randomQuestion.id}`)
}
