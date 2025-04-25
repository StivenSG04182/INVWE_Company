'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { paypal } from '@/lib/paypal'
import { CheckCircleIcon, XCircleIcon, CreditCard, SmartphoneIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import PaymentGatewayModal from '@/components/global/payment-gateway-modal'
import { PaymentGatewayValidationResponse } from '@/lib/payment-gateway-types'
import { paymentGateways } from '@/lib/payment-gateways'
import { useToast } from '@/components/ui/use-toast'

type Props = {
    params: {
        agencyId: string
    }
    searchParams: { code: string }
}

const LaunchPadPage = ({ params, searchParams }: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [gatewayStatus, setGatewayStatus] = useState<Record<string, PaymentGatewayValidationResponse>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [agencyDetails, setAgencyDetails] = useState<any>(null)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const { toast } = useToast()

    // Efecto para cargar los detalles de la agencia
    useEffect(() => {
        const getAgencyDetails = async () => {
            try {
                const response = await fetch(`/api/agency/${params.agencyId}`)
                const data = await response.json()
                if (data) {
                    setAgencyDetails(data)
                }
            } catch (error) {
                console.error('Error loading agency details:', error)
            }
        }
        
        getAgencyDetails()
    }, [params.agencyId])
    
    // Efecto para detectar si el sitio puede instalarse como PWA
    useEffect(() => {
        // Guardar el evento beforeinstallprompt para usarlo después
        const handleBeforeInstallPrompt = (e: any) => {
            // Prevenir que Chrome muestre el diálogo automáticamente
            e.preventDefault()
            // Guardar el evento para usarlo después
            setDeferredPrompt(e)
        }
        
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])
    
    // Función para instalar la PWA
    const installPWA = async () => {
        if (!deferredPrompt) {
            // Si no hay un evento guardado, mostrar instrucciones manuales
            toast({
                title: 'Instalación manual',
                description: 'Para instalar la aplicación, usa la opción "Añadir a pantalla de inicio" en el menú de tu navegador.',
                variant: 'default'
            })
            return
        }
        
        // Mostrar el diálogo de instalación
        deferredPrompt.prompt()
        
        // Esperar a que el usuario responda al diálogo
        const choiceResult = await deferredPrompt.userChoice
        
        if (choiceResult.outcome === 'accepted') {
            toast({
                title: 'Instalación exitosa',
                description: 'La aplicación se ha instalado correctamente en tu dispositivo.',
                variant: 'default'
            })
        }
        
        // Limpiar el evento guardado
        setDeferredPrompt(null)
    }
    
    // Efecto para validar las pasarelas de pago
    useEffect(() => {
        const validateGateways = async () => {
            try {
                // Verificar si hay un código de autenticación en la URL
                // Si lo hay, no mostrar el indicador de carga para todas las pasarelas
                // ya que se mostrará específicamente para la pasarela que se está autenticando
                if (!searchParams.code) {
                    setIsLoading(true)
                }

                const validations = await Promise.all(
                    paymentGateways.map(async (gateway) => {
                        const response = await fetch(`/api/payment-gateways/${gateway.id}/validate?agencyId=${params.agencyId}`)
                        const data = await response.json()
                        return [gateway.id, data]
                    })
                )

                setGatewayStatus(Object.fromEntries(validations))
            } catch (error) {
                console.error('Error validating gateways:', error)
                toast({
                    title: 'Error',
                    description: 'No se pudieron validar las pasarelas de pago',
                    variant: 'destructive'
                })
            } finally {
                // Solo finalizar la carga si no hay un código de autenticación en proceso
                if (!searchParams.code) {
                    setIsLoading(false)
                }
            }
        }

        validateGateways()
    }, [params.agencyId])

    // Efecto para procesar el código de autenticación cuando se regresa de la pasarela
    useEffect(() => {
        // Recuperar el ID de la pasarela guardado antes de la redirección
        const lastGatewayId = typeof window !== 'undefined' ? localStorage.getItem('lastGatewayId') : null

        // Procesar el código de autenticación si existe en la URL
        if (searchParams.code) {
            // Intentar determinar qué pasarela se está autenticando
            // Primero intentamos usar el ID guardado en localStorage
            // Si no está disponible, intentamos determinarlo por la URL de referencia
            // Si todo falla, usamos PayPal como valor predeterminado
            const referrer = document.referrer
            const gatewayId = lastGatewayId ||
                paymentGateways.find(g => referrer.includes(g.id))?.id ||
                'paypal'

            // Mostrar un indicador de carga mientras procesamos la autenticación
            setIsLoading(true)
            handleGatewaySelect(gatewayId)
        } else if (lastGatewayId && document.referrer) {
            // Si no hay código pero hay un ID de pasarela guardado y venimos de una redirección,
            // probablemente hubo un error en la autenticación
            toast({
                title: 'Error de autenticación',
                description: `No se pudo completar la autenticación con la pasarela ${paymentGateways.find(g => g.id === lastGatewayId)?.name || lastGatewayId}`,
                variant: 'destructive'
            })

            // Limpiar el ID guardado
            if (typeof window !== 'undefined') {
                localStorage.removeItem('lastGatewayId')
            }

            // Actualizar el estado de la pasarela a error
            setGatewayStatus(prev => ({
                ...prev,
                [lastGatewayId]: {
                    isValid: false,
                    status: 'error',
                    error: 'Error de autenticación'
                }
            }))

            setIsLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.code]) // Este efecto solo se ejecuta cuando cambia el código

    const handleGatewaySelect = async (gatewayId: string) => {
        if (searchParams.code) {
            try {
                const response = await fetch(`/api/payment-gateways/${gatewayId}/auth`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code: searchParams.code,
                        agencyId: params.agencyId,
                    }),
                })

                const data = await response.json()

                if (data.success) {
                    // Actualizar el estado de la pasarela a conectada
                    setGatewayStatus(prev => ({
                        ...prev,
                        [gatewayId]: {
                            isValid: true,
                            status: 'connected'
                        }
                    }))

                    // Mostrar un mensaje de éxito con toast
                    toast({
                        title: 'Pasarela conectada',
                        description: `La pasarela ${paymentGateways.find(g => g.id === gatewayId)?.name || gatewayId} ha sido conectada correctamente`,
                        variant: 'default'
                    })
                } else {
                    // Actualizar el estado de la pasarela a error
                    setGatewayStatus(prev => ({
                        ...prev,
                        [gatewayId]: {
                            isValid: false,
                            status: 'error',
                            error: data.error || 'Error desconocido'
                        }
                    }))

                    // Mostrar mensaje de error con toast
                    toast({
                        title: 'Error de conexión',
                        description: `No se pudo conectar la pasarela ${paymentGateways.find(g => g.id === gatewayId)?.name || gatewayId}: ${data.error || 'Error desconocido'}`,
                        variant: 'destructive'
                    })

                    console.error(`Error al conectar pasarela ${gatewayId}:`, data.error)
                }
            } catch (error) {
                console.error('Error connecting gateway:', error)

                // Actualizar el estado de la pasarela a error
                setGatewayStatus(prev => ({
                    ...prev,
                    [gatewayId]: {
                        isValid: false,
                        status: 'error',
                        error: 'Error de conexión'
                    }
                }))

                // Mostrar mensaje de error con toast
                toast({
                    title: 'Error de conexión',
                    description: `Ocurrió un error al conectar con la pasarela ${paymentGateways.find(g => g.id === gatewayId)?.name || gatewayId}`,
                    variant: 'destructive'
                })
            } finally {
                // Finalizar el indicador de carga
                setIsLoading(false)
            }
        } else {
            // Si no hay código, redirigir a la página de autenticación de la pasarela
            const gateway = paymentGateways.find(g => g.id === gatewayId)
            if (gateway) {
                // Guardar el ID de la pasarela en localStorage para recuperarlo después de la redirección
                localStorage.setItem('lastGatewayId', gatewayId)

                // Redirigir a la URL de autenticación
                window.location.href = gateway.authUrl(params.agencyId)
            }
        }
    }

    const getConnectedGatewaysCount = () => {
        return Object.values(gatewayStatus).filter(
            status => status?.isValid && status?.status === 'connected'
        ).length
    }

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="w-full h-full max-w-[800px]">
                <Card className="border-none">
                    <CardHeader>
                        <CardTitle>¡Comencemos!</CardTitle>
                        <CardDescription>
                            Sigue estos pasos para configurar tu cuenta correctamente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
                            <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                                <div className="relative w-20 h-20 flex items-center justify-center">
                                    <SmartphoneIcon className="w-12 h-12 text-primary" />
                                </div>
                                <p>Guarda el sitio web como acceso directo en tu dispositivo móvil</p>
                            </div>
                            <Button onClick={installPWA}>Instalar</Button>
                        </div>

                        <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
                            <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                                <div className="relative w-20 h-20 flex items-center justify-center">
                                    <div className="flex flex-wrap gap-1 justify-center items-center">
                                        {paymentGateways.map((gateway) => (
                                            <div key={gateway.id} className="relative">
                                                <Image 
                                                    src={gateway.logo} 
                                                    alt={`${gateway.name} logo`} 
                                                    height={30} 
                                                    width={30} 
                                                    className="rounded-md object-contain border p-1" 
                                                />
                                                {gatewayStatus[gateway.id]?.isValid && gatewayStatus[gateway.id]?.status === 'connected' && (
                                                    <CheckCircleIcon className="absolute -top-1 -right-1 text-primary bg-background rounded-full" size={12} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p>Configura tus pasarelas de pago</p>
                                    <p className="text-sm text-muted-foreground">
                                        {getConnectedGatewaysCount()} pasarelas conectadas
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {getConnectedGatewaysCount() > 0 && (
                                    <CheckCircleIcon size={20} className="text-primary" />
                                )}
                                <Button onClick={() => setIsModalOpen(true)}>
                                    {getConnectedGatewaysCount() > 0 ? 'Gestionar' : 'Conectar'}
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
                            <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                                <Image 
                                    src={agencyDetails?.agencyLogo || "/agency-logo.png"} 
                                    alt="Logo de la agencia" 
                                    height={80} 
                                    width={80} 
                                    className="rounded-md object-contain" 
                                />
                                <p>Completa los detalles de tu negocio</p>
                            </div>
                            <Link
                                className="bg-primary p-2 px-4 rounded-md text-white"
                                href={`/agency/${params.agencyId}/settings`}
                            >
                                Iniciar
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <PaymentGatewayModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                agencyId={params.agencyId}
                onSelectGateway={handleGatewaySelect}
                gatewayStatus={gatewayStatus}
                isLoading={isLoading}
            />
        </div>
    )
}

export default LaunchPadPage