import type { Metadata } from "next"
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'
import type React from 'react'
import { ThemeProvider } from "@/components/index/theme-provider"
/* import { ModalProvider } from '@/providers/modal-provider'
import { ToastProvider } from '@/providers/toast-provider' */

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
      <html lang="es" suppressHydrationWarning>
        <head>
          <title>INVWE</title>
        </head>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="invwe-theme"
          >
            {children}
          </ThemeProvider>
          {/* <ModalProvider />
          <ToastProvider /> */}
        </body>
      </html>
    </ClerkProvider>
  )
}
