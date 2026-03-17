"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMewI18n } from "@/lib/mew-i18n"
import { VERSION_HISTORY, type VersionHistoryEntry } from "@/lib/version-history"

interface VersionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function groupVersionHistoryByDate(entries: VersionHistoryEntry[]) {
  return entries.reduce<Array<{ date: string; entries: VersionHistoryEntry[] }>>((groups, entry) => {
    const currentGroup = groups[groups.length - 1]
    if (currentGroup && currentGroup.date === entry.date) {
      currentGroup.entries.push(entry)
      return groups
    }

    groups.push({ date: entry.date, entries: [entry] })
    return groups
  }, [])
}

function formatLocalizedDate(date: string, language: "ru" | "en") {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    language === "ru" ? "ru-RU" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  )
}

function summarizeEntries(entries: VersionHistoryEntry[], language: "ru" | "en") {
  const seen = new Set<string>()

  return entries
    .map((entry) => entry.summary[language].replace(/[.;]\s*$/u, "").trim())
    .filter((summary) => {
      const normalized = summary.toLocaleLowerCase(language === "ru" ? "ru-RU" : "en-US")
      if (seen.has(normalized)) return false
      seen.add(normalized)
      return true
    })
}

export function VersionHistoryDialog({ open, onOpenChange }: VersionHistoryDialogProps) {
  const { language, t } = useMewI18n()
  const dateGroups = groupVersionHistoryByDate(VERSION_HISTORY)
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({})

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
            {dateGroups.map((group) => {
              const firstVersion = group.entries[0]?.version
              const lastVersion = group.entries[group.entries.length - 1]?.version
              const versionLabel = firstVersion === lastVersion
                ? `v${firstVersion}`
                : `v${firstVersion} - v${lastVersion}`
              const dateLabel = formatLocalizedDate(group.date, language)
              const summaryLines = summarizeEntries(group.entries, language)
              const isExpanded = !!expandedDates[group.date]
              const visibleSummaryLines = isExpanded ? summaryLines : summaryLines.slice(0, 5)
              const hasHiddenLines = summaryLines.length > 5

              return (
                <div
                  key={group.date}
                  className="rounded-xl border border-border/50 bg-card/50 p-4 shadow-[0_8px_24px_rgba(2,6,23,0.18)]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-amber-400/35 bg-amber-500/10 px-2.5 py-1 text-sm font-semibold text-amber-100">
                      {dateLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">{versionLabel}</span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {visibleSummaryLines.map((summaryLine) => (
                      <p key={summaryLine} className="text-sm leading-relaxed text-slate-200/90">
                        {summaryLine}.
                      </p>
                    ))}
                  </div>
                  {hasHiddenLines && !isExpanded && (
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 rounded-full px-3 text-amber-100 hover:bg-amber-500/10 hover:text-amber-50"
                        onClick={() => {
                          setExpandedDates((current) => ({
                            ...current,
                            [group.date]: true,
                          }))
                        }}
                      >
                        {t.expand}
                      </Button>
                    </div>
                  )}
                  {hasHiddenLines && isExpanded && (
                    <div className="mt-3 flex justify-start">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 rounded-full px-3 text-amber-100 hover:bg-amber-500/10 hover:text-amber-50"
                        onClick={() => {
                          setExpandedDates((current) => ({
                            ...current,
                            [group.date]: false,
                          }))
                        }}
                      >
                        {t.collapse}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
