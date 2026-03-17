"use client"

import { createContext, useContext, type ReactNode } from "react"

export type CardDesignVariant = "classic" | "storybook"

interface CardDesignContextValue {
  variant: CardDesignVariant
  setVariant: (variant: CardDesignVariant) => void
}

const CardDesignContext = createContext<CardDesignContextValue>({
  variant: "classic",
  setVariant: () => {},
})

export function CardDesignProvider({
  variant,
  setVariant,
  children,
}: CardDesignContextValue & { children: ReactNode }) {
  return (
    <CardDesignContext.Provider value={{ variant, setVariant }}>
      {children}
    </CardDesignContext.Provider>
  )
}

export function useCardDesign() {
  return useContext(CardDesignContext)
}