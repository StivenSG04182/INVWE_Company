import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PaymentGatewayAuthResponse } from '@/lib/payment-gateway-types'

export async function POST(req: Request) {
    try {
        const { code, agencyId } = await req.json()

        if (!code || !agencyId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Obtener token de acceso de PayU
        const merchantId = process.env.PAYU_MERCHANT_ID!
        const apiKey = process.env.PAYU_API_KEY!
        const apiLogin = process.env.PAYU_API_LOGIN!

        const authResponse = await fetch('https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi', {
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

        const authData = await authResponse.json()

        if (!authResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to authenticate with PayU', details: authData },
                { status: 400 }
            )
        }

        // Guardar o actualizar la conexión en la base de datos
        const connection = await db.paymentGatewayConnection.upsert({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId: 'payu'
                }
            },
            create: {
                agencyId,
                gatewayId: 'payu',
                status: 'connected',
                accountId: merchantId,
                accessToken: apiKey,
                metadata: {
                    merchantId,
                    apiLogin
                }
            },
            update: {
                status: 'connected',
                accountId: merchantId,
                accessToken: apiKey,
                metadata: {
                    merchantId,
                    apiLogin
                }
            }
        })

        const response: PaymentGatewayAuthResponse = {
            success: true,
            accountId: connection.accountId,
            accessToken: connection.accessToken,
            metadata: connection.metadata
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('PayU auth error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 