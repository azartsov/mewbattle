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
  currentCoins: number
  onOpen: (offerId: BoosterOffer["id"]) => Promise<BoosterOpenResult>
  onInsufficientCoins: (offer: BoosterOffer) => void
}

const RARITY_LABEL: Array<"common" | "rare" | "epic" | "legendary"> = ["common", "rare", "epic", "legendary"]

const OFFER_THEMES: Record<BoosterOffer["id"], {
  art: string
  sky: string
  meadow: string
  frame: string
  panel: string
  badge: string
  text: string
  cloud: string
}> = {
  starter: {
    art: "/cards/cat_knight.svg",
    sky: "from-amber-100 via-orange-50 to-rose-100",
    meadow: "from-emerald-300/90 via-lime-200/85 to-yellow-100/95",
    frame: "border-orange-200/85 shadow-[0_18px_40px_rgba(124,45,18,0.16)]",
    panel: "bg-orange-50/78",
    badge: "bg-orange-500/90 text-orange-50",
    text: "text-orange-950",
    cloud: "bg-white/80",
  },
  hunter: {
    art: "/cards/cat_ninja.svg",
    sky: "from-sky-100 via-cyan-50 to-teal-100",
    meadow: "from-emerald-300/90 via-teal-200/85 to-cyan-100/95",
    frame: "border-sky-200/85 shadow-[0_18px_40px_rgba(14,116,144,0.16)]",
    panel: "bg-sky-50/78",
    badge: "bg-sky-600/90 text-sky-50",
    text: "text-sky-950",
    cloud: "bg-white/78",
  },
  royal: {
    art: "/cards/cat_dragon.svg",
    sky: "from-yellow-100 via-amber-50 to-pink-100",
    meadow: "from-orange-300/90 via-amber-200/85 to-yellow-100/95",
    frame: "border-amber-200/85 shadow-[0_18px_40px_rgba(146,64,14,0.16)]",
    panel: "bg-amber-50/80",
    badge: "bg-amber-500/90 text-amber-50",
    text: "text-amber-950",
    cloud: "bg-white/76",
  },
}

export function BoosterShop({ offers, currentCoins, onOpen, onInsufficientCoins }: BoosterShopProps) {
  const { t } = useMewI18n()
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

  const open = async (offer: BoosterOffer) => {
    if (currentCoins < offer.cost) {
      onInsufficientCoins(offer)
      return
    }

    setOpening(true)
    setOpeningOfferId(offer.id)
    try {
      const result = await onOpen(offer.id)
      setCards(result.cards)
      setUnlockedDeckSlot(result.unlockedDeckSlot)
      setLastOpenedOfferId(offer.id)
      setShowResultModal(true)
    } finally {
      setOpening(false)
      setOpeningOfferId(null)
    }
  }

  return (
    <div className="space-y-4">
      {opening ? <PawLoader overlay size="lg" label={t.openingBooster} /> : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{t.boosters}</h2>
        <CoinPawBadge amount={currentCoins} compact />
      </div>

      <style>{`
        @keyframes booster-card-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes booster-cloud-drift {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(7px); }
        }
        .booster-card-float {
          animation: booster-card-float 5.4s ease-in-out infinite;
        }
        .booster-cloud-drift {
          animation: booster-cloud-drift 8.2s ease-in-out infinite;
        }
      `}</style>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
        {offers.map((offer) => {
          const theme = OFFER_THEMES[offer.id]
          const canAfford = currentCoins >= offer.cost
          const missingCoins = Math.max(0, offer.cost - currentCoins)
          const isOpening = openingOfferId === offer.id

          return (
            <div
              key={offer.id}
              className={cn(
                "booster-card-float relative w-[216px] overflow-hidden rounded-[28px] border bg-white/80 p-2.5 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1",
                theme.frame,
                theme.text,
                opening && "pointer-events-none opacity-80",
              )}
              title={offer.title}
            >
              <div className={cn("relative min-h-[268px] overflow-hidden rounded-[22px] border border-white/60 bg-gradient-to-b", theme.sky)}>
                <div className="absolute inset-x-0 top-0 h-[54%] overflow-hidden rounded-t-[22px]">
                  <div className="absolute left-4 top-4 h-10 w-10 rounded-full bg-white/55 blur-sm" />
                  <div className={cn("booster-cloud-drift absolute left-5 top-7 h-5 w-14 rounded-full blur-[1px]", theme.cloud)} />
                  <div className={cn("booster-cloud-drift absolute right-5 top-10 h-4 w-12 rounded-full blur-[1px]", theme.cloud)} style={{ animationDelay: "-2.3s" }} />
                  <div className={cn("absolute inset-x-0 bottom-0 h-20 rounded-t-[60%] bg-gradient-to-t", theme.meadow)} />
                  <div className="absolute left-5 bottom-5 h-3.5 w-16 rounded-full bg-emerald-500/20 blur-md" />
                  <div className="absolute right-7 bottom-7 h-3.5 w-14 rounded-full bg-emerald-500/15 blur-md" />
                  <div className="absolute left-1/2 top-[50%] z-10 h-[118px] w-[118px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/35 blur-2xl" />
                  <Image
                    src={theme.art}
                    alt={offer.title}
                    width={118}
                    height={118}
                    className="absolute left-1/2 top-[50%] z-20 h-[118px] w-[118px] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_10px_16px_rgba(15,23,42,0.18)]"
                  />
                </div>

                <div className="relative z-30 flex min-h-[268px] flex-col justify-between p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]", theme.badge)}>
                      {offer.title}
                    </span>
                    <CoinPawBadge
                      amount={offer.cost}
                      compact
                      className="shrink-0 border-slate-900/70 bg-slate-950/88 text-amber-200 shadow-[0_8px_20px_rgba(15,23,42,0.32)] [&>span:first-child]:bg-amber-400/18 [&>span:first-child]:text-amber-200"
                    />
                  </div>

                  <div className={cn("rounded-[20px] border border-white/65 p-3 shadow-sm backdrop-blur-sm", theme.panel)}>
                    <p className="text-sm font-semibold leading-snug">{offer.subtitle}</p>
                    <div className="mt-2.5 grid grid-cols-2 gap-1 text-[10px] font-medium">
                      {RARITY_LABEL.map((rarity) => (
                        <span key={`${offer.id}-${rarity}`} className="rounded-full bg-white/65 px-1.5 py-1 text-center leading-none">
                          {rarityLabels[rarity]} {Math.round((offer.rarityWeights[rarity] ?? 0) * 100)}%
                        </span>
                      ))}
                    </div>

                    {!canAfford ? (
                      <p className="mt-2.5 text-[11px] font-medium leading-snug text-rose-700">
                        {t.boosterNotEnoughCoins} {t.boosterNeedMoreCoins} {missingCoins} {t.coins.toLowerCase()}.
                      </p>
                    ) : (
                      <p className="mt-2.5 text-[11px] leading-snug text-foreground/70">
                        {t.boosterCostWarning} {offer.cost} {t.coins.toLowerCase()}.
                      </p>
                    )}

                    <Button
                      size="sm"
                      variant={canAfford ? "default" : "secondary"}
                      className="mt-3 w-full rounded-full"
                      onClick={() => {
                        void open(offer)
                      }}
                      disabled={opening || isOpening}
                    >
                      {isOpening ? <PawLoader size="sm" /> : t.openBooster}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

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
              <div className="grid grid-cols-2 gap-3 justify-items-center lg:grid-cols-3">
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