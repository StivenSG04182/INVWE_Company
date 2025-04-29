'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircleIcon, CreditCard } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import PaymentGatewayModal from '@/components/forms/payment-gateway-modal'
import { PaymentGatewayValidationResponse } from '@/app/api/payment-gateways/payment-gateway-types'
import { paymentGateways } from '@/app/api/payment-gateways/payment-gateways'
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
    const [hasConnectedGateway, setHasConnectedGateway] = useState(false)
    const { toast } = useToast()
    const allDetailsExist = agencyDetails ? (
        agencyDetails.address &&
        agencyDetails.agencyLogo &&
        agencyDetails.city &&
        agencyDetails.companyEmail &&
        agencyDetails.companyPhone &&
        agencyDetails.country &&
        agencyDetails.name &&
        agencyDetails.state &&
        agencyDetails.zipCode
    ) : false

    // Efecto para cargar los detalles de la agencia
    useEffect(() => {
        const getAgencyDetails = async () => {
            try {
                const response = await fetch(`/api/agency/${params.agencyId}`)
                const data = await response.json()
                if (data && data.success) {
                    // Guardamos los datos de la agencia directamente para facilitar el acceso
                    setAgencyDetails(data.agency)
                    console.log('Datos de agencia cargados:', data.agency)
                }
            } catch (error) {
                console.error('Error loading agency details:', error)
            }
        }
        
        getAgencyDetails()
    }, [params.agencyId])
    
    // Efecto para PWA eliminado: ya no se requiere esta funcionalidad

    
    // Función para validar las pasarelas de pago consultando directamente en la base de datos
    const validateGateways = async () => {
        try {
            // Mostrar indicador de carga al iniciar la validación
            setIsLoading(true)

            // Consultar directamente si existe alguna pasarela conectada para esta agencia
            const response = await fetch(`/api/agency/${params.agencyId}/payment-gateways`)
            const data = await response.json()
            
            if (data.success) {
                // Verificar si hay alguna pasarela con status 'connected'
                const connectedGateways = data.connections.filter(
                    (connection: any) => connection.status === 'connected'
                )
                
                // Actualizar el estado de conexión de pasarelas
                setHasConnectedGateway(connectedGateways.length > 0)
                
                // Actualizar el estado detallado de cada pasarela
                const gatewayStatusMap: Record<string, PaymentGatewayValidationResponse> = {}
                
                // Inicializar todas las pasarelas como no conectadas
                paymentGateways.forEach(gateway => {
                    gatewayStatusMap[gateway.id] = {
                        success: true,
                        isValid: false,
                        isConnected: false,
                        status: 'not_connected'
                    }
                })
                
                // Actualizar el estado de las pasarelas conectadas
                connectedGateways.forEach((connection: any) => {
                    gatewayStatusMap[connection.gatewayId] = {
                        success: true,
                        isValid: true,
                        isConnected: true,
                        status: 'connected'
                    }
                })
                
                setGatewayStatus(gatewayStatusMap)
            } else {
                throw new Error(data.error || 'Error al consultar pasarelas de pago')
            }
        } catch (error) {
            console.error('Error validating gateways:', error)
            toast({
                title: 'Error',
                description: 'No se pudieron validar las pasarelas de pago',
                variant: 'destructive'
            })
        } finally {
            // Finalizar la carga después de la validación
            setIsLoading(false)
        }
    }

    // Efecto para validar las pasarelas de pago al cargar el componente
    useEffect(() => {
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
            
            // Limpiar el código de la URL para evitar procesamiento repetido
            if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
            }
            
            // Procesar la autenticación
            handleGatewaySelect(gatewayId)
            
            // Limpiar datos de localStorage para evitar procesamiento repetido
            if (typeof window !== 'undefined') {
                localStorage.removeItem('lastGatewayId')
                localStorage.removeItem('authStartTime')
            }
            
            // Cerrar esta ventana si fue abierta como una nueva pestaña
            if (window.opener) {
                try {
                    window.opener.postMessage({ type: 'GATEWAY_AUTH_COMPLETE', gatewayId }, window.location.origin)
                    setTimeout(() => window.close(), 2000)
                } catch (error) {
                    console.error('Error al comunicarse con la ventana principal:', error)
                }
            }
        } else if (lastGatewayId && document.referrer) {
            // Si no hay código pero hay un ID de pasarela guardado y venimos de una redirección,
            // probablemente hubo un error en la autenticación
            toast({
                title: 'Error de autenticación',
                description: `No se pudo completar la autenticación con la pasarela ${paymentGateways.find(g => g.id === lastGatewayId)?.name || lastGatewayId}`,
                variant: 'destructive'
            })

            // Limpiar todos los datos guardados
            if (typeof window !== 'undefined') {
                localStorage.removeItem('lastGatewayId')
                localStorage.removeItem('authStartTime')
            }

            setIsLoading(false)
            
            // Cerrar esta ventana si fue abierta como una nueva pestaña
            if (window.opener) {
                try {
                    window.opener.postMessage({ type: 'GATEWAY_AUTH_ERROR', gatewayId: lastGatewayId }, window.location.origin)
                    setTimeout(() => window.close(), 2000)
                } catch (error) {
                    console.error('Error al comunicarse con la ventana principal:', error)
                }
            }
            
            // Actualizar el estado de las pasarelas consultando la base de datos
            validateGateways()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.code]) // Evitamos dependencia circular con handleGatewaySelect
    
    // Efecto para escuchar mensajes de la ventana de autenticación
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Verificar que el mensaje viene de nuestro origen
            if (event.origin !== window.location.origin) return
            
            // Procesar mensajes de la ventana de autenticación
            if (event.data.type === 'GATEWAY_AUTH_COMPLETE' || event.data.type === 'GATEWAY_AUTH_ERROR') {
                // Actualizar el estado de las pasarelas consultando la base de datos
                validateGateways()
            }
        }
        
        // Agregar el listener de mensajes
        window.addEventListener('message', handleMessage)
        
        // Limpiar el listener cuando el componente se desmonte
        return () => {
            window.removeEventListener('message', handleMessage)
        }
    }, []) // No incluimos validateGateways en las dependencias para evitar bucles infinitos

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
                    // Mostrar un mensaje de éxito con toast
                    toast({
                        title: 'Pasarela conectada',
                        description: `La pasarela ${paymentGateways.find(g => g.id === gatewayId)?.name || gatewayId} ha sido conectada correctamente`,
                        variant: 'default'
                    })
                    
                    // Actualizar el estado de las pasarelas consultando la base de datos
                    validateGateways()
                } else {
                    // Mostrar mensaje de error con toast
                    toast({
                        title: 'Error de conexión',
                        description: `No se pudo conectar la pasarela ${paymentGateways.find(g => g.id === gatewayId)?.name || gatewayId}: ${data.error || 'Error desconocido'}`,
                        variant: 'destructive'
                    })

                    console.error(`Error al conectar pasarela ${gatewayId}:`, data.error)
                    
                    // Actualizar el estado de las pasarelas consultando la base de datos
                    validateGateways()
                }
            } catch (error) {
                console.error('Error connecting gateway:', error)

                // Mostrar mensaje de error con toast
                toast({
                    title: 'Error de conexión',
                    description: `Ocurrió un error al conectar con la pasarela ${paymentGateways.find(g => g.id === gatewayId)?.name || gatewayId}`,
                    variant: 'destructive'
                })
                
                // Actualizar el estado de las pasarelas consultando la base de datos
                validateGateways()
            } finally {
                // Finalizar el indicador de carga
                setIsLoading(false)
            }
        } else {
            // Si no hay código, abrir la página de autenticación de la pasarela en una nueva pestaña
            const gateway = paymentGateways.find(g => g.id === gatewayId)
            if (gateway) {
                // Guardar el ID de la pasarela en localStorage para recuperarlo después
                localStorage.setItem('lastGatewayId', gatewayId)
                
                // Guardar el timestamp de inicio del proceso de autenticación
                const authStartTime = new Date().getTime()
                localStorage.setItem('authStartTime', authStartTime.toString())

                // Abrir la URL de autenticación en una nueva pestaña
                const authWindow = window.open(gateway.authUrl(params.agencyId), '_blank')
                
                // Configurar un intervalo para verificar si la ventana se ha cerrado
                if (authWindow) {
                    const checkWindowClosed = setInterval(() => {
                        if (authWindow.closed) {
                            clearInterval(checkWindowClosed)
                            
                            // Verificar si ha pasado un tiempo razonable desde que se inició la autenticación
                            const currentTime = new Date().getTime()
                            const authStartTime = parseInt(localStorage.getItem('authStartTime') || '0')
                            const timeElapsed = currentTime - authStartTime
                            
                            // Si han pasado menos de 10 segundos, consideramos que el usuario cerró la ventana sin completar
                            if (timeElapsed < 10000 && localStorage.getItem('lastGatewayId')) {
                                const canceledGatewayId = localStorage.getItem('lastGatewayId') || gatewayId
                                
                                // Mostrar mensaje de que no se completó el proceso
                                toast({
                                    title: 'Proceso cancelado',
                                    description: `No se completó el proceso de configuración con la pasarela ${paymentGateways.find(g => g.id === canceledGatewayId)?.name || canceledGatewayId}`,
                                    variant: 'destructive'
                                })
                            }
                            
                            // Limpiar datos de autenticación
                            localStorage.removeItem('authStartTime')
                            
                            // Actualizar el estado de las pasarelas cuando la ventana se cierre
                            validateGateways()
                        }
                    }, 1000)
                }
            }
        }
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
                                    <div className="flex flex-wrap gap-1 justify-center items-center">
                                        <CreditCard className='w-12 h-12 text-primary' />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p>Configura tu pasarela de pago</p>
                                    <p className="text-sm text-muted-foreground">
                                        {hasConnectedGateway ? 'Pasarela conectada' : 'Sin pasarela conectada'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {hasConnectedGateway && (
                                    <CheckCircleIcon size={50} className="text-primary p-2 flex-shrink-0" />
                                )}
                                {!hasConnectedGateway && (
                                    <Button onClick={() => setIsModalOpen(true)}>
                                        Conectar
                                    </Button>
                                )}
                                {hasConnectedGateway && (
                                    <Button 
                                        onClick={() => setIsModalOpen(true)}
                                        variant="outline"
                                    >
                                        Gestionar
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className='flex justify-between items-center w-full border p-4 rounded-lg gap-2'>
                            <div className='flex md:items-center gap-4 flex-col md:!flex-row'>
                                {agencyDetails?.agencyLogo ? (
                                    <Image 
                                        src={agencyDetails.agencyLogo} 
                                        alt='app logo' 
                                        height={80} 
                                        width={80} 
                                        className='rounded-md object-contain' 
                                        onError={(e) => {
                                            console.error('Error cargando logo:', agencyDetails.agencyLogo);
                                            // Fallback para cuando el logo no se puede cargar
                                            e.currentTarget.src = '/placeholder-logo.png';
                                        }}
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                                        <p className="text-gray-500 text-xs">Sin logo</p>
                                    </div>
                                )}
                                <p> Rellene todos los datos de su empresa </p>
                            </div>
                            {allDetailsExist ? (
                                <CheckCircleIcon size={50} className='text-primary p-2 flex-shrink-0'/>
                            ) : (
                                <Link 
                                className='bg-primary p-2 px-4 rounded-md text-white'
                                href={`/agency/${params.agencyId}/settings`}>Configurar</Link>
                            )}
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