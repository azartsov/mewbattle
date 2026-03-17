export interface VersionHistoryEntry {
  version: string
  date: string
  summary: {
    ru: string
    en: string
  }
}

export const VERSION_HISTORY: VersionHistoryEntry[] = [
  {
    version: "0.178",
    date: "2026-03-17",
    summary: {
      ru: "На заставке добавлена кнопка «Что нового», открывающая окно истории версий до входа в игру.",
      en: "Added a 'What's New' button on the splash screen that opens the version history before entering the game.",
    },
  },
  {
    version: "0.177",
    date: "2026-03-17",
    summary: {
      ru: "Добавлено окно истории версий по нажатию на номер версии в меню: отображаются дата и краткое описание изменений от новых версий к старым.",
      en: "Added a version history dialog opened from the version label in the menu, showing dates and short change summaries from newest to oldest.",
    },
  },
  {
    version: "0.176",
    date: "2026-03-17",
    summary: {
      ru: "Добавлен Кот-Лекарь, лечение союзника во время удара, сакурная анимация исцеления, порядок редкости в помощи и снижение уклонения Ворона до 20%.",
      en: "Added Cat Healer, ally healing on hit, sakura healing animation, rarity order in Help, and reduced Raven dodge chance to 20%.",
    },
  },
  {
    version: "0.175",
    date: "2026-03-17",
    summary: {
      ru: "Карточки получили персонализированные фоны в стиле укиё-э, чтобы персонажи лучше различались по внешнему виду.",
      en: "Cards received personalized ukiyo-e themed backgrounds to make each character more recognizable at a glance.",
    },
  },
  {
    version: "0.174",
    date: "2026-03-17",
    summary: {
      ru: "Снижена частота выпадения пустых бустеров.",
      en: "Reduced the frequency of empty booster drops.",
    },
  },
  {
    version: "0.173",
    date: "2026-03-17",
    summary: {
      ru: "Добавлены цитаты Кодекса Кота-До на заставку и в бой, расширены переводы для боевого интерфейса.",
      en: "Added Cat Codex-Do quotes to the splash screen and battle, and expanded battle UI translations.",
    },
  },
  {
    version: "0.172",
    date: "2026-03-17",
    summary: {
      ru: "Обновлена помощь по карточкам, добавлено описание умений и улучшена логика потенциальной награды за колоду.",
      en: "Updated card help, added ability explanations, and improved the deck potential reward logic.",
    },
  },
  {
    version: "0.171",
    date: "2026-03-17",
    summary: {
      ru: "Улучшено поведение бустеров: закрытие по клику вне кнопки открытия и очистка лишних надписей.",
      en: "Improved booster behavior: close on click outside the open button and removed extra overlay text.",
    },
  },
  {
    version: "0.170",
    date: "2026-03-16",
    summary: {
      ru: "Добавлены таймер автовыбора цели у босса, fallback-изображения, подробная таблица карты, HP-бонус к награде и предпросмотр награды колоды.",
      en: "Added boss auto-target countdown, image fallbacks, detailed card table, HP bonus reward, and deck reward preview.",
    },
  },
]
