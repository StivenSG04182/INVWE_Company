import { ClerkProvider } from "@clerk/nextjs"
import type React from "react"
import { BackgroundBeams } from "../../components/ui/background-beams"

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider>
            <div className="relative min-h-screen flex items-center justify-center">
                <div className="relative z-10 w-full max-w-md">{children}</div>
                <div className="absolute inset-0 bg-neutral-950">
                    <BackgroundBeams />
                </div>
            </div>
        </ClerkProvider>
    )
}

