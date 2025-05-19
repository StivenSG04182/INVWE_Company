import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  ProductService,
  StockService,
  MovementService,
  AreaService,
  CategoryService,
} from "@/lib/services/inventory-service"

export async function GET(req: NextRequest, { params }: { params: { agencyId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const { agencyId } = params
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")

    let data
    switch (type) {
      case "products":
        data = await ProductService.getProducts(agencyId)
        break
      case "stocks":
        data = await StockService.getStocks(agencyId)
        break
      case "movements":
        data = await MovementService.getMovements(agencyId)
        break
      case "areas":
        data = await AreaService.getAreas(agencyId)
        break
      case "categories":
        data = await CategoryService.getCategories(agencyId)
        break
      case "low-stock":
        data = await StockService.checkLowStockProducts(agencyId)
        break
      case "expiring":
        const daysThreshold = searchParams.get("days") ? Number.parseInt(searchParams.get("days")) : 30
        data = await ProductService.checkExpiringProducts(agencyId, daysThreshold)
        break
      default:
        data = await ProductService.getProducts(agencyId)
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error en API de inventario:", error)
    return NextResponse.json({ success: false, error: error.message || "Error en el servidor" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { agencyId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const { agencyId } = params
    const body = await req.json()
    const { type, data } = body

    let result
    switch (type) {
      case "product":
        result = await ProductService.createProduct({ ...data, agencyId })
        break
      case "movement":
        result = await MovementService.createMovement({ ...data, agencyId })
        break
      default:
        return NextResponse.json({ success: false, error: "Tipo de operación no válido" }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Error en API de inventario:", error)
    return NextResponse.json({ success: false, error: error.message || "Error en el servidor" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { agencyId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const { agencyId } = params
    const body = await req.json()
    const { type, id, data } = body

    let result
    switch (type) {
      case "product":
        result = await ProductService.updateProduct(id, { ...data, agencyId })
        break
      case "stock":
        result = await StockService.updateStock(id, data.quantity)
        break
      default:
        return NextResponse.json({ success: false, error: "Tipo de operación no válido" }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Error en API de inventario:", error)
    return NextResponse.json({ success: false, error: error.message || "Error en el servidor" }, { status: 500 })
  }
}
