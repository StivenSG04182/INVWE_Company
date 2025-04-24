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

        // Obtener credenciales de Wompi
        const clientId = process.env.WOMPI_CLIENT_ID
        const clientSecret = process.env.WOMPI_CLIENT_SECRET

        if (!clientId || !clientSecret) {
            return NextResponse.json(
                { error: 'Wompi credentials not configured' },
                { status: 500 }
            )
        }

        // Validar el código con Wompi
        const response = await fetch('https://api.wompi.co/v1/merchants/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            },
            body: JSON.stringify({
                code,
                merchantId: agencyId
            })
        })

        if (!response.ok) {
            const error = await response.json()
            return NextResponse.json(
                { error: error.message || 'Failed to validate with Wompi' },
                { status: response.status }
            )
        }

        const data = await response.json()

        // Actualizar o crear la conexión en la base de datos
        const connection = await db.paymentGatewayConnection.upsert({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId: 'wompi'
                }
            },
            update: {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                metadata: {
                    merchantId: data.merchantId,
                    status: data.status
                }
            },
            create: {
                agencyId,
                gatewayId: 'wompi',
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                metadata: {
                    merchantId: data.merchantId,
                    status: data.status
                }
            }
        })

        return NextResponse.json({
            success: true,
            connection
        } as PaymentGatewayAuthResponse)

    } catch (error) {
        console.error('Wompi auth error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 