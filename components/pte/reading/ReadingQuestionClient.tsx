'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import ReadingInput from './ReadingInput'
import { AIScoringModal } from '@/components/pte/scoring/AIScoringModal'
import { AIFeedbackData, QuestionType } from '@/lib/types'
import { scoreReadingAttempt } from '@/app/actions/pte'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, BookOpen, Sparkles, RotateCcw, CheckCircle, Loader2, AlertCircle, HelpCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import ReadingResults from '@/app/practice/_componets/ReadingResults'
import { Alert, AlertDescription } from '@/components/ui/alert'

type ReadingQuestionClientProps = {
  question: {
    id: string
    type: any
    title?: string | null
    promptText: string
    questionData?: {
      options?: string[]
      paragraphs?: string[]
      wordBank?: string[]
      blanks?: { index: number; answer: string }[]
      answerKey: any
    }
  }
}

export default function ReadingQuestionClient({
  question,
}: ReadingQuestionClientProps) {
  const [userResponse, setUserResponse] = useState<any>(null)
  const [isScoring, setIsScoring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiFeedback, setAiFeedback] = useState<AIFeedbackData | null>(null)
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes default

  const answerKey = question.questionData?.answerKey

  const onResponseChange = useCallback((response: any) => {
    setError(null)
    setUserResponse(response)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!userResponse || isScoring) return
    
    setError(null)
    setIsScoring(true)
    setAiFeedback(null)

    try {
      const result = await scoreReadingAttempt(
        question.type,
        question.promptText,
        question.questionData?.options,
        question.questionData?.paragraphs,
        answerKey,
        userResponse
      )

      if (result.success) {
        setAiFeedback(result.feedback!)
      } else {
        setError(result.error || 'Failed to get AI score.')
      }
    } catch (e) {
      setError('An unexpected error occurred while scoring.')
    } finally {
      setIsScoring(false)
    }
  }, [userResponse, question.type, question.promptText, question.questionData, answerKey, isScoring])

  useEffect(() => {
    if (isScoring || aiFeedback) return
    const timerId = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(timerId)
  }, [isScoring, aiFeedback])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  if (aiFeedback) {
    return (
        <div className="space-y-10">
            <ReadingResults scoreData={aiFeedback} />
            <div className="flex justify-center">
                <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => { setAiFeedback(null); setTimeLeft(15 * 60) }}
                    className="rounded-2xl font-black uppercase tracking-widest px-12 h-14"
                >
                    Retry Practice
                </Button>
            </div>
        </div>
    )
  }

  if (!answerKey) {
    return (
        <div className="p-12 text-center space-y-4">
            <AlertCircle className="size-12 text-rose-500 mx-auto" />
            <h3 className="text-xl font-black italic">Answer key missing for this item.</h3>
        </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-6 bg-card/30 backdrop-blur-sm border border-border/40 rounded-[32px]">
        <div className="flex items-center gap-6">
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Session Timer</span>
                <span className={cn(
                    "text-xl font-black tabular-nums transition-colors",
                    timeLeft < 60 ? "text-rose-500 animate-pulse" : "text-emerald-600"
                )}>
                    {formatTime(timeLeft)}
                </span>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Question Type</span>
                <Badge variant="outline" className="mt-1 rounded-lg font-black text-[9px] uppercase tracking-tighter border-emerald-500/20 bg-emerald-500/5 text-emerald-600">
                    Comprehension
                </Badge>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setUserResponse(null)}
                className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-4"
            >
                <RotateCcw className="mr-2 size-3" />
                Reset
            </Button>
            <Button 
                onClick={handleSubmit}
                disabled={!userResponse || isScoring}
                className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700"
            >
                {isScoring ? (
                    <Loader2 className="mr-2 size-3 animate-spin" />
                ) : (
                    <CheckCircle className="mr-2 size-3" />
                )}
                Submit Answer
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Side: Passage */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-black uppercase tracking-[0.2em] text-[10px] ml-2">
                <BookOpen className="size-4" />
                <span>Reading Passage</span>
            </div>
            <Card className="border-border/40 rounded-[48px] bg-white dark:bg-[#121214] shadow-xl shadow-black/5 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Sparkles className="size-32" />
                </div>
                <CardContent className="p-10 md:p-14 prose prose-indigo dark:prose-invert max-w-none">
                    <p className="text-lg font-medium leading-relaxed text-foreground/80 selection:bg-emerald-500/10">
                        {question.promptText}
                    </p>
                </CardContent>
            </Card>
        </div>

        {/* Right Side: Interaction */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-black uppercase tracking-[0.2em] text-[10px] ml-2">
                <HelpCircle className="size-4" />
                <span>Task Interaction</span>
            </div>
            <Card className="border-border/40 rounded-[48px] bg-card/30 backdrop-blur-sm shadow-none h-full border-none">
                <CardContent className="p-10 md:p-14">
                    <ReadingInput
                        questionType={question.type}
                        question={question.questionData}
                        value={userResponse}
                        onChange={onResponseChange}
                    />
                </CardContent>
            </Card>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-[32px] bg-rose-500/5 border-rose-500/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-bold">{error}</AlertDescription>
        </Alert>
      )}

      <AIScoringModal
        open={isScoring}
        onOpenChange={() => {}}
        isScoring={isScoring}
        title="AI Scoring Your Response"
        description="Our PTE algorithm is comparing your answer against official criteria..."
      />
    </div>
  )
}
