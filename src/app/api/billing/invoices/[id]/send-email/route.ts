import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST: Enviar factura por correo electrónico
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const invoiceId = params.id;
    if (!invoiceId) {
      return NextResponse.json({ success: false, error: 'ID de factura requerido' }, { status: 400 });
    }

    // Obtener la factura con todos los datos necesarios
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        Customer: true,
        Items: {
          include: {
            Product: true
          }
        },
        Agency: true
      }
    });

    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Factura no encontrada' }, { status: 404 });
    }

    if (!invoice.Customer || !invoice.Customer.email) {
      return NextResponse.json({ success: false, error: 'El cliente no tiene correo electrónico' }, { status: 400 });
    }

    // Aquí se implementaría el envío real del correo electrónico
    // Por ahora, simulamos que se ha enviado correctamente
    
    // Ejemplo de implementación con un servicio de correo:
    /*
    await emailService.sendInvoice({
      to: invoice.Customer.email,
      subject: `Factura ${invoice.invoiceNumber} - ${invoice.Agency.name}`,
      invoice: invoice,
      pdfAttachment: await generateInvoicePDF(invoice)
    });
    */

    // Actualizar la factura para marcar que se ha enviado
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'SENT'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Factura enviada correctamente a ${invoice.Customer.email}`
    });
  } catch (error: any) {
    console.error('Error al enviar factura por correo:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}