'use client'

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useState } from 'react'
import { toast } from 'sonner'

interface PayPalButtonProps {
  amount: number
  onSuccess: (details: any) => void
  onError: (error: any) => void
  currency?: string
}

export const PayPalButton = ({ amount, onSuccess, onError, currency = 'USD' }: PayPalButtonProps) => {
  const [error, setError] = useState<string | null>(null)

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    currency: currency,
    intent: 'capture',
  }

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount.toString(),
            currency_code: currency,
          },
        },
      ],
    })
  }

  const onApprove = async (data: any, actions: any) => {
    try {
      setError(null)
      const details = await actions.order.capture()
      onSuccess(details)
      toast.success('Payment successful!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.'
      setError(errorMessage)
      onError(error)
      toast.error(errorMessage)
    }
  }

  const handleError = (err: any) => {
    const errorMessage = err.message || 'An error occurred with PayPal'
    setError(errorMessage)
    onError(err)
    toast.error(errorMessage)
  }

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="w-full">
        {error && (
          <div className="text-red-500 mb-4 p-2 bg-red-50 rounded border border-red-200">
            {error}
          </div>
        )}
        <PayPalButtons
          style={{ layout: 'vertical' }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={handleError}
        />
      </div>
    </PayPalScriptProvider>
  )
} 