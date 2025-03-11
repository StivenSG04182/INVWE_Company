"use client"

import { ThemeProvider } from "next-themes"

export default function SelectInventoryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange
            storageKey="invwe-select-inventory-theme"
        >
            {children}
        </ThemeProvider>
    )
}