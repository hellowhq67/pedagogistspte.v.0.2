'use client'

import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ScoringProgressModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Simple modal shown while AI scoring is in progress for speaking items.
export function ScoringProgressModal({
  open,
  onOpenChange,
}: ScoringProgressModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader className="space-y-2 text-center">
          <div className="flex justify-center pb-2">
            <div className="rounded-full bg-primary/10 p-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </div>
          <DialogTitle className="text-lg font-black tracking-tight">
            Scoring your response
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground">
            Our AI is analysing your pronunciation, fluency and content. This only
            takes a few seconds.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
