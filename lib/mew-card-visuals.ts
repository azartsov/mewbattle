export type CardVisualTheme = {
  frameBackground: string
  artBackground: string
  bodyBackground: string
  sealBackground: string
  sealClass: string
  sealShapeClass?: string
}

function softenLayer(background: string, overlay: string) {
  return [overlay, background].join(", ")
}

function softenTheme(theme: CardVisualTheme): CardVisualTheme {
  return {
    ...theme,
    frameBackground: softenLayer(
      theme.frameBackground,
      "linear-gradient(160deg, rgba(255, 251, 245, 0.16), rgba(255, 244, 232, 0.08) 46%, rgba(255, 255, 255, 0.04) 100%)",
    ),
    artBackground: softenLayer(
      theme.artBackground,
      "linear-gradient(180deg, rgba(255, 249, 240, 0.12), rgba(255, 255, 255, 0.02) 62%, rgba(255, 244, 232, 0.08) 100%)",
    ),
    bodyBackground: softenLayer(
      theme.bodyBackground,
      "linear-gradient(180deg, rgba(255, 252, 247, 0.26), rgba(255, 247, 239, 0.12) 58%, rgba(255, 255, 255, 0.04) 100%)",
    ),
  }
}

const DEFAULT_THEME: CardVisualTheme = {
  frameBackground: [
    "linear-gradient(155deg, rgba(18, 18, 28, 0.96), rgba(44, 24, 36, 0.92) 52%, rgba(83, 43, 36, 0.9) 100%)",
    "repeating-linear-gradient(118deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 11px)",
  ].join(", "),
  artBackground: [
    "radial-gradient(circle at 82% 22%, rgba(250, 204, 21, 0.2) 0 11%, transparent 12%)",
    "linear-gradient(180deg, rgba(15, 23, 42, 0.25), rgba(15, 23, 42, 0.72))",
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 10px)",
  ].join(", "),
  bodyBackground: [
    "linear-gradient(180deg, rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.42))",
    "repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 12px)",
  ].join(", "),
  sealBackground: [
    "radial-gradient(circle at 50% 50%, rgba(255, 251, 235, 0.18) 0 18%, transparent 19%)",
    "repeating-conic-gradient(from 0deg, rgba(255, 251, 235, 0.18) 0 12deg, transparent 12deg 24deg)",
  ].join(", "),
  sealClass: "border-amber-200/25 bg-amber-200/10",
  sealShapeClass: "rounded-full",
}

