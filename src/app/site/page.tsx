import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { pricingCards } from '@/lib/constants'
import clsx from 'clsx'
import { Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { PayPalButton } from '@/components/global/paypal-button'
import { CheckCircleIcon } from 'lucide-react'
import React from 'react'

interface Subscription {
  id: string;
  plan: string;
  price: number;
  active: boolean;
}

export default async function Home() {
  // Intentamos obtener las suscripciones, si hay error retornamos un array vacío
  let subscriptions: Subscription[] = [];
  try {
    subscriptions = await db.subscription.findMany({
      where: {
        active: true,
      },
      orderBy: {
        price: "asc",
      },
    });
  } catch (error) {
    console.log("No hay suscripciones disponibles:", error);
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Planes de Suscripción</h1>
          <p className="text-xl text-muted-foreground">
            Elige el plan que mejor se adapte a tus necesidades
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subscriptions.length > 0 ? (
            subscriptions.map((plan) => (
              <div
                key={plan.id}
                className="bg-card rounded-lg shadow-lg p-8 border"
              >
                <h2 className="text-2xl font-bold mb-4">{plan.plan}</h2>
                <p className="text-4xl font-bold mb-6">
                  ${plan.price}
                  <span className="text-lg text-muted-foreground">/mes</span>
                </p>
                <div className="mb-8">
                  <PayPalButton
                    amount={plan.price}
                    onSuccess={() => {
                      console.log("Pago exitoso");
                    }}
                    onError={() => {
                      console.log("Error en el pago");
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center">
              <p className="text-lg text-muted-foreground">
                No hay planes de suscripción disponibles en este momento.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}