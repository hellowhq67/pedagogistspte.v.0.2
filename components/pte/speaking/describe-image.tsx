'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, Square, Volume2, AlertCircle, RotateCcw, CheckCircle, Loader2, Play, Sparkles, Clock, Eye, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { scoreSpeakingAttempt } from '@/app/actions/pte'
import { QuestionType } from '@/lib/types'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LiveWaveform } from '@/components/ui/live-waveform'
import { MicSelector } from '@/components/ui/mic-selector'
import {
    AudioPlayerProvider,
    AudioPlayerButton,
    AudioPlayerProgress,
    AudioPlayerTime,
    AudioPlayerDuration,
    AudioPlayerSpeed,
} from '@/components/ui/audio-player'
import { toast } from 'sonner'
import { useAudioRecorder } from '@/components/pte/hooks/use-audio-recorder'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import SpeakingResults from '@/app/practice/_componets/SpeakingResults'

interface DescribeImageProps {
    question: {
        id: string
        title: string
        promptText: string | null
        promptMediaUrl: string | null
        difficulty: string
    }
}

export function DescribeImage({ question }: DescribeImageProps) {
    const router = useRouter()
    const [stage, setStage] = useState<'idle' | 'preparing' | 'recording' | 'processing' | 'complete'>('idle')
    const [prepTime, setPrepTime] = useState(25)
    const [transcript, setTranscript] = useState('')
    const [score, setScore] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleRecordingComplete = useCallback(async (blob: Blob, duration: number) => {
        setStage('processing')
        try {
            const url = URL.createObjectURL(blob)
            setAudioUrl(url)

            // Mock transcription for now
            setTimeout(() => {
                setTranscript('The image shows a detailed chart of population growth trends.')
                setStage('complete')
            }, 1500)
        } catch (err: any) {
            setError(err.message || 'Failed to process recording')
            setStage('idle')
        }
    }, [])

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
        maxDuration: 40000,
        onRecordingComplete: handleRecordingComplete,
    })


    const handleStartRecording = useCallback(async () => {
        playBeep()
        setStage('recording')
        await startRecording(selectedDeviceId)
    }, [startRecording, playBeep, selectedDeviceId])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (stage === 'preparing' && prepTime > 0) {
            timer = setTimeout(() => setPrepTime(prepTime - 1), 1000)
        } else if (stage === 'preparing' && prepTime === 0) {
            handleStartRecording()
        }
        return () => clearTimeout(timer)
    }, [stage, prepTime, handleStartRecording])

    const handleBegin = () => {
        setStage('preparing')
        setPrepTime(25)
        setError(null)
        setScore(null)
        resetRecording()
    }

    const handleStopRecording = useCallback(() => {
        playBeep(660, 200)
        stopRecording()
    }, [stopRecording, playBeep])

    const handleSubmit = async () => {
        if (!audioBlob || !question.id) return
        setIsSubmitting(true)
        try {
            const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })

            const result = await scoreSpeakingAttempt(
                QuestionType.DESCRIBE_IMAGE,
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
                        <span className="text-sm font-black flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            25s
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

            {/* Task Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                        <Sparkles className="size-4" />
                        <span>Describe this image</span>
                    </div>

                    <div className="relative group overflow-hidden rounded-[48px] border border-border/40 bg-white dark:bg-[#121214] shadow-2xl shadow-black/5 aspect-[4/3] flex items-center justify-center">
                        {question.promptMediaUrl ? (
                            <>
                                <Image
                                    src={question.promptMediaUrl}
                                    alt="Describe this"
                                    fill
                                    className="object-contain p-8"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <Button variant="secondary" className="rounded-2xl font-black uppercase tracking-widest" onClick={() => window.open(question.promptMediaUrl!, '_blank')}>
                                        <Eye className="mr-2 size-4" />
                                        Full Size
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center space-y-4 text-muted-foreground">
                                <ImageIcon className="size-20 mx-auto opacity-20" />
                                <p className="font-bold uppercase tracking-widest text-xs">No Image Available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Interaction Card */}
                <Card className="border-border/40 rounded-[48px] bg-card/30 backdrop-blur-sm overflow-hidden border-none shadow-none lg:mt-11">
                    <CardContent className="p-8 md:p-12">
                        <div className="relative">
                            {stage === 'idle' && (
                                <div
                                    key="idle"
                                    className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black tracking-tight">Ready to Begin?</h3>
                                        <p className="text-sm font-medium text-muted-foreground">You will have 25 seconds to study the image before recording starts.</p>
                                    </div>
                                    <div className="max-w-xs mx-auto">
                                        <MicSelector value={selectedDeviceId} onValueChange={setSelectedDeviceId} />
                                    </div>
                                    <Button onClick={handleBegin} size="lg" className="rounded-2xl font-black h-16 px-12 text-lg shadow-xl shadow-primary/20">
                                        Start Practice
                                    </Button>
                                </div>
                            )}

                            {stage === 'preparing' && (
                                <div
                                    key="preparing"
                                    className="text-center space-y-8 animate-in fade-in duration-500"
                                >
                                    <div className="relative size-40 mx-auto flex items-center justify-center">
                                        <span className="text-7xl font-black text-primary tabular-nums">{prepTime}</span>
                                        <svg className="absolute inset-0 size-full -rotate-90">
                                            <circle
                                                cx="50%"
                                                cy="50%"
                                                r="48%"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                strokeDasharray={`${(prepTime / 25) * 100} 100`}
                                                pathLength="100"
                                                className="text-primary transition-all duration-1000"
                                            />
                                        </svg>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Preparation Time</p>
                                        <p className="font-bold text-foreground/80">Study the image carefully</p>
                                    </div>
                                    <Button variant="ghost" onClick={handleStartRecording} className="font-black uppercase tracking-widest text-xs">
                                        Skip to Recording
                                    </Button>
                                </div>
                            )}

                            {stage === 'recording' && (
                                <div
                                    key="recording"
                                    className="space-y-10 animate-in fade-in duration-500"
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
                                        <span className="text-5xl font-black tabular-nums">{Math.floor(recordingTime / 1000)}s</span>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">/ 40s Limit</p>
                                    </div>
                                    <div className="flex justify-center">
                                        <Button
                                            variant="destructive"
                                            size="lg"
                                            onClick={handleStopRecording}
                                            className="rounded-full size-24 shadow-2xl shadow-rose-500/30 transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <Square className="size-10 fill-current" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {(stage === 'processing' || stage === 'complete') && (
                                <div
                                    key="processing"
                                    className="space-y-8 animate-in fade-in duration-500"
                                >
                                    {stage === 'processing' ? (
                                        <div className="text-center py-12 space-y-4">
                                            <Loader2 className="size-12 text-primary animate-spin mx-auto" />
                                            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Analyzing your response</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="p-6 bg-muted/50 rounded-[32px] border border-border/40">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Recorded Transcript</p>
                                                <p className="font-bold leading-relaxed italic text-foreground/80">&ldquo;{transcript}&rdquo;</p>
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