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

        // Buscar la conexión existente
        const connection = await db.paymentGatewayConnection.findUnique({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId: 'wompi'
                }
            }
        })

        if (!connection) {
            return NextResponse.json({
                success: true,
                isConnected: false
            } as PaymentGatewayValidationResponse)
        }

        // Validar el estado de la cuenta con Wompi
        const response = await fetch('https://api.wompi.co/v1/merchants/status', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${connection.accessToken}`
            }
        })

        if (!response.ok) {
            const error = await response.json()
            return NextResponse.json(
                { error: error.message || 'Failed to validate Wompi account' },
                { status: response.status }
            )
        }

        const data = await response.json()

        return NextResponse.json({
            success: true,
            isConnected: true,
            merchantStatus: data.status
        } as PaymentGatewayValidationResponse)

    } catch (error) {
        console.error('Wompi validation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 