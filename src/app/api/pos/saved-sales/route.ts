import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: Obtener ventas guardadas
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const agencyId = searchParams.get('agencyId');
    const subAccountId = searchParams.get('subAccountId');

    if (!agencyId) {
      return NextResponse.json({ success: false, error: 'ID de agencia requerido' }, { status: 400 });
    }

    // Obtener ventas guardadas (en estado DRAFT)
    const savedSales = await prisma.sale.findMany({
      where: {
        agencyId,
        ...(subAccountId && { subAccountId }),
        status: 'DRAFT'
      },
      include: {
        Items: {
          include: {
            Product: true
          }
        },
        Customer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformar los datos para que sean compatibles con el formato esperado por el frontend
    const formattedSales = savedSales.map(sale => ({
      id: sale.id,
      date: sale.createdAt.toLocaleString(),
      items: sale.Items.length,
      total: parseFloat(sale.total.toString()),
      products: sale.Items.map(item => ({
        id: item.productId,
        name: item.description || item.Product.name,
        price: parseFloat(item.unitPrice.toString()),
        quantity: item.quantity,
        subtotal: parseFloat(item.subtotal.toString())
      })),
      client: sale.Customer ? {
        id: sale.Customer.id,
        name: sale.Customer.name,
        email: sale.Customer.email
      } : {
        id: null,
        name: "Cliente General"
      }
    }));

    return NextResponse.json({ success: true, data: formattedSales });
  } catch (error: any) {
    console.error('Error al obtener ventas guardadas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Guardar una venta para completarla después
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const data = await req.json();
    const { agencyId, subAccountId, areaId, products, client } = data;

    if (!agencyId || !products || products.length === 0) {
      return NextResponse.json({ success: false, error: 'Datos incompletos' }, { status: 400 });
    }

    // Calcular subtotal e IVA
    const subtotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const tax = subtotal * 0.19; // 19% de IVA

    // Crear la venta en estado DRAFT
    const sale = await prisma.sale.create({
      data: {
        saleNumber: `DRAFT-${Date.now()}`,
        subtotal: subtotal,
        tax: tax,
        total: subtotal + tax,
        paymentMethod: 'CASH', // Valor por defecto
        status: 'DRAFT',
        saleDate: new Date(),
        customerId: client?.id || null,
        cashierId: session.user?.id || null,
        areaId,
        agencyId,
        ...(subAccountId && { subAccountId }),
        Items: {
          create: products.map(p => ({
            quantity: p.quantity,
            unitPrice: p.price,
            subtotal: p.price * p.quantity,
            description: p.name,
            productId: p.id
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
      data: sale,
      message: 'Venta guardada correctamente'
    });
  } catch (error: any) {
    console.error('Error al guardar venta:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar una venta guardada
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const saleId = searchParams.get('id');

    if (!saleId) {
      return NextResponse.json({ success: false, error: 'ID de venta requerido' }, { status: 400 });
    }

    // Eliminar la venta y sus items (se eliminan en cascada)
    await prisma.sale.delete({
      where: { id: saleId }
    });

    return NextResponse.json({
      success: true,
      message: 'Venta eliminada correctamente'
    });
  } catch (error: any) {
    console.error('Error al eliminar venta guardada:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}