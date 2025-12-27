import { notFound, redirect } from 'next/navigation'
import { db } from '@/lib/db/drizzle'
import { pteQuestions, pteQuestionTypes, pteCategories } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Clock, BookOpen, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface CategoryPracticePageProps {
    params: {
        category: string
        type: string
    }
}

export default async function CategoryPracticePage({ params }: CategoryPracticePageProps) {
    const { category, type } = params

    // Get the question type details
    const questionType = await db.query.pteQuestionTypes.findFirst({
        where: eq(pteQuestionTypes.code, type as any),
        with: {
            category: true
        }
    })

    if (!questionType || questionType.category?.code !== category) {
        notFound()
    }

    // Fetch questions for this type
    const questions = await db.query.pteQuestions.findMany({
        where: and(
            eq(pteQuestions.questionTypeId, questionType.id),
            eq(pteQuestions.isActive, true)
        ),
        orderBy: (q, { desc }) => [desc(q.createdAt)],
        limit: 50
    })

    return (
        <div className="max-w-6xl mx-auto space-y-10 py-10 px-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                        <BookOpen className="w-4 h-4" />
                        <span>{category} Practice</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">{questionType.name}</h1>
                    <p className="text-muted-foreground font-medium max-w-2xl">
                        {questionType.description || `Practice ${questionType.name} with real exam-style questions and get instant AI feedback.`}
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Available</p>
                        <p className="text-2xl font-black">{questions.length}</p>
                    </div>
                    <div className="h-10 w-px bg-border/50 mx-2 hidden sm:block" />
                    <Button asChild size="lg" className="rounded-2xl font-black uppercase tracking-widest text-xs px-8 shadow-xl shadow-primary/20">
                        <Link href={`/practice/${category}/${type}/${questions[0]?.id || ''}`}>
                            Start random
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-card/50 backdrop-blur-sm border border-border/40 rounded-[32px]">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search questions..." 
                        className="pl-11 bg-background/50 border-none rounded-2xl h-12 focus-visible:ring-1 ring-primary/20"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="ghost" className="rounded-xl gap-2 font-bold text-xs uppercase tracking-widest">
                        <Filter className="w-4 h-4" />
                        Difficulty
                    </Button>
                    <Button variant="ghost" className="rounded-xl font-bold text-xs uppercase tracking-widest">
                        Not Practiced
                    </Button>
                </div>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-1 gap-4">
                {questions.map((q, index) => (
                    <Link 
                        key={q.id} 
                        href={`/practice/${category}/${type}/${q.id}`}
                        className="group"
                    >
                        <Card className="border-border/40 bg-card/30 backdrop-blur-sm hover:bg-card/80 transition-all duration-500 rounded-[32px] overflow-hidden group-hover:shadow-2xl group-hover:shadow-primary/5 group-hover:-translate-y-1">
                            <CardContent className="p-6 sm:p-8 flex items-center justify-between gap-6">
                                <div className="flex items-center gap-6 flex-1 min-w-0">
                                    <div className="size-14 rounded-2xl bg-background flex items-center justify-center font-black text-lg border border-border/40 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500">
                                        {index + 1}
                                    </div>
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-xl font-black truncate">{q.title}</h3>
                                            <Badge variant="secondary" className={cn(
                                                "uppercase text-[10px] font-black tracking-widest border-none px-3",
                                                q.difficulty === 'Easy' ? "bg-emerald-500/10 text-emerald-600" :
                                                q.difficulty === 'Medium' ? "bg-amber-500/10 text-amber-600" :
                                                "bg-rose-500/10 text-rose-600"
                                            )}>
                                                {q.difficulty}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground text-sm font-medium line-clamp-1 opacity-70">
                                            {q.content || "No description available for this question."}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 shrink-0">
                                    <div className="hidden md:flex flex-col items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Time Limit</span>
                                        <span className="text-sm font-bold flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-primary" />
                                            {questionType.timeLimit ? `${questionType.timeLimit}s` : 'No limit'}
                                        </span>
                                    </div>
                                    <div className="size-12 rounded-full bg-background border border-border/40 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500 group-hover:translate-x-1">
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

                {questions.length === 0 && (
                    <div className="py-20 text-center space-y-4">
                        <div className="size-20 rounded-full bg-muted mx-auto flex items-center justify-center">
                            <Search className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-black">No questions found</h3>
                        <p className="text-muted-foreground">We couldn't find any questions for this type yet.</p>
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/practice">Go back to Categories</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}