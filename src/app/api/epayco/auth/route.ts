import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PaymentGatewayAuthResponse } from '@/app/api/payment-gateways/payment-gateway-types'

export async function POST(req: Request) {
    try {
        const { code, agencyId } = await req.json()

        if (!code || !agencyId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Obtener credenciales de Epayco
        const publicKey = process.env.EPAYCO_PUBLIC_KEY!
        const privateKey = process.env.EPAYCO_PRIVATE_KEY!

        // Autenticar con Epayco
        const authResponse = await fetch('https://api.secure.payco.co/v1/merchant/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${publicKey}:${privateKey}`).toString('base64')}`,
            },
            body: JSON.stringify({
                merchantId: code
            })
        })

        const authData = await authResponse.json()

        if (!authResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to authenticate with Epayco', details: authData },
                { status: 400 }
            )
        }

        // Guardar o actualizar la conexión en la base de datos
        const connection = await db.paymentGatewayConnection.upsert({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId: 'epayco'
                }
            },
            create: {
                agencyId,
                gatewayId: 'epayco',
                status: 'connected',
                accountId: code,
                accessToken: publicKey,
                metadata: {
                    merchantId: code,
                    merchantName: authData.merchantName
                }
            },
            update: {
                status: 'connected',
                accountId: code,
                accessToken: publicKey,
                metadata: {
                    merchantId: code,
                    merchantName: authData.merchantName
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
        console.error('Epayco auth error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 