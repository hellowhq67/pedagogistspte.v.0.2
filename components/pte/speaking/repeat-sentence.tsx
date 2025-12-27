'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Square, Volume2, AlertCircle, ArrowLeft, Play, Loader2, RotateCcw, CheckCircle, Sparkles, Clock } from 'lucide-react'
import { useAudioRecorder } from '../hooks/use-audio-recorder'
import { scoreSpeakingAttempt } from '@/app/actions/pte'
import { QuestionType } from '@/lib/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
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
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import SpeakingResults from '@/app/practice/_componets/SpeakingResults'

interface RepeatSentenceProps {
    question: {
        id: string
        title: string
        promptText: string | null
        promptMediaUrl: string | null
        difficulty: string
    }
}

export function RepeatSentence({ question }: RepeatSentenceProps) {
    const router = useRouter()
    const [stage, setStage] = useState<'idle' | 'playing' | 'waiting' | 'recording' | 'processing' | 'complete'>('idle')
    const [playCount, setPlayCount] = useState(0)
    const [transcript, setTranscript] = useState('')
    const [score, setScore] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [countdown, setCountdown] = useState(3)

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
        maxDuration: 15000,
        onRecordingComplete: handleRecordingComplete,
    })

    const handleBegin = () => {
        setStage('idle')
        setPlayCount(0)
        setError(null)
        setScore(null)
        resetRecording()
    }

    const handlePlayAudio = () => {
        if (!question.promptMediaUrl || playCount >= 1) return
        setStage('playing')
        if (audioRef.current) {
            audioRef.current.play()
            setPlayCount(playCount + 1)
        }
    }

    const handleStartRecording = useCallback(async () => {
        playBeep()
        setStage('recording')
        await startRecording(selectedDeviceId)
    }, [startRecording, playBeep, selectedDeviceId])

    const handleAudioEnded = () => {
        setStage('waiting')
        setCountdown(3)
    }

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (stage === 'waiting' && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        } else if (stage === 'waiting' && countdown === 0) {
            handleStartRecording()
        }
        return () => clearTimeout(timer)
    }, [stage, countdown, handleStartRecording])

    const handleStopRecording = useCallback(() => {
        playBeep(660, 200)
        stopRecording()
    }, [stopRecording, playBeep])

    async function handleRecordingComplete(blob: Blob, duration: number) {
        setStage('processing')
        try {
            const url = URL.createObjectURL(blob)
            setAudioUrl(url)

            // In a real app, you'd call a transcription service here
            // For now, using mock transcription
            setTimeout(() => {
                setTranscript("The university is conducting groundbreaking research.")
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
            // Convert blob to file
            const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })

            const result = await scoreSpeakingAttempt(
                QuestionType.REPEAT_SENTENCE,
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
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Target</span>
                        <span className="text-sm font-black flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            15s Limit
                        </span>
                    </div>
                    <div className="w-px h-8 bg-border/50" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Plays</span>
                        <span className={cn(
                            "text-sm font-black",
                            playCount >= 1 ? "text-rose-500" : "text-emerald-500"
                        )}>
                            {playCount} / 1
                        </span>
                    </div>
                </div>

                <Badge variant="outline" className="rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest bg-primary/5 text-primary border-primary/20">
                    {question.difficulty || 'Medium'}
                </Badge>
            </div>

            {/* Prompt Area */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                    <Sparkles className="size-4" />
                    <span>Listen and repeat the sentence</span>
                </div>

                {question.promptMediaUrl && (
                    <audio
                        ref={audioRef}
                        src={question.promptMediaUrl}
                        onEnded={handleAudioEnded}
                        className="hidden"
                    />
                )}

                <Card className="border-border/40 rounded-[48px] bg-white dark:bg-[#121214] overflow-hidden shadow-xl shadow-black/5">
                    <CardContent className="p-12 flex flex-col items-center justify-center min-h-[200px] text-center">
                        <div className="relative w-full">
                            {stage === 'idle' && (
                                <div
                                    key="idle"
                                    className="space-y-6 animate-in fade-in zoom-in-95 duration-500"
                                >
                                    <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto">
                                        <Volume2 className="size-10 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black tracking-tight">Ready to Listen?</h3>
                                        <p className="text-muted-foreground font-medium">Click the button below to play the audio. You can only listen once.</p>
                                    </div>
                                    <Button onClick={handlePlayAudio} size="lg" className="rounded-2xl font-black h-14 px-8 shadow-xl shadow-primary/20">
                                        Play Audio Prompt
                                    </Button>
                                </div>
                            )}

                            {stage === 'playing' && (
                                <div
                                    key="playing"
                                    className="space-y-8 w-full max-w-sm mx-auto animate-in fade-in duration-500"
                                >
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div
                                                key={i}
                                                className="w-1.5 bg-primary rounded-full animate-bounce"
                                                style={{ animationDelay: `${i * 0.1}s`, animationDuration: '0.6s' }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-lg font-bold text-primary animate-pulse uppercase tracking-widest">Listening...</p>
                                </div>
                            )}

                            {stage === 'waiting' && (
                                <div
                                    key="waiting"
                                    className="space-y-4 animate-in fade-in zoom-in-50 duration-500"
                                >
                                    <span className="text-8xl font-black text-primary tabular-nums">{countdown}</span>
                                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Get Ready to Speak</p>
                                </div>
                            )}

                            {stage === 'recording' && (
                                <div
                                    key="recording"
                                    className="w-full space-y-8 animate-in fade-in duration-500"
                                >
                                    <div className="h-24 flex items-center justify-center">
                                        <LiveWaveform
                                            isActive={true}
                                            audioLevel={audioLevel}
                                            className="w-full h-full text-primary"
                                        />
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-2 text-rose-500">
                                            <div className="size-2 rounded-full bg-rose-500 animate-pulse" />
                                            <span className="text-sm font-black uppercase tracking-widest">Recording</span>
                                        </div>
                                        <span className="text-4xl font-black tabular-nums">{Math.floor(recordingTime / 1000)}s</span>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="lg"
                                        onClick={handleStopRecording}
                                        className="rounded-full size-20 shadow-2xl shadow-rose-500/30"
                                    >
                                        <Square className="size-8 fill-current" />
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
                                            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Analyzing Audio</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 w-full max-w-md mx-auto">
                                            <div className="p-6 bg-muted/50 rounded-3xl border border-border/40 text-left">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Your response</p>
                                                <p className="font-bold leading-relaxed italic text-foreground/80">&ldquo;{transcript}&rdquo;</p>
                                            </div>

                                            <div className="w-full p-4 bg-background rounded-3xl border border-border/40">
                                                <audio controls src={audioUrl!} className="w-full" />
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

            {/* Settings Bar */}
            <div className="flex justify-center">
                <div className="px-6 py-3 bg-card/30 backdrop-blur-sm border border-border/40 rounded-2xl flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Microphone</span>
                    <MicSelector value={selectedDeviceId} onValueChange={setSelectedDeviceId} />
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="rounded-3xl border-rose-500/20 bg-rose-500/5">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-bold">{error}</AlertDescription>
                </Alert>
            )}
        </div>
    )
}
