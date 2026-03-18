"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMewI18n } from "@/lib/mew-i18n"
import { VERSION_HISTORY, type VersionHistoryEntry } from "@/lib/version-history"

interface VersionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentVersion?: string
  currentBuildDate?: string
}

function compareVersionsDesc(left: string, right: string) {
  const leftParts = left.split(".").map((part) => Number.parseInt(part, 10) || 0)
  const rightParts = right.split(".").map((part) => Number.parseInt(part, 10) || 0)
  const maxLength = Math.max(leftParts.length, rightParts.length)

  for (let index = 0; index < maxLength; index += 1) {
    const leftPart = leftParts[index] ?? 0
    const rightPart = rightParts[index] ?? 0
    if (leftPart !== rightPart) {
      return rightPart - leftPart
    }
  }

  return 0
}

function sortVersionHistory(entries: VersionHistoryEntry[]) {
  return [...entries].sort((left, right) => {
    if (left.date !== right.date) {
      return right.date.localeCompare(left.date)
    }

    return compareVersionsDesc(left.version, right.version)
  })
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

function compactSummaryLine(summary: string, language: "ru" | "en") {
  const normalized = summary.replace(/[.;]\s*$/u, "").trim()
  const firstClause = normalized.split(/[,;:]/u)[0]?.trim() ?? normalized
  const maxLength = language === "ru" ? 52 : 58

  if (firstClause.length <= maxLength) return firstClause
  return `${firstClause.slice(0, maxLength).trimEnd()}...`
}

function summarizeDayCompact(entries: VersionHistoryEntry[], language: "ru" | "en") {
  const lines = summarizeEntries(entries, language)
  const compactLines = lines.map((line) => compactSummaryLine(line, language))
  const visible = compactLines.slice(0, 3)
  const hiddenCount = Math.max(0, compactLines.length - visible.length)

  if (visible.length === 0) {
    return language === "ru" ? "Изменения за день." : "Daily changes."
  }

  const suffix = hiddenCount > 0
    ? language === "ru"
      ? ` + ещё ${hiddenCount}`
      : ` + ${hiddenCount} more`
    : ""

  const prefix = language === "ru"
    ? `${entries.length} изм.: `
    : `${entries.length} changes: `

  return `${prefix}${visible.join(", ")}${suffix}.`
}

export function VersionHistoryDialog({ open, onOpenChange, currentVersion, currentBuildDate }: VersionHistoryDialogProps) {
  const { language, t } = useMewI18n()
  const dateGroups = groupVersionHistoryByDate(sortVersionHistory(VERSION_HISTORY))
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
              const resolvedFirstVersion = currentVersion && currentBuildDate === group.date && firstVersion && compareVersionsDesc(currentVersion, firstVersion) < 0
                ? currentVersion
                : firstVersion
              const versionLabel = resolvedFirstVersion === lastVersion
                ? `v${resolvedFirstVersion}`
                : `v${resolvedFirstVersion} - v${lastVersion}`
              const dateLabel = formatLocalizedDate(group.date, language)
              const summaryLines = summarizeEntries(group.entries, language)
              const compactDaySummary = summarizeDayCompact(group.entries, language)
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
                  {!isExpanded ? (
                    <p className="mt-3 text-sm leading-relaxed text-slate-200/90">
                      {compactDaySummary}
                    </p>
                  ) : (
                    <div className="mt-3 space-y-1.5">
                      {visibleSummaryLines.map((summaryLine) => (
                        <p key={summaryLine} className="text-sm leading-relaxed text-slate-200/90">
                          {summaryLine}.
                        </p>
                      ))}
                    </div>
                  )}
                  {(summaryLines.length > 1 || hasHiddenLines) && !isExpanded && (
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
                  {(summaryLines.length > 1 || hasHiddenLines) && isExpanded && (
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
