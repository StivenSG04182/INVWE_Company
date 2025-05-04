import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ProductService, StockService, AreaService, ProviderService, MovementService } from '@/lib/services/inventory-service';

// Función para verificar la autorización del usuario
async function checkAuthorization(agencyId: string) {
  const { userId } = auth();
  if (!userId) {
    return { authorized: false, error: 'No autorizado', status: 401 };
  }

  // Aquí podrías verificar si el usuario pertenece a la agencia
  // Por ahora, simplemente autorizamos si hay un userId
  return { authorized: true };
}

// Manejador para obtener datos del inventario
export async function GET(
  req: Request,
  { params }: { params: { agencyId: string } }
) {
  try {
    const { authorized, error, status } = await checkAuthorization(params.agencyId);
    if (!authorized) {
      return NextResponse.json({ error }, { status });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    let data;
    switch (type) {
      case 'products':
        data = id
          ? await ProductService.getProductById(id)
          : await ProductService.getProducts(params.agencyId);
        break;
      case 'stock':
        if (id && searchParams.get('by') === 'product') {
          data = await StockService.getStockByProductId(id);
        } else if (id && searchParams.get('by') === 'area') {
          data = await StockService.getStockByAreaId(id);
        } else {
          data = await StockService.getStocks(params.agencyId);
        }
        break;
      case 'areas':
        data = id
          ? await AreaService.getAreaById(id)
          : await AreaService.getAreas(params.agencyId);
        break;
      case 'providers':
        data = id
          ? await ProviderService.getProviderById(id)
          : await ProviderService.getProviders(params.agencyId);
        break;
      case 'movements':
        data = id
          ? await MovementService.getMovementById(id)
          : await MovementService.getMovements(params.agencyId);
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de datos no válido' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`Error en la API de inventario:`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Manejador para crear nuevos elementos en el inventario
export async function POST(
  req: Request,
  { params }: { params: { agencyId: string } }
) {
  try {
    const { authorized, error, status } = await checkAuthorization(params.agencyId);
    if (!authorized) {
      return NextResponse.json({ error }, { status });
    }

    const body = await req.json();
    const { type } = body;
    let data;

    // Asegurarse de que el agencyId esté incluido en los datos
    body.data.agencyId = params.agencyId;

    switch (type) {
      case 'product':
        data = await ProductService.createProduct(body.data);
        break;
      case 'area':
        data = await AreaService.createArea(body.data);
        break;
      case 'provider':
        data = await ProviderService.createProvider(body.data);
        break;
      case 'movement':
        data = await MovementService.createMovement(body.data);
        break;
      case 'stock':
        data = await StockService.updateStock(body.data);
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de operación no válido' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`Error en la API de inventario:`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Manejador para actualizar elementos existentes
export async function PUT(
  req: Request,
  { params }: { params: { agencyId: string } }
) {
  try {
    const { authorized, error, status } = await checkAuthorization(params.agencyId);
    if (!authorized) {
      return NextResponse.json({ error }, { status });
    }

    const body = await req.json();
    const { type, id, data } = body;
    let result;

    switch (type) {
      case 'product':
        result = await ProductService.updateProduct(id, data);
        break;
      case 'area':
        result = await AreaService.updateArea(id, data);
        break;
      case 'provider':
        result = await ProviderService.updateProvider(id, data);
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de operación no válido' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error(`Error en la API de inventario:`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Manejador para eliminar elementos
export async function DELETE(
  req: Request,
  { params }: { params: { agencyId: string } }
) {
  try {
    const { authorized, error, status } = await checkAuthorization(params.agencyId);
    if (!authorized) {
      return NextResponse.json({ error }, { status });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Tipo y ID son requeridos' },
        { status: 400 }
      );
    }

    let result;
    switch (type) {
      case 'product':
        result = await ProductService.deleteProduct(id);
        break;
      case 'area':
        result = await AreaService.deleteArea(id);
        break;
      case 'provider':
        result = await ProviderService.deleteProvider(id);
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de operación no válido' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error(`Error en la API de inventario:`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}