/**
 * Color assertion helpers for Playwright DOM tests.
 *
 * Tailwind v4 may output colors as hex, rgb, oklch, or oklab. Normalize both
 * rendered properties and semantic custom properties through Canvas 2D so
 * assertions compare pixels rather than serialization formats.
 */

import type { Locator, Page } from "@playwright/test"

/**
 * Parse a CSS hex color (#RRGGBB or #RGB) into an rgb() string.
 * Use only when you are confident the computed style returns rgb() format.
 * Prefer the normalization helpers for general color comparisons.
 *
 * @example hexToRgb("#181B1F") === "rgb(24, 27, 31)"
 */
export function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "")
  let r: number, g: number, b: number
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16)
    g = parseInt(clean[1] + clean[1], 16)
    b = parseInt(clean[2] + clean[2], 16)
  } else {
    r = parseInt(clean.slice(0, 2), 16)
    g = parseInt(clean.slice(2, 4), 16)
    b = parseInt(clean.slice(4, 6), 16)
  }
  return `rgb(${r}, ${g}, ${b})`
}

/** Resolve a rendered color property to sRGB rgb(). */
export async function normalizeCssColor(
  locator: Locator,
  property: "backgroundColor" | "color" | "borderColor"
): Promise<string> {
  return locator.evaluate((el, prop) => {
    const computed = getComputedStyle(el)[prop as never] as string
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = computed
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return `rgb(${r}, ${g}, ${b})`
  }, property)
}

/** Resolve a semantic CSS custom property to the same sRGB representation. */
export async function normalizeCssVariableColor(
  page: Page,
  variable: string
): Promise<string> {
  return page.evaluate((name) => {
    const probe = document.createElement("span")
    probe.style.color = `var(${name})`
    document.body.append(probe)

    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = getComputedStyle(probe).color
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data

    probe.remove()
    return `rgb(${r}, ${g}, ${b})`
  }, variable)
}
