// features.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Boxes, BarChart3, Shield } from "lucide-react";

export function Features() {
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const section = document.getElementById("features");
        if (!section) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setInView(entry.isIntersecting);
                    window.dispatchEvent(
                        new CustomEvent("featuresInView", { detail: entry.isIntersecting })
                    );
                });
            },
            { threshold: 0.5 }
        );

        observer.observe(section);
        return () => {
            observer.unobserve(section);
        };
    }, []);

    return (
        <section id="features" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        One platform, infinite possibilities
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Everything you need to manage your inventory in real-time, all in one place.
                    </p>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl dark:opacity-30" />
                    {/* Aplicamos clases para transición: desde opacidad 0 y desplazado, a opacidad 100 y posición normal */}
                    <Card
                        className={`relative border bg-card/50 backdrop-blur-xl p-8 transition-all duration-700 
            ${inView ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
                    >
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h3 className="text-2xl font-bold mb-4">3D Warehouse Visualization</h3>
                                <p className="text-muted-foreground mb-6">
                                    View your entire warehouse in stunning 3D. Navigate through aisles, locate items instantly, and
                                    optimize space utilization with our advanced visualization tools.
                                </p>
                                <Button>Learn More</Button>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mt-20">
                    {[
                        {
                            icon: <Boxes className="h-12 w-12 text-primary" />,
                            title: "Smart Storage",
                            description:
                                "AI-powered storage optimization that learns from your inventory patterns.",
                        },
                        {
                            icon: <BarChart3 className="h-12 w-12 text-primary" />,
                            title: "Real-time Analytics",
                            description:
                                "Track inventory movements and predict future needs with advanced analytics.",
                        },
                        {
                            icon: <Shield className="h-12 w-12 text-primary" />,
                            title: "Secure Access",
                            description:
                                "Role-based access control and audit trails for enhanced security.",
                        },
                    ].map((feature, index) => (
                        <Card
                            key={index}
                            className={`border bg-card/50 backdrop-blur-xl p-8 transition-all duration-700 hover:bg-card/80 
                            ${inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
                        >
                            <div className="mb-6">{feature.icon}</div>
                            <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
