import { prisma } from "@/lib/prisma"
import { EventEmitter, InventoryEvents } from "@/lib/event-emitter"

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
    // Importamos las funciones de queries2.ts para usar la implementación centralizada
    const { getAreas } = await import('@/lib/queries2')
    return getAreas(agencyId)
  }

  static async getAreaById(agencyId: string, areaId: string) {
    const { getAreaById } = await import('@/lib/queries2')
    return getAreaById(agencyId, areaId)
  }

  static async createArea(data: any) {
    const { createArea } = await import('@/lib/queries2')
    return createArea(data)
  }

  static async updateArea(areaId: string, data: any) {
    const { updateArea } = await import('@/lib/queries2')
    return updateArea(areaId, data)
  }

  static async deleteArea(agencyId: string, areaId: string, subaccountId?: string) {
    const { deleteArea } = await import('@/lib/queries2')
    return deleteArea(agencyId, areaId, subaccountId)
  }

  static async getDefaultArea(agencyId: string) {
    // Buscar un área por defecto o crear una si no existe
    const { getAreas, createArea } = await import('@/lib/queries2')
    
    let areas = await getAreas(agencyId)
    let defaultArea = areas.length > 0 ? areas[0] : null

    if (!defaultArea) {
      defaultArea = await createArea({
        name: "Área Principal",
        description: "Área por defecto del sistema",
        agencyId,
      })
    }

    return defaultArea
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

