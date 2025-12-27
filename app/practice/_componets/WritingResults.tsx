'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { CheckCircle2, AlertCircle, TrendingUp, PenTool, Type, BookCheck, SearchCode, LayoutTemplate } from 'lucide-react'

interface WritingResultsProps {
    scoreData: {
        overallScore: number
        content?: { score: number; feedback: string }
        grammar?: { score: number; feedback: string }
        vocabulary?: { score: number; feedback: string }
        spelling?: { score: number; feedback: string }
        structure?: { score: number; feedback: string }
        strengths: string[]
        areasForImprovement: string[]
    }
}

export default function WritingResults({ scoreData }: WritingResultsProps) {
    const getScoreColor = (score: number, max: number) => {
        const ratio = score / max
        if (ratio >= 0.8) return "text-emerald-500"
        if (ratio >= 0.5) return "text-amber-500"
        return "text-rose-500"
    }

    const getProgressColor = (score: number, max: number) => {
        const ratio = score / max
        if (ratio >= 0.8) return "bg-emerald-500"
        if (ratio >= 0.5) return "bg-amber-500"
        return "bg-rose-500"
    }

    const criteria = [
        { label: 'Content', data: scoreData.content, icon: Type, max: 3 },
        { label: 'Grammar', data: scoreData.grammar, icon: BookCheck, max: 2 },
        { label: 'Vocabulary', data: scoreData.vocabulary, icon: PenTool, max: 2 },
        { label: 'Spelling', data: scoreData.spelling, icon: SearchCode, max: 2 },
        { label: 'Structure', data: scoreData.structure, icon: LayoutTemplate, max: 2 },
    ].filter(item => item.data !== undefined)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Overall Score Large Card */}
            <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-indigo-900 to-slate-950 p-1">
                <div className="bg-background rounded-[38px] p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none text-white">
                        <TrendingUp className="size-64" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                        <div className="text-center md:text-left space-y-4">
                            <Badge className="bg-indigo-500/10 text-indigo-500 border-none font-black uppercase tracking-widest text-[10px] px-4 py-1">
                                Writing Analysis
                            </Badge>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Your Essay <br/>Report is ready</h2>
                            <p className="text-muted-foreground font-medium text-lg max-w-md">Excellent work on your written discourse. Here is the detailed AI breakdown.</p>
                        </div>

                        <div className="relative flex items-center justify-center">
                            <div className="size-48 md:size-56 rounded-full border-8 border-muted flex flex-col items-center justify-center relative">
                                <span className="text-6xl md:text-7xl font-black tracking-tighter text-indigo-600">
                                    {Math.round(scoreData.overallScore)}
                                </span>
                                <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">Score / 90</span>
                                
                                <svg className="absolute -inset-2 size-[calc(100%+16px)] -rotate-90">
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r="48%"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeDasharray={`${(scoreData.overallScore / 90) * 100} 100`}
                                        pathLength="100"
                                        className="text-indigo-600 transition-all duration-1000"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Criteria Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {criteria.map((item) => (
                    <Card key={item.label} className="border-border/40 rounded-[32px] overflow-hidden bg-card/30 backdrop-blur-sm shadow-none">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="size-10 rounded-xl bg-indigo-500/5 flex items-center justify-center">
                                    <item.icon className="size-5 text-indigo-500" />
                                </div>
                                <span className={cn("text-xl font-black", getScoreColor(item.data!.score, item.max))}>
                                    {item.data!.score}<span className="text-[10px] text-muted-foreground font-bold ml-0.5">/{item.max}</span>
                                </span>
                            </div>
                            <div>
                                <h4 className="font-black text-[10px] uppercase tracking-widest mb-1 text-muted-foreground">{item.label}</h4>
                                <div className="h-1 w-full bg-muted rounded-full overflow-hidden mb-3">
                                    <div 
                                        className={cn("h-full rounded-full transition-all duration-1000", getProgressColor(item.data!.score, item.max))} 
                                        style={{ width: `${(item.data!.score / item.max) * 100}%` }}
                                    />
                                </div>
                                <p className="text-[10px] font-bold leading-relaxed text-muted-foreground/80 line-clamp-3">
                                    {item.data!.feedback}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-[40px] bg-emerald-500/5 border border-emerald-500/10 space-y-6">
                    <div className="flex items-center gap-3 text-emerald-600">
                        <div className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="size-5" />
                        </div>
                        <h4 className="font-black text-sm uppercase tracking-widest">Key Strengths</h4>
                    </div>
                    <ul className="space-y-3">
                        {scoreData.strengths.map((s, i) => (
                            <li key={i} className="text-sm font-bold text-emerald-700/70 flex items-start gap-3">
                                <div className="mt-1.5 size-1.5 rounded-full bg-emerald-500 shrink-0" />
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-8 rounded-[40px] bg-rose-500/5 border border-rose-500/10 space-y-6">
                    <div className="flex items-center gap-3 text-rose-600">
                        <div className="size-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                            <AlertCircle className="size-5" />
                        </div>
                        <h4 className="font-black text-sm uppercase tracking-widest">Areas for Improvement</h4>
                    </div>
                    <ul className="space-y-3">
                        {scoreData.areasForImprovement.map((a, i) => (
                            <li key={i} className="text-sm font-bold text-rose-700/70 flex items-start gap-3">
                                <div className="mt-1.5 size-1.5 rounded-full bg-rose-500 shrink-0" />
                                {a}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