const CARD_VISUALS: Record<string, CardVisualTheme> = {
  cat_knight: {
    frameBackground: [
      "linear-gradient(155deg, rgba(14, 21, 40, 0.97), rgba(31, 58, 112, 0.92) 45%, rgba(138, 94, 48, 0.9) 100%)",
      "repeating-linear-gradient(120deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 13px)",
    ].join(", "),
    artBackground: [
      "radial-gradient(circle at 78% 22%, rgba(248, 250, 252, 0.28) 0 12%, transparent 13%)",
      "linear-gradient(180deg, rgba(29, 78, 216, 0.14), rgba(15, 23, 42, 0.76))",
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 10px)",
    ].join(", "),
    bodyBackground: [
      "linear-gradient(180deg, rgba(30, 64, 175, 0.12), rgba(120, 53, 15, 0.22) 100%)",
      "repeating-linear-gradient(140deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 12px)",
    ].join(", "),
    sealBackground: [
      "linear-gradient(0deg, transparent 44%, rgba(224, 242, 254, 0.85) 44% 56%, transparent 56%)",
      "linear-gradient(90deg, transparent 44%, rgba(224, 242, 254, 0.85) 44% 56%, transparent 56%)",
      "radial-gradient(circle at 50% 50%, transparent 0 34%, rgba(251, 191, 36, 0.55) 34% 41%, transparent 41%)",
    ].join(", "),
    sealClass: "border-sky-100/25 bg-amber-200/10",
    sealShapeClass: "rounded-full",
  },
  cat_healer: {
    frameBackground: [
      "linear-gradient(155deg, rgba(41, 18, 34, 0.98), rgba(136, 70, 122, 0.9) 42%, rgba(14, 116, 144, 0.84) 100%)",
      "repeating-linear-gradient(120deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 12px)",
    ].join(", "),
    artBackground: [
      "radial-gradient(circle at 78% 20%, rgba(253, 230, 138, 0.22) 0 11%, transparent 12%)",
      "radial-gradient(circle at 22% 32%, rgba(251, 207, 232, 0.2) 0 14%, transparent 15%)",
      "linear-gradient(180deg, rgba(190, 24, 93, 0.12), rgba(15, 118, 110, 0.72))",
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 10px)",
    ].join(", "),
    bodyBackground: [
      "linear-gradient(180deg, rgba(244, 114, 182, 0.08), rgba(45, 212, 191, 0.18))",
      "repeating-linear-gradient(138deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 10px)",
    ].join(", "),
    sealBackground: [
      "radial-gradient(circle at 50% 50%, rgba(253, 242, 248, 0.78) 0 10%, transparent 11%)",
      "radial-gradient(circle at 28% 34%, rgba(251, 207, 232, 0.46) 0 10%, transparent 11%)",
      "radial-gradient(circle at 72% 34%, rgba(251, 207, 232, 0.46) 0 10%, transparent 11%)",
      "radial-gradient(circle at 50% 76%, rgba(153, 246, 228, 0.5) 0 12%, transparent 13%)",
    ].join(", "),
    sealClass: "border-rose-100/20 bg-teal-100/8",
    sealShapeClass: "rounded-full",
  },
  cat_alchemist: {
    frameBackground: [
      "linear-gradient(155deg, rgba(23, 32, 28, 0.97), rgba(72, 87, 36, 0.9) 44%, rgba(132, 94, 38, 0.9) 100%)",
      "repeating-linear-gradient(122deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 12px)",
    ].join(", "),
    artBackground: [
      "radial-gradient(circle at 78% 20%, rgba(253, 224, 71, 0.22) 0 11%, transparent 12%)",
      "radial-gradient(circle at 34% 74%, rgba(187, 247, 208, 0.16) 0 17%, transparent 18%)",
      "linear-gradient(180deg, rgba(132, 94, 38, 0.12), rgba(22, 101, 52, 0.68))",
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 11px)",
    ].join(", "),
    bodyBackground: [
      "linear-gradient(180deg, rgba(163, 230, 53, 0.08), rgba(120, 53, 15, 0.2))",
      "repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 10px)",
    ].join(", "),
    sealBackground: [
      "radial-gradient(circle at 50% 50%, rgba(254, 249, 195, 0.8) 0 9%, transparent 10%)",
      "radial-gradient(circle at 28% 28%, rgba(217, 249, 157, 0.58) 0 10%, transparent 11%)",
      "radial-gradient(circle at 72% 28%, rgba(217, 249, 157, 0.58) 0 10%, transparent 11%)",
      "radial-gradient(circle at 28% 72%, rgba(217, 249, 157, 0.58) 0 10%, transparent 11%)",
      "radial-gradient(circle at 72% 72%, rgba(217, 249, 157, 0.58) 0 10%, transparent 11%)",
    ].join(", "),
    sealClass: "border-lime-100/25 bg-amber-100/10",
    sealShapeClass: "rounded-[32%] rotate-12",
  },
  cat_phantom: {
    frameBackground: [
      "linear-gradient(150deg, rgba(14, 18, 33, 0.98), rgba(71, 85, 105, 0.88) 45%, rgba(76, 29, 149, 0.86) 100%)",
      "repeating-linear-gradient(122deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 13px)",
    ].join(", "),
    artBackground: [
      "radial-gradient(circle at 80% 24%, rgba(255,255,255,0.22) 0 10%, transparent 11%)",
      "linear-gradient(180deg, rgba(148, 163, 184, 0.16), rgba(15, 23, 42, 0.8))",
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 12px)",
    ].join(", "),
    bodyBackground: [
      "linear-gradient(180deg, rgba(148, 163, 184, 0.08), rgba(91, 33, 182, 0.16))",
      "repeating-linear-gradient(145deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 13px)",
    ].join(", "),
    sealBackground: [
      "radial-gradient(circle at 50% 50%, rgba(226, 232, 240, 0.78) 0 14%, transparent 15%)",
      "radial-gradient(circle at 50% 50%, transparent 0 34%, rgba(226, 232, 240, 0.34) 34% 42%, transparent 42%)",
      "linear-gradient(45deg, transparent 46%, rgba(226, 232, 240, 0.5) 46% 54%, transparent 54%)",
      "linear-gradient(-45deg, transparent 46%, rgba(226, 232, 240, 0.5) 46% 54%, transparent 54%)",
    ].join(", "),
    sealClass: "border-slate-100/20 bg-slate-100/8",
    sealShapeClass: "rounded-full",
  },
  cat_ninja: {
    frameBackground: [
      "linear-gradient(155deg, rgba(9, 15, 29, 0.98), rgba(26, 36, 67, 0.92) 43%, rgba(54, 65, 111, 0.88) 100%)",
      "repeating-linear-gradient(120deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 12px)",
    ].join(", "),
    artBackground: [
      "radial-gradient(circle at 82% 18%, rgba(226, 232, 240, 0.24) 0 10%, transparent 11%)",
      "linear-gradient(180deg, rgba(51, 65, 85, 0.12), rgba(15, 23, 42, 0.82))",
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 9px)",
    ].join(", "),
    bodyBackground: [
      "linear-gradient(180deg, rgba(30, 41, 59, 0.12), rgba(51, 65, 85, 0.22))",
      "repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 11px)",
    ].join(", "),
    sealBackground: [
      "linear-gradient(90deg, transparent 18%, rgba(226, 232, 240, 0.8) 18% 28%, transparent 28% 72%, rgba(226, 232, 240, 0.8) 72% 82%, transparent 82%)",
      "linear-gradient(0deg, transparent 18%, rgba(226, 232, 240, 0.22) 18% 28%, transparent 28% 72%, rgba(226, 232, 240, 0.22) 72% 82%, transparent 82%)",
      "radial-gradient(circle at 50% 50%, rgba(226, 232, 240, 0.78) 0 8%, transparent 9%)",
    ].join(", "),
    sealClass: "border-slate-200/20 bg-slate-100/8",
    sealShapeClass: "rounded-[22%] rotate-45",
  },
  cat_mage: {
    frameBackground: [
      "linear-gradient(155deg, rgba(21, 22, 49, 0.98), rgba(45, 34, 84, 0.92) 45%, rgba(21, 94, 117, 0.86) 100%)",
      "repeating-linear-gradient(122deg, rgba(255,255,255,0.045) 0 2px, transparent 2px 13px)",
    ].join(", "),
    artBackground: [
      "radial-gradient(circle at 79% 21%, rgba(196, 181, 253, 0.24) 0 11%, transparent 12%)",
      "radial-gradient(circle at 24% 32%, rgba(125, 211, 252, 0.15) 0 15%, transparent 16%)",
      "linear-gradient(180deg, rgba(14, 116, 144, 0.12), rgba(49, 46, 129, 0.76))",
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 10px)",
    ].join(", "),
    bodyBackground: [
      "linear-gradient(180deg, rgba(125, 211, 252, 0.08), rgba(109, 40, 217, 0.2))",
      "repeating-linear-gradient(138deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 11px)",
    ].join(", "),
    sealBackground: [
      "radial-gradient(circle at 50% 50%, rgba(196, 181, 253, 0.82) 0 10%, transparent 11%)",
      "radial-gradient(circle at 50% 18%, rgba(125, 211, 252, 0.52) 0 11%, transparent 12%)",
      "radial-gradient(circle at 82% 50%, rgba(125, 211, 252, 0.52) 0 11%, transparent 12%)",
      "radial-gradient(circle at 50% 82%, rgba(125, 211, 252, 0.52) 0 11%, transparent 12%)",
      "radial-gradient(circle at 18% 50%, rgba(125, 211, 252, 0.52) 0 11%, transparent 12%)",
    ].join(", "),
    sealClass: "border-violet-100/25 bg-cyan-100/8",
    sealShapeClass: "rounded-full",
  },
  cat_berserker: {
    frameBackground: [
      "linear-gradient(154deg, rgba(39, 11, 17, 0.98), rgba(127, 29, 29, 0.92) 44%, rgba(146, 64, 14, 0.9) 100%)",
      "repeating-linear-gradient(118deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 12px)",
    ].join(", "),
    artBackground: [
      "radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.22) 0 11%, transparent 12%)",
      "linear-gradient(180deg, rgba(220, 38, 38, 0.14), rgba(69, 10, 10, 0.8))",
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 10px)",
    ].join(", "),
    bodyBackground: [
      "linear-gradient(180deg, rgba(239, 68, 68, 0.08), rgba(180, 83, 9, 0.22))",
      "repeating-linear-gradient(136deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 10px)",
    ].join(", "),
    sealBackground: [
      "conic-gradient(from 0deg, rgba(251, 191, 36, 0.72) 0 22%, transparent 22% 28%, rgba(251, 191, 36, 0.72) 28% 50%, transparent 50% 56%, rgba(251, 191, 36, 0.72) 56% 78%, transparent 78% 84%, rgba(251, 191, 36, 0.72) 84% 100%)",
      "radial-gradient(circle at 50% 50%, rgba(127, 29, 29, 0.75) 0 16%, transparent 17%)",
    ].join(", "),
    sealClass: "border-amber-100/20 bg-rose-100/8",
    sealShapeClass: "rounded-full rotate-12",
  },
  cat_vampire: {
    frameBackground: [
      "linear-gradient(155deg, rgba(18, 8, 22, 0.99), rgba(88, 28, 50, 0.92) 45%, rgba(30, 41, 59, 0.88) 100%)",
      "repeating-linear-gradient(122deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 13px)",
    ].join(", "),
    artBackground: [
      "radial-gradient(circle at 80% 20%, rgba(244, 114, 182, 0.22) 0 11%, transparent 12%)",
      "linear-gradient(180deg, rgba(127, 29, 29, 0.12), rgba(15, 23, 42, 0.82))",
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 11px)",
    ].join(", "),
    bodyBackground: [
      "linear-gradient(180deg, rgba(244, 114, 182, 0.08), rgba(71, 85, 105, 0.18))",
      "repeating-linear-gradient(138deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 12px)",
    ].join(", "),
    sealBackground: [
      "radial-gradient(circle at 50% 50%, rgba(251, 207, 232, 0.76) 0 10%, transparent 11%)",
      "radial-gradient(circle at 33% 36%, rgba(244, 114, 182, 0.5) 0 11%, transparent 12%)",
      "radial-gradient(circle at 67% 36%, rgba(244, 114, 182, 0.5) 0 11%, transparent 12%)",
      "linear-gradient(180deg, transparent 44%, rgba(251, 207, 232, 0.55) 44% 56%, transparent 56%)",
    ].join(", "),
    sealClass: "border-rose-100/20 bg-fuchsia-100/8",
    sealShapeClass: "rounded-full",
  },
  cat_dragon: {
    frameBackground: [
      "linear-gradient(155deg, rgba(54, 33, 9, 0.99), rgba(180, 83, 9, 0.92) 44%, rgba(120, 53, 15, 0.9) 70%, rgba(133, 77, 14, 0.92) 100%)",
      "repeating-linear-gradient(120deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 12px)",
    ].join(", "),
    artBackground: [
      "radial-gradient(circle at 78% 18%, rgba(254, 240, 138, 0.28) 0 11%, transparent 12%)",
      "radial-gradient(circle at 22% 72%, rgba(251, 191, 36, 0.15) 0 20%, transparent 21%)",
      "linear-gradient(180deg, rgba(245, 158, 11, 0.12), rgba(120, 53, 15, 0.78))",
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.09) 0 1px, transparent 1px 9px)",
    ].join(", "),
    bodyBackground: [
      "linear-gradient(180deg, rgba(251, 191, 36, 0.08), rgba(217, 119, 6, 0.22))",
      "repeating-linear-gradient(138deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 10px)",
    ].join(", "),
    sealBackground: [
      "radial-gradient(circle at 50% 50%, rgba(254, 240, 138, 0.8) 0 12%, transparent 13%)",
      "radial-gradient(circle at 50% 50%, transparent 0 30%, rgba(254, 240, 138, 0.42) 30% 38%, transparent 38%)",
      "linear-gradient(25deg, transparent 44%, rgba(254, 240, 138, 0.5) 44% 56%, transparent 56%)",
      "linear-gradient(-25deg, transparent 44%, rgba(254, 240, 138, 0.5) 44% 56%, transparent 56%)",
    ].join(", "),
    sealClass: "border-amber-50/25 bg-yellow-100/10",
    sealShapeClass: "rounded-full",
  },
  boss_raven: {
    frameBackground: [
      "linear-gradient(155deg, rgba(16, 16, 35, 0.99), rgba(55, 48, 163, 0.9) 46%, rgba(30, 58, 138, 0.88) 100%)",
      "repeating-linear-gradient(120deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 13px)",
    ].join(", "),
    artBackground: [
      "radial-gradient(circle at 79% 19%, rgba(224, 231, 255, 0.24) 0 10%, transparent 11%)",
      "linear-gradient(180deg, rgba(99, 102, 241, 0.14), rgba(15, 23, 42, 0.82))",
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 10px)",
    ].join(", "),
    bodyBackground: [
      "linear-gradient(180deg, rgba(129, 140, 248, 0.08), rgba(30, 64, 175, 0.18))",
      "repeating-linear-gradient(138deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 11px)",
    ].join(", "),
    sealBackground: [
      "linear-gradient(45deg, transparent 40%, rgba(224, 231, 255, 0.72) 40% 60%, transparent 60%)",
      "linear-gradient(-45deg, transparent 40%, rgba(224, 231, 255, 0.72) 40% 60%, transparent 60%)",
      "radial-gradient(circle at 50% 50%, rgba(224, 231, 255, 0.82) 0 10%, transparent 11%)",
    ].join(", "),
    sealClass: "border-indigo-100/25 bg-violet-100/8",
    sealShapeClass: "rounded-full",
  },
  boss_dog: {
    frameBackground: [
      "linear-gradient(155deg, rgba(34, 17, 8, 0.99), rgba(146, 64, 14, 0.92) 44%, rgba(120, 53, 15, 0.9) 100%)",
      "repeating-linear-gradient(122deg, rgba(255,255,255,0.045) 0 2px, transparent 2px 12px)",
    ].join(", "),
    artBackground: [
      "radial-gradient(circle at 79% 20%, rgba(253, 230, 138, 0.22) 0 10%, transparent 11%)",
      "linear-gradient(180deg, rgba(180, 83, 9, 0.14), rgba(69, 26, 3, 0.8))",
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 10px)",
    ].join(", "),
    bodyBackground: [
      "linear-gradient(180deg, rgba(251, 191, 36, 0.08), rgba(154, 52, 18, 0.2))",
      "repeating-linear-gradient(138deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 11px)",
    ].join(", "),
    sealBackground: [
      "radial-gradient(circle at 50% 50%, rgba(253, 230, 138, 0.8) 0 12%, transparent 13%)",
      "radial-gradient(circle at 50% 22%, rgba(251, 191, 36, 0.48) 0 12%, transparent 13%)",
      "radial-gradient(circle at 50% 78%, rgba(251, 191, 36, 0.48) 0 12%, transparent 13%)",
      "linear-gradient(90deg, transparent 44%, rgba(253, 230, 138, 0.52) 44% 56%, transparent 56%)",
    ].join(", "),
    sealClass: "border-amber-100/25 bg-orange-100/8",
    sealShapeClass: "rounded-[24%]",
  },
  boss_rat: {
    frameBackground: [
      "linear-gradient(155deg, rgba(15, 25, 19, 0.99), rgba(22, 101, 52, 0.9) 44%, rgba(63, 98, 18, 0.88) 100%)",
      "repeating-linear-gradient(122deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 13px)",
    ].join(", "),
    artBackground: [
      "radial-gradient(circle at 79% 18%, rgba(217, 249, 157, 0.2) 0 10%, transparent 11%)",
      "linear-gradient(180deg, rgba(132, 204, 22, 0.12), rgba(20, 83, 45, 0.8))",
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 10px)",
    ].join(", "),
    bodyBackground: [
      "linear-gradient(180deg, rgba(190, 242, 100, 0.08), rgba(22, 101, 52, 0.2))",
      "repeating-linear-gradient(138deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 11px)",
    ].join(", "),
    sealBackground: [
      "radial-gradient(circle at 50% 50%, rgba(217, 249, 157, 0.76) 0 9%, transparent 10%)",
      "radial-gradient(circle at 33% 33%, rgba(190, 242, 100, 0.46) 0 10%, transparent 11%)",
      "radial-gradient(circle at 67% 33%, rgba(190, 242, 100, 0.46) 0 10%, transparent 11%)",
      "radial-gradient(circle at 33% 67%, rgba(190, 242, 100, 0.46) 0 10%, transparent 11%)",
      "radial-gradient(circle at 67% 67%, rgba(190, 242, 100, 0.46) 0 10%, transparent 11%)",
    ].join(", "),
    sealClass: "border-lime-100/25 bg-emerald-100/8",
    sealShapeClass: "rounded-full",
  },
}

export function getCardVisualTheme(cardId: string): CardVisualTheme {
  return softenTheme(CARD_VISUALS[cardId] ?? DEFAULT_THEME)
}