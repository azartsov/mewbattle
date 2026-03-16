"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { MewCard } from "@/lib/mew-types"
import { MewCardFace } from "@/components/mew/mew-card-face"
import { CoinPawBadge } from "@/components/mew/coin-paw-badge"
import { PawLoader } from "@/components/mew/paw-loader"
import { useMewI18n } from "@/lib/mew-i18n"
import type { BoosterOffer, BoosterOpenResult } from "@/lib/mew-firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface BoosterShopProps {
  offers: BoosterOffer[]
  onOpen: (offerId: BoosterOffer["id"]) => Promise<BoosterOpenResult>
}

const RARITY_LABEL: Array<"common" | "rare" | "epic" | "legendary"> = ["common", "rare", "epic", "legendary"]

const CAT_ART_BY_OFFER: Record<BoosterOffer["id"], string> = {
  starter: "/cards/cat_knight.svg",
  hunter: "/cards/cat_ninja.svg",
  royal: "/cards/cat_dragon.svg",
}

const INLAY_DOTS: Array<{ x: number; y: number; r: number; o: number }> = [
  { x: 22, y: 24, r: 1.7, o: 0.5 },
  { x: 46, y: 34, r: 1.2, o: 0.45 },
  { x: 68, y: 18, r: 1.4, o: 0.35 },
  { x: 84, y: 42, r: 1.1, o: 0.4 },
  { x: 112, y: 26, r: 1.6, o: 0.42 },
  { x: 134, y: 36, r: 1.15, o: 0.35 },
  { x: 158, y: 20, r: 1.3, o: 0.4 },
  { x: 172, y: 46, r: 1.1, o: 0.28 },
  { x: 28, y: 88, r: 1.2, o: 0.32 },
  { x: 56, y: 96, r: 1.5, o: 0.4 },
  { x: 92, y: 86, r: 1.1, o: 0.32 },
  { x: 126, y: 96, r: 1.35, o: 0.38 },
  { x: 162, y: 90, r: 1.2, o: 0.3 },
]

// Map cost to tier and styling (lacquer box vibe: glossy dark base + metallic inlay/trim)
const TIER_CONFIG: Record<string, {
  name: string
  colors: {
    lacquer: string
    lid: string
    side: string
    trim: string
    inlay: string
    inlayText: string
  }
}> = {
  bronze: {
    name: "Bronze",
    colors: {
      lacquer: "from-neutral-950 via-amber-950/60 to-neutral-950",
      lid: "from-amber-700/70 via-amber-800/55 to-neutral-950",
      side: "from-neutral-950 via-amber-950/35 to-black",
      trim: "border-amber-400/60 shadow-amber-950/60",
      inlay: "border-amber-300/35",
      inlayText: "text-amber-200/75",
    },
  },
  silver: {
    name: "Silver",
    colors: {
      lacquer: "from-neutral-950 via-slate-900/55 to-neutral-950",
      lid: "from-slate-300/25 via-slate-500/25 to-neutral-950",
      side: "from-neutral-950 via-slate-900/35 to-black",
      trim: "border-slate-200/45 shadow-slate-950/60",
      inlay: "border-slate-200/30",
      inlayText: "text-slate-100/70",
    },
  },
  gold: {
    name: "Gold",
    colors: {
      lacquer: "from-neutral-950 via-yellow-950/55 to-neutral-950",
      lid: "from-yellow-500/45 via-yellow-600/35 to-neutral-950",
      side: "from-neutral-950 via-yellow-950/35 to-black",
      trim: "border-yellow-300/70 shadow-yellow-950/70",
      inlay: "border-yellow-200/35",
      inlayText: "text-yellow-200/80",
    },
  },
}

const getTierForOffer = (offer: BoosterOffer): "bronze" | "silver" | "gold" => {
  // Map by cost: 80=bronze, ~120=silver, >150=gold
  if (offer.cost <= 90) return "bronze"
  if (offer.cost <= 140) return "silver"
  return "gold"
}

