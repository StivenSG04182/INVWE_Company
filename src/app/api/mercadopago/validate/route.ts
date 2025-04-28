import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PaymentGatewayValidationResponse } from '@/app/api/payment-gateways/payment-gateway-types'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const agencyId = searchParams.get('agencyId')

        if (!agencyId) {
            return NextResponse.json(
                { error: 'Missing agencyId parameter' },
                { status: 400 }
            )
        }

        // Obtener la conexión de la base de datos
        const connection = await db.paymentGatewayConnection.findUnique({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId: 'mercadopago'
                }
            }
        })

        if (!connection) {
            return NextResponse.json({
                isValid: false,
                status: 'disconnected'
            } as PaymentGatewayValidationResponse)
        }

        // Verificar si el token ha expirado
        if (connection.expiresAt && connection.expiresAt < new Date()) {
            // Intentar refrescar el token
            try {
                const clientId = process.env.MERCADOPAGO_CLIENT_ID!
                const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET!

                const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        grant_type: 'refresh_token',
                        refresh_token: connection.refreshToken!,
                        client_id: clientId,
                        client_secret: clientSecret
                    })
                })

                const tokenData = await tokenResponse.json()

                if (tokenResponse.ok) {
                    // Actualizar el token en la base de datos
                    await db.paymentGatewayConnection.update({
                        where: { id: connection.id },
                        data: {
                            accessToken: tokenData.access_token,
                            refreshToken: tokenData.refresh_token,
                            expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
                        }
                    })

                    return NextResponse.json({
                        isValid: true,
                        status: 'connected'
                    } as PaymentGatewayValidationResponse)
                }
            } catch (error) {
                console.error('Error refreshing Mercado Pago token:', error)
            }

            return NextResponse.json({
                isValid: false,
                status: 'disconnected',
                error: 'Token expired and refresh failed'
            } as PaymentGatewayValidationResponse)
        }

        // Verificar el estado de la cuenta con Mercado Pago
        try {
            const response = await fetch('https://api.mercadopago.com/users/me', {
                headers: {
                    'Authorization': `Bearer ${connection.accessToken}`,
                },
            })

            if (!response.ok) {
                return NextResponse.json({
                    isValid: false,
                    status: 'failed',
                    error: 'Failed to validate Mercado Pago account'
                } as PaymentGatewayValidationResponse)
            }

            return NextResponse.json({
                isValid: true,
                status: 'connected'
            } as PaymentGatewayValidationResponse)
        } catch (error) {
            console.error('Error validating Mercado Pago account:', error)
            return NextResponse.json({
                isValid: false,
                status: 'failed',
                error: 'Error validating Mercado Pago account'
            } as PaymentGatewayValidationResponse)
        }
    } catch (error) {
        console.error('Mercado Pago validation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 