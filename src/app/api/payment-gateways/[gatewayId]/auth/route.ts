import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PaymentGatewayAuthResponse } from '@/lib/payment-gateway-types'
import { getPaymentGateway } from '@/lib/payment-gateways'

export async function POST(req: Request, { params }: { params: { gatewayId: string } }) {
    try {
        const { code, agencyId } = await req.json()
        const { gatewayId } = params

        if (!code || !agencyId) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos' },
                { status: 400 }
            )
        }

        // Verificar que la pasarela existe
        try {
            getPaymentGateway(gatewayId)
        } catch (error) {
            return NextResponse.json(
                { error: `Pasarela de pago ${gatewayId} no encontrada` },
                { status: 404 }
            )
        }

        // Redirigir a la API específica de la pasarela
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/${gatewayId}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, agencyId }),
        })

        const data = await response.json()

        return NextResponse.json(data)
    } catch (error) {
        console.error(`Error en autenticación de pasarela ${params.gatewayId}:`, error)
        return NextResponse.json(
            { error: 'Error en la autenticación de la pasarela de pago' },
            { status: 500 }
        )
    }
}