export function BoosterShop({ offers, onOpen }: BoosterShopProps) {
  const { t } = useMewI18n()
  const [hoveredOfferId, setHoveredOfferId] = useState<BoosterOffer["id"] | null>(null)
  const [selectedOfferId, setSelectedOfferId] = useState<BoosterOffer["id"] | null>(null)
  const [lastOpenedOfferId, setLastOpenedOfferId] = useState<BoosterOffer["id"] | null>(null)
  const [opening, setOpening] = useState(false)
  const [openingOfferId, setOpeningOfferId] = useState<BoosterOffer["id"] | null>(null)
  const [cards, setCards] = useState<MewCard[]>([])
  const [unlockedDeckSlot, setUnlockedDeckSlot] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)

  const lastOpenedOffer = offers.find((offer) => offer.id === lastOpenedOfferId)
  const rarityLabels: Record<(typeof RARITY_LABEL)[number], string> = {
    common: t.rarityCommon,
    rare: t.rarityRare,
    epic: t.rarityEpic,
    legendary: t.rarityLegendary,
  }

  const open = async (offerId: BoosterOffer["id"]) => {
    setOpening(true)
    setOpeningOfferId(offerId)
    try {
      const result = await onOpen(offerId)
      setCards(result.cards)
      setUnlockedDeckSlot(result.unlockedDeckSlot)
      setLastOpenedOfferId(offerId)
      setShowResultModal(true)
    } finally {
      setOpening(false)
      setOpeningOfferId(null)
    }
  }

  return (
    <div
      className="space-y-4"
      onClick={() => {
        setSelectedOfferId(null)
        setHoveredOfferId(null)
      }}
    >
      {opening ? <PawLoader overlay size="lg" label={t.openingBooster} /> : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{t.boosters}</h2>
      </div>

      <style>{`
        @keyframes lacquer-shine {
          0%, 100% { opacity: 0.22; transform: translateX(-6px) translateY(2px) skewX(-12deg); }
          50% { opacity: 0.42; transform: translateX(10px) translateY(-2px) skewX(-12deg); }
        }
        @keyframes inlay-glow {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.85; }
        }
        .lacquer-shine {
          animation: lacquer-shine 4.8s ease-in-out infinite;
        }
        .inlay-glow {
          animation: inlay-glow 2.8s ease-in-out infinite;
        }
      `}</style>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
        {offers.map((offer) => {
          const tier = getTierForOffer(offer)
          const tierConfig = TIER_CONFIG[tier]
          const isHovered = hoveredOfferId === offer.id
          const isActive = isHovered || selectedOfferId === offer.id
          const isOpening = openingOfferId === offer.id
          const catArt = CAT_ART_BY_OFFER[offer.id]

          return (
            <div
              key={offer.id}
              role="button"
              tabIndex={opening ? -1 : 0}
              aria-disabled={opening}
              onMouseEnter={() => setHoveredOfferId(offer.id)}
              onMouseLeave={() => setHoveredOfferId(null)}
              onClick={(e) => {
                e.stopPropagation()
                if (opening) return
                setSelectedOfferId((prev) => (prev === offer.id ? null : offer.id))
              }}
              onKeyDown={(event) => {
                if (opening) return
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setSelectedOfferId((prev) => (prev === offer.id ? null : offer.id))
                }
              }}
              className={cn(
                "relative w-[210px] h-[260px] focus:outline-none group transition-transform duration-300 hover:scale-[1.08] active:scale-[0.98]",
                opening && "pointer-events-none opacity-80",
              )}
              title={offer.title}
            >
              {/* 3D Isometric Box Container */}
              <div className="relative w-full h-full" style={{ perspective: "1000px" }}>
                {/* Isometric projection */}
                <div className="absolute inset-0 transition-all duration-300" style={{
                  transformStyle: "preserve-3d",
                  transform: isActive ? "rotateX(14deg) rotateY(-18deg) rotateZ(6deg)" : "rotateX(18deg) rotateY(-20deg)",
                }}>

                  {/* Front face (main box) */}
                  <div className={cn(
                    "absolute inset-0 rounded-xl border-2 shadow-2xl",
                    `bg-gradient-to-br ${tierConfig.colors.lacquer}`,
                    tierConfig.colors.trim,
                  )}>
                    {/* Lacquer depth + vignette */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-black/35 via-transparent to-black/45" />

                    {/* Specular glossy highlight */}
                    <div className="lacquer-shine pointer-events-none absolute -left-10 -top-8 h-40 w-56 rounded-full bg-white/20 blur-2xl" />

                    {/* Metallic inlay frame */}
                    <div className={cn(
                      "inlay-glow pointer-events-none absolute inset-3 rounded-lg border",
                      tierConfig.colors.inlay,
                    )} />

                    {/* Sakura + cat art (subtle, not copied from reference) */}
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute right-3 top-3 opacity-75">
                        <Image
                          src="/ui/sakura-bloom.svg"
                          alt="Sakura"
                          width={40}
                          height={40}
                          className="h-10 w-10 opacity-70"
                        />
                      </div>
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[46%] opacity-20">
                        <Image
                          src={catArt}
                          alt="Cat"
                          width={120}
                          height={120}
                          className="h-[120px] w-[120px]"
                        />
                      </div>
                      <svg
                        className={cn("absolute inset-0 h-full w-full", tierConfig.colors.inlayText)}
                        viewBox="0 0 200 200"
                        aria-hidden="true"
                      >
                        {INLAY_DOTS.map((d, idx) => (
                          <circle key={idx} cx={d.x} cy={d.y} r={d.r} fill="currentColor" opacity={d.o} />
                        ))}
                      </svg>
                    </div>

                    {/* Content - Title and cost */}
                    <div className="relative h-full flex flex-col items-center justify-center p-4 text-center">
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg leading-tight text-white drop-shadow-lg">{offer.title}</h3>
                        <div className="flex justify-center pt-1">
                          <CoinPawBadge amount={offer.cost} compact />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top edge (lid) */}
                  <div className={cn(
                    "absolute -top-5 left-2 right-2 h-9 rounded-t-xl border-2 border-b-0 shadow-xl",
                    `bg-gradient-to-r ${tierConfig.colors.lid}`,
                    tierConfig.colors.trim,
                    "transition-all duration-300",
                    isActive && "-top-7"
                  )}>
                    <div className="absolute inset-0 rounded-t-xl bg-gradient-to-b from-white/20 via-white/10 to-transparent" />
                    <div className={cn("pointer-events-none absolute inset-2 rounded-lg border", tierConfig.colors.inlay)} />
                  </div>

                  {/* Left edge (3D side) */}
                  <div className={cn(
                    "absolute top-7 -left-4 w-4 h-36 rounded-l-xl",
                    `bg-gradient-to-r ${tierConfig.colors.side}`,
                  )}>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                  </div>

                  {/* Right edge (3D side) */}
                  <div className={cn(
                    "absolute top-7 -right-4 w-4 h-36 rounded-r-xl",
                    `bg-gradient-to-l ${tierConfig.colors.side}`,
                  )}>
                    <div className="absolute inset-0 bg-gradient-to-l from-white/10 to-transparent" />
                  </div>
                </div>

                {/* Hover overlay with info and open button */}
                <div className={cn(
                  "absolute inset-0 rounded-xl bg-black/65 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 transition-opacity duration-300",
                  isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => {
                  setSelectedOfferId(null)
                  setHoveredOfferId(null)
                }}>
                  <div className="space-y-1.5 text-center text-xs">
                    <p className="text-foreground/70">{offer.subtitle}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {RARITY_LABEL.map((rarity) => (
                        <span key={`${offer.id}-${rarity}`} className="text-[10px] text-muted-foreground">
                          {rarityLabels[rarity]}: {Math.round((offer.rarityWeights[rarity] ?? 0) * 100)}%
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      open(offer.id)
                    }}
                    disabled={opening || isOpening}
                  >
                    {isOpening ? (
                      <>
                        <PawLoader size="sm" />
                      </>
                    ) : (
                      t.openBooster
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Result modal */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t.latestDrop}
              {lastOpenedOffer ? ` - ${lastOpenedOffer.title}` : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {unlockedDeckSlot ? (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-center">
                <Image
                  src="/ui/sakura-bloom.svg"
                  alt="Deck slot unlocked"
                  width={240}
                  height={160}
                  className="mx-auto h-auto w-full max-w-[240px]"
                />
                <p className="mt-2 text-sm font-medium text-emerald-100">Поздравляем! Открылся 4-й слот колоды.</p>
              </div>
            ) : cards.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 justify-items-center">
                {cards.map((card, idx) => (
                  <MewCardFace
                    key={`${card.id}-${idx}`}
                    card={card}
                    compact
                    className="max-w-[210px] animate-in fade-in slide-in-from-bottom-2 duration-300"
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border/70 bg-card/60 p-3 text-center">
                <Image
                  src="/ui/sakura-dry.svg"
                  alt="No cards"
                  width={240}
                  height={160}
                  className="mx-auto h-auto w-full max-w-[240px]"
                />
                <p className="mt-2 text-sm text-muted-foreground">В этом бустере карты не выпали.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
