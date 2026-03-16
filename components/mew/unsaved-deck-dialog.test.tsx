// @vitest-environment jsdom

import React from "react"
import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it, vi } from "vitest"
import { UnsavedDeckDialog } from "@/components/mew/unsaved-deck-dialog"

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}))

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => open ? <div data-dialog-open="true">{children}</div> : null,
  DialogContent: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  DialogHeader: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  DialogTitle: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h2 {...props}>{children}</h2>,
}))

vi.mock("@/components/mew/paw-loader", () => ({
  PawLoader: () => <span data-testid="paw-loader">loader</span>,
}))

describe("UnsavedDeckDialog", () => {
  afterEach(() => {
    document.body.innerHTML = ""
    vi.restoreAllMocks()
  })

  it("renders actions and routes clicks to stay, discard, and save handlers", async () => {
    const onStay = vi.fn()
    const onDiscard = vi.fn()
    const onSave = vi.fn()

    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <UnsavedDeckDialog
          open
          onOpenChange={() => {}}
          title="Unsaved Changes"
          description="Save before leaving?"
          stayLabel="Stay"
          discardLabel="Don't Save"
          saveLabel="Save"
          onStay={onStay}
          onDiscard={onDiscard}
          onSave={onSave}
        />,
      )
    })

    const buttons = Array.from(container.querySelectorAll("button"))
    expect(buttons.map((button) => button.textContent)).toEqual(["Stay", "Don't Save", "Save"])

    await act(async () => {
      buttons[0]?.click()
      buttons[1]?.click()
      buttons[2]?.click()
    })

    expect(onStay).toHaveBeenCalledTimes(1)
    expect(onDiscard).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledTimes(1)

    await act(async () => {
      root.unmount()
    })
  })

  it("shows loading state and disables save button while saving", async () => {
    const onSave = vi.fn()

    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <UnsavedDeckDialog
          open
          onOpenChange={() => {}}
          title="Unsaved Changes"
          description="Save before leaving?"
          stayLabel="Stay"
          discardLabel="Don't Save"
          saveLabel="Save"
          saving
          onStay={() => {}}
          onDiscard={() => {}}
          onSave={onSave}
        />,
      )
    })

    const buttons = Array.from(container.querySelectorAll("button"))
    const saveButton = buttons[2] as HTMLButtonElement | undefined
    expect(saveButton?.disabled).toBe(true)
    expect(saveButton?.textContent).toContain("Save")
    expect(container.querySelector('[data-testid="paw-loader"]')).not.toBeNull()

    await act(async () => {
      saveButton?.click()
    })

    expect(onSave).not.toHaveBeenCalled()

    await act(async () => {
      root.unmount()
    })
  })
})
