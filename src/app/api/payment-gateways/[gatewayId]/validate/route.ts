import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PaymentGatewayValidationResponse } from '@/lib/payment-gateway-types'
import { getPaymentGateway } from '@/lib/payment-gateways'

export async function GET(req: Request, { params }: { params: { gatewayId: string } }) {
    try {
        const { searchParams } = new URL(req.url)
        const agencyId = searchParams.get('agencyId')
        const { gatewayId } = params

        if (!agencyId) {
            return NextResponse.json(
                { error: 'Falta el parámetro agencyId' },
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/${gatewayId}/validate?agencyId=${agencyId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const data = await response.json()

        return NextResponse.json(data)
    } catch (error) {
        console.error(`Error en validación de pasarela ${params.gatewayId}:`, error)
        return NextResponse.json(
            { error: 'Error en la validación de la pasarela de pago' },
            { status: 500 }
        )
    }
}