import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"


export function Pricing() {
    return (
        <section id="pricing" className="py-24 relative">
        <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Planes, Suscripción</h2>

               {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
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
                                "Empleados Ilimitados",
                                "Facturas Ilimitadas",
                                "Creación hasta 10 Sucursales diferentes"
                            ],
                            limits: {
                                workers: "custom",
                                invoices: "custom",
                                stores: "custom"
                            },
                            isPaid: true
                        }
                    ].map((plan, index) => (
                        <Card
                            key={index}
                            className={`border bg-gradient-to-b from-card/50 to-card/80 backdrop-blur-xl p-6 transition-all hover:scale-105 dark:shadow-[0_0_15px_rgba(206,158,80,0.3)] shadow-[0_0_15px_rgba(80,128,206,0.3)]`}
                        >
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                    <div className="text-3xl font-bold mb-4">
                                        {plan.price}
                                        <span className="text-sm text-muted-foreground">/mes</span>
                                    </div>
                                    <p className="text-muted-foreground mb-4 text-sm">{plan.description}</p>
                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-center text-sm">
                                                <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Link href="/sign-in" className="mt-auto">
                                    <Button
                                        className="w-full bg-custom-blue hover:bg-custom-blue/90 dark:bg-custom-gold dark:hover:bg-custom-gold/90 dark:text-black"
                                        size="lg"
                                    >
                                        Comenzar
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}