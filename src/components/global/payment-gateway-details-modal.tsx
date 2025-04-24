import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { paymentGateways } from '@/lib/payment-gateways'

type Props = {
  isOpen: boolean
  onClose: () => void
  gatewayId: string
  onConfirm: () => void
}

const PaymentGatewayDetailsModal = ({ 
  isOpen, 
  onClose, 
  gatewayId,
  onConfirm
}: Props) => {
  const gateway = paymentGateways.find(g => g.id === gatewayId)

  if (!gateway) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles de {gateway.name}</DialogTitle>
          <DialogDescription>
            Revisa los detalles y tarifas de {gateway.name}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center mb-6">
            <Image 
              src={gateway.logo} 
              alt={`${gateway.name} logo`} 
              height={80} 
              width={80} 
              className="rounded-md object-contain mr-4"
            />
            <div>
              <h3 className="font-medium text-lg">{gateway.name}</h3>
              <p className="text-sm text-muted-foreground">{gateway.description}</p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-4">Tarifas</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Porcentaje por transacción</span>
                <span className="font-medium">{gateway.fees.percentage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cargo fijo por transacción</span>
                <span className="font-medium">{gateway.fees.fixed} {gateway.fees.currency}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            Conectar con {gateway.name}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentGatewayDetailsModal 