import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { CheckCircleIcon } from 'lucide-react'
import React from 'react'
import { Separator } from '@/components/ui/separator'
import { pricingCards } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'

type Props = {
  params: {
    agencyId: string
  }
}

const PricingPage = async ({ params }: Props) => {
  const agencyDetails = await db.agency.findUnique({
    where: { id: params.agencyId },
    include: { Subscription: true },
  })

  if (!agencyDetails) return null

  const currentPlan = agencyDetails.Subscription?.plan || null
  const isSubscribed = agencyDetails.Subscription?.active || false

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-4xl font-bold">Planes de Precios</h1>
        <p className="text-muted-foreground mt-2">
          Elige el plan que mejor se adapte a tus necesidades
        </p>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pricingCards.map((card) => (
          <Card key={card.title} className="flex flex-col">
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{card.price}</span>
                {card.duration && (
                  <span className="text-muted-foreground ml-1">/{card.duration}</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                {card.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              {isSubscribed && currentPlan === card.priceId ? (
                <Button className="w-full" disabled>
                  Plan Actual
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  asChild
                >
                  <a href={`/api/paypal/create-subscription?planId=${card.priceId}&agencyId=${params.agencyId}`}>
                    {isSubscribed ? 'Cambiar Plan' : 'Suscribirse'}
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PricingPage 