'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { CheckCircle2, AlertCircle, TrendingUp, Zap, Target, Mic } from 'lucide-react'

interface SpeakingResultsProps {
    scoreData: {
        overallScore: number
        content: { score: number; feedback: string }
        pronunciation: { score: number; feedback: string }
        fluency: { score: number; feedback: string }
        strengths: string[]
        areasForImprovement: string[]
    }
}

export default function SpeakingResults({ scoreData }: SpeakingResultsProps) {
    const getScoreColor = (score: number) => {
        if (score >= 4) return "text-emerald-500"
        if (score >= 3) return "text-amber-500"
        return "text-rose-500"
    }

    const getProgressColor = (score: number) => {
        if (score >= 4) return "bg-emerald-500"
        if (score >= 3) return "bg-amber-500"
        return "bg-rose-500"
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Overall Score Large Card */}
            <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-gray-900 to-black p-1">
                <div className="bg-background rounded-[38px] p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                        <TrendingUp className="size-64" />
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                        <div className="text-center md:text-left space-y-4">
                            <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[10px] px-4 py-1">
                                Performance Report
                            </Badge>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Your Speaking <br />Report is ready</h2>
                            <p className="text-muted-foreground font-medium text-lg">Great effort! Here is how you performed according to the AI algorithm.</p>
                        </div>

                        <div className="relative flex items-center justify-center">
                            <div className="size-48 md:size-56 rounded-full border-8 border-muted flex flex-col items-center justify-center relative">
                                <span className="text-6xl md:text-7xl font-black tracking-tighter">
                                    {Math.round(scoreData.overallScore)}
                                </span>
                                <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">Score / 90</span>

                                {/* Score ring */}
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
                                        className="text-primary"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Subscores */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Content', data: scoreData.content || { score: 0, feedback: 'No feedback provided' }, icon: Target },
                        { label: 'Pronunciation', data: scoreData.pronunciation || { score: 0, feedback: 'No feedback provided' }, icon: Mic },
                        { label: 'Fluency', data: scoreData.fluency || { score: 0, feedback: 'No feedback provided' }, icon: Zap }
                    ].map((item) => (
                        <Card key={item.label} className="border-border/40 rounded-[32px] overflow-hidden bg-card/30 backdrop-blur-sm shadow-none">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="size-10 rounded-xl bg-muted flex items-center justify-center">
                                        <item.icon className="size-5 text-muted-foreground" />
                                    </div>
                                    <span className={cn("text-2xl font-black", getScoreColor(item.data.score))}>
                                        {item.data.score || 0}<span className="text-xs text-muted-foreground font-bold ml-0.5">/5</span>
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-widest mb-1">{item.label}</h4>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-3">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000", getProgressColor(item.data.score))}
                                            style={{ width: `${((item.data.score || 0) / 5) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                                        &ldquo;{item.data.feedback || 'N/A'}&rdquo;
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recommendations */}
                <div className="space-y-6">
                    <div className="p-8 rounded-[32px] bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle2 className="size-5" />
                            <h4 className="font-black text-sm uppercase tracking-widest">Key Strengths</h4>
                        </div>
                        <ul className="space-y-2">
                            {scoreData.strengths.map((s, i) => (
                                <li key={i} className="text-xs font-bold text-emerald-700/70 flex items-start gap-2">
                                    <span className="mt-1 size-1 rounded-full bg-emerald-500 shrink-0" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-8 rounded-[32px] bg-rose-500/5 border border-rose-500/10 space-y-4">
                        <div className="flex items-center gap-2 text-rose-600">
                            <AlertCircle className="size-5" />
                            <h4 className="font-black text-sm uppercase tracking-widest">Needs Work</h4>
                        </div>
                        <ul className="space-y-2">
                            {scoreData.areasForImprovement.map((a, i) => (
                                <li key={i} className="text-xs font-bold text-rose-700/70 flex items-start gap-2">
                                    <span className="mt-1 size-1 rounded-full bg-rose-500 shrink-0" />
                                    {a}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
