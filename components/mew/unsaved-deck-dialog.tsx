"use client"

import { Button } from "@/components/ui/button"
import { PawLoader } from "@/components/mew/paw-loader"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface UnsavedDeckDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  stayLabel: string
  discardLabel: string
  saveLabel: string
  saving?: boolean
  onStay: () => void
  onDiscard: () => void
  onSave: () => void
}

export function UnsavedDeckDialog({
  open,
  onOpenChange,
  title,
  description,
  stayLabel,
  discardLabel,
  saveLabel,
  saving = false,
  onStay,
  onDiscard,
  onSave,
}: UnsavedDeckDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-amber-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <DialogHeader>
          <DialogTitle className="text-amber-200">{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-300/80">{description}</p>
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button size="sm" variant="ghost" onClick={onStay}>
            {stayLabel}
          </Button>
          <Button size="sm" variant="outline" onClick={onDiscard}>
            {discardLabel}
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <PawLoader size="sm" />
                {saveLabel}
              </>
            ) : saveLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
