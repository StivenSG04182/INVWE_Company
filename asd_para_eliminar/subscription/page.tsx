"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

const subscriptionPlans = [
    {
        name: "Gratis",
        price: "0 COP",
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
    }
]

export default function SubscriptionPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const companyId = searchParams.get("companyId")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubscription = async (plan: typeof subscriptionPlans[0]) => {
        try {
            setIsLoading(true)

            if (plan.isPaid) {
                // Redirect to payment gateway
                router.push(`/payment?companyId=${companyId}&plan=${plan.name}`)
                return
            }

            // For free plan, create subscription directly
            const response = await axios.post("/api/subscription", {
                companyId,
                plan: plan.name,
                limits: plan.limits
            })

            router.push(`/${response.data.companyName}/${response.data.storeId}`)
            toast.success("Suscripción activada exitosamente")
        } catch (error) {
            toast.error("Error al activar la suscripción")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container py-20">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">Elige tu Plan</h1>
                <p className="text-xl text-muted-foreground">
                    Selecciona el plan que mejor se adapte a tus necesidades
                </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {subscriptionPlans.map((plan) => (
                    <Card key={plan.name} className="p-8">
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <p className="text-3xl font-bold mt-4">{plan.price}</p>
                        <ul className="mt-6 space-y-4">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-500" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            onClick={() => handleSubscription(plan)}
                            disabled={isLoading}
                            className="w-full mt-8"
                        >
                            Seleccionar Plan
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    )
}