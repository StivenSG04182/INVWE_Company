import { z } from 'zod';

// Esquema de validación para la creación de una tienda
export const createStoreSchema = z.object({
    name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }).max(50),
    description: z.string().max(500).optional(),
    companyId: z.string(),
});

// Esquema de validación para la actualización de una tienda
export const updateStoreSchema = z.object({
    name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }).max(50).optional(),
    description: z.string().max(500).optional(),
    logoUrl: z.string().url({ message: 'URL de logo inválida' }).optional().nullable(),
    bannerUrl: z.string().url({ message: 'URL de banner inválida' }).optional().nullable(),
    themeId: z.string().optional().nullable(),
    templateId: z.string().optional().nullable(),
    domain: z.string().optional().nullable(),
    isPublished: z.boolean().optional(),
});

// Esquema de validación para la configuración de la tienda
export const storeSettingsSchema = z.object({
    currency: z.string().min(3).max(3),
    language: z.string().min(2).max(5),
    paymentMethods: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            isEnabled: z.boolean(),
            config: z.record(z.any()),
        })
    ),
    shippingOptions: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            price: z.number().min(0),
            isEnabled: z.boolean(),
            estimatedDeliveryTime: z.string().optional(),
        })
    ),
    taxSettings: z.object({
        isEnabled: z.boolean(),
        rate: z.number().min(0).max(100),
        includeInPrice: z.boolean(),
    }),
    contactInfo: z.object({
        email: z.string().email({ message: 'Email inválido' }),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
    socialMedia: z.object({
        facebook: z.string().url().optional().nullable(),
        instagram: z.string().url().optional().nullable(),
        twitter: z.string().url().optional().nullable(),
        tiktok: z.string().url().optional().nullable(),
        youtube: z.string().url().optional().nullable(),
    }).optional(),
});

// Esquema de validación para la creación de un producto
export const createProductSchema = z.object({
    name: z.string().min(3).max(100),
    description: z.string(),
    price: z.number().min(0),
    compareAtPrice: z.number().min(0).optional(),
    images: z.array(z.string().url()),
    categories: z.array(z.string()),
    tags: z.array(z.string()),
    inventory: z.object({
        sku: z.string(),
        quantity: z.number().int().min(0),
        isTracking: z.boolean(),
    }),
    variants: z.array(
        z.object({
            name: z.string(),
            price: z.number().min(0),
            compareAtPrice: z.number().min(0).optional(),
            sku: z.string(),
            quantity: z.number().int().min(0),
            options: z.array(
                z.object({
                    name: z.string(),
                    value: z.string(),
                })
            ),
            imageUrl: z.string().url().optional(),
        })
    ).optional(),
    isPublished: z.boolean().default(false),
});

// Esquema de validación para la actualización de un producto
export const updateProductSchema = createProductSchema.partial();

// Esquema de validación para la creación de un pedido
export const createOrderSchema = z.object({
    customerId: z.string().optional(),
    items: z.array(
        z.object({
            productId: z.string(),
            variantId: z.string().optional(),
            name: z.string(),
            price: z.number().min(0),
            quantity: z.number().int().min(1),
            total: z.number().min(0),
            options: z.array(
                z.object({
                    name: z.string(),
                    value: z.string(),
                })
            ).optional(),
        })
    ),
    shippingAddress: z.object({
        firstName: z.string(),
        lastName: z.string(),
        address1: z.string(),
        address2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
    }),
    billingAddress: z.object({
        firstName: z.string(),
        lastName: z.string(),
        address1: z.string(),
        address2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
    }),
    paymentMethod: z.string(),
    notes: z.string().optional(),
});

// Esquema de validación para la actualización de un pedido
export const updateOrderSchema = z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
    paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
    notes: z.string().optional(),
});