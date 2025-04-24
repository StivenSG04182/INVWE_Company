'use client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Plan } from '@prisma/client'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import React, { useState } from 'react'

type Props = {
  selectedPriceId: string | Plan
  planAmount: number
}

const SubscriptionForm = ({ selectedPriceId, planAmount }: Props) => {
  const { toast } = useToast()
  const [priceError, setPriceError] = useState('')

  const handlePaymentSuccess = async () => {
    try {
      const response = await fetch('/api/paypal/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPriceId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create subscription')
      }

      toast({
        title: 'Payment successful',
        description: 'Your payment has been successfully processed.',
      })
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Payment failed',
        description: 'We couldn\'t process your payment. Please try again.',
      })
    }
  }

  return (
    <div className="w-full">
      <small className="text-destructive">{priceError}</small>
      <PayPalScriptProvider
        options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
          components: 'buttons',
          intent: 'subscription',
        }}
      >
        <PayPalButtons
          style={{
            layout: 'vertical',
            shape: 'rect',
            label: 'subscribe',
          }}
          createSubscription={(data, actions) => {
            return actions.subscription.create({
              plan_id: selectedPriceId as string,
            })
          }}
          onApprove={async (data, actions) => {
            await handlePaymentSuccess()
          }}
          onError={(err) => {
            console.error('PayPal error:', err)
            toast({
              variant: 'destructive',
              title: 'Payment failed',
              description: 'There was an error processing your payment.',
            })
          }}
        />
      </PayPalScriptProvider>
    </div>
  )
}

export default SubscriptionForm