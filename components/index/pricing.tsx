import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export function Pricing() {
    return (
        <section id="pricing" className="py-24 relative">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Planes, Suscripción</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {[
                        {
                            name: "Gratis",
                            price: "0 COP",
                            description: "Perfecto para pequeñas empresas",
                            features: [
                                "Máximo 10 trabajadores",
                                "1,000 facturaciones electrónicas",
                                "Creación máxima de 3 tiendas"
                            ],
                            limits: {
                                workers: 10,
                                invoices: 1000,
                                stores: 3
                            },
                            isPaid: false
                        },
                        {
                            name: "Básico",
                            price: "20,000 COP",
                            description: "Perfecto para medianas empresas",
                            features: [
                                "Máximo 30 trabajadores",
                                "10,000 facturaciones electrónicas",
                                "Creación máxima de 5 tiendas"
                            ],
                            limits: {
                                workers: 30,
                                invoices: 10000,
                                stores: 5
                            },
                            isPaid: true
                        },
                        {
                            name: "Premium",
                            price: "50,000 COP",
                            description: "Perfecto para grandes empresas",
                            features: [
                                "Máximo 50 trabajadores",
                                "100,000 facturaciones electrónicas",
                                "Creación máxima de 10 tiendas"
                            ],
                            limits: {
                                workers: 50,
                                invoices: 100000,
                                stores: 10
                            },
                            isPaid: true
                        },
                        {
                            name: "ENTERPRISE",
                            price: "Custom",
                            description: "Plan perfecto para armar tu plan",
                            features: [
                                "Enpleados Ilimitados",
                                "Facturas Ilimitadas",
                                "Creación hasta 10 Sucursales diferentes"
                            ],
                            limits: {
                                workers: "custom",
                                invoices: "custon",
                                stores: "custon"
                            },
                            isPaid: true
                        }
                    ].map((plan, index) => (
                        <Card
                            key={index}
                            className={`border bg-gradient-to-b ${index === 1
                                ? ""
                                : "from-card/50 to-card/80"
                                } backdrop-blur-xl p-8 transition-all hover:scale-105`}

                        >
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <div className="text-4xl font-bold mb-4">
                                        {plan.price}
                                        <span className="text-lg text-muted-foreground">/month</span>
                                    </div>
                                    <p className="text-muted-foreground mb-6">{plan.description}</p>
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-center">
                                                <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Link href="/sign-in">
                                    <Button
                                        className="w-full mt-auto"
                                        variant={index === 1 ? "default" : "outline"}
                                        size="lg"
                                    >
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
