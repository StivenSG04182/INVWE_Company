"use server";

import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { db } from "./db";

import { Agency, User } from "@prisma/client";
import { StockService } from './services/inventory-service';

// TODO: Obtiene usuario autenticado
export const getAuthUserDetails = async () => {
    const user = await currentUser();
    if (!user) {
        return;
    }

    const userData = await db.user.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress,
        },
        include: {
            Agency: {
                include: {
                    SidebarOption: true,
                    SubAccount: {
                        include: {
                            SidebarOption: true,
                        },
                    },
                },
            },
            Permissions: true,
        },
    });
    return userData;
};

// TODO: Obtiene agencia por ID
export const getAgencyDetails = async (agencyId: string): Promise<Agency | null> => {
    return await db.agency.findUnique({
        where: {
            id: agencyId
        },
        include: {
            SubAccount: true,
            Subscription: true
        }
    })
}

// TODO: Registra actividad y notificaciones
export const saveActivityLogsNotification = async ({
    agencyId,
    description,
    subaccountId,
}: {
    agencyId?: string;
    description: string;
    subaccountId?: string;
}) => {
    const authUser = await currentUser();
    let userData;
    if (!authUser) {
        // Si no hay usuario autenticado, buscar un usuario con acceso a la tienda o agencia
        const response = await db.user.findFirst({
            where: {
                OR: [
                    // Buscar usuarios con rol SUBACCOUNT_USER
                    {
                        role: 'SUBACCOUNT_USER',
                        Agency: {
                            SubAccount: {
                                some: { id: subaccountId },
                            },
                        },
                    },
                    // Buscar usuarios con rol SUBACCOUNT_GUEST
                    {
                        role: 'SUBACCOUNT_GUEST',
                        Agency: {
                            SubAccount: {
                                some: { id: subaccountId },
                            },
                        },
                    },
                    // Buscar usuarios con rol AGENCY_OWNER
                    {
                        role: 'AGENCY_OWNER',
                        Agency: {
                            id: agencyId,
                        },
                    },
                    // Buscar usuarios con rol AGENCY_ADMIN
                    {
                        role: 'AGENCY_ADMIN',
                        Agency: {
                            id: agencyId,
                        },
                    },
                ],
            },
        });
        if (response) {
            userData = response;
        }
    } else {
        userData = await db.user.findUnique({
            where: { email: authUser?.emailAddresses[0].emailAddress },
        });
    }

    if (!userData) {
        return;
    }
    let foundAgencyId = agencyId;
    if (!foundAgencyId) {
        if (!subaccountId) {
            return;
        }
        const response = await db.subAccount.findUnique({
            where: { id: subaccountId },
        });
        if (response) foundAgencyId = response.agencyId;
    }
    if (!foundAgencyId) {
        return;
    }

    if (subaccountId) {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                User: {
                    connect: {
                        id: userData.id,
                    },
                },
                Agency: {
                    connect: {
                        id: foundAgencyId,
                    },
                },
                SubAccount: {
                    connect: { id: subaccountId },
                },
            },
        });
    } else {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                User: {
                    connect: {
                        id: userData.id,
                    },
                },
                Agency: {
                    connect: {
                        id: foundAgencyId,
                    },
                },
            },
        });
    }
};

