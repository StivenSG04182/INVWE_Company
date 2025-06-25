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
      EventEmitter.emit(InventoryEvents.PRODUCT_EXPIRING, {
        product,
        daysRemaining: Math.ceil((product.expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        subAccountId: product.subAccountId,
      })
    }

    return expiringProducts
  }
}

// Servicio para gestión de stock
export class StockService {
  static async getStocks(agencyId: string) {
    return prisma.stock.findMany({
      where: { agencyId },
      include: {
        Product: true,
        Area: true,
      },
    })
  }

  static async getStocksByProduct(agencyId: string, productId: string) {
    return prisma.stock.findMany({
      where: {
        agencyId,
        productId,
      },
      include: {
        Area: true,
      },
    })
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
    const stock = await prisma.stock.update({
      where: { id: stockId },
      data: { quantity },
      include: { Product: true },
    })

    // Emitir evento de stock actualizado
    EventEmitter.emit(InventoryEvents.STOCK_UPDATED, stock)

    // Verificar si el stock está por debajo del mínimo
    if (stock.Product.minStock && stock.quantity <= stock.Product.minStock) {
      EventEmitter.emit(InventoryEvents.STOCK_BELOW_MINIMUM, stock)
    }

    return stock
  }

  // Método para actualizar stock desde el POS
  static async updateStockFromSale(saleData: {
    productId: string
    areaId: string
    quantity: number
    agencyId: string
  }) {
    // Buscar el stock correspondiente
    const stock = await prisma.stock.findFirst({
      where: {
        productId: saleData.productId,
        areaId: saleData.areaId,
      },
      include: { Product: true },
    })

    if (!stock) {
      throw new Error(`No se encontró stock para el producto ${saleData.productId} en el área ${saleData.areaId}`)
    }

    // Verificar que hay suficiente stock
    if (stock.quantity < saleData.quantity) {
      throw new Error(`Stock insuficiente para el producto ${stock.Product.name}`)
    }

    // Actualizar el stock
    const updatedStock = await prisma.stock.update({
      where: { id: stock.id },
      data: {
        quantity: stock.quantity - saleData.quantity,
      },
      include: { Product: true },
    })

    // Emitir evento de stock actualizado
    EventEmitter.emit(InventoryEvents.STOCK_UPDATED, updatedStock)

    // Registrar el movimiento de salida
    await MovementService.createMovement({
      type: "SALIDA",
      productId: saleData.productId,
      areaId: saleData.areaId,
      quantity: saleData.quantity,
      notes: "Venta desde POS",
      agencyId: saleData.agencyId,
      subAccountId: stock.subAccountId,
    })

    // Verificar si el stock está por debajo del mínimo
    if (updatedStock.Product.minStock && updatedStock.quantity <= updatedStock.Product.minStock) {
      EventEmitter.emit(InventoryEvents.STOCK_BELOW_MINIMUM, updatedStock)
    }

    return updatedStock
  }

  // Método para verificar productos con stock bajo
  static async checkLowStockProducts(agencyId: string, thresholdPercentage = 10) {
    const products = await prisma.product.findMany({
      where: {
        agencyId,
        minStock: { not: null },
      },
      include: {
        Stocks: true,
      },
    })

    const lowStockProducts = products.filter((product) => {
      if (!product.minStock) return false

      // Calcular stock total
      const totalStock = product.Stocks.reduce((sum, stock) => sum + stock.quantity, 0)

      // Calcular porcentaje respecto al mínimo
      const percentage = (totalStock / product.minStock) * 100

      // Considerar bajo stock si está por debajo del umbral porcentual o si quedan 10 unidades o menos
      return (
        percentage <= thresholdPercentage || (product.minStock - totalStock <= 10 && totalStock <= product.minStock)
      )
    })

    return lowStockProducts
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
    // Convertir el tipo de movimiento al enum de Prisma
    const movementType = data.type.toUpperCase() as "ENTRADA" | "SALIDA" | "TRANSFERENCIA"

    // Crear el movimiento
    const movement = await prisma.movement.create({
      data: {
        type: movementType,
        quantity: Number.parseInt(data.quantity),
        notes: data.notes,
        productId: data.productId,
        areaId: data.areaId,
        providerId: data.providerId,
        agencyId: data.agencyId,
        subAccountId: data.subAccountId,
      },
      include: {
        Product: true,
        Area: true,
      },
    })

    // Actualizar el stock según el tipo de movimiento
    if (movementType === "ENTRADA") {
      await StockService.handleStockEntry(data)
    } else if (movementType === "SALIDA") {
      await StockService.handleStockExit(data)
    } else if (movementType === "TRANSFERENCIA") {
      await StockService.handleStockTransfer(data)
    }

    // Emitir evento de movimiento creado
    EventEmitter.emit(InventoryEvents.MOVEMENT_CREATED, movement)

    return movement
  }

