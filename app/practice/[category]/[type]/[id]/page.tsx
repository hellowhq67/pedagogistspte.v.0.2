import { notFound } from 'next/navigation'
import { db } from '@/lib/db/drizzle'
import { pteQuestions, pteQuestionTypes, pteCategories } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import SpeakingHandler from '@/app/practice/_componets/SpeakingHandler'
import WritingHandler from '@/app/practice/_componets/WritingHandler'
import ReadingHandler from '@/app/practice/_componets/ReadingHandler'
import ListeningHandler from '@/app/practice/_componets/ListeningHandler'

interface PracticeTaskPageProps {
    params: {
        category: string
        type: string
        id: string
    }
}

export default async function PracticeTaskPage({ params }: PracticeTaskPageProps) {
    const { category, type, id } = params

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

    if (!question || question.questionType.category?.code !== category || question.questionType.code !== type) {
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
    if (category === 'speaking') {
        return (
            <SpeakingHandler 
                question={question} 
                questionType={question.questionType}
                allQuestions={allQuestions}
            />
        )
    }

    if (category === 'writing') {
        return (
            <WritingHandler 
                question={question} 
                questionType={question.questionType}
                allQuestions={allQuestions}
            />
        )
    }

    if (category === 'reading') {
        return (
            <ReadingHandler 
                question={question} 
                questionType={question.questionType}
                allQuestions={allQuestions}
            />
        )
    }

    if (category === 'listening') {
        return (
            <ListeningHandler 
                question={question} 
                questionType={question.questionType}
                allQuestions={allQuestions}
            />
        )
    }

    // Fallback for other categories (to be implemented)
    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">{question.questionType.name}</h1>
            <p className="text-muted-foreground">Practice for {category} is coming soon.</p>
        </div>
    )
}
