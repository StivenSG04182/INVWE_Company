"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"


export function ThereeAnimation() {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">

            <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto px-6">
                <h1 className="text-5xl md:text-7xl font-bold">
                    Tu inventario,
                    <span className="block text-primary mt-2">.</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Transform your warehouse management with real-time 3D visualization, AI-powered insights, and seamless
                    inventory control.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="text-lg">
                        Start Free Trial
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button size="lg" variant="outline" className="text-lg">
                        Watch Demo
                    </Button>
                </div>
            </div>
        </section>
    )
}

