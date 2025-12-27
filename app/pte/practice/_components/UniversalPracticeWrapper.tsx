'use client'

import React, { useState } from 'react'
import { ChevronLeft, ListMusic, Clock, Info, Share2, MessageSquare, Trophy, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { QuestionDrawer } from './QuestionDrawer'
import { PracticeCommunityTabs } from '@/app/practice/_componets/PracticeCommunityTabs'

interface UniversalPracticeWrapperProps {
  children: React.ReactNode
  question: any
  questionType: any
  allQuestions: any[]
  categoryCode: string
}

export function UniversalPracticeWrapper({
  children,
  question,
  questionType,
  allQuestions,
  categoryCode
}: UniversalPracticeWrapperProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background/50">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-muted"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                  {categoryCode} Practice
                </span>
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter bg-primary/5 text-primary border-primary/20">
                  AI Scored
                </Badge>
              </div>
              <h1 className="text-base font-black truncate max-w-[200px] sm:max-w-md">
                {questionType.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <TooltipProvider>
              <div className="hidden md:flex items-center gap-1 mr-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/40">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {questionType.timeLimit ? `${questionType.timeLimit}s Limit` : 'No Limit'}
                </span>
              </div>
            </TooltipProvider>

            <Button
              variant="outline"
              className="h-10 rounded-2xl border-border/40 gap-2 px-4 font-black text-xs uppercase tracking-widest hover:border-primary/40 hover:bg-primary/5 transition-all"
              onClick={() => setIsDrawerOpen(true)}
            >
              <ListMusic className="w-4 h-4" />
              <span className="hidden sm:inline">Change Question</span>
            </Button>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-bold">Question Info & Rubric</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container max-w-6xl mx-auto py-8 px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Practice Interface */}
          <div className="lg:col-span-12 space-y-12">
            <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700">
                {children}
            </div>

            {/* Bottom Actions & Community */}
            <div className="space-y-8 pt-12 border-t border-border/40">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-[40px] bg-primary/5 border border-primary/10 overflow-hidden relative group">
                    <div className="absolute -right-8 -bottom-8 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                        <Sparkles className="size-48" />
                    </div>
                    
                    <div className="space-y-2 text-center sm:text-left relative z-10">
                        <h3 className="text-xl font-black">Ready for a challenge?</h3>
                        <p className="text-sm text-muted-foreground font-medium max-w-md">
                            Try this question in a timed environment and see how you rank among other students.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 relative z-10">
                        <Button variant="outline" size="lg" className="rounded-2xl border-border/40 font-black text-[10px] uppercase tracking-widest h-14 px-8">
                            <Share2 className="mr-2 size-4" />
                            Share Task
                        </Button>
                        <Button size="lg" className="rounded-2xl font-black text-[10px] uppercase tracking-widest h-14 px-10 shadow-xl shadow-primary/20">
                            <Trophy className="mr-2 size-4" />
                            Leaderboard
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                        <MessageSquare className="size-4 text-primary" />
                        <h2 className="text-sm font-black uppercase tracking-widest">Community Discussion</h2>
                    </div>
                    <PracticeCommunityTabs questionId={question.id} />
                </div>
            </div>
          </div>
        </div>
      </main>

      <QuestionDrawer
        isOpen={isDrawerOpen}
        onClose={setIsDrawerOpen}
        questions={allQuestions}
        currentQuestionId={question.id}
        categoryCode={categoryCode}
        typeCode={questionType.code}
      />
    </div>
  )
}
