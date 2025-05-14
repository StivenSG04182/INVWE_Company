import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Función para generar un número de factura único
const generateInvoiceNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Obtener la última factura para generar un nuevo número
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  let sequence = 1;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[1] || '0');
    sequence = lastSequence + 1;
  }
  
  return `F${year}${month}${day}-${sequence.toString().padStart(4, '0')}`;
};

// GET: Obtener facturas
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const agencyId = searchParams.get('agencyId');
    const subAccountId = searchParams.get('subAccountId');
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!agencyId) {
      return NextResponse.json({ success: false, error: 'ID de agencia requerido' }, { status: 400 });
    }

    // Construir la consulta base para facturas
    let invoicesQuery: any = {
      where: {
        agencyId: agencyId,
        ...(subAccountId && { subAccountId }),
        ...(customerId && { customerId }),
        ...(status && { status }),
        ...(startDate && endDate && {
          issuedDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
      },
      include: {
        Customer: true,
        Items: {
          include: {
            Product: true
          }
        },
        Payments: true
      },
      orderBy: {
        issuedDate: 'desc'
      }
    };

    // Obtener facturas
    const invoices = await prisma.invoice.findMany(invoicesQuery);

    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    console.error('Error al obtener facturas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Crear una nueva factura
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const data = await req.json();
    const { agencyId, subAccountId, customerId, items, subtotal, tax, discount = 0, total, notes } = data;

    if (!agencyId || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Datos incompletos' }, { status: 400 });
    }

    // Generar número de factura único
    const invoiceNumber = await generateInvoiceNumber();

    // Crear la factura en la base de datos
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        status: 'DRAFT',
        subtotal,
        tax,
        discount,
        total,
        notes,
        issuedDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días de plazo por defecto
        customerId,
        agencyId,
        ...(subAccountId && { subAccountId }),
        Items: {
          create: items.map((item: any) => ({
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            tax: item.tax || 0,
            total: item.quantity * item.unitPrice,
            description: item.description,
            productId: item.productId
          }))
        }
      },
      include: {
        Items: true,
        Customer: true
      }
    });

    return NextResponse.json({
      success: true,
      data: invoice
    });
  } catch (error: any) {
    console.error('Error al crear factura:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}