  // Implementación de los métodos de manejo de stock
  static async handleStockEntry(data: any) {
    // Buscar si ya existe un stock para este producto y área
    const existingStock = await prisma.stock.findFirst({
      where: {
        productId: data.productId,
        areaId: data.areaId,
      },
    })

    let stock

    if (existingStock) {
      // Actualizar stock existente
      stock = await prisma.stock.update({
        where: { id: existingStock.id },
        data: {
          quantity: existingStock.quantity + Number.parseInt(data.quantity),
        },
        include: { Product: true },
      })
    } else {
      // Crear nuevo stock
      stock = await prisma.stock.create({
        data: {
          productId: data.productId,
          areaId: data.areaId,
          quantity: Number.parseInt(data.quantity),
          agencyId: data.agencyId,
          subAccountId: data.subAccountId,
        },
        include: { Product: true },
      })
    }

    // Emitir evento de stock actualizado
    EventEmitter.emit(InventoryEvents.STOCK_UPDATED, stock)

    return stock
  }

  static async handleStockExit(data: any) {
    // Buscar el stock correspondiente
    const stock = await prisma.stock.findFirst({
      where: {
        productId: data.productId,
        areaId: data.areaId,
      },
      include: { Product: true },
    })

    if (!stock) {
      throw new Error(`No se encontró stock para el producto ${data.productId} en el área ${data.areaId}`)
    }

    // Verificar que hay suficiente stock
    if (stock.quantity < Number.parseInt(data.quantity)) {
      throw new Error(`Stock insuficiente para realizar la salida`)
    }

    // Actualizar el stock
    const updatedStock = await prisma.stock.update({
      where: { id: stock.id },
      data: {
        quantity: stock.quantity - Number.parseInt(data.quantity),
      },
      include: { Product: true },
    })

    // Emitir evento de stock actualizado
    EventEmitter.emit(InventoryEvents.STOCK_UPDATED, updatedStock)

    // Verificar si el stock está por debajo del mínimo
    if (updatedStock.Product.minStock && updatedStock.quantity <= updatedStock.Product.minStock) {
      EventEmitter.emit(InventoryEvents.STOCK_BELOW_MINIMUM, updatedStock)
    }

    return updatedStock
  }

  static async handleStockTransfer(data: any) {
    // Verificar que se proporcionó un área de destino
    if (!data.destinationAreaId) {
      throw new Error("Se requiere un área de destino para la transferencia")
    }

    // Buscar el stock de origen
    const sourceStock = await prisma.stock.findFirst({
      where: {
        productId: data.productId,
        areaId: data.areaId,
      },
      include: { Product: true },
    })

    if (!sourceStock) {
      throw new Error(`No se encontró stock para el producto ${data.productId} en el área de origen ${data.areaId}`)
    }

    // Verificar que hay suficiente stock en el origen
    if (sourceStock.quantity < Number.parseInt(data.quantity)) {
      throw new Error(`Stock insuficiente en el área de origen para realizar la transferencia`)
    }

    // Buscar si ya existe un stock en el área de destino
    const destinationStock = await prisma.stock.findFirst({
      where: {
        productId: data.productId,
        areaId: data.destinationAreaId,
      },
      include: { Product: true },
    })

    // Iniciar una transacción para asegurar que ambas operaciones se completen o ninguna
    const result = await prisma.$transaction(async (prisma) => {
      // Reducir stock en el área de origen
      const updatedSourceStock = await prisma.stock.update({
        where: { id: sourceStock.id },
        data: {
          quantity: sourceStock.quantity - Number.parseInt(data.quantity),
        },
        include: { Product: true },
      })

      let updatedDestinationStock

      // Aumentar stock en el área de destino
      if (destinationStock) {
        updatedDestinationStock = await prisma.stock.update({
          where: { id: destinationStock.id },
          data: {
            quantity: destinationStock.quantity + Number.parseInt(data.quantity),
          },
          include: { Product: true },
        })
      } else {
        updatedDestinationStock = await prisma.stock.create({
          data: {
            productId: data.productId,
            areaId: data.destinationAreaId,
            quantity: Number.parseInt(data.quantity),
            agencyId: data.agencyId,
            subAccountId: data.subAccountId,
          },
          include: { Product: true },
        })
      }

      return { updatedSourceStock, updatedDestinationStock }
    })

    // Emitir eventos de stock actualizado
    EventEmitter.emit(InventoryEvents.STOCK_UPDATED, result.updatedSourceStock)
    EventEmitter.emit(InventoryEvents.STOCK_UPDATED, result.updatedDestinationStock)

    // Verificar si el stock de origen está por debajo del mínimo
    if (
      result.updatedSourceStock.Product.minStock &&
      result.updatedSourceStock.quantity <= result.updatedSourceStock.Product.minStock
    ) {
      EventEmitter.emit(InventoryEvents.STOCK_BELOW_MINIMUM, result.updatedSourceStock)
    }

    return result
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
          description: "Área por defecto del sistema",
          agencyId,
        },
      })
    }

    return defaultArea
  }

  static async updateArea(areaId: string, data: any) {
    // Actualizar el área con los datos proporcionados
    const area = await prisma.area.update({
      where: { id: areaId },
      data: {
        name: data.name,
        description: data.description,
        layout: data.layout,
        subAccountId: data.subAccountId,
      },
    })

    // Emitir evento de área actualizada si es necesario
    EventEmitter.emit(InventoryEvents.AREA_UPDATED, area)

    return area
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
