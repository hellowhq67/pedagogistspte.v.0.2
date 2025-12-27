'use client'

import { countWords } from '@/lib/utils'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Type, AlertTriangle } from 'lucide-react'

type WritingType = 'summarize_written_text' | 'write_essay' | 'essay'

type Props = {
  questionType: string
  value: string
  onChange: (text: string) => void
  disabled?: boolean
}

function guidanceFor(type: string) {
  if (type === 'summarize_written_text') {
    return {
      label: 'Summary Sentence',
      min: 5,
      max: 75,
      placeholder:
        'Write a single sentence that summarizes the passage. (5–75 words)',
    }
  }
  return {
    label: 'Full Essay',
    min: 200,
    max: 300,
    placeholder:
      'Structure your essay with an introduction, body paragraphs, and a clear conclusion. (200–300 words)',
  }
}

export default function WritingInput({
  questionType,
  value,
  onChange,
  disabled,
}: Props) {
  const wc = countWords(value || '')
  const { label, min, max, placeholder } = guidanceFor(questionType)

  const within = wc >= min && wc <= max
  const warnLow = wc > 0 && wc < min
  const warnHigh = wc > max

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Type className="size-4 text-indigo-600" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground opacity-50">Target Range</span>
            <span className="text-[10px] font-bold">{min}-{max} words</span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "rounded-xl px-4 py-1 font-black text-xs border-none",
              within ? "bg-emerald-500/10 text-emerald-600" :
                (warnLow || warnHigh) ? "bg-rose-500/10 text-rose-600" : "bg-muted text-muted-foreground"
            )}
          >
            {wc} Words
          </Badge>
        </div>
      </div>

      <div className="relative group">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "min-h-[300px] rounded-[32px] p-8 text-lg font-medium leading-relaxed resize-none transition-all duration-500",
            "bg-white dark:bg-white/5 border-border/40 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5",
            "placeholder:text-muted-foreground/30 selection:bg-indigo-500/10"
          )}
        />

        {/* Subtle corner accent */}
        <div className="absolute bottom-6 right-6 opacity-20 pointer-events-none group-focus-within:opacity-100 transition-opacity">
          <div className="size-2 rounded-full bg-indigo-500" />
        </div>
      </div>

      {(warnLow || warnHigh) && (
        <div
          className="flex items-center gap-2 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-600 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <AlertTriangle className="size-4 shrink-0" />
          <p className="text-xs font-bold">
            {warnLow
              ? `Your response is too short. Add at least ${min - wc} more words.`
              : `Your response is too long. Try to remove ${wc - max} words.`}
          </p>
        </div>
      )}
    </div>
  )
}

