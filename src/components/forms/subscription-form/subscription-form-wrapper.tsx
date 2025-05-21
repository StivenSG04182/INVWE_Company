'use client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { pricingCards } from '@/lib/constants'
import { useModal } from '@/providers/modal-provider'
import { Plan } from '@prisma/client'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import Loading from '@/components/global/loading'
import SubscriptionForm from '.'

type Props = {
  customerId: string
  planExists: boolean
}

const SubscriptionFormWrapper = ({ customerId, planExists }: Props) => {
  const { data, setClose } = useModal()
  const router = useRouter()
  const [selectedPriceId, setSelectedPriceId] = useState<Plan | ''>(
    data?.plans?.defaultPriceId || ''
  )
  const [loading, setLoading] = useState(false)

  const handlePlanSelection = async (priceId: Plan) => {
    setSelectedPriceId(priceId)
    setLoading(true)
    try {
      const response = await fetch('/api/paypal/create-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create plan')
      }

      if (planExists) {
        toast({
          title: 'Success',
          description: 'Your plan has been successfully upgraded!',
        })
        setClose()
        router.refresh()
      }
    } catch (error) {
      console.error('Error creating plan:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create subscription plan. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="border-none transition-all">
      <div className="flex flex-col gap-4">
        {data.plans?.plans.map((price) => (
          <Card
            onClick={() => handlePlanSelection(price.id as Plan)}
            key={price.id}
            className={clsx('relative cursor-pointer transition-all', {
              'border-primary': selectedPriceId === price.id,
            })}
          >
            <CardHeader>
              <CardTitle>
                ${price.billing_cycles?.[0]?.pricing_scheme?.fixed_price?.value || '0'}
                <p className="text-sm text-muted-foreground">
                  {price.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {
                    pricingCards.find((p) => p.priceId === price.id)
                      ?.description
                  }
                </p>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      {selectedPriceId && (
        <div className="mt-4">
          <SubscriptionForm
            selectedPriceId={selectedPriceId}
            planAmount={
              data.plans?.plans.find((p) => p.id === selectedPriceId)
                ?.billing_cycles?.[0]?.pricing_scheme?.fixed_price?.value || 0
            }
          />
        </div>
      )}
    </div>
  )
}

export default SubscriptionFormWrapper