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
                    gatewayId: 'epayco'
                }
            }
        })

        if (!connection) {
            return NextResponse.json({
                isValid: false,
                status: 'disconnected'
            } as PaymentGatewayValidationResponse)
        }

        // Verificar el estado de la cuenta con Epayco
        try {
            const publicKey = connection.accessToken!
            const privateKey = process.env.EPAYCO_PRIVATE_KEY!
            const merchantId = connection.metadata?.merchantId

            const response = await fetch('https://api.secure.payco.co/v1/merchant/status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${publicKey}:${privateKey}`).toString('base64')}`,
                }
            })

            if (!response.ok) {
                return NextResponse.json({
                    isValid: false,
                    status: 'failed',
                    error: 'Failed to validate Epayco account'
                } as PaymentGatewayValidationResponse)
            }

            const data = await response.json()

            return NextResponse.json({
                isValid: true,
                status: 'connected',
                metadata: {
                    merchantStatus: data.status
                }
            } as PaymentGatewayValidationResponse)
        } catch (error) {
            console.error('Error validating Epayco account:', error)
            return NextResponse.json({
                isValid: false,
                status: 'failed',
                error: 'Error validating Epayco account'
            } as PaymentGatewayValidationResponse)
        }
    } catch (error) {
        console.error('Epayco validation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 