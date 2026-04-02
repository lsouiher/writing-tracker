'use client'

import { useCallback, useEffect, useState } from 'react'

type Locale = 'fr' | 'en'

const LOCALE_KEY = 'ialgeria-locale'

const labels: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
}

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'fr'
  return (localStorage.getItem(LOCALE_KEY) as Locale) || 'fr'
}

export function LanguageToggle() {
  const [locale, setLocale] = useState<Locale>('fr')

  useEffect(() => {
    setLocale(getStoredLocale())
  }, [])

  const toggle = useCallback(() => {
    const next: Locale = locale === 'fr' ? 'en' : 'fr'
    setLocale(next)
    localStorage.setItem(LOCALE_KEY, next)
    document.documentElement.lang = next
    window.dispatchEvent(new CustomEvent('locale-change', { detail: next }))
  }, [locale])

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-1.5 rounded-full border border-muted/30 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      aria-label={locale === 'fr' ? 'Switch to English' : 'Passer en français'}
      title={locale === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      <span className="text-xs">🌐</span>
      <span>{labels[locale]}</span>
    </button>
  )
}

export function useLocale() {
  const [locale, setLocale] = useState<Locale>('fr')

  useEffect(() => {
    setLocale(getStoredLocale())

    const handler = (e: Event) => {
      setLocale((e as CustomEvent<Locale>).detail)
    }
    window.addEventListener('locale-change', handler)
    return () => window.removeEventListener('locale-change', handler)
  }, [])

  return locale
}
