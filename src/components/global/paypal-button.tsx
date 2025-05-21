'use client'

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useState } from 'react'
import { toast } from 'sonner'

interface PayPalButtonProps {
  amount: number
  onSuccess: (details: any) => void
  onError: (error: any) => void
}

export const PayPalButton = ({ amount, onSuccess, onError }: PayPalButtonProps) => {
  const [error, setError] = useState<string | null>(null)

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    currency: 'USD',
    intent: 'capture',
  }

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount.toString(),
            currency_code: 'USD',
          },
        },
      ],
    })
  }

  const onApprove = async (data: any, actions: any) => {
    try {
      const details = await actions.order.capture()
      onSuccess(details)
      toast.success('Payment successful!')
    } catch (error) {
      setError('Payment failed. Please try again.')
      onError(error)
      toast.error('Payment failed. Please try again.')
    }
  }

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="w-full">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <PayPalButtons
          style={{ layout: 'vertical' }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err) => {
            setError(err.message)
            onError(err)
            toast.error('An error occurred with PayPal')
          }}
        />
      </div>
    </PayPalScriptProvider>
  )
} 