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
                    gatewayId: 'paypal'
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
                const clientId = process.env.PAYPAL_CLIENT_ID!
                const clientSecret = process.env.PAYPAL_CLIENT_SECRET!
                const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

                const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `grant_type=refresh_token&refresh_token=${connection.refreshToken}`,
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
                console.error('Error refreshing PayPal token:', error)
            }

            return NextResponse.json({
                isValid: false,
                status: 'disconnected',
                error: 'Token expired and refresh failed'
            } as PaymentGatewayValidationResponse)
        }

        // Verificar el estado de la cuenta con PayPal
        try {
            const response = await fetch(`https://api-m.sandbox.paypal.com/v2/identity/oauth2/userinfo?schema=paypalv1.1`, {
                headers: {
                    'Authorization': `Bearer ${connection.accessToken}`,
                },
            })

            if (!response.ok) {
                return NextResponse.json({
                    isValid: false,
                    status: 'failed',
                    error: 'Failed to validate PayPal account'
                } as PaymentGatewayValidationResponse)
            }

            return NextResponse.json({
                isValid: true,
                status: 'connected'
            } as PaymentGatewayValidationResponse)
        } catch (error) {
            console.error('Error validating PayPal account:', error)
            return NextResponse.json({
                isValid: false,
                status: 'failed',
                error: 'Error validating PayPal account'
            } as PaymentGatewayValidationResponse)
        }
    } catch (error) {
        console.error('PayPal validation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 