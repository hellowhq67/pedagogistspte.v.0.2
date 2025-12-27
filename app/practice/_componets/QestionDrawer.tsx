'use client'

import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Question {
    id: string
    title: string
    difficulty: string
    practiced?: boolean
}

interface QestionDrawerProps {
    isOpen: boolean
    onClose: (open: boolean) => void
    questions: Question[]
    currentQuestionId?: string
    categoryCode: string
    typeCode: string
}

export default function QestionDrawer({
    isOpen,
    onClose,
    questions,
    currentQuestionId,
    categoryCode,
    typeCode
}: QestionDrawerProps) {
    const router = useRouter()

    const handleQuestionClick = (questionId: string) => {
        router.push(`/practice/${categoryCode}/${typeCode}/${questionId}`)
        onClose(false)
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-[350px] sm:w-[400px] p-0 flex flex-col gap-0 border-l border-border/40">
                <SheetHeader className="p-6 border-b border-border/40 bg-card/50">
                    <SheetTitle className="text-xl font-black flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-primary" />
                        Question List
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                        {questions.length} Questions Available
                    </p>
                </SheetHeader>

                <ScrollArea className="flex-1 px-2 py-4">
                    <div className="space-y-1">
                        {questions.map((q, index) => (
                            <button
                                key={q.id}
                                onClick={() => handleQuestionClick(q.id)}
                                className={cn(
                                    "w-full text-left p-4 rounded-2xl transition-all flex items-start gap-4 group relative overflow-hidden",
                                    currentQuestionId === q.id 
                                        ? "bg-primary/10 text-primary" 
                                        : "hover:bg-muted/50 text-foreground/70 hover:text-foreground"
                                )}
                            >
                                <div className="mt-1">
                                    {q.practiced ? (
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                        <Circle className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">
                                            Q-{index + 1}
                                        </span>
                                        <Badge 
                                            variant="outline" 
                                            className={cn(
                                                "text-[9px] px-1.5 py-0 h-4 uppercase font-bold border-0 bg-transparent",
                                                q.difficulty === 'Easy' ? "text-emerald-500" :
                                                q.difficulty === 'Medium' ? "text-amber-500" :
                                                "text-rose-500"
                                            )}
                                        >
                                            {q.difficulty}
                                        </Badge>
                                    </div>
                                    <p className="text-sm font-bold leading-tight line-clamp-2 group-hover:translate-x-0.5 transition-transform">
                                        {q.title}
                                    </p>
                                </div>
                                
                                {currentQuestionId === q.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
