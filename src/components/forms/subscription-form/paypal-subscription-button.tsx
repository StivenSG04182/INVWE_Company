'use client'
import { PayPalButtons } from "@paypal/react-paypal-js"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/db"

type Props = {
  planId: string
  price: string
  agencyId: string
  onSuccess: () => void
  onError: (error: any) => void
}

export const PayPalSubscriptionButton = ({
  planId,
  price,
  agencyId,
  onSuccess,
  onError,
}: Props) => {
  const { toast } = useToast()

  const createSubscription = async () => {
    try {
      const response = await fetch("/api/paypal/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          price,
          agencyId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create subscription')
      }

      const data = await response.json()
      return data.subscriptionId
    } catch (error) {
      console.error("Error creating PayPal subscription:", error)
      throw error
    }
  }

  const onApprove = async (data: any) => {
    try {
      const response = await fetch("/api/paypal/capture-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: data.subscriptionID,
          agencyId,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Your subscription has been activated!",
        })
        onSuccess()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error capturing PayPal subscription:", error)
      onError(error)
    }
  }

  return (
    <PayPalButtons
      style={{
        layout: "vertical",
        color: "blue",
        shape: "rect",
        label: "subscribe",
      }}
      createSubscription={createSubscription}
      onApprove={onApprove}
      onError={(err) => {
        console.error("PayPal error:", err)
        onError(err)
      }}
    />
  )
} 