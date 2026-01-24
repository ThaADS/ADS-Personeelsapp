import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthSessionProvider from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { ToastProvider } from "@/components/ui/toast";
import { PWAProvider } from "@/components/pwa";
import LocaleSync from "@/components/providers/LocaleSync";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// PWA Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7c3aed' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://adspersoneelsapp.nl'),
  title: {
    default: 'ADSPersoneelapp - Complete HR Software voor Nederland',
    template: '%s | ADSPersoneelapp',
  },
  description: 'ADSPersoneelapp is de complete HR software voor Nederlandse bedrijven. Urenregistratie, verlofbeheer, ziekmelding, fleet tracking en meer. Start vandaag met 14 dagen gratis.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ADSPersoneelapp',
  },
  applicationName: 'ADSPersoneelapp',
  keywords: [
    'HR software',
    'personeelsbeheer',
    'urenregistratie',
    'verlofbeheer',
    'ziekmelding',
    'fleet tracking',
    'personeelsapp',
    'HR management',
    'Nederland',
    'MKB',
    'onderneming',
    'personeel administratie',
  ],
  authors: [{ name: 'ADSPersoneelapp B.V.' }],
  creator: 'ADSPersoneelapp',
  publisher: 'ADSPersoneelapp B.V.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://adspersoneelsapp.nl',
    siteName: 'ADSPersoneelapp',
    title: 'ADSPersoneelapp - Complete HR Software voor Nederland',
    description: 'De complete HR software voor Nederlandse bedrijven. Urenregistratie, verlofbeheer, ziekmelding, fleet tracking en meer.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ADSPersoneelapp - HR Software',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADSPersoneelapp - Complete HR Software',
    description: 'De complete HR software voor Nederlandse bedrijven.',
    images: ['/og-image.png'],
    creator: '@adspersoneelapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: 'https://adspersoneelsapp.nl',
    languages: {
      'nl-NL': 'https://adspersoneelsapp.nl',
    },
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        {/* PWA Icons */}
        <link rel="icon" href="/icons/icon-192x192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.svg" />
        {/* Splash screens for iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <LocaleProvider>
            <ToastProvider>
              <AuthSessionProvider>
                <PWAProvider>
                  <LocaleSync />
                  {children}
                </PWAProvider>
              </AuthSessionProvider>
            </ToastProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
