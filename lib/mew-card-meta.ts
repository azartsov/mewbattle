export type CardMetaLocalized = {
  name: string
  lore: string
  ability: string
}

/** Russian localizations for cat and boss cards keyed by card/boss ID. */
export const CARD_META_RU: Record<string, CardMetaLocalized> = {
  cat_knight: {
    name: "Кот-Рыцарь",
    lore: "Верный страж храма, стоящий непоколебимо перед клювом и когтями врага.",
    ability: "Стойка щита",
  },
  cat_alchemist: {
    name: "Кот-Алхимик",
    lore: "Тактик-аптекарь, поднимающий тониковый щит и удерживающий строй в бою.",
    ability: "Тониковый щит",
  },
  cat_phantom: {
    name: "Кот-Фантом",
    lore: "Шепчущая тень, тающая между ударами и уходящая от смертельных атак.",
    ability: "Призрачное уклонение",
  },
  cat_ninja: {
    name: "Кот-Ниндзя",
    lore: "Безмолвный охотник лунных крыш, смертоносный против стремительных хищников.",
    ability: "Уклонение 30%",
  },
  cat_mage: {
    name: "Кот-Маг",
    lore: "Учёный-чародей защитных чар, особо силён против чумных стай.",
    ability: "Магический щит",
  },
  cat_berserker: {
    name: "Кот-Берсерк",
    lore: "Боевой вождь клана, сокрушающий броню неудержимой яростью.",
    ability: "Шанс двойного удара",
  },
  cat_vampire: {
    name: "Кот-Вампир",
    lore: "Древний ночной хищник, черпающий силу из каждой нанесённой раны.",
    ability: "Вампиризм: лечение от урона",
  },
  cat_dragon: {
    name: "Кот-Дракон",
    lore: "Мифический огненный властелин, которого боятся все боссы проклятых земель.",
    ability: "Легендарный двойной огонь",
  },
  boss_raven: {
    name: "Злой Ворон",
    lore: "Проклятый ворон-колдун, управляющий штормовыми перьями и зеркальными щитами.",
    ability: "Уклонение ниндзя и щит мага",
  },
  boss_dog: {
    name: "Злой Пёс",
    lore: "Железночелюстной боевой пёс со сожжённых дорог святилищ.",
    ability: "Берсерк-укус и мощная контратака",
  },
  boss_rat: {
    name: "Злая Крыса",
    lore: "Повелитель чумных крыс, побеждающий скоростью и изматывающим уроном.",
    ability: "Быстрое уклонение и чиповый отравляющий урон",
  },
}

/** Japanese kanji names shown above the card display name. */
export const CARD_META_JA: Record<string, string> = {
  cat_knight: "騎士猫",
  cat_alchemist: "錬金猫",
  cat_phantom: "幻影猫",
  cat_ninja: "忍者猫",
  cat_mage: "魔法猫",
  cat_berserker: "狂戦猫",
  cat_vampire: "吸血猫",
  cat_dragon: "龍猫",
  boss_raven: "邪鴉",
  boss_dog: "猛犬",
  boss_rat: "疫鼠",
}
