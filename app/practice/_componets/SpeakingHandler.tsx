'use client'

import React, { useState } from 'react'
import { ReadAloud } from '@/components/pte/speaking/read-aloud'
import { RepeatSentence } from '@/components/pte/speaking/repeat-sentence'
import { DescribeImage } from '@/components/pte/speaking/describe-image'
import { RetellLecture } from '@/components/pte/speaking/retell-lecture'
import { AnswerShortQuestion } from '@/components/pte/speaking/answer-short-question'
import { RespondToSituation } from '@/components/pte/speaking/respond-to-situation'
import { SummarizeGroupDiscussion } from '@/components/pte/speaking/summarize-group-discussion'
import { QuestionType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ListMusic, ChevronLeft, ChevronRight } from 'lucide-react'
import QestionDrawer from './QestionDrawer'
import { PracticeCommunityTabs } from './PracticeCommunityTabs'

interface SpeakingHandlerProps {
    question: any
    questionType: any
    allQuestions: any[]
}

const speakingComponentMap = {
    'read_aloud': { component: ReadAloud, type: QuestionType.READ_ALOUD },
    'repeat_sentence': { component: RepeatSentence, type: QuestionType.REPEAT_SENTENCE },
    'describe_image': { component: DescribeImage, type: QuestionType.DESCRIBE_IMAGE },
    'retell_lecture': { component: RetellLecture, type: QuestionType.RE_TELL_LECTURE },
    'answer_short_question': { component: AnswerShortQuestion, type: QuestionType.ANSWER_SHORT_QUESTION },
    'respond_to_situation': { component: RespondToSituation, type: null },
    'summarize_group_discussion': { component: SummarizeGroupDiscussion, type: QuestionType.SUMMARIZE_GROUP_DISCUSSION },
}

export default function SpeakingHandler({ question, questionType, allQuestions }: SpeakingHandlerProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    
    const componentConfig = speakingComponentMap[questionType.code as keyof typeof speakingComponentMap]
    if (!componentConfig) return <div>Unsupported question type</div>

    const Component = componentConfig.component

    const questionProps = {
        id: question.id,
        title: question.title,
        promptText: question.content || '',
        promptMediaUrl: question.imageUrl || question.audioUrl,
        difficulty: question.difficulty,
        type: componentConfig.type,
        ...question.speakingDetails,
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
                            <h2 className="text-sm font-black uppercase tracking-widest text-primary/60">{questionType.name}</h2>
                            <p className="text-xs font-bold text-muted-foreground truncate max-w-[200px] sm:max-w-md">
                                {question.title}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            className="rounded-xl border-border/40 gap-2 h-10 px-4 font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                            onClick={() => setIsDrawerOpen(true)}
                        >
                            <ListMusic className="w-4 h-4" />
                            <span className="hidden sm:inline">Questions</span>
                        </Button>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8 space-y-12">
                {/* Main Task Component */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Component question={questionProps} />
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
                categoryCode="speaking"
                typeCode={questionType.code}
            />
        </div>
    )
}
