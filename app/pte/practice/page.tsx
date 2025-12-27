import { db } from '@/lib/db/drizzle'
import { pteCategories } from '@/lib/db/schema'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Sparkles, Mic, PenTool, BookOpen, Headphones, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const iconMap = {
    'speaking': Mic,
    'writing': PenTool,
    'reading': BookOpen,
    'listening': Headphones,
}

export default async function PracticePage() {
  const categories = await db.query.pteCategories.findMany({
    orderBy: (c, { asc }) => [asc(c.id)],
    with: {
        questionTypes: {
            where: (qt, { eq }) => eq(qt.isActive, true)
        }
    }
  })

  return (
    <div className="max-w-7xl mx-auto space-y-16 py-16 px-6">
      {/* Hero Header */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <Badge variant="outline" className="rounded-full px-6 py-2 border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
            AI-Powered Learning
        </Badge>
        <h1 className="text-6xl font-black tracking-tight leading-tight">
            Master the <span className="text-primary underline decoration-primary/20 underline-offset-8">PTE Exam</span>
        </h1>
        <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            Choose a section to begin your journey. Every task is powered by our advanced AI scoring system to give you instant, accurate feedback.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((category) => {
          const Icon = iconMap[category.code as keyof typeof iconMap] || Sparkles
          
          return (
            <Link 
              key={category.id} 
              href={`/pte/practice/${category.code}`}
              className="group"
            >
              <Card className="h-full border-border/40 bg-card/30 backdrop-blur-xl hover:bg-card hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] transition-all duration-700 rounded-[56px] overflow-hidden group-hover:-translate-y-3 relative">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-125 transition-transform duration-1000">
                    <Icon className="size-64" />
                </div>
                
                <CardContent className="p-12 flex flex-col h-full relative z-10">
                  <div className="flex items-start justify-between mb-12">
                    <div className="size-20 rounded-[28px] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40 group-hover:scale-110 transition-transform duration-500">
                      <Icon className="size-10" />
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Available Tasks</span>
                        <span className="text-3xl font-black text-primary">{category.questionTypes?.length || 0}</span>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    <h3 className="text-3xl font-black group-hover:text-primary transition-colors">{category.title}</h3>
                    <p className="text-muted-foreground text-lg font-medium leading-relaxed opacity-70">
                      {category.description || `Comprehensive practice for all ${category.title} task types.`}
                    </p>
                  </div>

                  <div className="mt-12 flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="size-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                <Zap className="size-3.5 text-primary opacity-40" />
                            </div>
                        ))}
                        <div className="px-4 flex items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">
                            Instant Scoring
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group/btn">
                        <span className="text-xs font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                            Explore Section
                        </span>
                        <div className="size-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-[-45deg] transition-all duration-500">
                            <ArrowRight className="size-6" />
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Stats / Motivation Bar */}
      <div className="rounded-[40px] bg-muted/30 p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-border/40">
        <div className="flex items-center gap-6">
            <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Sparkles className="size-8 text-emerald-600" />
            </div>
            <div>
                <h4 className="text-xl font-black">AI Scoring is Active</h4>
                <p className="text-sm text-muted-foreground font-medium">Our models are trained on thousands of official PTE responses.</p>
            </div>
        </div>
        <Button size="lg" className="rounded-2xl h-14 px-10 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20">
            View My Progress
        </Button>
      </div>
    </div>
  )
}
