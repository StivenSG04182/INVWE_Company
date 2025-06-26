import { prisma } from "@/lib/prisma"
import { EventEmitter, InventoryEvents } from "@/lib/event-emitter"

// Servicio centralizado para gestión de inventario
export class InventoryService {
  // Métodos para productos
  static async getProducts(agencyId: string) {
    return prisma.product.findMany({
      where: { agencyId },
      include: {
        Category: true,
        Movements: true,
      },
    })
  }

  static async getProductById(agencyId: string, productId: string) {
    return prisma.product.findFirst({
      where: {
        id: productId,
        agencyId,
      },
      include: {
        Category: true,
        Movements: true,
      },
    })
  }

  static async createProduct(data: any) {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        price: Number.parseFloat(data.price),
        cost: data.cost ? Number.parseFloat(data.cost) : undefined,
        minStock: data.minStock ? Number.parseInt(data.minStock) : undefined,
        images: data.images || [],
        agencyId: data.agencyId,
        subAccountId: data.subaccountId,
        categoryId: data.categoryId !== "no-category" ? data.categoryId : null,
        brand: data.brand,
        model: data.model,
        tags: data.tags || [],
        unit: data.unit,
        barcode: data.barcode,
        quantity: data.quantity ? Number.parseInt(data.quantity) : 0,
        locationId: data.locationId,
        warehouseId: data.warehouseId,
        batchNumber: data.batchNumber,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
        serialNumber: data.serialNumber,
        warrantyMonths: data.warrantyMonths ? Number.parseInt(data.warrantyMonths) : null,
        isReturnable: data.isReturnable,
        isActive: data.isActive !== false,
        discount: data.discount ? Number.parseFloat(data.discount) : 0,
        discountStartDate: data.discountStartDate ? new Date(data.discountStartDate) : null,
        discountEndDate: data.discountEndDate ? new Date(data.discountEndDate) : null,
        discountMinimumPrice: data.discountMinimumPrice ? Number.parseFloat(data.discountMinimumPrice) : null,
        taxRate: data.taxRate ? Number.parseFloat(data.taxRate) : 0,
        supplierId: data.supplierId !== "no-supplier" ? data.supplierId : null,
        variants: data.variants || [],
        documents: data.documents || [],
        customFields: data.customFields || {},
        externalIntegrations: data.externalIntegrations || {},
      },
    })

    // Nota: Ya no creamos el stock inicial aquí porque el componente product-form.tsx
    // ya está creando un movimiento directamente a través de la API

    // Emitir evento de producto creado
    EventEmitter.emit(InventoryEvents.PRODUCT_CREATED, product)

    return product
  }

  static async updateProduct(productId: string, data: any) {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        price: Number.parseFloat(data.price),
        cost: data.cost ? Number.parseFloat(data.cost) : undefined,
        minStock: data.minStock ? Number.parseInt(data.minStock) : undefined,
        images: data.images || [],
        subAccountId: data.subaccountId,
        categoryId: data.categoryId !== "no-category" ? data.categoryId : null,
        brand: data.brand,
        model: data.model,
        tags: data.tags || [],
        unit: data.unit,
        barcode: data.barcode,
        locationId: data.locationId,
        warehouseId: data.warehouseId,
        batchNumber: data.batchNumber,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
        serialNumber: data.serialNumber,
        warrantyMonths: data.warrantyMonths ? Number.parseInt(data.warrantyMonths) : null,
        isReturnable: data.isReturnable,
        isActive: data.isActive !== false,
        discount: data.discount ? Number.parseFloat(data.discount) : 0,
        discountStartDate: data.discountStartDate ? new Date(data.discountStartDate) : null,
        discountEndDate: data.discountEndDate ? new Date(data.discountEndDate) : null,
        discountMinimumPrice: data.discountMinimumPrice ? Number.parseFloat(data.discountMinimumPrice) : null,
        taxRate: data.taxRate ? Number.parseFloat(data.taxRate) : 0,
        supplierId: data.supplierId !== "no-supplier" ? data.supplierId : null,
        variants: data.variants || [],
        documents: data.documents || [],
        customFields: data.customFields || {},
        externalIntegrations: data.externalIntegrations || {},
      },
    })

    // Emitir evento de producto actualizado
    EventEmitter.emit(InventoryEvents.PRODUCT_UPDATED, product)

    return product
  }

  static async deleteProduct(productId: string) {
    const product = await prisma.product.delete({
      where: { id: productId },
    })

    // Emitir evento de producto eliminado
    EventEmitter.emit(InventoryEvents.PRODUCT_DELETED, product)

    return product
  }

  // Métodos para descuentos
  static async getActiveDiscounts(agencyId: string) {
    const now = new Date()

    // Obtener productos con descuentos activos
    const productsWithDiscount = await prisma.product.findMany({
      where: {
        agencyId,
        discount: { gt: 0 },
        discountEndDate: { gte: now },
        OR: [{ discountStartDate: null }, { discountStartDate: { lte: now } }],
      },
    })

    // Obtener categorías con descuentos activos
    const categoriesWithDiscount = await prisma.productCategory.findMany({
      where: {
        agencyId,
        // Aquí asumimos que las categorías tienen campos similares para descuentos
        // Ajusta según tu modelo real
      },
    })

    // Combinar y formatear los resultados
    const discounts = [
      ...productsWithDiscount.map((p) => ({
        _id: p.id,
        name: `Descuento ${p.discount}% en ${p.name}`,
        discountType: "product",
        discount: p.discount,
        startDate: p.discountStartDate,
        endDate: p.discountEndDate,
        minimumPrice: p.discountMinimumPrice,
        itemIds: [p.id],
      })),
      // Mapear categorías con descuento si es necesario
    ]

    return discounts
  }

  // Método para verificar productos por vencer
  static async checkExpiringProducts(agencyId: string, daysThreshold = 30) {
    const today = new Date()
    const thresholdDate = new Date()
    thresholdDate.setDate(today.getDate() + daysThreshold)

    const expiringProducts = await prisma.product.findMany({
      where: {
        agencyId,
        expirationDate: {
          gte: today,
          lte: thresholdDate,
        },
      },
      include: {
        SubAccount: true,
      },
    })

    // Notificar sobre productos por vencer
    for (const product of expiringProducts) {
      if (product.expirationDate) {
        EventEmitter.emit(InventoryEvents.PRODUCT_EXPIRING, {
          product,
          daysRemaining: Math.ceil((product.expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
          subAccountId: product.subAccountId,
        })
      }
    }

    return expiringProducts
  }
}

// Servicio para gestión de stock
export class StockService {
  static async getStocks(agencyId: string) {
    // Como no hay modelo Stock, retornamos un array vacío
    return []
  }

  static async getStocksByProduct(agencyId: string, productId: string) {
    // Como no hay modelo Stock, retornamos un array vacío
    return []
  }

  static async createInitialStock(data: {
    productId: string
    areaId: string
    quantity: number
    agencyId: string
    subAccountId?: string
  }) {
    // En lugar de usar el modelo Stock, creamos un movimiento de entrada
    // para registrar el stock inicial
    const movement = await prisma.movement.create({
      data: {
        type: "ENTRADA",
        quantity: data.quantity,
        notes: "Stock inicial al crear el producto",
        productId: data.productId,
        areaId: data.areaId,
        agencyId: data.agencyId,
        subAccountId: data.subAccountId,
      },
      include: {
        Product: true,
        Area: true,
      },
    })

    // Emitir evento de movimiento creado
    EventEmitter.emit(InventoryEvents.MOVEMENT_CREATED, movement)

    return movement
  }

  static async updateStock(stockId: string, quantity: number) {
    // Como no hay modelo Stock, lanzamos un error
    throw new Error("Modelo Stock no disponible")
  }

  // Método para actualizar stock desde el POS
  static async updateStockFromSale(saleData: {
    productId: string
    areaId: string
    quantity: number
    agencyId: string
  }) {
    // Como no hay modelo Stock, solo registramos el movimiento de salida
    await MovementService.createMovement({
      type: "SALIDA",
      productId: saleData.productId,
      areaId: saleData.areaId,
      quantity: saleData.quantity,
      notes: "Venta desde POS",
      agencyId: saleData.agencyId,
    })

    return { success: true }
  }

  // Método para verificar productos con stock bajo
  static async checkLowStockProducts(agencyId: string, thresholdPercentage = 10) {
    // Como no hay modelo Stock, retornamos un array vacío
    return []
  }
}

// Servicio para gestión de movimientos
export class MovementService {
  static async getMovements(agencyId: string) {
    return prisma.movement.findMany({
      where: { agencyId },
      include: {
        Product: true,
        Area: true,
        Provider: true,
      },
      orderBy: { createdAt: "desc" },
    })
  }

  static async getMovementsByProduct(agencyId: string, productId: string) {
    return prisma.movement.findMany({
      where: {
        agencyId,
        productId,
      },
      include: {
        Area: true,
        Provider: true,
      },
      orderBy: { createdAt: "desc" },
    })
  }

  static async createMovement(data: any) {
    const { type: movementType, ...movementData } = data

    // Crear el movimiento
    const movement = await prisma.movement.create({
      data: {
        type: movementType,
        ...movementData,
      },
      include: {
        Product: true,
        Area: true,
        Provider: true,
      },
    })

    // Emitir evento de movimiento creado
    EventEmitter.emit(InventoryEvents.MOVEMENT_CREATED, movement)

    return movement
  }
}

// Servicio para gestión de áreas
export class AreaService {
  static async getAreas(agencyId: string) {
    return prisma.area.findMany({
      where: { agencyId },
    })
  }

  static async getDefaultArea(agencyId: string) {
    // Buscar un área por defecto o crear una si no existe
    let defaultArea = await prisma.area.findFirst({
      where: { agencyId },
    })

    if (!defaultArea) {
      defaultArea = await prisma.area.create({
        data: {
          name: "Área Principal",
          description: "Área por defecto",
          agencyId,
        },
      })
    }

    return defaultArea
  }

  static async updateArea(areaId: string, data: any) {
    return prisma.area.update({
      where: { id: areaId },
      data,
    })
  }
}

// Servicio para gestión de categorías
export class CategoryService {
  static async getCategories(agencyId: string) {
    return prisma.productCategory.findMany({
      where: { agencyId },
    })
  }
}

// Exportar todos los servicios
export { InventoryService as ProductService }
