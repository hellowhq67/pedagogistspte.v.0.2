import { notFound } from 'next/navigation'
import { db } from '@/lib/db/drizzle'
import { pteQuestions, pteQuestionTypes } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock, Star, Zap } from 'lucide-react'
import Link from 'next/link'

interface PracticeTypePageProps {
  params: Promise<{
    category: string
    slug: string
  }>
}

export default async function PracticeTypePage({ params }: PracticeTypePageProps) {
  const { category, slug } = await params

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

  // Fetch all questions for this type
  const questions = await db.query.pteQuestions.findMany({
    where: and(
      eq(pteQuestions.questionTypeId, questionType.id),
      eq(pteQuestions.isActive, true)
    ),
    orderBy: [desc(pteQuestions.createdAt)],
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-12 px-6">
        <div className="space-y-4">
            <h1 className="text-4xl font-black capitalize tracking-tight">
                {questionType.name}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
                {questionType.description || `Browse and practice ${questionType.name} questions.`}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map((question, index) => (
                <Link 
                    key={question.id} 
                    href={`/pte/practice/${category}/${slug}/${question.id}`}
                    className="group"
                >
                    <Card className="h-full border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="font-mono text-xs">
                                    #{index + 1}
                                </Badge>
                                <Badge className={
                                    question.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' :
                                    question.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' :
                                    'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                }>
                                    {question.difficulty || 'Medium'}
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-bold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                    {question.title || `Question #${index + 1}`}
                                </h3>
                                <p className="text-muted-foreground text-sm line-clamp-3">
                                    {question.content || "No preview available."}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Clock className="size-3.5 mr-1" />
                                    <span>{questionType.timeLimit ? `${Math.ceil(questionType.timeLimit / 60)} min` : 'Practice'}</span>
                                </div>
                                <Button size="sm" variant="ghost" className="gap-2 group-hover:bg-primary group-hover:text-white transition-all">
                                    Start
                                    <ArrowRight className="size-3.5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>

        {questions.length === 0 && (
            <div className="text-center py-24 text-muted-foreground bg-muted/30 rounded-3xl border border-dashed">
                <Zap className="size-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No questions available for this type yet.</p>
            </div>
        )}
    </div>
  )
}
