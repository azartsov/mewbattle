"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useMewI18n } from "@/lib/mew-i18n"
import { VERSION_HISTORY } from "@/lib/version-history"

interface VersionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VersionHistoryDialog({ open, onOpenChange }: VersionHistoryDialogProps) {
  const { language, t } = useMewI18n()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-primary/25 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <DialogHeader>
          <DialogTitle className='font-["Trebuchet_MS","Verdana",sans-serif] text-amber-100'>
            {t.versionHistoryTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[65vh] overflow-auto pr-1">
          <div className="space-y-3">
            {VERSION_HISTORY.map((entry) => {
              const localizedDate = new Date(`${entry.date}T00:00:00`).toLocaleDateString(
                language === "ru" ? "ru-RU" : "en-US",
                { year: "numeric", month: "long", day: "numeric" },
              )

              return (
                <div
                  key={entry.version}
                  className="rounded-xl border border-border/50 bg-card/50 p-4 shadow-[0_8px_24px_rgba(2,6,23,0.18)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-amber-400/35 bg-amber-500/10 px-2.5 py-1 text-sm font-semibold text-amber-100">
                        v{entry.version}
                      </span>
                      <span className="text-xs text-muted-foreground">{localizedDate}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-200/90">
                    {entry.summary[language]}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
