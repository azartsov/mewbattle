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
    version: "0.206",
    date: "2026-03-18",
    summary: {
      ru: "Цвета фонов карточек стали мягче, а экраны победы и поражения теперь разворачиваются на весь экран и закрываются только по кнопке.",
      en: "Card background colors are now softer, and the victory and defeat screens now expand to full screen and close only via a button.",
    },
  },
  {
    version: "0.204",
    date: "2026-03-17",
    summary: {
      ru: "У босса Злого пса сокращено название умения, а параметры на карточках стали компактнее и больше не переносятся на вторую строку.",
      en: "The Evil Dog boss now has a shorter ability name, and card parameters are more compact so they no longer wrap onto a second line.",
    },
  },
  {
    version: "0.203",
    date: "2026-03-17",
    summary: {
      ru: "Изображения персонажей на карточках стали крупнее и четче: увеличена зона портрета, ослаблено затемнение и улучшен масштаб отображения.",
      en: "Character art on cards is now larger and clearer: the portrait area was expanded, dark overlays were softened, and display scaling was improved.",
    },
  },
  {
    version: "0.190",
    date: "2026-03-17",
    summary: {
      ru: "Экран результата стал еще компактнее, а задержка перед его показом сокращена до 1400 мс.",
      en: "The result screen is now even more compact, and the reveal delay was reduced to 1400 ms.",
    },
  },
  {
    version: "0.189",
    date: "2026-03-17",
    summary: {
      ru: "Экран победы или поражения стал компактнее и полупрозрачнее, поэтому через него теперь видно финальную ситуацию на поле боя.",
      en: "The victory or defeat screen is now smaller and more translucent, so the final battlefield state remains visible behind it.",
    },
  },
  {
    version: "0.188",
    date: "2026-03-17",
    summary: {
      ru: "После финального удара экран победы или поражения теперь появляется с задержкой, чтобы сначала успевали доиграть анимации потери жизней.",
      en: "After the final hit, the victory or defeat screen now appears with a delay so the lost-health animations can finish first.",
    },
  },
  {
    version: "0.187",
    date: "2026-03-17",
    summary: {
      ru: "Ускорен отсчет перед ответным ударом босса, чтобы бой шел заметно динамичнее.",
      en: "Sped up the countdown before the boss counterattack so battles feel more dynamic.",
    },
  },
  {
    version: "0.186",
    date: "2026-03-17",
    summary: {
      ru: "Кнопки «Вступаем в бой» и «Начать бой» теперь мягко подсвечиваются в те моменты, когда игра ждет нажатия игрока.",
      en: "The Enter Battle and Start Battle buttons now softly glow whenever the game is waiting for the player to press them.",
    },
  },
  {
    version: "0.184",
    date: "2026-03-17",
    summary: {
      ru: "В начале боя блок выбора колоды теперь мерцает, пока игрок не выберет колоду для старта схватки.",
      en: "At battle start, the deck selection block now pulses until the player picks a deck to begin the fight.",
    },
  },
  {
    version: "0.183",
    date: "2026-03-17",
    summary: {
      ru: "Сохранение состояния игры теперь показывается стандартным анимированным лоадером поверх текущего экрана, без отдельных переходов на экран Firestore.",
      en: "Game state saving now uses the standard animated loader over the current screen, without separate transitions to a Firestore screen.",
    },
  },
  {
    version: "0.182",
    date: "2026-03-17",
    summary: {
      ru: "Исправлен повторный возврат в тот же бой после сохранения: данные обновляются только после выхода из арены, поэтому экран завершения больше не сбрасывается назад в текущую схватку.",
      en: "Fixed the repeat return into the same battle after saving: data now refreshes only after leaving the arena, so the completion screen no longer resets back into the current fight.",
    },
  },
  {
    version: "0.181",
    date: "2026-03-17",
    summary: {
      ru: "Завершение боя больше не зависит от сохранения в Firestore: экраны победы и поражения показываются сразу, а арена гарантированно возвращается в стартовый режим боя.",
      en: "Battle completion no longer depends on Firestore persistence: victory and defeat screens appear immediately, and the arena reliably returns to the initial battle state.",
    },
  },
  {
    version: "0.180",
    date: "2026-03-17",
    summary: {
      ru: "Исправлены экраны завершения боя с автоматическим возвратом к стартовому состоянию арены, а Кот-Лекарь теперь лечит только союзников и посылает к цели заметный поток лепестков сакуры.",
      en: "Fixed battle completion screens with automatic return to the arena start state, and Cat Healer now heals only allies with a more visible sakura petal stream aimed at the target.",
    },
  },
  {
    version: "0.179",
    date: "2026-03-17",
    summary: {
      ru: "Усилено лечение Кота-Лекаря, бустеры получили проверку баланса и новый плоский аниме-оформленный вид, а в бою появились отдельные финальные экраны победы и поражения.",
      en: "Buffed Cat Healer recovery, added booster balance checks with a flatter anime-inspired look, and introduced dedicated victory and defeat end screens in battle.",
    },
  },
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
