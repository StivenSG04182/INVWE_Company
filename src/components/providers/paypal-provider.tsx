'use client'
import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import React from 'react'

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""

export const PayPalProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <PayPalScriptProvider
      options={{
        "client-id": PAYPAL_CLIENT_ID,
        clientId: PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "subscription",
      }}
    >
      {children}
    </PayPalScriptProvider>
  )
} 