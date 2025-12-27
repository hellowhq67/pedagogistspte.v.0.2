'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Mic, Square, Volume2, RotateCcw, CheckCircle, Loader2, AlertCircle, Clock, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { ScoringProgressModal } from './scoring-progress-modal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SpeakingFeedbackData, QuestionType } from '@/lib/types'
import { scoreReadAloudAttempt } from '@/app/actions/pte'
import SpeakingResults from '@/app/practice/_componets/SpeakingResults'
import { cn } from '@/lib/utils'

interface ReadAloudProps {
    question: {
        id: string
        type: QuestionType.READ_ALOUD
        title?: string | null
        promptText: string
        difficulty?: string | null
    }
}

type Phase = 'idle' | 'preparing' | 'beep' | 'recording' | 'finished' | 'submitting' | 'scored'

const PREP_TIME = 30
const RECORDING_TIME = 40

export function ReadAloud({ question }: ReadAloudProps) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [timeLeft, setTimeLeft] = useState(PREP_TIME)
    const [recordingTime, setRecordingTime] = useState(0)
    const [totalTime, setTotalTime] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isScoringModalOpen, setIsScoringModalOpen] = useState(false)
    const [aiFeedback, setAiFeedback] = useState<SpeakingFeedbackData | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const totalTimerRef = useRef<NodeJS.Timeout | null>(null)
    const beepAudioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const createBeep = () => {
            const osc = audioContext.createOscillator()
            const gain = audioContext.createGain()
            osc.connect(gain)
            gain.connect(audioContext.destination)
            osc.frequency.value = 800
            osc.type = 'sine'
            gain.gain.value = 0.3
            osc.start()
            osc.stop(audioContext.currentTime + 0.2)
        }
        beepAudioRef.current = { play: createBeep } as any

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
            if (totalTimerRef.current) clearInterval(totalTimerRef.current)
        }
    }, [])

    useEffect(() => {
        if (phase === 'preparing' || phase === 'recording') {
            totalTimerRef.current = setInterval(() => {
                setTotalTime((t) => t + 1)
            }, 1000)
        } else {
            if (totalTimerRef.current) clearInterval(totalTimerRef.current)
        }
        return () => {
            if (totalTimerRef.current) clearInterval(totalTimerRef.current)
        }
    }, [phase])

    const playBeepAndStartRecording = useCallback(() => {
        setPhase('beep')
        beepAudioRef.current?.play()
        setTimeout(() => startRecording(), 500)
    }, [])

    const startPractice = useCallback(() => {
        setPhase('preparing')
        setTimeLeft(PREP_TIME)
        setTotalTime(0)
        setSubmitError(null)
        setAiFeedback(null)

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current)
                    playBeepAndStartRecording()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }, [playBeepAndStartRecording])

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                setAudioBlob(blob)
                setAudioUrl(URL.createObjectURL(blob))
                setPhase('finished')
            }

            mediaRecorder.start()
            setPhase('recording')
            setRecordingTime(0)

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev >= RECORDING_TIME - 1) {
                        stopRecording()
                        return RECORDING_TIME
                    }
                    return prev + 1
                })
            }, 1000)
        } catch (err) {
            console.error('Error accessing microphone:', err)
            toast.error('Could not access microphone. Please check permissions.')
            setPhase('idle')
        }
    }, [])

    const stopRecording = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current)
        if (mediaRecorderRef.current && phase === 'recording') {
            beepAudioRef.current?.play()
            mediaRecorderRef.current.stop()
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }
    }, [phase])

    const handleSubmit = useCallback(async () => {
        if (!audioBlob) {
            setSubmitError('No audio recorded to submit.')
            return
        }

        setPhase('submitting')
        setIsScoringModalOpen(true)
        setSubmitError(null)
        setAiFeedback(null)

        try {
            const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })
            const result = await scoreReadAloudAttempt(file, question.promptText, question.id)

            if (result.success && result.feedback) {
                setAiFeedback(result.feedback)
                setPhase('scored')
                toast.success('Your response has been submitted and scored!')
            } else {
                setSubmitError(result.error || 'Failed to get AI score.')
                setPhase('finished')
            }
        } catch (error: any) {
            console.error('Submit error:', error)
            setSubmitError(error.message || 'Failed to submit. Please try again.')
            setPhase('finished')
        } finally {
            setIsScoringModalOpen(false)
        }
    }, [audioBlob, question.promptText, question.id])

    const handleReset = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current)
        if (totalTimerRef.current) clearInterval(totalTimerRef.current)
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }

        setPhase('idle')
        setTimeLeft(PREP_TIME)
        setRecordingTime(0)
        setTotalTime(0)
        setAudioBlob(null)
        setAudioUrl(null)
        setAiFeedback(null)
        setSubmitError(null)
    }, [])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    if (phase === 'scored' && aiFeedback) {
        return (
            <div className="space-y-8">
                <SpeakingResults
                    scoreData={{
                        overallScore: aiFeedback.overallScore,
                        content: aiFeedback.content || { score: 0, feedback: '' },
                        pronunciation: aiFeedback.pronunciation || { score: 0, feedback: '' },
                        fluency: aiFeedback.fluency || { score: 0, feedback: '' },
                        strengths: aiFeedback.strengths,
                        areasForImprovement: aiFeedback.areasForImprovement
                    }}
                />
                <div className="flex justify-center">
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={handleReset}
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
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Target</span>
                        <span className="text-sm font-black flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            {RECORDING_TIME}s Limit
                        </span>
                    </div>
                    <div className="w-px h-8 bg-border/50" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Time Spent</span>
                        <span className={cn(
                            "text-sm font-black",
                            (phase === 'preparing' || phase === 'recording') ? "text-rose-500" : "text-foreground"
                        )}>
                            {formatTime(totalTime)}
                        </span>
                    </div>
                </div>

                <Badge variant="outline" className="rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest bg-primary/5 text-primary border-primary/20">
                    {question.difficulty || 'Medium'}
                </Badge>
            </div>

            {/* Main Task Area */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                    <Sparkles className="size-4" />
                    <span>Read the text aloud</span>
                </div>

                <div className="p-8 md:p-12 bg-white dark:bg-[#121214] rounded-[48px] border border-border/40 shadow-xl shadow-black/5 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary/20" />
                    <p className="text-xl md:text-2xl font-bold leading-relaxed text-foreground/90 selection:bg-primary/20">
                        {question.promptText || question.title}
                    </p>
                </div>
            </div>

            {/* Control Station */}
            <Card className="border-border/40 rounded-[48px] bg-card/30 backdrop-blur-sm overflow-hidden border-none shadow-none">
                <CardContent className="p-8 md:p-12">
                    <div className="flex flex-col items-center justify-center gap-8">
                        {/* Status Label */}
                        <div className="text-center space-y-1">
                            <h3 className="text-2xl font-black uppercase tracking-tight">
                                {phase === 'idle' ? 'Ready to Start' :
                                    phase === 'preparing' ? 'Prepare Yourself' :
                                        phase === 'recording' ? 'Recording Now' :
                                            phase === 'finished' ? 'Task Complete' : 'Processing...'}
                            </h3>
                            <p className="text-sm font-medium text-muted-foreground">
                                {phase === 'idle' ? 'Click the microphone to begin preparation' :
                                    phase === 'preparing' ? `Recording starts automatically in ${timeLeft}s` :
                                        phase === 'recording' ? 'Speak clearly into your microphone' :
                                            'Great job! You can now submit or try again.'}
                            </p>
                        </div>

                        {/* Visual Progress */}
                        {(phase === 'preparing' || phase === 'recording') && (
                            <div className="w-full max-w-md space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <span>{phase === 'preparing' ? 'Preparation' : 'Progress'}</span>
                                    <span>{phase === 'preparing' ? `${timeLeft}s` : `${recordingTime}s / ${RECORDING_TIME}s`}</span>
                                </div>
                                <Progress
                                    value={phase === 'preparing' ? ((PREP_TIME - timeLeft) / PREP_TIME) * 100 : (recordingTime / RECORDING_TIME) * 100}
                                    className="h-3 rounded-full bg-muted overflow-hidden"
                                />
                            </div>
                        )}

                        {/* Main Interaction Button */}
                        <div className="relative">
                            {phase === 'idle' && (
                                <Button
                                    size="lg"
                                    onClick={startPractice}
                                    className="size-28 rounded-full bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/40 group transition-all duration-500 hover:scale-110 active:scale-95"
                                >
                                    <Volume2 className="size-10 group-hover:scale-110 transition-transform" />
                                    <div className="absolute -inset-4 bg-primary/10 rounded-full animate-ping pointer-events-none" />
                                </Button>
                            )}

                            {phase === 'recording' && (
                                <Button
                                    size="lg"
                                    variant="destructive"
                                    onClick={stopRecording}
                                    className="size-28 rounded-full shadow-2xl shadow-rose-500/40 animate-pulse transition-all duration-500 hover:scale-110 active:scale-95"
                                >
                                    <Square className="size-10 fill-current" />
                                </Button>
                            )}

                            {(phase === 'finished' || phase === 'submitting') && audioUrl && (
                                <div className="flex flex-col items-center gap-8 w-full min-w-[300px]">
                                    <div className="w-full p-4 bg-background rounded-3xl border border-border/40">
                                        <audio controls src={audioUrl} className="w-full" />
                                    </div>
                                    <div className="flex gap-4 w-full">
                                        <Button
                                            variant="outline"
                                            onClick={handleReset}
                                            className="flex-1 rounded-2xl font-black uppercase tracking-widest h-14 border-border/60"
                                        >
                                            <RotateCcw className="mr-2 size-4" />
                                            Retry
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={phase === 'submitting'}
                                            className="flex-1 rounded-2xl font-black uppercase tracking-widest h-14 shadow-xl shadow-primary/20"
                                        >
                                            {phase === 'submitting' ? (
                                                <Loader2 className="mr-2 size-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="mr-2 size-4" />
                                            )}
                                            Submit
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {submitError && (
                                <div className="mt-6 flex items-center gap-2 text-rose-500 font-bold text-sm bg-rose-500/5 px-4 py-2 rounded-xl border border-rose-500/10">
                                    <AlertCircle className="size-4" />
                                    {submitError}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ScoringProgressModal
                open={isScoringModalOpen}
                onOpenChange={setIsScoringModalOpen}
            />
        </div>
    )
}
