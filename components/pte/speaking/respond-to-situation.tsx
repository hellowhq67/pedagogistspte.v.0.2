'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Square, AlertCircle, ArrowLeft, Clock, Sparkles, Loader2, RotateCcw, CheckCircle } from 'lucide-react'
import { useAudioRecorder } from '../hooks/use-audio-recorder'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { scoreSpeakingAttempt } from '@/app/actions/pte'
import { QuestionType } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { LiveWaveform } from '@/components/ui/live-waveform'
import { MicSelector } from '@/components/ui/mic-selector'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import SpeakingResults from '@/app/practice/_componets/SpeakingResults'

interface RespondToSituationProps {
    question: {
        id: string
        title: string
        promptText: string | null
        promptMediaUrl: string | null
        difficulty: string
    }
}

export function RespondToSituation({ question }: RespondToSituationProps) {
    const router = useRouter()
    const [stage, setStage] = useState<'idle' | 'reading' | 'recording' | 'processing' | 'complete'>('idle')
    const [transcript, setTranscript] = useState('')
    const [score, setScore] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [readingTime, setReadingTime] = useState(40)
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        isRecording,
        recordingTime,
        audioBlob,
        audioLevel,
        error: recorderError,
        startRecording,
        stopRecording,
        resetRecording,
        playBeep,
    } = useAudioRecorder({
        maxDuration: 40000, // 40 seconds max
        onRecordingComplete: handleRecordingComplete,
    })

    const handleBegin = () => {
        setStage('reading')
        setReadingTime(40)
        setError(null)
        setScore(null)
        resetRecording()
    }

    const handleStartRecording = useCallback(async () => {
        playBeep()
        setStage('recording')
        await startRecording(selectedDeviceId)
    }, [startRecording, playBeep, selectedDeviceId])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (stage === 'reading' && readingTime > 0) {
            timer = setTimeout(() => setReadingTime(readingTime - 1), 1000)
        } else if (stage === 'reading' && readingTime === 0) {
            handleStartRecording()
        }
        return () => clearTimeout(timer)
    }, [stage, readingTime, handleStartRecording])

    const handleStopRecording = useCallback(() => {
        playBeep(660, 200)
        stopRecording()
    }, [stopRecording, playBeep])

    async function handleRecordingComplete(blob: Blob, duration: number) {
        setStage('processing')
        try {
            const url = URL.createObjectURL(blob)
            setAudioUrl(url)

            // Mock transcription
            setTimeout(() => {
                setTranscript("I would explain the situation clearly and offer an alternative solution.")
                setStage('complete')
            }, 1500)
        } catch (err: any) {
            setError(err.message || 'Failed to process recording')
            setStage('idle')
        }
    }

    const handleSubmit = async () => {
        if (!audioBlob || !question.id) return
        setIsSubmitting(true)
        try {
            const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })

            const result = await scoreSpeakingAttempt(
                QuestionType.RESPOND_TO_A_SITUATION,
                file,
                question.promptText || question.title,
                question.id
            )

            if (result.success && result.feedback) {
                setScore(result.feedback)
                toast.success('Response scored successfully!')
            } else {
                setError(result.error || 'Failed to score response')
                toast.error(result.error || 'Submission failed.')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to submit attempt')
            toast.error('Submission failed.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (score) {
        return (
            <div className="space-y-8">
                <SpeakingResults scoreData={score} />
                <div className="flex justify-center">
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={handleBegin}
                        className="rounded-2xl font-black uppercase tracking-widest px-12 h-14"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Info Bar */}
            <div className="flex items-center justify-between p-6 bg-card/30 backdrop-blur-sm border border-border/40 rounded-[32px]">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Prep</span>
                        <span className="text-sm font-black flex items-center gap-1.5 text-primary">
                            <Clock className="w-3.5 h-3.5" />
                            40s
                        </span>
                    </div>
                    <div className="w-px h-8 bg-border/50" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Target</span>
                        <span className="text-sm font-black flex items-center gap-1.5">
                            <Mic className="w-3.5 h-3.5 text-primary" />
                            40s Limit
                        </span>
                    </div>
                </div>

                <Badge variant="outline" className="rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest bg-primary/5 text-primary border-primary/20">
                    {question.difficulty || 'Medium'}
                </Badge>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                        <Sparkles className="size-4" />
                        <span>Respond to this situation</span>
                    </div>

                    <Card className="border-border/40 rounded-[48px] bg-white dark:bg-[#121214] overflow-hidden shadow-xl shadow-black/5">
                        <CardContent className="p-8 md:p-12 space-y-8">
                            <div className="size-20 rounded-3xl bg-primary/5 flex items-center justify-center">
                                <Clock className="size-10 text-primary" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black tracking-tight">{question.title}</h3>
                                <div className="p-8 bg-muted/30 rounded-[40px] border border-border/40 relative">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 rounded-l-full" />
                                    <p className="text-lg md:text-xl font-bold text-foreground/80 leading-relaxed italic">
                                        &ldquo;{question.promptText}&rdquo;
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-border/40 rounded-[48px] bg-card/30 backdrop-blur-sm overflow-hidden border-none shadow-none lg:mt-11">
                    <CardContent className="p-8 md:p-12">
                        <div className="relative">
                            {stage === 'idle' && (
                                <div
                                    key="idle"
                                    className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black tracking-tight">Ready?</h3>
                                        <p className="text-muted-foreground font-medium">Read the situation carefully and prepare your response.</p>
                                    </div>
                                    <div className="max-w-xs mx-auto">
                                        <MicSelector value={selectedDeviceId} onValueChange={setSelectedDeviceId} />
                                    </div>
                                    <Button onClick={handleBegin} size="lg" className="rounded-2xl font-black h-16 px-12 shadow-xl shadow-primary/20 text-lg">
                                        Start Preparation
                                    </Button>
                                </div>
                            )}

                            {stage === 'reading' && (
                                <div
                                    key="reading"
                                    className="text-center space-y-8 animate-in fade-in duration-500"
                                >
                                    <div className="relative size-48 mx-auto flex items-center justify-center">
                                        <span className="text-8xl font-black text-primary tabular-nums">{readingTime}</span>
                                        <svg className="absolute inset-0 size-full -rotate-90">
                                            <circle
                                                cx="50%"
                                                cy="50%"
                                                r="48%"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                strokeDasharray={`${(readingTime / 40) * 100} 100`}
                                                pathLength="100"
                                                className="text-primary transition-all duration-1000"
                                            />
                                        </svg>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Reading & Prep</p>
                                        <p className="font-bold text-foreground/80">Think of a natural response</p>
                                    </div>
                                    <Button variant="ghost" onClick={handleStartRecording} className="font-black uppercase tracking-widest text-xs">
                                        Skip to Recording
                                    </Button>
                                </div>
                            )}

                            {stage === 'recording' && (
                                <div
                                    key="recording"
                                    className="w-full space-y-10 animate-in fade-in duration-500"
                                >
                                    <div className="h-32 flex items-center justify-center">
                                        <LiveWaveform
                                            isActive={true}
                                            audioLevel={audioLevel}
                                            className="w-full h-full text-primary"
                                        />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <div className="flex items-center justify-center gap-2 text-rose-500">
                                            <div className="size-2 rounded-full bg-rose-500 animate-pulse" />
                                            <span className="text-sm font-black uppercase tracking-widest">Recording</span>
                                        </div>
                                        <span className="text-6xl font-black tabular-nums">{Math.floor(recordingTime / 1000)}s</span>
                                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">/ 40s Limit</p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="lg"
                                        onClick={handleStopRecording}
                                        className="rounded-full size-24 shadow-2xl shadow-rose-500/30"
                                    >
                                        <Square className="size-10 fill-current" />
                                    </Button>
                                </div>
                            )}

                            {(stage === 'processing' || stage === 'complete') && (
                                <div
                                    key="processing"
                                    className="w-full space-y-8 animate-in fade-in duration-500"
                                >
                                    {stage === 'processing' ? (
                                        <div className="space-y-4">
                                            <Loader2 className="size-12 text-primary animate-spin mx-auto" />
                                            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Evaluating Response</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 max-w-md mx-auto">
                                            <div className="p-8 bg-muted/50 rounded-[40px] border border-border/40">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Transcription</p>
                                                <p className="text-xl font-bold italic text-foreground/80">&ldquo;{transcript}&rdquo;</p>
                                            </div>

                                            <div className="p-4 bg-background rounded-3xl border border-border/40">
                                                <audio src={audioUrl!} controls className="w-full" />
                                            </div>

                                            <div className="flex gap-4">
                                                <Button variant="outline" onClick={handleBegin} className="flex-1 rounded-2xl font-black h-14">
                                                    <RotateCcw className="mr-2 size-4" />
                                                    Retry
                                                </Button>
                                                <Button
                                                    onClick={handleSubmit}
                                                    disabled={isSubmitting}
                                                    className="flex-1 rounded-2xl font-black h-14 shadow-xl shadow-primary/20"
                                                >
                                                    {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CheckCircle className="mr-2 size-4" />}
                                                    Submit
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {recorderError && (
                <Alert variant="destructive" className="rounded-[32px] bg-rose-500/5 border-rose-500/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-bold">{recorderError}</AlertDescription>
                </Alert>
            )}
        </div>
    )
}