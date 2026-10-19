"use client"

import { useCallback, useEffect, useSyncExternalStore } from "react"

import { themeToggle } from "@/data/site"

/**
 * The theme, in one place, so the header's toggle and the mobile drawer
 * (ticket #6) agree on what the current theme is.
 *
 * The theme is applied before the first paint by the inline script in
 * `src/app/layout.tsx`, which reads the same storage key. This module handles
 * the choice a visitor makes while the page is open.
 */

/** The two themes the page has. */
export type ThemeName = "light" | "dark"

/** The original's storage key, so the behaviour is identical. */
export const THEME_STORAGE_KEY = "artcraft-theme"

/** The toggle's accessible names, named for the theme each one switches to. */
export const themeToggleLabel = themeToggle

declare global {
  interface Window {
    /** Installed by the pre-paint script in `src/app/layout.tsx`. */
    __artcraftSetTheme?: (theme: ThemeName) => void
  }
}

/**
 * The theme the page is showing: the explicit choice, or — where there is
 * none — the operating system's colour-scheme preference, which is what the
 * token layer's media query follows.
 */
export function appliedTheme(): ThemeName {
  const attribute = document.documentElement.getAttribute("data-theme")
  if (attribute === "light" || attribute === "dark") {
    return attribute
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

/*
 * A tiny store, so that every toggle on the page agrees on the current theme:
 * the header carries two of them, one for the wide group and one for the
 * narrow one, and they must never disagree.
 */
const listeners = new Set<() => void>()
let current: ThemeName | null = null

function announce(theme: ThemeName) {
  current = theme
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): ThemeName {
  return current ?? appliedTheme()
}

function getServerSnapshot(): ThemeName {
  return "light"
}

/**
 * Applies a theme: the document element carries it, the choice is stored, and
 * the colours flip together.
 */
export function applyTheme(theme: ThemeName) {
  if (typeof window.__artcraftSetTheme === "function") {
    window.__artcraftSetTheme(theme)
  } else {
    const root = document.documentElement
    root.classList.add("theme-anim")
    root.setAttribute("data-theme", theme)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      /* A browser that refuses storage still gets the theme. */
    }
    window.setTimeout(() => root.classList.remove("theme-anim"), 450)
  }
  announce(theme)
}

/** The current theme, and the ways to change it. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Where the visitor has made no choice, the page follows the operating
  // system — and so does the toggle's name.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      if (current === null) {
        announce(appliedTheme())
      }
    }
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  const setTheme = useCallback((next: ThemeName) => applyTheme(next), [])

  const toggle = useCallback(
    () => applyTheme(appliedTheme() === "dark" ? "light" : "dark"),
    [],
  )

  return { theme, setTheme, toggle }
}
