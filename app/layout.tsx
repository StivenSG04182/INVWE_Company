import type { Metadata } from "next"
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'
import type React from 'react'
import { ThemeProvider } from "@/components/index/theme-provider"
import { CookieConsentProvider } from "@/components/cookie-consent/cookie-provider"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "StreamLine - Interactive Inventory Management",
  description: "Streamline your inventory management with our powerful, interactive platform.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="es" suppressHydrationWarning className="h-full">
        <head>
          <title>INVWE</title>
        </head>
        <body className={`${inter.className} flex flex-col min-h-screen`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
            storageKey="invwe-theme">
            <div className="flex-grow">{children}</div>
            <CookieConsentProvider />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}