import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { Db } from 'mongodb'

export const POST = async (req: Request) => {
    try {
        const body = await req.json()


        // Validar estructura básica de la factura
        if (!body.clientId || !body.items || body.items.length === 0) {
            return new NextResponse('Datos de factura incompletos', { status: 400 })
        }

        // Crear documento de factura
        const newInvoice = {
            ...body,
            invoiceNumber: `INV-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'pending',
            total: body.items.reduce((acc: number, item: { quantity: number; unitPrice: number; taxRate: number }) =>
                acc + (item.quantity * item.unitPrice) * (1 + item.taxRate), 0)
        }

        // Insertar en MongoDB
        const client = await clientPromise
        const db: Db = client.db(process.env.MONGODB_DB)
        const result = await db.collection('invoices').insertOne(newInvoice)

        return NextResponse.json({
            id: result.insertedId,
            ...newInvoice
        }, { status: 201 })

    } catch (error) {
        console.error('[INVOICE_CREATION_ERROR]', error)
        return new NextResponse('Error interno del servidor', { status: 500 })
    }
}