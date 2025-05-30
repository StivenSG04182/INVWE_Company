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
        // Obtener productos y su información relacionada
        const products = await db.product.findMany({
            where: {
                subAccountId: subaccountId,
            },
            include: {
                stocks: true,
            },
        });

        // Calcular estadísticas
        const totalProducts = products.length;
        const activeProducts = products.filter(product => product.active).length;

        const lowStockProducts = products.filter(product => {
            const totalStock = product.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
            return product.minStock && totalStock <= product.minStock;
        }).length;

        const inventoryValue = products.reduce((total, product) => {
            const totalStock = product.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
            return total + (product.price * totalStock);
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
            product: true,
            area: true,
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
        include: {
            stocks: {
                include: {
                    area: true,
                },
            },
        },
    });
};

export const getSubaccountAreas = async (subaccountId: string) => {
    return await db.area.findMany({
        where: {
            subAccountId: subaccountId,
        },
        include: {
            stocks: {
                include: {
                    product: true,
                },
            },
        },
    });
};

export const createSubaccountMovement = async (
    subaccountId: string,
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
        },
    });
};

export const updateSubaccountStock = async (
    subaccountId: string,
    stockId: string,
    quantity: number
) => {
    return await db.stock.update({
        where: {
            id: stockId,
            subAccountId: subaccountId,
        },
        data: {
            quantity,
        },
    });
};

export const createSubaccountProduct = async (
    subaccountId: string,
    data: {
        name: string;
        description?: string;
        price: number;
        minStock?: number;
        stocks?: {
            areaId: string;
            quantity: number;
        }[];
    }
) => {
    return await db.product.create({
        data: {
            ...data,
            subAccountId: subaccountId,
            stocks: {
                create: data.stocks?.map(stock => ({
                    ...stock,
                    subAccountId: subaccountId,
                })),
            },
        },
        include: {
            stocks: true,
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
    data: {
        name: string;
        description?: string;
    }
) => {
    return await db.area.create({
        data: {
            ...data,
            subAccountId: subaccountId,
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
        include: {
            stocks: {
                include: {
                    product: true,
                },
            },
        },
    });

    const areaValues = areaStats.map(area => ({
        name: area.name,
        value: area.stocks.reduce((total, stock) =>
            total + (stock.quantity * stock.product.price), 0
        ),
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
        include: {
            stocks: {
                include: {
                    area: true,
                },
            },
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
        include: {
            stocks: true,
        },
    });

    return products.filter(product => {
        const totalStock = product.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
        return totalStock <= (product.minStock || 0);
    });
};