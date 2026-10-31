import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter, JetBrains_Mono } from "next/font/google"
import localFont from "next/font/local"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/toaster"
import { cn } from "@workspace/ui/lib/utils"

export const metadata: Metadata = {
  // Resolves the generated opengraph-image URLs to absolute links.
  metadataBase: process.env.BETTER_AUTH_URL
    ? new URL(process.env.BETTER_AUTH_URL)
    : undefined,
  title: "Quist — search engine for AI-solved problems",
  description:
    "A searchable knowledge base of real, confirmed AI conversations that solved developer problems.",
  openGraph: { siteName: "Quist", type: "website" },
  // X/Twitter reuses the og:image; this just asks for the large card.
  twitter: { card: "summary_large_image" },
  manifest: "/site.webmanifest",
  icons: {
    // favicon.ico is auto-detected from app/; add the iOS + PWA icons here.
    apple: "/apple-touch-icon.png",
  },
}

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const fontGeist = Geist({ subsets: ["latin"], variable: "--font-geist" })

const fontJetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

// Display font for landing / marketing headings (PP Mondwest, local file).
const fontDisplay = localFont({
  src: "../public/fonts/ppmondwest-regular.otf",
  variable: "--font-mondwest",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        fontJetbrainsMono.variable,
        fontGeist.variable,
        fontDisplay.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