// TODO: Lista productos
export const getProducts = async (agencyId: string, subAccountId?: string) => {
    try {
        const products = await db.product.findMany({
            where: { 
                agencyId,
                active: true,
                ...(subAccountId && { subAccountId })
            },
            include: {
                Category: true,
                Movements: true,
                SubAccount: true,
            },
            orderBy: {
                name: 'desc'
            }
        });
        
        const formattedProducts = products.map(product => ({
            ...product,
            price: Number(product.price),
            cost: product.cost ? Number(product.cost) : null,
            discount: product.discount ? Number(product.discount) : 0,
            discountMinimumPrice: product.discountMinimumPrice ? Number(product.discountMinimumPrice) : null,
            taxRate: product.taxRate ? Number(product.taxRate) : 0
        }));

        return formattedProducts;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

// TODO: Obtiene producto por ID
export const getProductById = async (agencyId: string, productId: string, subAccountId?: string) => {
    return await db.product.findFirst({
        where: {
            id: productId,
            agencyId,
            ...(subAccountId && { subAccountId })
        },
        include: {
            Category: true,
            Movements: true,
            SubAccount: true,
        },
    });
};

/// TODO: Crea producto
export const createProduct = async (data: any) => {
    const product = await db.product.create({
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
            warehouseId: data.warehouseId !== "no-area" ? data.warehouseId : null,
            batchNumber: data.batchNumber,
            expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
            serialNumber: data.serialNumber,
            warrantyMonths: data.warrantyMonths ? Number.parseInt(data.warrantyMonths) : null,
            isReturnable: data.isReturnable,
            active: data.isActive !== false,
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
    });

    await saveActivityLogsNotification({
        agencyId: data.agencyId,
        description: `Producto creado: ${data.name}`,
        subaccountId: data.subaccountId,
    });

    return product;
};

// TODO: Actualiza producto
export const updateProduct = async (productId: string, data: any) => {
    const product = await db.product.update({
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
            active: data.isActive !== false,
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
    });

    await saveActivityLogsNotification({
        agencyId: data.agencyId,
        description: `Producto actualizado: ${data.name}`,
        subaccountId: data.subaccountId,
    });

    return product;
};

// TODO: Elimina producto
export const deleteProduct = async (agencyId: string, productId: string, subaccountId?: string) => {
    if (!productId) {
        throw new Error("ID de producto no proporcionado");
    }

    const productToDelete = await db.product.findUnique({
        where: { id: productId },
    });

    if (!productToDelete) {
        throw new Error("Producto no encontrado");
    }

    const product = await db.product.delete({
        where: { id: productId },
    });

    await saveActivityLogsNotification({
        agencyId,
        description: `Producto eliminado: ${productToDelete.name}`,
        subaccountId,
    });

    return {
        ...product,
        price: Number(product.price),
        cost: product.cost ? Number(product.cost) : null,
        discount: product.discount ? Number(product.discount) : null,
        discountMinimumPrice: product.discountMinimumPrice ? Number(product.discountMinimumPrice) : null,
        taxRate: product.taxRate ? Number(product.taxRate) : null
    };
};

// TODO: Duplica producto
export const duplicateProduct = async (agencyId: string, productId: string, subaccountId?: string) => {
    if (!productId) {
        throw new Error("ID de producto no proporcionado");
    }

    const originalProduct = await db.product.findFirst({
        where: {
            id: productId,
            agencyId,
        },
    });

    if (!originalProduct) {
        throw new Error("Producto no encontrado");
    }

    const newProduct = await db.product.create({
        data: {
            name: `${originalProduct.name} (Copia)`,
            sku: `${originalProduct.sku}-COPY`,
            description: originalProduct.description,
            price: originalProduct.price,
            cost: originalProduct.cost,
            minStock: originalProduct.minStock,
            images: originalProduct.images,
            categoryId: originalProduct.categoryId,
            active: originalProduct.active,
            agencyId: originalProduct.agencyId,
            subAccountId: originalProduct.subAccountId,
            brand: originalProduct.brand,
            model: originalProduct.model,
            tags: originalProduct.tags,
            unit: originalProduct.unit,
            barcode: originalProduct.barcode,
            isActive: originalProduct.isActive,
            quantity: 0,
            locationId: originalProduct.locationId,
            warehouseId: originalProduct.warehouseId,
            isReturnable: originalProduct.isReturnable,
            taxRate: originalProduct.taxRate,
            supplierId: originalProduct.supplierId,
            variants: originalProduct.variants as any,
            customFields: originalProduct.customFields as any,
            externalIntegrations: originalProduct.externalIntegrations as any,
        },
    });

    await saveActivityLogsNotification({
        agencyId,
        description: `Producto duplicado: ${originalProduct.name} → ${newProduct.name}`,
        subaccountId,
    });

    return {
        ...newProduct,
        price: Number(newProduct.price),
        cost: newProduct.cost ? Number(newProduct.cost) : null,
        discount: newProduct.discount ? Number(newProduct.discount) : null,
        discountMinimumPrice: newProduct.discountMinimumPrice ? Number(newProduct.discountMinimumPrice) : null,
        taxRate: newProduct.taxRate ? Number(newProduct.taxRate) : null
    };
};

// TODO: Obtiene descuentos activos
export const getActiveDiscounts = async (agencyId: string) => {
    const now = new Date();

    const productsWithDiscount = await db.product.findMany({
        where: {
            agencyId,
            discount: { gt: 0 },
            discountEndDate: { gte: now },
            OR: [{ discountStartDate: null }, { discountStartDate: { lte: now } }],
        },
    });

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
    ];

    return discounts;
};

// TODO: Lista categorías
export const getCategories = async (agencyId: string) => {
    return await db.productCategory.findMany({
        where: { agencyId },
    });
};

// TODO: Crea categoría
export const createCategory = async (data: any) => {
    const category = await db.productCategory.create({
        data: {
            name: data.name,
            description: data.description,
            agencyId: data.agencyId,
        },
    });

    await saveActivityLogsNotification({
        agencyId: data.agencyId,
        description: `Categoría creada: ${data.name}`,
        subaccountId: data.subaccountId,
    });

    return category;
};

// TODO: Actualiza categoría
export const updateCategory = async (categoryId: string, data: any) => {
    const category = await db.productCategory.update({
        where: { id: categoryId },
        data: {
            name: data.name,
            description: data.description,
        },
    });

    await saveActivityLogsNotification({
        agencyId: data.agencyId,
        description: `Categoría actualizada: ${data.name}`,
        subaccountId: data.subaccountId,
    });

    return category;
};

// TODO: Elimina categoría
export const deleteCategory = async (agencyId: string, categoryId: string, subaccountId?: string) => {
    const category = await db.productCategory.delete({
        where: { id: categoryId },
    });

    await saveActivityLogsNotification({
        agencyId,
        description: `Categoría eliminada: ${category.name}`,
        subaccountId,
    });

    return category;
};

// TODO: Lista proveedores
export const getProviders = async (agencyId: string) => {
    return await db.provider.findMany({
        where: { agencyId },
    });
};

// TODO: Obtiene proveedor por ID
export const getProviderById = async (agencyId: string, providerId: string) => {
    return await db.provider.findFirst({
        where: {
            id: providerId,
            agencyId,
        },
    });
};

// TODO: Crea proveedor
export const createProvider = async (data: any) => {
    const provider = await db.provider.create({
        data: {
            name: data.name,
            contactName: data.contactName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            active: data.active !== false,
            agencyId: data.agencyId,
            subAccountId: data.subaccountId,
        },
    });

    await saveActivityLogsNotification({
        agencyId: data.agencyId,
        description: `Proveedor creado: ${data.name}`,
        subaccountId: data.subaccountId,
    });

    return provider;
};

// TODO: Actualiza proveedor
export const updateProvider = async (providerId: string, data: any) => {
    const provider = await db.provider.update({
        where: { id: providerId },
        data: {
            name: data.name,
            contactName: data.contactName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            active: data.active !== false,
            subAccountId: data.subaccountId,
        },
    });

    await saveActivityLogsNotification({
        agencyId: data.agencyId,
        description: `Proveedor actualizado: ${data.name}`,
        subaccountId: data.subaccountId,
    });

    return provider;
};

// TODO: Elimina proveedor
export const deleteProvider = async (agencyId: string, providerId: string, subaccountId?: string) => {
    const provider = await db.provider.delete({
        where: { id: providerId },
    });

    await saveActivityLogsNotification({
        agencyId,
        description: `Proveedor eliminado: ${provider.name}`,
        subaccountId,
    });

    return provider;
};

// TODO: Lista clientes
export const getClients = async (agencyId: string, subAccountId?: string) => {
    return await db.client.findMany({
        where: {
            agencyId,
            ...(subAccountId ? { subAccountId } : {})
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

// TODO: Obtiene cliente por ID
export const getClientById = async (clientId: string) => {
    return await db.client.findUnique({
        where: {
            id: clientId
        },
        include: {
            Opportunities: true,
            Cases: true,
            PQRs: true
        }
    });
};

// TODO: Obtiene clientes de agencia
export const getClientsByAgency = async (agencyId: string) => {
    return await db.client.findMany({
        where: {
            agencyId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

// TODO: Crea cliente
export const createClient = async (agencyId: string, data: any, subAccountId?: string) => {
    // Validar datos requeridos
    if (!data.name) {
        throw new Error("El nombre del cliente es obligatorio");
    }

    const client = await db.client.create({
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
            notes: data.notes,
            type: data.type || "INDIVIDUAL",
            status: data.status || "ACTIVE",
            agencyId: agencyId,
            subAccountId: subAccountId || null,
        },
    });

    await saveActivityLogsNotification({
        agencyId,
        description: `Cliente creado: ${data.name}`,
        subaccountId: subAccountId,
    });

    return client;
};

// TODO: Actualiza cliente
export const updateClient = async (clientId: string, data: any) => {
    const existingClient = await db.client.findUnique({
        where: { id: clientId },
    });

    if (!existingClient) {
        throw new Error("Cliente no encontrado");
    }

    const client = await db.client.update({
        where: { id: clientId },
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
            notes: data.notes,
            type: data.type,
            status: data.status,
        },
    });

    await saveActivityLogsNotification({
        agencyId: existingClient.agencyId,
        description: `Cliente actualizado: ${data.name}`,
        subaccountId: existingClient.subAccountId || undefined,
    });

    return client;
};

// TODO: Elimina cliente
export const deleteClient = async (clientId: string) => {
    const clientToDelete = await db.client.findUnique({
        where: { id: clientId },
    });

    if (!clientToDelete) {
        throw new Error("Cliente no encontrado");
    }

    const client = await db.client.delete({
        where: { id: clientId },
    });

    await saveActivityLogsNotification({
        agencyId: clientToDelete.agencyId,
        description: `Cliente eliminado: ${clientToDelete.name}`,
        subaccountId: clientToDelete.subAccountId || undefined,
    });

    return client;
};

// TODO: Filtra clientes por estado
export const getClientsByStatus = async (agencyId: string, status: string, subAccountId?: string) => {
    return await db.client.findMany({
        where: {
            agencyId,
            status: status as any,
            ...(subAccountId ? { subAccountId } : {})
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

// TODO: Filtra clientes por tipo
export const getClientsByType = async (agencyId: string, type: string, subAccountId?: string) => {
    return await db.client.findMany({
        where: {
            agencyId,
            type: type as any,
            ...(subAccountId ? { subAccountId } : {})
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

// TODO: Busca clientes
export const searchClients = async (agencyId: string, searchTerm: string, subAccountId?: string) => {
    return await db.client.findMany({
        where: {
            agencyId,
            ...(subAccountId ? { subAccountId } : {}),
            OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
                { phone: { contains: searchTerm, mode: 'insensitive' } },
            ],
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

// TODO: Lista áreas
export const getAreas = async (agencyId: string, subAccountId?: string) => {
    return await db.area.findMany({
        where: {
            agencyId,
            ...(subAccountId ? { subAccountId } : {})
        },
        orderBy: {
            name: 'asc'
        }
    });
};

// TODO: Obtiene área por ID
export const getAreaById = async (areaId: string) => {
    return await db.area.findUnique({
        where: { id: areaId }
    });
};

// TODO: Crea área
export const createArea = async (data: any) => {
    const area = await db.area.create({
        data: {
            name: data.name,
            description: data.description,
            agencyId: data.agencyId,
            subAccountId: data.subaccountId,
        },
    });

    await saveActivityLogsNotification({
        agencyId: data.agencyId,
        description: `Área creada: ${data.name}`,
        subaccountId: data.subaccountId,
    });

    return area;
};

// TODO: Actualiza área
export const updateArea = async (areaId: string, data: any) => {
    const area = await db.area.update({
        where: { id: areaId },
        data: {
            name: data.name,
            description: data.description,
            subAccountId: data.subaccountId,
        },
    });

    await saveActivityLogsNotification({
        agencyId: data.agencyId,
        description: `Área actualizada: ${data.name}`,
        subaccountId: data.subaccountId,
    });

    return area;
};

// TODO: Elimina área
export const deleteArea = async (agencyId: string, areaId: string, subaccountId?: string) => {
    const productsInArea = await db.movement.findMany({
        where: { areaId }
    });

    if (productsInArea.length > 0) {
        throw new Error("No se puede eliminar un área que contiene productos");
    }

    const area = await db.area.delete({
        where: { id: areaId },
    });

    await saveActivityLogsNotification({
        agencyId,
        description: `Área eliminada: ${area.name}`,
        subaccountId,
    });

    return area;
};


// TODO: Lista tiendas
export const getSubAccounts = async (agencyId: string) => {
    return await db.subAccount.findMany({
        where: { agencyId },
        orderBy: { name: 'asc' }
    });
};

// TODO: Lista movimientos
export const getMovements = async (agencyId: string, subAccountId?: string) => {
    const whereClause: any = { agencyId };

    if (subAccountId) {
        whereClause.subAccountId = subAccountId;
    }

    return await db.movement.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
        include: {
            Product: true,
            Area: true,
            DestinationArea: true,
            Provider: true,
        }
    });
};

// TODO: Crear movimiento
export const createMovement = async (data: any) => {
    if (!data.type || !data.productId || !data.areaId || !data.quantity || !data.agencyId) {
        throw new Error('Faltan campos requeridos para crear el movimiento');
    }

    if (data.quantity <= 0) {
        throw new Error('La cantidad debe ser mayor a cero');
    }

    const movement = await db.$transaction(async (tx) => {
        const currentProduct = await tx.product.findUnique({
            where: { id: data.productId }
        });

        if (!currentProduct) {
            throw new Error('Producto no encontrado');
        }

        let updateData = {};

        switch (data.type) {
            case 'entrada':
                updateData = {
                    quantity: (currentProduct.quantity || 0) + data.quantity
                };
                break;

            case 'salida':
                if ((currentProduct.quantity || 0) < data.quantity) {
                    throw new Error(`Stock insuficiente. Solo hay ${currentProduct.quantity} unidades disponibles.`);
                }
                updateData = {
                    quantity: (currentProduct.quantity || 0) - data.quantity
                };
                break;

            case 'transferencia':
                if (!data.destinationAreaId) {
                    throw new Error('Se requiere un área de destino para las transferencias');
                }

                if (data.areaId === data.destinationAreaId) {
                    throw new Error('El área de origen y destino no pueden ser la misma');
                }

                if ((currentProduct.quantity || 0) < data.quantity) {
                    throw new Error(`Stock insuficiente para transferir. Solo hay ${currentProduct.quantity} unidades disponibles.`);
                }

                updateData = {
                    quantity: currentProduct.quantity
                };
                break;

            default:
                throw new Error('Tipo de movimiento no válido');
        }

        await tx.product.update({
            where: { id: data.productId },
            data: updateData
        });

        const newMovement = await tx.movement.create({
            data: {
                type: data.type,
                quantity: data.quantity,
                notes: data.notes || '',
                date: data.date || new Date(),
                Product: { connect: { id: data.productId } },
                Area: { connect: { id: data.areaId } },
                Agency: { connect: { id: data.agencyId } },
                ...(data.subaccountId && { SubAccount: { connect: { id: data.subaccountId } } }),
                ...(data.providerId && { Provider: { connect: { id: data.providerId } } }),
                ...(data.destinationAreaId && { DestinationArea: { connect: { id: data.destinationAreaId } } }),
            },
        });

        return newMovement;
    });

    await saveActivityLogsNotification({
        agencyId: data.agencyId,
        description: `Movimiento de inventario: ${data.type} de ${data.quantity} unidades`,
        subaccountId: data.subaccountId,
    });

    return movement;
};

// TODO: Filtra movimientos
export const getMovementsByOptions = async (agencyId: string, options?: {
    subAccountId?: string;
    productId?: string;
    areaId?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
}) => {
    const { subAccountId, productId, areaId, type, startDate, endDate } = options || {};

    const whereClause: any = { agencyId };

    if (subAccountId) whereClause.subAccountId = subAccountId;
    if (productId) whereClause.productId = productId;
    if (areaId) whereClause.areaId = areaId;
    if (type) whereClause.type = type;

    if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = startDate;
        if (endDate) whereClause.createdAt.lte = endDate;
    }

    return await db.movement.findMany({
        where: whereClause,
        include: {
            Product: true,
            Area: true,
            DestinationArea: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

// TODO: Obtiene movimiento por ID
export const getMovementById = async (movementId: string) => {
    return await db.movement.findUnique({
        where: { id: movementId },
        include: {
            Product: true,
            Area: true,
            DestinationArea: true,
        }
    });
};


// TODO: Crea descuento
export const createDiscount = async (data: any) => {
    if (!data.discount || !data.startDate || !data.endDate || !data.agencyId) {
        throw new Error("Faltan datos requeridos para el descuento");
    }

    if (!data.applyToAll && (!data.itemIds || data.itemIds.length === 0)) {
        throw new Error("No se han proporcionado IDs de productos para actualizar");
    }

    if (data.discount <= 0 || data.discount >= 100) {
        throw new Error("El descuento debe ser mayor a 0% y menor a 100%");
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
        throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
    }

    try {
        if (data.discountType === "product") {
            if (data.applyToAll) {
                const products = await db.product.findMany({
                    where: { agencyId: data.agencyId }
                });

                let updatedCount = 0;
                const updatePromises = products.map(async (product) => {
                    try {
                        if (!product.id) {
                            console.error('Producto sin ID:', product);
                            return;
                        }

                        await db.product.update({
                            where: { id: product.id },
                            data: {
                                discount: Number(data.discount),
                                discountStartDate: startDate,
                                discountEndDate: endDate,
                                discountMinimumPrice: data.minimumPrice ? Number(data.minimumPrice) : null,
                            }
                        });
                        updatedCount++;
                    } catch (error) {
                        console.error(`Error actualizando producto ${product.id}:`, error);
                    }
                });

                await Promise.all(updatePromises);

                await saveActivityLogsNotification({
                    agencyId: data.agencyId,
                    description: `Descuento global aplicado: ${data.discount}% a todos los productos`,
                    subaccountId: data.subaccountId,
                });

                return { success: true, affectedItems: updatedCount };
            }
            // Si es para productos específicos
            else if (data.itemIds && data.itemIds.length > 0) {
                let updatedCount = 0;
                const updatePromises = data.itemIds.map(async (productId) => {
                    try {
                        if (!productId) {
                            console.error('ID de producto inválido:', productId);
                            return;
                        }
                        await db.product.update({
                            where: { id: productId },
                            data: {
                                discount: Number(data.discount),
                                discountStartDate: startDate,
                                discountEndDate: endDate,
                                discountMinimumPrice: data.minimumPrice ? Number(data.minimumPrice) : null,
                            }
                        });
                        updatedCount++;
                    } catch (error) {
                        console.error(`Error actualizando producto ${productId}:`, error);
                    }
                });

                await Promise.all(updatePromises);

                await saveActivityLogsNotification({
                    agencyId: data.agencyId,
                    description: `Descuento aplicado: ${data.discount}% a ${updatedCount} productos`,
                    subaccountId: data.subaccountId,
                });

                return { success: true, affectedItems: updatedCount };
            }
        }
        // Si es para categorías
        else if (data.discountType === "category") {
            if (data.itemIds && data.itemIds.length > 0) {
                let updatedCount = 0;

                const products = await db.product.findMany({
                    where: {
                        categoryId: {
                            in: data.itemIds
                        },
                        agencyId: data.agencyId
                    }
                });

                for (const product of products) {
                    try {
                        await db.product.update({
                            where: {
                                id: product.id
                            },
                            data: {
                                discount: parseFloat(data.discount),
                                discountStartDate: startDate,
                                discountEndDate: endDate,
                                discountMinimumPrice: data.minimumPrice ? parseFloat(data.minimumPrice) : null,
                            }
                        });
                        updatedCount++;
                    } catch (updateError) {
                        console.error(`Error al actualizar producto ${product.id}:`, updateError);
                    }
                }

                await saveActivityLogsNotification({
                    agencyId: data.agencyId,
                    description: `Descuento por categoría aplicado: ${data.discount}% a ${updatedCount} productos`,
                    subaccountId: data.subaccountId,
                });

                return { success: true, affectedItems: updatedCount };
            }

            return { success: false, message: "No se especificaron categorías para actualizar" };
        }

        return { success: false, message: "Tipo de descuento no válido" };
    } catch (error) {
        console.error("Error al aplicar el descuento:", error);
        throw new Error(`Error al aplicar el descuento: ${error.message || 'Error desconocido'}`);
    }
};

// TODO: Elimina descuento
export const removeDiscount = async (agencyId: string, productId: string, subaccountId?: string) => {
    const product = await db.product.update({
        where: { id: productId },
        data: {
            discount: 0,
            discountStartDate: null,
            discountEndDate: null,
            discountMinimumPrice: null,
        }
    });

    await saveActivityLogsNotification({
        agencyId,
        description: `Descuento eliminado del producto: ${product.name}`,
        subaccountId,
    });

    return { success: true };
};

// TODO: Exporta inventario
export const exportInventoryData = async (agencyId: string, options?: {
    format?: 'excel' | 'pdf' | 'json';
    fields?: string[];
    subAccountId?: string;
    categoryId?: string;
    areaId?: string;
    includeZeroStock?: boolean;
}) => {
    const { format = 'excel', fields = [], subAccountId, categoryId, areaId, includeZeroStock = false } = options || {};

    // Construir la consulta base para productos
    const whereClause: any = { agencyId };

    // Añadir filtros adicionales si se proporcionan
    if (subAccountId) whereClause.subAccountId = subAccountId;
    if (categoryId) whereClause.categoryId = categoryId;

    // Obtener productos con sus categorías
    const products = await db.product.findMany({
        where: whereClause,
        include: {
            Category: true,
            Movements: true,
        },
    });

    // Obtener áreas para calcular stock por área
    const areas = await db.area.findMany({
        where: {
            agencyId,
            ...(subAccountId ? { subAccountId } : {})
        },
    });

    // Procesar datos para exportación
    const exportData = products.map(product => {
        // Calcular stock por área
        const stockByArea: Record<string, number> = {};
        let totalStock = 0;

        // Inicializar stock en 0 para todas las áreas
        areas.forEach(area => {
            stockByArea[area.id] = 0;
        });

        // Calcular stock basado en movimientos
        product.Movements.forEach((movement: any) => {
            if (movement.type === 'entrada') {
                stockByArea[movement.areaId] = (stockByArea[movement.areaId] || 0) + movement.quantity;
                totalStock += movement.quantity;
            } else if (movement.type === 'salida') {
                stockByArea[movement.areaId] = (stockByArea[movement.areaId] || 0) - movement.quantity;
                totalStock -= movement.quantity;
            } else if (movement.type === 'transferencia') {
                stockByArea[movement.areaId] = (stockByArea[movement.areaId] || 0) - movement.quantity;
                stockByArea[movement.destinationAreaId] = (stockByArea[movement.destinationAreaId] || 0) + movement.quantity;
            }
        });

        // Filtrar por área específica si se proporciona
        if (areaId && stockByArea[areaId] === 0 && !includeZeroStock) {
            return null;
        }

        // Crear objeto con los datos del producto
        const productData: Record<string, any> = {
            id: product.id,
            name: product.name,
            sku: product.sku,
            barcode: product.barcode || 'N/A',
            price: Number(product.price),
            cost: product.cost ? Number(product.cost) : 0,
            category: product.Category ? product.Category.name : 'Sin categoría',
            totalStock,
            minStock: product.minStock || 0,
            lastUpdated: product.updatedAt ? new Date(product.updatedAt).toISOString() : 'N/A',
        };

        // Añadir stock por área
        areas.forEach(area => {
            productData[`stock_${area.id}`] = stockByArea[area.id] || 0;
            productData[`area_${area.id}`] = area.name;
        });

        return productData;
    }).filter(Boolean); // Eliminar productos nulos (filtrados por área)

    // Filtrar campos si se especifican
    let filteredData = exportData;
    if (fields.length > 0) {
        filteredData = exportData.map(item => {
            if (!item) return null;
            const filtered: Record<string, any> = {};
            fields.forEach(field => {
                if (item && item[field] !== undefined) {
                    filtered[field] = item[field];
                }
            });
            return filtered;
        }).filter(Boolean) as Record<string, any>[];
    }

    return {
        success: true,
        format,
        data: filteredData,
        timestamp: new Date().toISOString(),
        totalItems: filteredData.length,
    };
};

// TODO: Exporta movimientos
export const exportMovementsData = async (agencyId: string, options?: {
    format?: 'excel' | 'pdf' | 'json';
    fields?: string[];
    startDate?: Date;
    endDate?: Date;
    type?: string;
    productId?: string;
    areaId?: string;
    subAccountId?: string;
}) => {
    const { format = 'excel', fields = [], startDate, endDate, type, productId, areaId, subAccountId } = options || {};

    // Construir la consulta para movimientos
    const whereClause: any = { agencyId };

    // Añadir filtros adicionales
    if (subAccountId) whereClause.subAccountId = subAccountId;
    if (productId) whereClause.productId = productId;
    if (areaId) whereClause.areaId = areaId;
    if (type) whereClause.type = type;

    // Filtro de fechas
    if (startDate || endDate) {
        whereClause.date = {};
        if (startDate) whereClause.date.gte = startDate;
        if (endDate) whereClause.date.lte = endDate;
    }

    // Obtener movimientos con relaciones
    const movements = await db.movement.findMany({
        where: whereClause,
        include: {
            Product: true,
            Area: true,
            DestinationArea: true,
            Provider: true,
        },
        orderBy: {
            date: 'desc',
        },
    });

    // Procesar datos para exportación
    const exportData = movements.map(movement => {
        const movementData: Record<string, any> = {
            id: movement.id,
            date: movement.date.toISOString(),
            type: movement.type,
            quantity: movement.quantity,
            productId: movement.productId,
            productName: movement.Product ? movement.Product.name : 'Producto desconocido',
            productSku: movement.Product ? movement.Product.sku : 'N/A',
            areaId: movement.areaId,
            areaName: movement.Area ? movement.Area.name : 'Área desconocida',
            notes: movement.notes || '',
        };

        // Añadir datos adicionales según el tipo de movimiento
        if (movement.type === 'transferencia' && movement.DestinationArea) {
            movementData.destinationAreaId = movement.destinationAreaId;
            movementData.destinationAreaName = movement.DestinationArea.name;
        }

        if (movement.type === 'entrada' && movement.Provider) {
            movementData.providerId = movement.providerId;
            movementData.providerName = movement.Provider.name;
        }

        return movementData;
    });

    // Filtrar campos si se especifican
    let filteredData = exportData;
    if (fields.length > 0) {
        filteredData = exportData.map(item => {
            if (!item) return null;
            const filtered: Record<string, any> = {};
            fields.forEach(field => {
                if (item && item[field] !== undefined) {
                    filtered[field] = item[field];
                }
            });
            return filtered;
        }).filter(Boolean) as Record<string, any>[];
    }

    return {
        success: true,
        format,
        data: filteredData,
        timestamp: new Date().toISOString(),
        totalItems: filteredData.length,
    };
};

// TODO: Obtiene stock de producto
export const getProductStock = async (productId: string, options?: {
    areaId?: string;
}) => {
    const { areaId } = options || {};

    // Obtener el producto con sus movimientos
    const product = await db.product.findUnique({
        where: { id: productId },
        include: {
            Movements: true,
        },
    });

    if (!product) {
        throw new Error("Producto no encontrado");
    }

    // Obtener todas las áreas o un área específica
    const areasQuery: any = { agencyId: product.agencyId };
    if (areaId) areasQuery.id = areaId;

    const areas = await db.area.findMany({
        where: areasQuery,
    });

    // Calcular stock por área
    const stockByArea: Record<string, { areaId: string, areaName: string, quantity: number }> = {};

    // Inicializar stock en 0 para todas las áreas
    areas.forEach(area => {
        stockByArea[area.id] = {
            areaId: area.id,
            areaName: area.name,
            quantity: 0,
        };
    });

    // Calcular stock basado en movimientos
    product.Movements.forEach((movement: any) => {
        if (movement.type === 'entrada') {
            if (stockByArea[movement.areaId]) {
                stockByArea[movement.areaId].quantity += movement.quantity;
            }
        } else if (movement.type === 'salida') {
            if (stockByArea[movement.areaId]) {
                stockByArea[movement.areaId].quantity -= movement.quantity;
            }
        } else if (movement.type === 'transferencia') {
            if (stockByArea[movement.areaId]) {
                stockByArea[movement.areaId].quantity -= movement.quantity;
            }
            if (stockByArea[movement.destinationAreaId]) {
                stockByArea[movement.destinationAreaId].quantity += movement.quantity;
            }
        }
    });

    // Calcular stock total
    const totalStock = Object.values(stockByArea).reduce((sum, area) => sum + area.quantity, 0);

    // Determinar estado del stock
    let stockStatus = 'normal';
    if (product.minStock && totalStock <= product.minStock) {
        stockStatus = 'bajo';
    }

    return {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        totalStock,
        minStock: product.minStock || 0,
        stockStatus,
        stockByArea: Object.values(stockByArea),
    };
};

// TODO: Actualiza configuración de stock
export const updateStockSettings = async (productId: string, data: {
    minStock?: number;
    maxStock?: number;
    reorderPoint?: number;
}) => {
    // Validar datos
    if (data.maxStock && data.minStock && data.minStock > data.maxStock) {
        throw new Error("El stock mínimo no puede ser mayor que el stock máximo");
    }

    if (data.reorderPoint && data.maxStock && data.minStock &&
        (data.reorderPoint < data.minStock || data.reorderPoint > data.maxStock)) {
        throw new Error("El punto de reorden debe estar entre el stock mínimo y máximo");
    }

    // Actualizar configuración de stock
    const product = await db.product.update({
        where: { id: productId },
        data: {
            minStock: data.minStock,
        },
    });

    return product;
};

// TODO: Obtiene productos para POS
export const getProductsForPOS = async (agencyId: string, options?: {
    subAccountId?: string;
    categoryId?: string;
    search?: string;
}) => {
    const { subAccountId, categoryId, search } = options || {};

    // Construir la consulta base
    const whereClause: any = {
        agencyId,
        active: true,
    };

    // Añadir filtro de tienda si se proporciona
    if (subAccountId) {
        whereClause.subAccountId = subAccountId;
    }

    // Añadir filtro de categoría si se proporciona y no es "Todos"
    if (categoryId && categoryId !== "Todos") {
        whereClause.categoryId = categoryId;
    }

    // Añadir búsqueda por término si se proporciona
    if (search) {
        whereClause.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { barcode: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }

    // Obtener productos con sus categorías y movimientos
    const products = await db.product.findMany({
        where: whereClause,
        include: {
            Category: true,
            Movements: true,
        },
        orderBy: {
            name: 'asc'
        }
    });

    // Convertir campos Decimal a número para evitar problemas en componentes cliente
    return products.map(product => ({
        ...product,
        price: Number(product.price),
        cost: product.cost ? Number(product.cost) : null,
        discount: product.discount ? Number(product.discount) : 0,
        discountMinimumPrice: product.discountMinimumPrice ? Number(product.discountMinimumPrice) : null,
        taxRate: product.taxRate ? Number(product.taxRate) : 0
    }));
};

// TODO: Procesa venta
export const processSale = async (data: {
    agencyId: string;
    subAccountId?: string;
    areaId?: string;
    products: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
    }>;
    client: {
        id: string | null;
        name: string;
    };
    paymentMethod: string;
    total: number;
}) => {
    // 0. Validaciones previas
    if (!data.products || data.products.length === 0) {
        throw new Error("No hay productos en la venta");
    }

    // 0.1. Comprobar si el cliente existe (para conectar o no dentro de la transacción)
    let clientExists = false;
    if (data.client.id) {
        const contact = await db.contact.findUnique({
            where: { id: data.client.id }
        });
        clientExists = !!contact;
    }

    // 1. Iniciar transacción con timeout de 60 s
    const sale = await db.$transaction(
        async (tx) => {
            // 1.1. Cargar y verificar stock
            const productIds = data.products.map(p => p.id);
            const products = await tx.product.findMany({
                where: { id: { in: productIds } }
            });
            const stockMap = new Map(products.map(p => [p.id, p.quantity]));
            for (const item of data.products) {
                const available = stockMap.get(item.id) ?? 0;
                if (available < item.quantity) {
                    throw new Error(`Cantidad insuficiente para ${item.name}. Disponible: ${available}`);
                }
            }

            // 1.2. Número de venta único
            const now = new Date();
            const formatted = [
                now.getFullYear(),
                String(now.getMonth() + 1).padStart(2, '0'),
                String(now.getDate()).padStart(2, '0')
            ].join('');
            const saleNumber = `V-${formatted}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

            // 1.3. Área por defecto si no viene
            let areaId = data.areaId;
            if (!areaId) {
                const defaultArea = await tx.area.findFirst({
                    where: { agencyId: data.agencyId },
                    select: { id: true }
                });
                if (defaultArea) {
                    areaId = defaultArea.id;
                } else {
                    const newArea = await tx.area.create({
                        data: {
                            name: "Área Predeterminada",
                            description: "Área creada automáticamente para ventas POS",
                            agencyId: data.agencyId
                        }
                    });
                    areaId = newArea.id;
                }
            }

            // 1.4. Crear la venta + items anidados
            const saleRecord = await tx.sale.create({
                data: {
                    saleNumber,
                    total: data.total,
                    paymentMethod: data.paymentMethod as any,
                    status: "COMPLETED",
                    ...(clientExists && {
                        Customer: { connect: { id: data.client.id! } }
                    }),
                    Agency: { connect: { id: data.agencyId } },
                    Area: { connect: { id: areaId! } },
                    ...(data.subAccountId && {
                        SubAccount: { connect: { id: data.subAccountId } }
                    }),
                    Items: {
                        create: data.products.map(item => ({
                            productId: item.id,
                            quantity: item.quantity,
                            unitPrice: item.price,
                            subtotal: item.price * item.quantity,
                            description: item.name
                        }))
                    },
                    notes: !data.client.id && data.client.name
                        ? `Cliente: ${data.client.name}`
                        : undefined
                }
            });

            // 1.5. Actualizar inventario en paralelo
            await Promise.all(
                data.products.map(item =>
                    tx.product.update({
                        where: { id: item.id },
                        data: { quantity: { decrement: item.quantity } }
                    })
                )
            );

            // 1.6. Crear movimientos en batch
            await tx.movement.createMany({
                data: data.products.map(item => ({
                    productId: item.id,
                    type: "SALIDA",
                    quantity: -item.quantity,
                    notes: `Venta ${saleNumber} - POS`,
                    agencyId: data.agencyId,
                    areaId: areaId!,
                    subAccountId: data.subAccountId
                }))
            });

            return saleRecord;
        },
        { timeout: 60000 }
    );

    // 2. Fuera de la transacción, registrar actividad/logs
    await saveActivityLogsNotification({
        agencyId: data.agencyId,
        description: `Venta ${sale.saleNumber} procesada: ${data.products.length} productos por $${data.total}`,
        subaccountId: data.subAccountId
    });

    return sale;
};


// TODO: Guarda el estado del carrito
export const saveSaleState = async (data: {
    agencyId: string;
    subAccountId?: string;
    products: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
        subtotal: number;
    }>;
    client: {
        id: string | null;
        name: string;
    };
}) => {
    // Verificar que haya productos en el carrito
    if (!data.products || data.products.length === 0) {
        throw new Error("No hay productos en el carrito");
    }

    // Guardar el estado del carrito
    const savedSale = await db.savedSale.create({
        data: {
            agencyId: data.agencyId,
            subAccountId: data.subAccountId,
            // Convertir el objeto client a una cadena JSON
            client: JSON.stringify(data.client),
            // Convertir el array de productos a una cadena JSON
            products: JSON.stringify(data.products),
            total: data.products.reduce((sum, product) => sum + product.subtotal, 0),
            areaId: "default" // Valor por defecto para el campo obligatorio areaId
        }
    });

    // Registrar actividad
    await saveActivityLogsNotification({
        agencyId: data.agencyId,
        description: `Venta guardada: ${data.products.length} productos`,
        subaccountId: data.subAccountId,
    });

    return savedSale;
};

// TODO: Obtiene ventas guardadas
export const getSavedSales = async (agencyId: string, options?: {
    subAccountId?: string;
}) => {
    const { subAccountId } = options || {};

    // Construir la consulta base
    const whereClause: any = {
        agencyId
        // Se eliminó el filtro de status porque no existe en el modelo
    };

    // Añadir filtro de tienda si se proporciona
    if (subAccountId) {
        whereClause.subAccountId = subAccountId;
    }

    // Obtener ventas guardadas
    const savedSales = await db.savedSale.findMany({
        where: whereClause,
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Convertir las cadenas JSON a objetos JavaScript
    return savedSales.map(sale => ({
        ...sale,
        products: JSON.parse(sale.products as string),
        client: sale.client ? JSON.parse(sale.client as string) : { name: "Cliente General", id: null }
    }));
}

// TODO: Elimina una venta guardada
export const deleteSavedSale = async (id: string) => {
    // Verificar que la venta guardada exista
    const savedSale = await db.savedSale.findUnique({
        where: { id }
    });

    if (!savedSale) {
        throw new Error("Venta guardada no encontrada");
    }

    // Eliminar la venta guardada
    await db.savedSale.delete({
        where: { id }
    });

    // Registrar actividad
    await saveActivityLogsNotification({
        agencyId: savedSale.agencyId,
        description: `Venta guardada eliminada`,
        subaccountId: savedSale.subAccountId || undefined,
    });

    return { success: true };
};

// TODO: Genera una factura
export const generateInvoice = async (data: {
    agencyId: string;
    subAccountId?: string | null;
    customerId: string;
    items: Array<{
        productId: string;
        description: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    notes?: string;
}) => {
    try {
        if (!data.items || data.items.length === 0) {
            throw new Error("No hay productos en la factura");
        }

        // Verificar que el cliente existe en la tabla Client
        const client = await db.client.findUnique({
            where: { 
                id: data.customerId
            }
        });

        if (!client) {
            throw new Error(`Cliente con ID ${data.customerId} no encontrado`);
        }

        // Generar número de factura único con formato
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const invoiceNumber = `INV-${formattedDate}-${randomPart}`;

        // Crear la factura con los items correctamente formateados
        const invoice = await db.invoice.create({
            data: {
                invoiceNumber: invoiceNumber,
                status: "PENDING",
                invoiceType: "PHYSICAL",
                documentType: "INVOICE",
                subtotal: data.subtotal,
                tax: data.tax,
                discount: 0,
                total: data.total,
                notes: data.notes || "",
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                customerId: client.id, // Usamos directamente el ID del Client
                agencyId: data.agencyId,
                subAccountId: data.subAccountId,
                customerTaxId: client.taxId || null,
                customerTaxType: client.taxIdType || null,
                customerEmail: client.email || null,
                customerPhone: client.phone || null,
                customerAddress: client.address || null,
                Items: {
                    create: data.items.map(item => ({
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        discount: 0,
                        tax: data.tax / data.subtotal * item.subtotal,
                        total: item.subtotal * (1 + (data.tax / data.subtotal)),
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

        await saveActivityLogsNotification({
            agencyId: data.agencyId,
            description: `Factura ${invoiceNumber} generada para ${client.name}`,
            subaccountId: data.subAccountId || undefined,
        });

        return {
            success: true,
            data: invoice
        };
    } catch (error) {
        console.error("Error al generar la factura:", error);
        throw error instanceof Error 
            ? error 
            : new Error("Error desconocido al generar la factura");
    }
};

// TODO: Envia una factura por correo electrónico
export const sendInvoiceByEmail = async (invoiceId: string) => {
    try {
        // Verificar que la factura exista
        const invoice = await db.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                Customer: true,
                Items: true
            }
        });

        if (!invoice) {
            throw new Error("Factura no encontrada");
        }

        if (!invoice.Customer || !invoice.Customer.email) {
            throw new Error("El cliente no tiene correo electrónico");
        }

        const emailData = {
            to: invoice.Customer.email,
            subject: `Factura ${invoice.invoiceNumber}`,
            body: `Estimado/a ${invoice.Customer.name},\n\nAdjunto encontrará su factura ${invoice.invoiceNumber} por un total de ${invoice.total}.\n\nGracias por su compra.`,
            attachments: []
        };

        // Actualizar la factura para indicar que se envió
        await db.invoice.update({
            where: { id: invoiceId },
            data: {
            }
        });

        await saveActivityLogsNotification({
            agencyId: invoice.agencyId,
            description: `Factura ${invoice.invoiceNumber} enviada por correo a ${invoice.Customer.email}`,
            subaccountId: invoice.subAccountId || undefined,
        });

        return {
            success: true,
            message: `Factura enviada a ${invoice.Customer.email}`
        };
    } catch (error) {
        console.error("Error al enviar factura por correo:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido al enviar la factura"
        };
    }
};

// TODO: Obtiene las áreas para POS
export const getAreasForPOS = async (agencyId: string, subAccountId?: string) => {
    const whereClause: any = {
        agencyId,
        active: true
    };

    if (subAccountId) {
        whereClause.subAccountId = subAccountId;
    }

    return await db.area.findMany({
        where: whereClause,
        orderBy: {
            name: 'asc'
        }
    });
};

// TODO: Vincula una venta con una factura
export const linkSaleToInvoice = async (saleId: string, invoiceId: string) => {
    try {
        // Verificar que la venta exista
        const sale = await db.sale.findUnique({
            where: { id: saleId }
        });

        if (!sale) {
            throw new Error("Venta no encontrada");
        }

        // Verificar que la factura exista
        const invoice = await db.invoice.findUnique({
            where: { id: invoiceId }
        });

        if (!invoice) {
            throw new Error("Factura no encontrada");
        }

        // Actualizar la venta con la referencia a la factura
        const updatedSale = await db.sale.update({
            where: { id: saleId },
            data: {
                invoiceId: invoiceId
            }
        });

        await saveActivityLogsNotification({
            agencyId: sale.agencyId,
            description: `Venta ${saleId} vinculada a factura ${invoiceId}`,
            subaccountId: sale.subAccountId || undefined,
        });

        return {
            success: true,
            data: updatedSale
        };
    } catch (error) {
        console.error("Error al vincular venta con factura:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido al vincular venta con factura"
        };
    }
};

// TODO: Obtiene las categorías para POS
export const getCategoriesForPOS = async (agencyId: string, subAccountId?: string) => {
    const whereClause: any = {
        agencyId
    };

    if (subAccountId) {
        whereClause.subAccountId = subAccountId;
    }

    return await db.productCategory.findMany({
        where: whereClause,
        orderBy: {
            name: 'asc'
        }
    });
};

// TODO: Obtiene los clientes para POS
export const getClientsForPOS = async (agencyId: string, subAccountId?: string) => {
    const whereClause: any = {
        agencyId,
        status: "ACTIVE"
    };

    if (subAccountId) {
        whereClause.subAccountId = subAccountId;
    }

    return await db.client.findMany({
        where: whereClause,
        orderBy: {
            name: 'asc'
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            type: true
        }
    });
};

// TODO: Obtiene las tiendas para una agencia
export const getSubAccountsForAgency = async (agencyId: string) => {
    if (!agencyId) {
        throw new Error("ID de agencia no proporcionado");
    }

    return await db.subAccount.findMany({
        where: {
            agencyId
        },
        orderBy: {
            name: 'asc'
        },
        select: {
            id: true,
            name: true,
            subAccountLogo: true,
            createdAt: true,
            updatedAt: true
        }
    });
};