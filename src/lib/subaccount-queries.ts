"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

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

export const getSubaccountDetails = async (subaccountId: string) => {
    const response = await db.subAccount.findUnique({
        where: {
            id: subaccountId,
        },
        include: {
            Agency: true,
        },
    });
    return response;
};

export const getDashboardData = async (subaccountId: string) => {
    try {
        const products = await db.product.findMany({
            where: {
                subAccountId: subaccountId,
            }
        });
        const totalProducts = products.length;
        const activeProducts = products.filter(product => product.active).length;

        const lowStockProducts = products.filter(product => {
            const totalStock = typeof product.quantity === "number" ? product.quantity : 0;
            return typeof product.minStock === "number" && totalStock <= product.minStock;
        }).length;

        const inventoryValue = products.reduce((total, product) => {
            const totalStock = typeof product.quantity === "number" ? product.quantity : 0;
            return total + (Number(product.price) * totalStock);
        }, 0);

        return {
            totalProducts,
            activeProducts,
            lowStockProducts,
            inventoryValue,
        };
    } catch (error) {
        console.error('Error al obtener datos del dashboard:', error);
        throw error;
    }
};

export const getSubaccountMovements = async (subaccountId: string, limit: number = 5) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await db.movement.findMany({
        where: {
            subAccountId: subaccountId,
            createdAt: {
                gte: thirtyDaysAgo,
            },
        },
        include: {
            Product: true,
            Area: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: limit,
    });
};

export const getSubaccountProducts = async (subaccountId: string) => {
    return await db.product.findMany({
        where: {
            subAccountId: subaccountId,
        },
    });
};

export const getSubaccountAreas = async (subaccountId: string) => {
    return await db.area.findMany({
        where: {
            subAccountId: subaccountId,
        },
    });
};

export const createSubaccountMovement = async (
    subaccountId: string,
    agencyId: string,
    data: {
        type: 'entrada' | 'salida' | 'transferencia';
        quantity: number;
        productId: string;
        areaId: string;
    }
) => {
    return await db.movement.create({
        data: {
            ...data,
            subAccountId: subaccountId,
            agencyId,
        },
    });
};

export const createSubaccountProduct = async (
    subaccountId: string,
    agencyId: string,
    data: {
        name: string;
        description?: string;
        price: number;
        minStock?: number;
        quantity?: number;
        sku: string;
    }
) => {
    return await db.product.create({
        data: {
            ...data,
            subAccountId: subaccountId,
            agencyId,
        },
    });
};

export const updateSubaccountProduct = async (
    subaccountId: string,
    productId: string,
    data: {
        name?: string;
        description?: string;
        price?: number;
        minStock?: number;
        active?: boolean;
    }
) => {
    return await db.product.update({
        where: {
            id: productId,
            subAccountId: subaccountId,
        },
        data,
    });
};

export const createSubaccountArea = async (
    subaccountId: string,
    agencyId: string,
    data: {
        name: string;
        description?: string;
    }
) => {
    return await db.area.create({
        data: {
            ...data,
            subAccountId: subaccountId,
            agencyId,
        },
    });
};

export const getSubaccountStats = async (subaccountId: string) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Obtener estadísticas de movimientos
    const movements = await db.movement.groupBy({
        by: ['type'],
        where: {
            subAccountId: subaccountId,
            createdAt: {
                gte: thirtyDaysAgo,
            },
        },
        _count: true,
    });

    // Obtener valor total del inventario por área
    const areaStats = await db.area.findMany({
        where: {
            subAccountId: subaccountId,
        },
    });

    // No hay stocks por área, así que no se puede calcular el valor por área basado en stocks
    // Se puede dejar vacío o calcular de otra forma si se requiere
    const areaValues: { name: string; value: number }[] = areaStats.map(area => ({
        name: area.name,
        value: 0,
    }));

    return {
        movements,
        areaValues,
    };
};

export const searchSubaccountProducts = async (
    subaccountId: string,
    searchTerm: string
) => {
    return await db.product.findMany({
        where: {
            subAccountId: subaccountId,
            OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
            ],
        },
    });
};

export const getLowStockProducts = async (subaccountId: string) => {
    const products = await db.product.findMany({
        where: {
            subAccountId: subaccountId,
            minStock: {
                not: null,
            },
        },
    });

    return products.filter(product => {
        const totalStock = typeof product.quantity === "number" ? product.quantity : 0;
        return totalStock <= (product.minStock || 0);
    });
};