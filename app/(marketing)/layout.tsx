"use client"

import { Header } from "@/components/index/header";
import { Footer } from "@/components/index/footer";

export default function MarketingLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <main className="min-h-screen relative">
            <div className="relative z-10">
                <Header />
                {children}
                <Footer />
            </div>
        </main>
    );
}