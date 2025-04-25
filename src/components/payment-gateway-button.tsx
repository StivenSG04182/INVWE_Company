'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PaymentGatewayModal } from './payment-gateway-modal'

type PaymentGatewayButtonProps = {
  entityType: 'agency' | 'subaccount'
  entityId: string
  isConnected: boolean
}

export function PaymentGatewayButton({
  entityType,
  entityId,
  isConnected
}: PaymentGatewayButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (isConnected) {
    return null
  }

  return (
    <>
      <Button
        className="bg-primary py-2 px-4 rounded-md text-white"
        onClick={() => setIsModalOpen(true)}
      >
        Iniciar
      </Button>
      
      <PaymentGatewayModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        entityType={entityType}
        entityId={entityId}
      />
    </>
  )
}