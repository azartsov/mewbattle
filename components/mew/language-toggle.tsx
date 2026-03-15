"use client"

import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMewI18n } from "@/lib/mew-i18n"

export function LanguageToggle() {
  const { language, setLanguage } = useMewI18n()

  return (
    <Button
      size="sm"
      variant="secondary"
      className="gap-1.5 rounded-full px-2.5"
      onClick={() => setLanguage(language === "en" ? "ru" : "en")}
    >
      <Languages className="h-3.5 w-3.5" />
      {language === "en" ? "EN" : "RU"}
    </Button>
  )
}
