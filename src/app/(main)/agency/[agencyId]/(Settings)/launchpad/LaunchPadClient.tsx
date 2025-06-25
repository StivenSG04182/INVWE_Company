'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { CheckCircleIcon, CreditCard } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import PaymentGatewayModal from '@/components/forms/payment-gateway-modal'
import { PaymentGatewayValidationResponse } from '@/app/api/payment-gateways/payment-gateway-types'
import { paymentGateways } from '@/app/api/payment-gateways/payment-gateways'
import { useToast } from '@/components/ui/use-toast'
import { verifyPaymentGatewayStatus, upsertPaymentGateway } from '@/lib/payment-queries'

interface ClientProps {
    agencyDetails: {
        id: string
        address: string | null
        agencyLogo: string | null
        city: string | null
        companyEmail: string | null
        companyPhone: string | null
        country: string | null
        name: string | null
        state: string | null
        zipCode: string | null
    }
    agencyId: string
    code?: string
}

export default function LaunchPadClient({
    agencyDetails,
    agencyId,
    code,
}: ClientProps) {
    // Aquí van tus hooks, useEffect, useState, etc.
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [gatewayStatus, setGatewayStatus] =
        useState<Record<string, PaymentGatewayValidationResponse>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [hasConnectedGateway, setHasConnectedGateway] = useState(false)
    const [allDetailsExist, setAllDetailsExist] = useState(false)
    const { toast } = useToast()

    // ————————————————
    // VALIDACIÓN DATOS AGENCIA
    // ————————————————
    useEffect(() => {
        const a = agencyDetails
        setAllDetailsExist(
            !!(
                a.address &&
                a.agencyLogo &&
                a.city &&
                a.companyEmail &&
                a.companyPhone &&
                a.country &&
                a.name &&
                a.state &&
                a.zipCode
            )
        )
    }, [agencyDetails])

    // ————————————————
    // VALIDACIÓN PASARELAS
    // ————————————————
    const validateGateways = useCallback(async () => {
        setIsLoading(true)
        try {
            const statusMap: Record<string, PaymentGatewayValidationResponse> = {}
            let hasConnected = false;

            // Verificamos cada pasarela disponible
            for (const gateway of paymentGateways) {
                const status = await verifyPaymentGatewayStatus(agencyId, gateway.id)
                statusMap[gateway.id] = {
                    success: true,
                    isConnected: status.isConnected
                }
                if (status.isConnected) hasConnected = true;
            }

            setHasConnectedGateway(hasConnected)
            setGatewayStatus(statusMap)
        } catch (err: any) {
            console.error(err)
            toast({
                title: 'Error',
                description: 'No se pudieron validar las pasarelas de pago',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }, [agencyId, toast])

    useEffect(() => {
        validateGateways()
    }, [agencyId, validateGateways])

    // ————————————————
    // CALLBACK OAUTH
    // ————————————————
    useEffect(() => {
        if (!code) return

        const lastId =
            typeof window !== 'undefined'
                ? localStorage.getItem('lastGatewayId')
                : null

        if (window.history.replaceState) {
            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            )
        }

        const referrer = document.referrer
        const gwId =
            lastId ||
            paymentGateways.find((g) => referrer.includes(g.id))?.id ||
            paymentGateways[0].id

        handleGatewaySelect(gwId, code)
        localStorage.removeItem('lastGatewayId')
        localStorage.removeItem('authStartTime')

        if (window.opener) {
            window.opener.postMessage(
                { type: 'GATEWAY_AUTH_COMPLETE', gatewayId: gwId },
                window.location.origin
            )
            setTimeout(() => window.close(), 1500)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code])

    useEffect(() => {
        function onMsg(e: MessageEvent) {
            if (e.origin !== window.location.origin) return
            if (
                e.data.type === 'GATEWAY_AUTH_COMPLETE' ||
                e.data.type === 'GATEWAY_AUTH_ERROR'
            ) {
                validateGateways()
            }
        }
        window.addEventListener('message', onMsg)
        return () => window.removeEventListener('message', onMsg)
    }, [validateGateways])

    // Reemplazamos handleGatewaySelect con la nueva implementación
    const handleGatewaySelect = async (
        gatewayId: string,
        codeParam?: string
    ) => {
        setIsLoading(true)
        if (codeParam) {
            try {
                await upsertPaymentGateway(agencyId, {
                    gatewayId,
                    status: 'ACTIVE',
                    accountId: codeParam,
                    accessToken: codeParam, // Temporal, esto debería manejarse por la pasarela específica
                })

                toast({
                    title: 'Pasarela conectada',
                    description: `La pasarela ${paymentGateways.find((g) => g.id === gatewayId)?.name || gatewayId} se conectó correctamente.`,
                })
                
                validateGateways()
            } catch (err: any) {
                console.error(err)
                toast({
                    title: 'Error de conexión',
                    description: err.message || 'Error desconocido',
                    variant: 'destructive',
                })
            }
        } else {
            const gw = paymentGateways.find((g) => g.id === gatewayId)
            if (!gw) return

            try {
                // Creamos una conexión pendiente
                await upsertPaymentGateway(agencyId, {
                    gatewayId,
                    status: 'PENDING'
                })

                localStorage.setItem('lastGatewayId', gatewayId)
                localStorage.setItem('authStartTime', Date.now().toString())
                
                const win = window.open(gw.authUrl(agencyId), '_blank')
                if (win) {
                    const iv = setInterval(() => {
                        if (win.closed) {
                            clearInterval(iv)
                            const start = parseInt(localStorage.getItem('authStartTime') || '0')
                            if (Date.now() - start < 10000) {
                                toast({
                                    title: 'Cancelado',
                                    description: 'No se completó la configuración',
                                    variant: 'destructive',
                                })
                            }
                            localStorage.removeItem('authStartTime')
                            validateGateways()
                        }
                    }, 1000)
                }
            } catch (err: any) {
                console.error(err)
                toast({
                    title: 'Error',
                    description: 'No se pudo iniciar la configuración',
                    variant: 'destructive',
                })
            }
        }
        setIsLoading(false)
    }

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="w-full max-w-[800px]">
                <Card className="border-none">
                    <CardHeader>
                        <CardTitle>¡Comencemos!</CardTitle>
                        <CardDescription>
                            Sigue estos pasos para configurar tu cuenta correctamente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {/* Paso 1: Pasarela */}
                        <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
                            <div className="flex md:items-center gap-4 flex-col md:flex-row">
                                <CreditCard className="w-12 h-12 text-primary" />
                                <div className="flex flex-col gap-1">
                                    <p>Configura tu pasarela de pago</p>
                                    <p className="text-sm text-muted-foreground">
                                        {hasConnectedGateway
                                            ? 'Pasarela conectada'
                                            : 'Sin pasarela conectada'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {hasConnectedGateway && (
                                    <CheckCircleIcon
                                        size={50}
                                        className="text-primary p-2 flex-shrink-0"
                                    />
                                )}
                                <Button onClick={() => setIsModalOpen(true)}>
                                    {hasConnectedGateway ? 'Gestionar' : 'Conectar'}
                                </Button>
                            </div>
                        </div>

                        {/* Paso 2: Datos de agencia */}
                        <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
                            <div className="flex md:items-center gap-4 flex-col md:flex-row">
                                <Image
                                    src={agencyDetails.agencyLogo!}
                                    alt="Logo agencia"
                                    height={80}
                                    width={80}
                                    className="rounded-md object-contain"
                                />
                                <p>Completa todos los detalles de tu negocio</p>
                            </div>
                            {allDetailsExist ? (
                                <CheckCircleIcon
                                    size={50}
                                    className="text-primary p-2 flex-shrink-0"
                                />
                            ) : (
                                <Link
                                    href={`/agency/${agencyId}/settings`}
                                    className="bg-primary p-2 px-4 rounded-md text-white"
                                >
                                    Comenzar
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <PaymentGatewayModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                agencyId={agencyId}
                onSelectGateway={(gw) => handleGatewaySelect(gw)}
                gatewayStatus={gatewayStatus}
                isLoading={isLoading}
            />
        </div>
    )
}
