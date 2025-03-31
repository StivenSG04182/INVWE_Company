/**
 * Tipos para las entidades de E-Commerce basados en las tablas de Supabase
 */

export interface EcommerceStore {
    id: string;
    store_id: string;
    domain?: string;
    subdomain?: string;
    theme: string;
    logo_url?: string;
    banner_url?: string;
    primary_color: string;
    secondary_color: string;
    is_active: boolean;
    mongodb_store_id?: string;
    created_at: string;
    updated_at: string;
}

export interface EcommerceCategory {
    id: string;
    ecommerce_store_id: string;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    is_featured: boolean;
    display_order: number;
    mongodb_category_id?: string;
    created_at: string;
    updated_at: string;
}

export interface EcommerceOrder {
    id: string;
    ecommerce_store_id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    shipping_address: string;
    billing_address?: string;
    subtotal: number;
    tax_total: number;
    shipping_cost: number;
    discount_amount: number;
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    payment_method?: string;
    payment_reference?: string;
    notes?: string;
    mongodb_order_id?: string;
    created_at: string;
    updated_at: string;
}

export interface EcommerceOrderItem {
    id: string;
    order_id: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    tax_amount: number;
    discount_amount: number;
    subtotal: number;
    total: number;
    created_at: string;
}

export interface EcommerceCoupon {
    id: string;
    ecommerce_store_id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_purchase?: number;
    max_discount?: number;
    start_date: string;
    end_date: string;
    usage_limit?: number;
    usage_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface EcommerceCustomer {
    id: string;
    ecommerce_store_id: string;
    email: string;
    name: string;
    phone?: string;
    password_hash?: string;
    shipping_address?: string;
    billing_address?: string;
    is_active: boolean;
    mongodb_customer_id?: string;
    created_at: string;
    updated_at: string;
}

export interface EcommercePayment {
    id: string;
    order_id: string;
    payment_method: string;
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    payment_reference?: string;
    amount: number;
    notes?: string;
    created_at: string;
}

export interface EcommerceShippingMethod {
    id: string;
    ecommerce_store_id: string;
    name: string;
    description?: string;
    cost: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}