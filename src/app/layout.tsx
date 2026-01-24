import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthSessionProvider from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { ToastProvider } from "@/components/ui/toast";
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

export const metadata: Metadata = {
  metadataBase: new URL('https://adspersoneelsapp.nl'),
  title: {
    default: 'ADSPersoneelapp - Complete HR Software voor Nederland',
    template: '%s | ADSPersoneelapp',
  },
  description: 'ADSPersoneelapp is de complete HR software voor Nederlandse bedrijven. Urenregistratie, verlofbeheer, ziekmelding, fleet tracking en meer. Start vandaag met 14 dagen gratis.',
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <LocaleProvider>
            <ToastProvider>
              <AuthSessionProvider>
                <LocaleSync />
                {children}
              </AuthSessionProvider>
            </ToastProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
