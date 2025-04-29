import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
    req: Request,
    { params }: { params: { agencyId: string } }
) {
    try {
        const { agencyId } = params

        if (!agencyId) {
            return NextResponse.json(
                { success: false, error: 'ID de agencia no proporcionado' },
                { status: 400 }
            )
        }

        // Consultar las conexiones de pasarelas de pago para esta agencia
        const connections = await db.paymentGatewayConnection.findMany({
            where: {
                agencyId: agencyId
            }
        })

        return NextResponse.json({
            success: true,
            connections
        })
    } catch (error) {
        console.error('Error al obtener las pasarelas de pago:', error)
        return NextResponse.json(
            { success: false, error: 'Error al obtener las pasarelas de pago' },
            { status: 500 }
        )
    }
}