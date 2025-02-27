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
            <div className="relative z-10 ">
                <Header />
                <section className="py-24 relative">
                    <div className="container mx-auto px-6 text-center">
                        {children}
                        <Footer />
                    </div>
                </section>
            </div>
        </main>
    );
}