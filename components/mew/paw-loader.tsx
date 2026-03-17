"use client"

import { PawPrint } from "lucide-react"
import { cn } from "@/lib/utils"

interface PawLoaderProps {
  label?: string
  size?: "sm" | "md" | "lg"
  overlay?: boolean
  className?: string
}

const sizeClasses = {
  sm: {
    shell: "h-12 w-12",
    core: "h-8 w-8",
    icon: "h-4 w-4",
    dot: "h-1.5 w-1.5",
    text: "text-xs",
  },
  md: {
    shell: "h-16 w-16",
    core: "h-11 w-11",
    icon: "h-5 w-5",
    dot: "h-2 w-2",
    text: "text-sm",
  },
  lg: {
    shell: "h-24 w-24",
    core: "h-16 w-16",
    icon: "h-8 w-8",
    dot: "h-2.5 w-2.5",
    text: "text-base",
  },
} as const

export function PawLoader({ label, size = "md", overlay = false, className }: PawLoaderProps) {
  const preset = sizeClasses[size]

  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className={cn("relative flex items-center justify-center", preset.shell)}>
        <span className="absolute inset-0 rounded-full border border-amber-400/35 bg-amber-500/8 paw-loader-ring" />
        <span className="absolute inset-[12%] rounded-full border border-amber-300/25 paw-loader-ring paw-loader-ring-delay" />
        <span className={cn("absolute rounded-full bg-amber-300/70 shadow-[0_0_10px_rgba(251,191,36,0.65)] paw-loader-dot-1", preset.dot)} />
        <span className={cn("absolute rounded-full bg-amber-200/75 shadow-[0_0_10px_rgba(253,230,138,0.55)] paw-loader-dot-2", preset.dot)} />
        <span className={cn("absolute rounded-full bg-amber-400/70 shadow-[0_0_10px_rgba(251,191,36,0.55)] paw-loader-dot-3", preset.dot)} />
        <span className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,247,204,0.9),rgba(251,191,36,0.55)_40%,rgba(180,83,9,0.18)_100%)] blur-[1px]" />
        <span className={cn("relative inline-flex items-center justify-center rounded-full border border-amber-200/40 bg-amber-400/20 text-amber-50 shadow-[0_10px_30px_rgba(251,191,36,0.2)] backdrop-blur-sm paw-loader-bob", preset.core)}>
          <PawPrint className={cn("paw-loader-print", preset.icon)} />
        </span>
      </div>
      {label ? <p className={cn("font-medium tracking-wide text-amber-100/90", preset.text)}>{label}</p> : null}
    </div>
  )

  if (!overlay) return content

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="rounded-3xl border border-amber-500/25 bg-slate-950/85 px-8 py-7 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        {content}
      </div>
    </div>
  )
}