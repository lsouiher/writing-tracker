import type { Metadata } from 'next'
import { DM_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import { LanguageToggle } from '@/components/ui/language-toggle'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  variable: '--font-display',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-code',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'IAlgeria — Apprenez l\'IA en francais',
    template: '%s | IAlgeria',
  },
  description:
    'La premiere plateforme d\'apprentissage de l\'intelligence artificielle en francais. Cours video gratuits, laboratoires interactifs, tuteur IA personnel.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'IAlgeria',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${dmSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Aller au contenu principal
        </a>
        <div className="fixed top-4 right-4 z-50">
          <LanguageToggle />
        </div>
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  )
}
