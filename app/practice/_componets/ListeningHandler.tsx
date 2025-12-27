'use client'

import React, { useState } from 'react'
import { QuestionType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ListMusic, ChevronLeft, Headphones } from 'lucide-react'
import QestionDrawer from '../_componets/QestionDrawer'
import { PracticeCommunityTabs } from '../_componets/PracticeCommunityTabs'
import ListeningQuestionClient from '@/components/pte/listening/ListeningQuestionClient'

interface ListeningHandlerProps {
    question: any
    questionType: any
    allQuestions: any[]
}

export default function ListeningHandler({ question, questionType, allQuestions }: ListeningHandlerProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    
    // Normalize question object
    const normalizedQuestion = {
        id: question.id,
        title: question.title,
        promptText: question.content || '',
        promptMediaUrl: question.listeningDetails?.audioFileUrl || question.audioUrl,
        type: questionType.code as any,
        questionData: {
            options: question.listeningDetails?.options?.choices || [],
            wordBank: question.listeningDetails?.options?.wordBank || [],
            transcript: question.listeningDetails?.transcript,
            answerKey: question.correctAnswer || question.listeningDetails?.correctAnswerPositions
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <div className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-xl"
                            onClick={() => window.history.back()}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="h-8 w-px bg-border/50 hidden sm:block" />
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-orange-600/60">{questionType.name}</h2>
                            <p className="text-xs font-bold text-muted-foreground truncate max-w-[200px] sm:max-w-md">
                                {question.title}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            className="rounded-xl border-border/40 gap-2 h-10 px-4 font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                            onClick={() => setIsDrawerOpen(true)}
                        >
                            <Headphones className="w-4 h-4" />
                            <span className="hidden sm:inline">Tracks</span>
                        </Button>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 space-y-12">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <ListeningQuestionClient question={normalizedQuestion} />
                </div>

                <div className="pt-12 border-t border-border/40">
                    <PracticeCommunityTabs questionId={question.id} />
                </div>
            </main>

            <QestionDrawer 
                isOpen={isDrawerOpen} 
                onClose={setIsDrawerOpen}
                questions={allQuestions}
                currentQuestionId={question.id}
                categoryCode="listening"
                typeCode={questionType.code}
            />
        </div>
    )
}
