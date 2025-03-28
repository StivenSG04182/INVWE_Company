"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function EcommercePage() {
    const router = useRouter()

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
            <h1 className="text-2xl font-bold mb-6">E-commerce Tools</h1>
            <div className="flex flex-col gap-4 w-full max-w-md">
                <Button
                    onClick={() => router.push('./ecommerce/ai-generator')}
                    className="w-full"
                >
                    AI Generator
                </Button>
                <Button
                    onClick={() => router.push('./ecommerce/customize')}
                    className="w-full"
                >
                    Customize
                </Button>
                <Button
                    onClick={() => router.push('./ecommerce/templates')}
                    className="w-full"
                >
                    Templates
                </Button>
            </div>
        </div>
    )
}
