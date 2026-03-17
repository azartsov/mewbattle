"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

export type MewLanguage = "en" | "ru"

type MewTranslations = {
  appTitle: string
  appSubtitle: string
  collection: string
  myDeck: string
  boosters: string
  battle: string
  help: string
  splashTitle: string
  splashSubtitle: string
  splashHint: string
  splashEnter: string
  splashMusicOn: string
  splashMusicOff: string
  splashMusicVolume: string
  splashMuted: string
  backToSplash: string
  signIn: string
  signUp: string
  createAccount: string
  alreadyHaveAccount: string
  continueAsGuest: string
  pleaseWait: string
  email: string
  password: string
  coins: string
  wins: string
  losses: string
  streak: string
  earned: string
  spent: string
  loadingData: string
  deckSaved: string
  battleSavedWin: string
  battleSavedLoss: string
  guestPreview: string
  openBooster: string
  openingBooster: string
  boosterCostWarning: string
  latestDrop: string
  statsHistory: string
  battleStatsHistory: string
  avgTurns: string
  noBattleHistory: string
  battleBoss: string
  battleTurns: string
  battleReward: string
  boosterStarterTitle: string
  boosterStarterSubtitle: string
  boosterHunterTitle: string
  boosterHunterSubtitle: string
  boosterRoyalTitle: string
  boosterRoyalSubtitle: string
  rarityCommon: string
  rarityRare: string
  rarityEpic: string
  rarityLegendary: string
  sellDuplicate: string
  selling: string
  cannotSell: string
  collectionTitle: string
  owned: string
  noCardsYet: string
  deckCollectionHint: string
  selectedCard: string
  tapSlotToPlace: string
  deckName: string
  saveDeck: string
  savingDeck: string
  deckUnsavedPrompt: string
  deckUnsavedTitle: string
  deckUnsavedDesc: string
  deckUnsavedSave: string
  deckUnsavedDiscard: string
  deckUnsavedStay: string
  remove: string
  emptyDeckSlot: string
  createNewDeck: string
  deckOne: string
  deckTwo: string
  deckThree: string
  currentDeck: string
  chooseDeck: string
  battleArena: string
  yourTurn: string
  bossTurn: string
  catsTurnCta: string
  bossTurnCta: string
  dragOrTapPlayer: string
  dragOrTapBoss: string
  autoTargetBoss: string
  victory: string
  defeat: string
  newBattle: string
  battleLog: string
  startFight: string
  chooseBattleDeck: string
  selectedBattleDeck: string
  startBattle: string
  noDeckForBattle: string
  helpTitle: string
  helpIntro: string
  helpStep1: string
  helpStep2: string
  helpStep3: string
  helpStep4: string
  helpEconomy: string
  helpBattle: string
  helpCardLegendTitle: string
  helpCardLegendIntro: string
  helpCardLegendAbilities: string
  helpRarityOrder: string
  helpStatAtk: string
  helpStatHp: string
  helpStatOwned: string
  helpStatRarity: string
  details: string
  characterLore: string
  paramList: string
  paramAttackDesc: string
  paramHealthDesc: string
  paramRarityDesc: string
  paramAbilityDesc: string
  paramAffinityDesc: string
  noAffinity: string
  bossType: string
  bossRaven: string
  bossDog: string
  bossRat: string
  resetToInitial: string
  resetConfirmTitle: string
  resetConfirmDesc: string
  bankruptcyWarning: string
  bankruptcyReset: string
  battleHistoryCleared: string
  nickname: string
  leaderboard: string
  leaderboardTitle: string
  leaderboardEmpty: string
  lbColNickname: string
  lbColScore: string
  lbColCards: string
  lbColDate: string
  rewardInverseTip: string
  battleHpBonus: string
  battleBase: string
  battleHpBonusDetail: string
  paramSellPriceDesc: string
  helpEconomyTitle: string
  helpBattleTitle: string
  helpRewardRules: string
  deckPotentialReward: string
  bossTurnCountdown: string
  logout: string
  catCodexAttribution: string
  versionHistoryTitle: string
  whatsNew: string
  battleLockedHint: string
  battleEnterHint: string
  enterBattle: string
  enteringBattle: string
}

