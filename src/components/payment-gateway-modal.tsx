'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { getPaymentGatewayOAuthLink } from '@/lib/utils'

type PaymentGateway = {
    id: string
    name: string
    logo: string
    oauthLink: string
}

type PaymentGatewayModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    entityType: 'agency' | 'subaccount'
    entityId: string
    onConnect?: (gatewayId: string) => void
}

export function PaymentGatewayModal({
    open,
    onOpenChange,
    entityType,
    entityId,
    onConnect
}: PaymentGatewayModalProps) {
    const [selectedGateway, setSelectedGateway] = useState<string | null>(null)

    // Función para generar enlaces OAuth para diferentes pasarelas
    const getOAuthLink = (gatewayId: string) => {
        return getPaymentGatewayOAuthLink(gatewayId, entityType, entityId)
    }

    // Lista de pasarelas de pago disponibles
    const paymentGateways: PaymentGateway[] = [
        {
            id: 'wompi',
            name: 'Wompi',
            logo: '/wompilogo.png',
            oauthLink: getOAuthLink('wompi')
        },
        {
            id: 'epayco',
            name: 'ePayco',
            logo: '/epayco-logo.png',
            oauthLink: getOAuthLink('epayco')
        },
        {
            id: 'mercadopago',
            name: 'Mercado Pago',
            logo: '/mercadopago-logo.png',
            oauthLink: getOAuthLink('mercadopago')
        },
        {
            id: 'paypal',
            name: 'PayPal',
            logo: '/paypal-logo.png',
            oauthLink: getOAuthLink('paypal')
        },
        {
            id: 'payu',
            name: 'PayU',
            logo: '/payu-logo.png',
            oauthLink: getOAuthLink('payu')
        }
    ]

    const handleGatewaySelect = (gatewayId: string) => {
        setSelectedGateway(gatewayId)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Selecciona una pasarela de pagos</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {paymentGateways.map((gateway) => (
                        <div
                            key={gateway.id}
                            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${selectedGateway === gateway.id ? 'border-primary bg-primary/10' : ''}`}
                            onClick={() => handleGatewaySelect(gateway.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 relative flex-shrink-0">
                                    <Image
                                        src={gateway.logo}
                                        alt={`${gateway.name} logo`}
                                        fill
                                        className="object-contain"
                                        onError={(e) => {
                                            // Fallback para logos que no existan
                                            e.currentTarget.src = '/placeholder-logo.png'
                                        }}
                                    />
                                </div>
                                <span className="font-medium">{gateway.name}</span>
                            </div>
                            {selectedGateway === gateway.id && (
                                <Link
                                    href={gateway.oauthLink}
                                    className="bg-primary py-2 px-4 rounded-md text-white"
                                    onClick={() => onConnect && onConnect(gateway.id)}
                                >
                                    Conectar
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}