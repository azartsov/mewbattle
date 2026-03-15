"use client"

import { PawPrint } from "lucide-react"
import { cn } from "@/lib/utils"

interface CoinPawBadgeProps {
  amount: number
  compact?: boolean
  className?: string
}

export function CoinPawBadge({ amount, compact = false, className }: CoinPawBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-500/12 text-amber-100",
        compact ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-sm",
        className,
      )}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20">
        <PawPrint className="h-3.5 w-3.5" />
      </span>
      <span className="font-semibold tabular-nums">{amount}</span>
    </span>
  )
}
