import { notFound } from 'next/navigation'
import { db } from '@/lib/db/drizzle'
import { pteCategories, pteQuestionTypes } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Sparkles, BookOpen, Clock, Zap } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PracticeCategoryPageProps {
  params: Promise<{
    category: string
  }>
}

export default async function PracticeCategoryPage({ params }: PracticeCategoryPageProps) {
  const { category: categoryCode } = await params

  const category = await db.query.pteCategories.findFirst({
    where: eq(pteCategories.code, categoryCode),
    with: {
      questionTypes: {
        where: eq(pteQuestionTypes.isActive, true),
      }
    }
  })

  if (!category) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-12 px-6">
      {/* Hero Section */}
      <div className="relative rounded-[48px] bg-primary/5 border border-primary/10 p-12 overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
            <Sparkles className="size-64" />
        </div>
        
        <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                <BookOpen className="size-4" />
                <span>Section Overview</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight capitalize">
                {category.title} <span className="text-primary">Practice</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                {category.description || `Master the ${category.title} section of the PTE Academic exam with our specialized practice modules and AI feedback.`}
            </p>
        </div>
      </div>

      {/* Question Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.questionTypes.map((type) => (
          <Link 
            key={type.id} 
            href={`/pte/practice/${categoryCode}/${type.code}`}
            className="group"
          >
            <Card className="h-full border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-[40px] overflow-hidden group-hover:-translate-y-2">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="flex items-start justify-between mb-8">
                  <div className="size-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <Zap className="size-8" />
                  </div>
                  <Badge variant="outline" className="rounded-full px-4 py-1 font-black text-[9px] uppercase tracking-widest border-primary/20 bg-primary/5 text-primary">
                    AI Scored
                  </Badge>
                </div>

                <div className="space-y-3 flex-1">
                  <h3 className="text-xl font-black group-hover:text-primary transition-colors">{type.name}</h3>
                  <p className="text-muted-foreground text-sm font-medium line-clamp-2 leading-relaxed opacity-70">
                    {type.description || `Practice official-style ${type.name} questions.`}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                        <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            {type.timeLimit ? `${type.timeLimit}s` : 'Timed'}
                        </div>
                    </div>
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:translate-x-1">
                        <ChevronRight className="size-5" />
                    </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
