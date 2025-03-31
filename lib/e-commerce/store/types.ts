export interface Store {
    id: string;
    name: string;
    userId: string;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    themeId?: string;
    templateId?: string;
    domain?: string;
    isPublished: boolean;
    settings: StoreSettings;
}

export interface StoreSettings {
    currency: string;
    language: string;
    paymentMethods: PaymentMethod[];
    shippingOptions: ShippingOption[];
    taxSettings: TaxSettings;
    contactInfo: ContactInfo;
    socialMedia?: SocialMediaLinks;
}

export interface PaymentMethod {
    id: string;
    name: string;
    isEnabled: boolean;
    config: Record<string, any>;
}

export interface ShippingOption {
    id: string;
    name: string;
    price: number;
    isEnabled: boolean;
    estimatedDeliveryTime?: string;
}

export interface TaxSettings {
    isEnabled: boolean;
    rate: number;
    includeInPrice: boolean;
}

export interface ContactInfo {
    email: string;
    phone?: string;
    address?: string;
}

export interface SocialMediaLinks {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
}

export interface Template {
    id: string;
    name: string;
    description: string;
    previewUrl: string;
    category: string;
    isDefault: boolean;
    isCustomizable: boolean;
    components: TemplateComponent[];
    settings: TemplateSettings;
    createdAt: Date;
    updatedAt: Date;
}

export interface TemplateComponent {
    id: string;
    type: string;
    name: string;
    isRequired: boolean;
    settings: Record<string, any>;
    content?: Record<string, any>;
}

export interface TemplateSettings {
    colors: ColorScheme;
    fonts: FontSettings;
    layout: LayoutSettings;
}

export interface ColorScheme {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
}

export interface FontSettings {
    heading: string;
    body: string;
    sizes: {
        h1: number;
        h2: number;
        h3: number;
        body: number;
    };
}

export interface LayoutSettings {
    headerType: string;
    footerType: string;
    productListLayout: string;
    productDetailLayout: string;
}

export interface Product {
    id: string;
    storeId: string;
    name: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    categories: string[];
    tags: string[];
    inventory: {
        sku: string;
        quantity: number;
        isTracking: boolean;
    };
    variants?: ProductVariant[];
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductVariant {
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    sku: string;
    quantity: number;
    options: {
        name: string;
        value: string;
    }[];
    imageUrl?: string;
}

export interface Order {
    id: string;
    storeId: string;
    customerId?: string;
    status: OrderStatus;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    shippingAddress: Address;
    billingAddress: Address;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded'
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}

export interface OrderItem {
    productId: string;
    variantId?: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
    options?: {
        name: string;
        value: string;
    }[];
}

export interface Address {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
}

export interface Customer {
    id: string;
    storeId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    addresses: Address[];
    orders: string[];
    createdAt: Date;
    updatedAt: Date;
}