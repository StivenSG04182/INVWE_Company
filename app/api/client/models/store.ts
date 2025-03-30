/* import type { IEntity } from "./base"

export interface IProduct extends IEntity {
    name: string
    description: string
    price: number
    stock: number
    category: string
    status: ProductStatus
    images: string[]
}

export interface IOrder extends IEntity {
    orderNumber: string
    customerId: string
    items: IOrderItem[]
    status: OrderStatus
    total: number
    paymentStatus: PaymentStatus
}

export interface IOrderItem {
    productId: string
    quantity: number
    price: number
    subtotal: number
}

export interface ICustomer extends IEntity {
    name: string
    email: string
    phone?: string
    address?: IAddress
    orders?: IOrder[]
}

export interface IAddress {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
}

export interface IDiscount extends IEntity {
    code: string
    type: DiscountType
    value: number
    startDate: Date
    endDate: Date
    status: DiscountStatus
    usageLimit?: number
    usageCount: number
}

export interface ILicense extends IEntity {
    key: string
    productId: string
    customerId: string
    status: LicenseStatus
    expiresAt?: Date
}

export enum ProductStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    OUT_OF_STOCK = "OUT_OF_STOCK",
}

export enum OrderStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
}

export enum DiscountType {
    PERCENTAGE = "PERCENTAGE",
    FIXED = "FIXED",
}

export enum DiscountStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    EXPIRED = "EXPIRED",
}

export enum LicenseStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    EXPIRED = "EXPIRED",
    REVOKED = "REVOKED",
}

 */