const translations: Record<MewLanguage, MewTranslations> = {
  en: {
    appTitle: "MewBattle",
    appSubtitle: "Card RPG Arena",
    collection: "Collection",
    myDeck: "My Deck",
    boosters: "Boosters",
    battle: "Battle",
    help: "Help",
    splashTitle: "Dawn Over Edo Arena",
    splashSubtitle: "Cats gather before the duel under ukiyo-e skies.",
    splashHint: "Tap to open entry",
    splashEnter: "Enter",
    splashMusicOn: "Music On",
    splashMusicOff: "Music Off",
    splashMusicVolume: "Music volume",
    splashMuted: "Muted",
    backToSplash: "Back to splash",
    signIn: "Sign In",
    signUp: "Sign Up",
    createAccount: "Create account",
    alreadyHaveAccount: "I already have account",
    continueAsGuest: "Continue as Guest",
    pleaseWait: "Please wait...",
    email: "Email",
    password: "Password",
    coins: "Coins",
    wins: "Wins",
    losses: "Losses",
    streak: "Streak",
    earned: "Earned",
    spent: "Spent",
    loadingData: "Loading Firestore data...",
    deckSaved: "Deck saved",
    battleSavedWin: "Battle saved. Victory",
    battleSavedLoss: "Battle saved. Defeat",
    guestPreview: "Guest mode is available for UI preview only. Sign in to save decks, boosters and battles in Firestore.",
    openBooster: "Open Booster",
    openingBooster: "Opening...",
    boosterCostWarning: "This booster costs",
    latestDrop: "Latest drop",
    statsHistory: "Stats History",
    battleStatsHistory: "Battle Stats History",
    avgTurns: "Avg turns",
    noBattleHistory: "No battle history yet.",
    battleBoss: "Boss",
    battleTurns: "Turns",
    battleReward: "Reward",
    boosterStarterTitle: "Starter Paw",
    boosterStarterSubtitle: "Budget booster with mostly common cards",
    boosterHunterTitle: "Hunter Pack",
    boosterHunterSubtitle: "Balanced chance for rare and epic cats",
    boosterRoyalTitle: "Royal Crown",
    boosterRoyalSubtitle: "Premium booster with better high-rarity odds",
    rarityCommon: "Common",
    rarityRare: "Rare",
    rarityEpic: "Epic",
    rarityLegendary: "Legendary",
    sellDuplicate: "Sell duplicate",
    selling: "Selling...",
    cannotSell: "Keep at least one copy of each card.",
    collectionTitle: "My Cats",
    owned: "Owned",
    noCardsYet: "Open boosters to get cards.",
    deckCollectionHint: "Collection: drag cards or tap to select",
    selectedCard: "Selected card",
    tapSlotToPlace: "Tap a slot to place it.",
    deckName: "Deck name",
    saveDeck: "Save Deck",
    savingDeck: "Saving...",
    deckUnsavedPrompt: "You have unsaved deck changes. Press OK to save them, or Cancel to continue without saving.",
    deckUnsavedTitle: "Unsaved Deck Changes",
    deckUnsavedDesc: "You have unsaved deck changes. Save them before leaving this section?",
    deckUnsavedSave: "Save",
    deckUnsavedDiscard: "Don't Save",
    deckUnsavedStay: "Stay",
    remove: "Remove",
    emptyDeckSlot: "Drop or tap a cat card here",
    createNewDeck: "New Deck",
    deckOne: "Deck 1",
    deckTwo: "Deck 2",
    deckThree: "Deck 3",
    currentDeck: "Current deck",
    chooseDeck: "Choose deck",
    battleArena: "Battle Arena",
    yourTurn: "Your turn",
    bossTurn: "Boss turn",
    catsTurnCta: "Cats Turn",
    bossTurnCta: "Boss Turn",
    dragOrTapPlayer: "Drag a cat onto the boss, or tap cat then tap boss.",
    dragOrTapBoss: "Drag the boss onto a cat, or tap the cat target.",
    autoTargetBoss: "Auto target for boss",
    victory: "Victory!",
    defeat: "Defeat",
    newBattle: "New Battle",
    battleLog: "Battle Log",
    startFight: "Start the fight.",
    chooseBattleDeck: "Choose deck for battle",
    selectedBattleDeck: "Battle deck",
    startBattle: "Start Battle",
    noDeckForBattle: "Pick or build a deck with at least one owned card.",
    helpTitle: "How MewBattle works",
    helpIntro: "MewBattle is a lightweight collectible card RPG focused on cats, boosters and boss fights.",
    helpStep1: "1. Open boosters to get cat cards.",
    helpStep2: "2. Build and save several decks in My Deck.",
    helpStep3: "3. Choose a deck before entering battle.",
    helpStep4: "4. Beat the boss to earn coins and keep your streak growing.",
    helpEconomy: "Economy: boosters cost coins, duplicate cards can be sold, victories pay more than defeats.",
    helpBattle: "Battle: on desktop drag cards, on mobile tap attacker then target.",
    helpCardLegendTitle: "Card Legend",
    helpCardLegendIntro: "Each card has combat stats and rarity tags that affect gameplay and economy.",
    helpCardLegendAbilities: "Also, every card has an Ability — a special trait that can trigger during battle.",
    helpRarityOrder: "Rarity order: COMMON -> RARE -> EPIC -> LEGENDARY.",
    helpStatAtk: "ATK: attack power. Higher ATK means more damage per hit.",
    helpStatHp: "HP: health points. When HP reaches 0, the fighter is defeated.",
    helpStatOwned: "x1, x2, ...: how many copies of this card you own.",
    helpStatRarity: "Rarity (COMMON / RARE / EPIC / LEGENDARY): affects drop chance and sell value.",
    details: "Details",
    characterLore: "Legend",
    paramList: "Parameters",
    paramAttackDesc: "ATK: base damage dealt per successful attack.",
    paramHealthDesc: "HP: maximum health before defeat.",
    paramRarityDesc: "Rarity: influences drop chances and economy value.",
    paramAbilityDesc: "Ability: core passive trait used during combat rolls.",
    paramAffinityDesc: "Mastery: bonus damage against specific boss types.",
    noAffinity: "No special mastery yet.",
    bossType: "Boss type",
    bossRaven: "Raven",
    bossDog: "Dog",
    bossRat: "Rat",
    resetToInitial: "Reset Progress",
    resetConfirmTitle: "Reset to Initial State?",
    resetConfirmDesc: "Your cards, decks and stats will be erased. You will start fresh with 3 cards and 500 coins.",
    bankruptcyWarning: "Not enough coins to start a battle and nothing left to sell. Reset your progress to begin again.",
    bankruptcyReset: "Start Over",
    battleHistoryCleared: "Battle history cleared.",
    nickname: "Nickname",
    leaderboard: "Leaderboard",
    leaderboardTitle: "Top Players",
    leaderboardEmpty: "No players on the leaderboard yet.",
    lbColNickname: "Player",
    lbColScore: "Coins",
    lbColCards: "Cards",
    lbColDate: "Date",
    rewardInverseTip: "Weaker deck -> higher reward (inversely proportional to deck strength)",
    battleHpBonus: "HP Bonus",
    battleBase: "Base",
    battleHpBonusDetail: "Remaining HP in your surviving cats is added to battle reward",
    paramSellPriceDesc: "Sell price for one duplicate (keep at least one copy)",
    helpEconomyTitle: "Economy",
    helpBattleTitle: "Battle Controls",
    helpRewardRules: "Reward formula: base reward (50–200, weaker deck → higher) + total remaining HP of surviving cats after battle.",
    deckPotentialReward: "Estimated battle reward",
    bossTurnCountdown: "Boss is choosing target...",
    logout: "Logout",
    catCodexAttribution: "quote from the Cat Codex-Do",
    versionHistoryTitle: "Version History",
    whatsNew: "What's New",
    battleLockedHint: "Battle is in progress: you can leave only after it ends.",
    battleEnterHint: "Press \"Enter battle\" to get a random boss.",
    enterBattle: "Enter battle",
    enteringBattle: "Entering battle",
  },
  ru: {
    appTitle: "MewBattle",
    appSubtitle: "Карточная RPG-арена",
    collection: "Коллекция",
    myDeck: "Моя колода",
    boosters: "Бустеры",
    battle: "Бой",
    help: "Помощь",
    splashTitle: "Рассвет над ареной Эдо",
    splashSubtitle: "Коты собираются перед дуэлью под небом в стиле укиё-э.",
    splashHint: "Нажмите, чтобы открыть вход",
    splashEnter: "Войти",
    splashMusicOn: "Музыка вкл",
    splashMusicOff: "Музыка выкл",
    splashMusicVolume: "Громкость",
    splashMuted: "Без звука",
    backToSplash: "Вернуться к заставке",
    signIn: "Войти",
    signUp: "Регистрация",
    createAccount: "Создать аккаунт",
    alreadyHaveAccount: "У меня уже есть аккаунт",
    continueAsGuest: "Продолжить как гость",
    pleaseWait: "Подождите...",
    email: "Email",
    password: "Пароль",
    coins: "Монеты",
    wins: "Победы",
    losses: "Поражения",
    streak: "Серия",
    earned: "Заработано",
    spent: "Потрачено",
    loadingData: "Загрузка данных Firestore...",
    deckSaved: "Колода сохранена",
    battleSavedWin: "Бой сохранен. Победа",
    battleSavedLoss: "Бой сохранен. Поражение",
    guestPreview: "Гостевой режим доступен только для просмотра интерфейса. Чтобы сохранять колоды, бустеры и бои, войдите в аккаунт.",
    openBooster: "Открыть бустер",
    openingBooster: "Открываем...",
    boosterCostWarning: "Этот бустер стоит",
    latestDrop: "Последний набор",
    statsHistory: "История статистики",
    battleStatsHistory: "История боевой статистики",
    avgTurns: "Средние ходы",
    noBattleHistory: "История боев пока пуста.",
    battleBoss: "Босс",
    battleTurns: "Ходы",
    battleReward: "Награда",
    boosterStarterTitle: "Стартовая лапка",
    boosterStarterSubtitle: "Бюджетный бустер с упором на обычные карты",
    boosterHunterTitle: "Охотничий набор",
    boosterHunterSubtitle: "Сбалансированный шанс на редких и эпических котов",
    boosterRoyalTitle: "Королевская корона",
    boosterRoyalSubtitle: "Премиум-бустер с повышенным шансом высоких редкостей",
    rarityCommon: "Обычная",
    rarityRare: "Редкая",
    rarityEpic: "Эпическая",
    rarityLegendary: "Легендарная",
    sellDuplicate: "Продать дубликат",
    selling: "Продажа...",
    cannotSell: "Нужно оставить минимум одну копию карты.",
    collectionTitle: "Мои коты",
    owned: "Есть",
    noCardsYet: "Откройте бустеры, чтобы получить карты.",
    deckCollectionHint: "Коллекция: перетаскивайте карты или выбирайте тапом",
    selectedCard: "Выбрана карта",
    tapSlotToPlace: "Нажмите на слот, чтобы поместить ее.",
    deckName: "Название колоды",
    saveDeck: "Сохранить колоду",
    savingDeck: "Сохраняем...",
    deckUnsavedPrompt: "Есть несохраненные изменения колоды. Нажмите OK, чтобы сохранить, или Cancel, чтобы продолжить без сохранения.",
    deckUnsavedTitle: "Несохраненные изменения",
    deckUnsavedDesc: "В колоде есть несохраненные изменения. Сохранить их перед выходом из раздела?",
    deckUnsavedSave: "Сохранить",
    deckUnsavedDiscard: "Не сохранять",
    deckUnsavedStay: "Остаться",
    remove: "Убрать",
    emptyDeckSlot: "Перетащите карту кота сюда или выберите тапом",
    createNewDeck: "Новая колода",
    deckOne: "Колода 1",
    deckTwo: "Колода 2",
    deckThree: "Колода 3",
    currentDeck: "Текущая колода",
    chooseDeck: "Выбор колоды",
    battleArena: "Боевая арена",
    yourTurn: "Ваш ход",
    bossTurn: "Ход босса",
    catsTurnCta: "Ход Котов",
    bossTurnCta: "Ход Босса",
    dragOrTapPlayer: "Перетащите кота на босса или нажмите на кота, затем на босса.",
    dragOrTapBoss: "Перетащите босса на кота или просто нажмите на цель.",
    autoTargetBoss: "Автовыбор цели для босса",
    victory: "Победа!",
    defeat: "Поражение",
    newBattle: "Новый бой",
    battleLog: "Лог боя",
    startFight: "Начните бой.",
    chooseBattleDeck: "Выберите колоду для боя",
    selectedBattleDeck: "Боевая колода",
    startBattle: "Начать бой",
    noDeckForBattle: "Выберите или соберите колоду хотя бы с одной доступной картой.",
    helpTitle: "Как устроен MewBattle",
    helpIntro: "MewBattle — это компактная коллекционная карточная RPG про котов, бустеры и бои с боссами.",
    helpStep1: "1. Открывайте бустеры и собирайте карты котов.",
    helpStep2: "2. Создавайте и сохраняйте несколько колод в разделе Моя колода.",
    helpStep3: "3. Перед боем выберите колоду, которой хотите играть.",
    helpStep4: "4. Побеждайте босса, получайте монеты и наращивайте серию побед.",
    helpEconomy: "Экономика: бустеры покупаются за монеты, дубликаты можно продавать, победы приносят больше награды, чем поражения.",
    helpBattle: "Бой: на десктопе работает drag-and-drop, на мобильных устройствах — выбор через нажатия.",
    helpCardLegendTitle: "Расшифровка карточки",
    helpCardLegendIntro: "У каждой карты есть боевые параметры и редкость, которые влияют на бой и экономику.",
    helpCardLegendAbilities: "Кроме параметров и редкости, у каждой карты есть умение — особенность, которая может сработать в бою.",
    helpRarityOrder: "Порядок редкости: COMMON -> RARE -> EPIC -> LEGENDARY.",
    helpStatAtk: "ATK: сила атаки. Чем выше значение, тем больше урон за удар.",
    helpStatHp: "HP: очки здоровья. При 0 HP боец выбывает.",
    helpStatOwned: "x1, x2, ...: количество копий карты в вашей коллекции.",
    helpStatRarity: "Редкость (COMMON / RARE / EPIC / LEGENDARY): влияет на шанс выпадения и цену продажи.",
    details: "Подробнее",
    characterLore: "Легенда",
    paramList: "Параметры",
    paramAttackDesc: "ATK: базовый урон за успешную атаку.",
    paramHealthDesc: "HP: максимальный запас здоровья до поражения.",
    paramRarityDesc: "Редкость: влияет на шансы выпадения и ценность в экономике.",
    paramAbilityDesc: "Умение: ключевая пассивная особенность в бою.",
    paramAffinityDesc: "Специализация: бонусный урон по конкретным типам боссов.",
    noAffinity: "Пока нет особой специализации.",
    bossType: "Тип босса",
    bossRaven: "Ворон",
    bossDog: "Пес",
    bossRat: "Крыса",
    resetToInitial: "Сбросить прогресс",
    resetConfirmTitle: "Сбросить до начального состояния?",
    resetConfirmDesc: "Карты, колоды и статистика будут удалены. Вы начнете заново с 3 картами и 500 монетами.",
    bankruptcyWarning: "Недостаточно монет для боя и нечего продавать. Сбросьте прогресс, чтобы начать заново.",
    bankruptcyReset: "Начать заново",
    battleHistoryCleared: "История боев очищена.",
    nickname: "Ник",
    leaderboard: "Топ игроков",
    leaderboardTitle: "Топ игроков",
    leaderboardEmpty: "В таблице пока нет игроков.",
    lbColNickname: "Игрок",
    lbColScore: "Монеты",
    lbColCards: "Карты",
    lbColDate: "Дата",
    rewardInverseTip: "Слабее колода -> выше награда (обратно пропорционально силе)",
    battleHpBonus: "Бонус ОЗ",
    battleBase: "База",
    battleHpBonusDetail: "Суммарное оставшееся здоровье живых котов добавляется к награде за бой",
    paramSellPriceDesc: "Цена продажи одного дубликата (минимум одна копия остаётся)",
    helpEconomyTitle: "Экономика",
    helpBattleTitle: "Управление боем",
    helpRewardRules: "Формула награды: базовая (50–200, слабее колода → больше) + суммарное оставшееся ОЗ выживших котов после боя.",
    deckPotentialReward: "Ожидаемая награда за бой",
    bossTurnCountdown: "Босс выбирает цель...",
    logout: "Выйти",
    catCodexAttribution: "цитата из Кодекса Кота-До",
    versionHistoryTitle: "История версий",
    whatsNew: "Что нового",
    battleLockedHint: "Бой запущен: выйти можно только после завершения.",
    battleEnterHint: "Нажмите «Вступаем в бой», чтобы получить случайного босса.",
    enterBattle: "Вступаем в бой",
    enteringBattle: "Вступаем в бой",
  },
}

interface MewI18nValue {
  language: MewLanguage
  setLanguage: (language: MewLanguage) => void
  t: MewTranslations
}

const STORAGE_KEY = "mewbattleUiLang"
const MewI18nContext = createContext<MewI18nValue | null>(null)

export function MewI18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<MewLanguage>("en")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as MewLanguage | null
    if (stored === "en" || stored === "ru") {
      setLanguage(stored)
      return
    }
    const browserLanguage = navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en"
    setLanguage(browserLanguage)
  }, [])

  const value = useMemo<MewI18nValue>(() => ({
    language,
    setLanguage: (nextLanguage) => {
      setLanguage(nextLanguage)
      localStorage.setItem(STORAGE_KEY, nextLanguage)
    },
    t: translations[language],
  }), [language])

  return <MewI18nContext.Provider value={value}>{children}</MewI18nContext.Provider>
}

export function useMewI18n() {
  const value = useContext(MewI18nContext)
  if (!value) throw new Error("useMewI18n must be used within MewI18nProvider")
  return value
}
