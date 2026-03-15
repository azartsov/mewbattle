"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LanguageToggle } from "@/components/mew/language-toggle"
import { useMewI18n } from "@/lib/mew-i18n"
import { BOSS_FIGHTERS } from "@/lib/mew-bosses"
import type { FighterCard } from "@/lib/mew-types"

interface PreAuthUkiyoeSplashProps {
  onEnter: () => void
}

const PETALS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: `${3 + (i * 4.3 + i * i * 0.18) % 93}%`,
  dur: `${5.5 + (i * 0.65) % 5}s`,
  delay: `-${(i * 0.7) % 9}s`,
  size: 10 + (i % 5) * 3,
  drift: `${-70 + (i % 7) * 23}px`,
}))

const BLOSSOM_POSITIONS: [number, number][] = [
  [198, 150], [255, 110], [308, 80], [358, 70], [295, 128],
  [258, 156], [208, 174], [174, 200], [238, 138], [280, 98], [330, 58],
]

export function PreAuthUkiyoeSplash({ onEnter }: PreAuthUkiyoeSplashProps) {
  const { t } = useMewI18n()
  const [boss, setBoss] = useState<FighterCard>(BOSS_FIGHTERS[0])

  useEffect(() => {
    setBoss(BOSS_FIGHTERS[Math.floor(Math.random() * BOSS_FIGHTERS.length)])
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes petalFall {
          0%   { opacity: 0; transform: translateY(-30px) rotate(0deg) translateX(0px); }
          8%   { opacity: 0.88; }
          88%  { opacity: 0.55; }
          100% { opacity: 0; transform: translateY(105vh) rotate(660deg) translateX(var(--petal-drift)); }
        }
        .splash-petal { animation: petalFall var(--petal-dur) var(--petal-delay) ease-in infinite; }
        @keyframes sakura-title-glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(251, 191, 221, 0.36)); }
          50% { filter: drop-shadow(0 0 16px rgba(244, 114, 182, 0.52)); }
        }
        .sakura-title {
          background-image:
            radial-gradient(circle at 14% 22%, rgba(255, 236, 245, 0.96) 0 16%, transparent 17%),
            radial-gradient(circle at 34% 72%, rgba(251, 191, 221, 0.92) 0 16%, transparent 17%),
            radial-gradient(circle at 58% 30%, rgba(244, 114, 182, 0.9) 0 15%, transparent 16%),
            radial-gradient(circle at 76% 64%, rgba(251, 207, 232, 0.9) 0 15%, transparent 16%),
            linear-gradient(120deg, rgba(255, 242, 248, 0.96), rgba(251, 207, 232, 0.9));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-family: "Hiragino Mincho ProN", "Yu Mincho", "MS Mincho", serif;
          font-weight: 700;
          letter-spacing: 0.08em;
          transform: scaleX(0.82);
          transform-origin: center;
          text-shadow:
            0 1px 0 rgba(17, 24, 39, 0.62),
            0 2px 6px rgba(17, 24, 39, 0.38),
            0 0 1px rgba(255, 255, 255, 0.55),
            -1px 0 0 rgba(255, 255, 255, 0.28),
            1px 0 0 rgba(17, 24, 39, 0.28);
          animation: sakura-title-glow 2.3s ease-in-out infinite;
        }
      `}</style>

      {/* Night sky */}
      <div className="absolute inset-0 bg-[linear-gradient(168deg,#0c0920_0%,#190d2d_30%,#26122a_62%,#0e1828_100%)]" />

      {/* Moon */}
      <div className="absolute right-[10%] top-[6%] h-28 w-28 rounded-full bg-amber-50/12 blur-3xl" />
      <svg className="absolute right-[11%] top-[7%] h-14 w-14" viewBox="0 0 60 60" aria-hidden="true">
        <circle cx="30" cy="30" r="26" fill="#fffbeb" fillOpacity="0.88" />
        <circle cx="34" cy="24" r="9" fill="#0c0920" fillOpacity="0.52" />
      </svg>

      {/* Sakura branch */}
      <svg className="pointer-events-none absolute -left-6 -top-4 h-[64%] w-[58%] opacity-68" viewBox="0 0 500 420" aria-hidden="true">
        <path d="M-10 420 C 55 340, 132 240, 200 155 C 248 90, 290 54, 345 18" stroke="#7c4a34" strokeWidth="16" fill="none" strokeLinecap="round" />
        <path d="M200 155 C 265 132, 318 96, 374 76" stroke="#7c4a34" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M160 212 C 216 184, 268 166, 308 138" stroke="#7c4a34" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M122 280 C 158 255, 192 233, 225 206" stroke="#7c4a34" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M238 145 C 256 115, 274 89, 300 70" stroke="#7c4a34" strokeWidth="5" fill="none" strokeLinecap="round" />
        {BLOSSOM_POSITIONS.map(([cx, cy], i) => (
          <g key={i}>
            {[0, 72, 144, 216, 288].map((deg, j) => {
              const angle = (deg + 18) * Math.PI / 180
              return (
                <ellipse
                  key={j}
                  cx={cx + Math.cos(angle) * 9}
                  cy={cy + Math.sin(angle) * 9}
                  rx="5.5" ry="3.5"
                  transform={`rotate(${deg + 18},${cx},${cy})`}
                  fill={i % 3 === 0 ? "#f9a8d4" : i % 3 === 1 ? "#fbb6ce" : "#fbcfe8"}
                  fillOpacity="0.9"
                />
              )
            })}
            <circle cx={cx} cy={cy} r="2.5" fill="#fde68a" fillOpacity="0.95" />
          </g>
        ))}
      </svg>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-[52%] bg-[linear-gradient(180deg,transparent_0%,rgba(12,9,32,0.8)_52%,rgba(5,4,15,0.97)_100%)]" />

      {/* Center logo from sakura petals */}
      <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="sakura-title select-none whitespace-nowrap text-[clamp(1.55rem,8.6vw,4.5rem)] uppercase">
            ＭＥＷＢＡＴＴＬＥ
          </h2>
          <p className="mt-1 text-sm font-semibold tracking-[0.12em] text-amber-100/90 sm:text-base">
            {t.appSubtitle}
          </p>
        </div>
      </div>

      {/* Falling petals */}
      {PETALS.map((p) => (
        <svg
          key={p.id}
          aria-hidden="true"
          className="splash-petal pointer-events-none absolute"
          style={{
            left: p.left,
            top: "-20px",
            width: p.size,
            height: p.size,
            "--petal-dur": p.dur,
            "--petal-delay": p.delay,
            "--petal-drift": p.drift,
          } as React.CSSProperties}
          viewBox="0 0 20 20"
        >
          <ellipse cx="10" cy="7" rx="5" ry="8" fill="#f9a8d4" opacity="0.85" transform="rotate(-20,10,10)" />
          <ellipse cx="10" cy="13" rx="5" ry="8" fill="#fbbfe4" opacity="0.75" transform="rotate(20,10,10)" />
        </svg>
      ))}

      {/* Cards row: 3 cats + random boss */}
      <div className="absolute inset-0 flex items-end justify-center pb-12">
        <div className="flex w-full max-w-3xl flex-col items-center gap-4 px-3 sm:px-4">
          <div className="relative">
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-rose-400/55 bg-rose-900/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-200">
              BOSS
            </span>
            <Image
              src={boss.imageUrl ?? "/bosses/evil_raven.svg"}
              alt={boss.name}
              width={144}
              height={144}
              className="rounded-2xl border border-rose-500/50 bg-black/35 p-1 shadow-2xl shadow-rose-900/55"
            />
          </div>

          <div className="grid w-full max-w-xl grid-cols-3 items-end gap-3">
            <Image
              src="/cards/cat_ninja.svg"
              alt="Cat Ninja"
              width={126}
              height={126}
              className="justify-self-end rounded-2xl border border-white/15 bg-black/20 p-1 shadow-2xl shadow-black/40"
            />
            <Image
              src="/cards/cat_dragon.svg"
              alt="Cat Dragon"
              width={136}
              height={136}
              className="-mb-2 justify-self-center rounded-2xl border border-amber-300/25 bg-black/25 p-1 shadow-2xl shadow-amber-900/35"
            />
            <Image
              src="/cards/cat_mage.svg"
              alt="Cat Mage"
              width={126}
              height={126}
              className="justify-self-start rounded-2xl border border-white/15 bg-black/20 p-1 shadow-2xl shadow-black/40"
            />
          </div>
        </div>
      </div>

      {/* Language control */}
      <div className="absolute right-4 top-4 z-10">
        <LanguageToggle />
      </div>

      {/* Title card */}
      <div className="absolute inset-x-0 top-10 flex justify-center px-4">
        <div className="max-w-xl rounded-2xl border border-amber-300/30 bg-black/40 px-6 py-4 text-center backdrop-blur-[3px]">
          <h1 className='text-2xl font-black tracking-wide text-amber-100 font-["Trebuchet_MS","Verdana",sans-serif]'>
            {t.splashTitle}
          </h1>
          <p className="mt-1.5 text-sm text-amber-50/80">{t.splashSubtitle}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-amber-200/80">{t.splashHint}</p>
          <Button
            className="mt-3 h-8 rounded-full bg-amber-500 px-5 text-xs font-semibold text-slate-950 hover:bg-amber-400"
            onClick={onEnter}
          >
            {t.splashEnter}
          </Button>
        </div>
      </div>
    </div>
  )
}
