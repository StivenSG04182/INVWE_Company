'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { paymentGateways } from '@/app/api/payment-gateways/payment-gateways'
import { PaymentGatewayValidationResponse } from '@/app/api/payment-gateways/payment-gateway-types'
import { CheckCircleIcon, XCircleIcon, CreditCard, Loader2Icon } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

type Props = {
  isOpen: boolean
  onClose: () => void
  agencyId: string
  onSelectGateway: (gatewayId: string) => void
  gatewayStatus?: Record<string, PaymentGatewayValidationResponse>
  isLoading?: boolean
}

const PaymentGatewayModal = ({ 
  isOpen, 
  onClose, 
  agencyId, 
  onSelectGateway,
  gatewayStatus = {},
  isLoading = false
}: Props) => {
  const [showGateways, setShowGateways] = useState(false)
  const { toast } = useToast()

  const handleGatewaySelect = async (gatewayId: string) => {
    try {
      // Verificamos primero si la pasarela ya está conectada
      const response = await fetch(`/api/payment-gateways/${gatewayId}/validate?agencyId=${agencyId}`)
      const data = await response.json()

      if (data.isValid && data.status === 'connected') {
        toast({
          title: 'Pasarela conectada',
          description: 'La pasarela de pagos está conectada correctamente',
        })
        
        // Si ya está conectada, simplemente notificamos al componente padre
        onSelectGateway(gatewayId)
      } else {
        // Si no está conectada, iniciamos el proceso de autenticación
        toast({
          title: 'Iniciando conexión',
          description: `Se abrirá una nueva pestaña para autenticación con ${paymentGateways.find(g => g.id === gatewayId)?.name || gatewayId}`,
        })
        
        // Guardar el ID de la pasarela en localStorage antes de abrir la nueva ventana
        if (typeof window !== 'undefined') {
          localStorage.setItem('lastGatewayId', gatewayId)
          
          // Guardar el timestamp de inicio del proceso de autenticación
          const authStartTime = new Date().getTime()
          localStorage.setItem('authStartTime', authStartTime.toString())
        }
        
        // Obtener la URL de autenticación de la pasarela
        const gateway = paymentGateways.find(g => g.id === gatewayId)
        if (gateway) {
          // Abrir la URL de autenticación en una nueva pestaña
          const authWindow = window.open(gateway.authUrl(agencyId), '_blank')
          
          // Cerramos el modal después de abrir la nueva pestaña
          onClose()
          
          // No configuramos un intervalo aquí para evitar múltiples llamadas
          // La actualización se manejará a través del sistema de mensajes en el componente principal
        }
      }
    } catch (error) {
      console.error('Error validating gateway:', error)
      toast({
        title: 'Error',
        description: 'Ocurrió un error al validar la pasarela de pagos',
        variant: 'destructive',
      })
    }
  }

  const handleClose = () => {
    setShowGateways(false)
    
    // Limpiar el ID de la pasarela guardado en localStorage al cerrar el modal
    // para evitar confusiones en futuras autenticaciones
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lastGatewayId')
    }
    
    onClose()
  }

  const getGatewayStatusIcon = (gatewayId: string) => {
    const status = gatewayStatus[gatewayId]
    
    if (isLoading) {
      // Verificar si este gateway específico está siendo procesado
      const lastGatewayId = typeof window !== 'undefined' ? localStorage.getItem('lastGatewayId') : null
      if (lastGatewayId === gatewayId) {
        return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      }
    }

    if (status?.isValid && status?.status === 'connected') {
      return <CheckCircleIcon size={24} className="text-primary" />
    }
    
    if (status?.status === 'error') {
      return <XCircleIcon size={24} className="text-destructive" />
    }

    return <XCircleIcon size={24} className="text-muted-foreground" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        {!showGateways ? (
          <>
            <DialogHeader>
              <DialogTitle>Conectar Pasarelas de Pago</DialogTitle>
              <DialogDescription>
                Conecta tus pasarelas de pago para recibir pagos de tus clientes
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <CreditCard className="h-12 w-12 text-primary" />
              </div>
              <p className="text-center text-muted-foreground">
                Conecta tus pasarelas de pago para comenzar a recibir pagos de tus clientes de manera segura y eficiente.
              </p>
              <Button 
                onClick={() => setShowGateways(true)}
                className="mt-4"
              >
                Comenzar
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Pasarelas de Pago Disponibles</DialogTitle>
              <DialogDescription>
                Selecciona una pasarela de pago para validar su conexión
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 py-4">
              {paymentGateways.map((gateway) => (
                <div key={gateway.id} className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
                  <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                    <div 
                      className={`h-20 w-20 rounded-md flex items-center justify-center text-white font-bold ${gateway.id === 'paypal' ? 'bg-blue-500' : 'bg-[#009ee3]'}`}
                    >
                      {gateway.name}
                    </div>
                    <div>
                      <h3 className="font-medium">{gateway.name}</h3>
                      <p className="text-sm text-muted-foreground">{gateway.description}</p>
                      <p className="text-sm mt-1">
                        Comisión: {gateway.fees.percentage}% + {gateway.fees.fixed} {gateway.fees.currency}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getGatewayStatusIcon(gateway.id)}
                    <div className="flex flex-col items-end gap-1">
                      {gatewayStatus[gateway.id]?.status === 'error' && (
                        <p className="text-xs text-destructive">
                          Error de conexión
                        </p>
                      )}
                      <Button
                        onClick={() => handleGatewaySelect(gateway.id)}
                        variant={(gatewayStatus[gateway.id]?.isValid && gatewayStatus[gateway.id]?.status === 'connected') ? "outline" : "default"}
                      >
                        {(gatewayStatus[gateway.id]?.isValid && gatewayStatus[gateway.id]?.status === 'connected') ? 'Reconectar' : 'Conectar'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PaymentGatewayModal