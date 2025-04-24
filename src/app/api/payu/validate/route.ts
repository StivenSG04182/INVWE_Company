import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PaymentGatewayValidationResponse } from '@/lib/payment-gateway-types'

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
                    gatewayId: 'payu'
                }
            }
        })

        if (!connection) {
            return NextResponse.json({
                isValid: false,
                status: 'disconnected'
            } as PaymentGatewayValidationResponse)
        }

        // Verificar el estado de la cuenta con PayU
        try {
            const apiKey = connection.accessToken!
            const apiLogin = connection.metadata?.apiLogin
            const merchantId = connection.metadata?.merchantId

            const response = await fetch('https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${apiLogin}:${apiKey}`).toString('base64')}`,
                },
                body: JSON.stringify({
                    language: 'es',
                    command: 'GET_BANK_LIST',
                    merchant: {
                        apiKey,
                        apiLogin
                    },
                    test: true
                })
            })

            if (!response.ok) {
                return NextResponse.json({
                    isValid: false,
                    status: 'failed',
                    error: 'Failed to validate PayU account'
                } as PaymentGatewayValidationResponse)
            }

            return NextResponse.json({
                isValid: true,
                status: 'connected'
            } as PaymentGatewayValidationResponse)
        } catch (error) {
            console.error('Error validating PayU account:', error)
            return NextResponse.json({
                isValid: false,
                status: 'failed',
                error: 'Error validating PayU account'
            } as PaymentGatewayValidationResponse)
        }
    } catch (error) {
        console.error('PayU validation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 