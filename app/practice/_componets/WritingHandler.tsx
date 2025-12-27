'use client'

import React, { useState } from 'react'
import { QuestionType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ListMusic, ChevronLeft, LayoutPanelLeft } from 'lucide-react'
import QestionDrawer from '../_componets/QestionDrawer'
import { PracticeCommunityTabs } from '../_componets/PracticeCommunityTabs'
import WritingQuestionClient from '@/components/pte/writing/WritingQuestionClient'

interface WritingHandlerProps {
    question: any
    questionType: any
    allQuestions: any[]
}

export default function WritingHandler({ question, questionType, allQuestions }: WritingHandlerProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    
    // Standardize question object for the child component
    const normalizedQuestion = {
        id: question.id,
        title: question.title,
        promptText: question.writingDetails?.promptText || question.content || '',
        type: questionType.code as QuestionType.WRITE_ESSAY | QuestionType.SUMMARIZE_WRITTEN_TEXT
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Top Navigation / Toolbar */}
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
                            <h2 className="text-sm font-black uppercase tracking-widest text-indigo-600/60">{questionType.name}</h2>
                            <p className="text-xs font-bold text-muted-foreground truncate max-w-[200px] sm:max-w-md">
                                {question.title}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            className="rounded-xl border-border/40 gap-2 h-10 px-4 font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            onClick={() => setIsDrawerOpen(true)}
                        >
                            <LayoutPanelLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Questions</span>
                        </Button>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 space-y-12">
                {/* Main Task Component */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <WritingQuestionClient question={normalizedQuestion} />
                </div>

                {/* Community & Stats Section */}
                <div className="pt-12 border-t border-border/40">
                    <PracticeCommunityTabs questionId={question.id} />
                </div>
            </main>

            {/* Side Drawer for Question Selection */}
            <QestionDrawer 
                isOpen={isDrawerOpen} 
                onClose={setIsDrawerOpen}
                questions={allQuestions}
                currentQuestionId={question.id}
                categoryCode="writing"
                typeCode={questionType.code}
            />
        </div>
    )
}
