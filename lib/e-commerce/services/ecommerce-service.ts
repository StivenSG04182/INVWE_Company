/**
 * Servicios para interactuar con las entidades de E-Commerce en Supabase
 */

import { supabase } from '@/lib/supabase';
import {
    EcommerceStore,
    EcommerceCategory,
    EcommerceOrder,
    EcommerceOrderItem,
    EcommerceCoupon,
    EcommerceCustomer,
    EcommercePayment,
    EcommerceShippingMethod
} from '../types/ecommerce-types';

// Servicios para EcommerceStore
export const ecommerceStoreService = {
    // Obtener todas las tiendas de e-commerce
    async getAllStores(): Promise<EcommerceStore[]> {
        const { data, error } = await supabase
            .from('ecommerce_stores')
            .select('*');

        if (error) throw error;
        return data as EcommerceStore[];
    },

    // Obtener tienda por ID
    async getStoreById(id: string): Promise<EcommerceStore | null> {
        const { data, error } = await supabase
            .from('ecommerce_stores')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as EcommerceStore;
    },

    // Obtener tienda por store_id
    async getStoreByStoreId(storeId: string): Promise<EcommerceStore | null> {
        const { data, error } = await supabase
            .from('ecommerce_stores')
            .select('*')
            .eq('store_id', storeId)
            .single();

        if (error) throw error;
        return data as EcommerceStore;
    },

    // Crear tienda de e-commerce
    async createStore(store: Omit<EcommerceStore, 'id' | 'created_at' | 'updated_at'>): Promise<EcommerceStore> {
        const { data, error } = await supabase
            .from('ecommerce_stores')
            .insert([store])
            .select()
            .single();

        if (error) throw error;
        return data as EcommerceStore;
    },

    // Actualizar tienda de e-commerce
    async updateStore(id: string, store: Partial<EcommerceStore>): Promise<EcommerceStore> {
        const { data, error } = await supabase
            .from('ecommerce_stores')
            .update(store)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as EcommerceStore;
    },

    // Eliminar tienda de e-commerce
    async deleteStore(id: string): Promise<void> {
        const { error } = await supabase
            .from('ecommerce_stores')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// Servicios para EcommerceCategory
export const ecommerceCategoryService = {
    // Obtener todas las categorías de una tienda
    async getCategoriesByStoreId(storeId: string): Promise<EcommerceCategory[]> {
        const { data, error } = await supabase
            .from('ecommerce_categories')
            .select('*')
            .eq('ecommerce_store_id', storeId);

        if (error) throw error;
        return data as EcommerceCategory[];
    },

    // Obtener categoría por ID
    async getCategoryById(id: string): Promise<EcommerceCategory | null> {
        const { data, error } = await supabase
            .from('ecommerce_categories')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as EcommerceCategory;
    },

    // Crear categoría
    async createCategory(category: Omit<EcommerceCategory, 'id' | 'created_at' | 'updated_at'>): Promise<EcommerceCategory> {
        const { data, error } = await supabase
            .from('ecommerce_categories')
            .insert([category])
            .select()
            .single();

        if (error) throw error;
        return data as EcommerceCategory;
    },

    // Actualizar categoría
    async updateCategory(id: string, category: Partial<EcommerceCategory>): Promise<EcommerceCategory> {
        const { data, error } = await supabase
            .from('ecommerce_categories')
            .update(category)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as EcommerceCategory;
    },

    // Eliminar categoría
    async deleteCategory(id: string): Promise<void> {
        const { error } = await supabase
            .from('ecommerce_categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// Servicios para EcommerceOrder
export const ecommerceOrderService = {
    // Obtener todos los pedidos de una tienda
    async getOrdersByStoreId(storeId: string): Promise<EcommerceOrder[]> {
        const { data, error } = await supabase
            .from('ecommerce_orders')
            .select('*')
            .eq('ecommerce_store_id', storeId);

        if (error) throw error;
        return data as EcommerceOrder[];
    },

    // Obtener pedido por ID
    async getOrderById(id: string): Promise<EcommerceOrder | null> {
        const { data, error } = await supabase
            .from('ecommerce_orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as EcommerceOrder;
    },

    // Crear pedido
    async createOrder(order: Omit<EcommerceOrder, 'id' | 'created_at' | 'updated_at'>): Promise<EcommerceOrder> {
        const { data, error } = await supabase
            .from('ecommerce_orders')
            .insert([order])
            .select()
            .single();

        if (error) throw error;
        return data as EcommerceOrder;
    },

    // Actualizar pedido
    async updateOrder(id: string, order: Partial<EcommerceOrder>): Promise<EcommerceOrder> {
        const { data, error } = await supabase
            .from('ecommerce_orders')
            .update(order)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as EcommerceOrder;
    },

    // Eliminar pedido
    async deleteOrder(id: string): Promise<void> {
        const { error } = await supabase
            .from('ecommerce_orders')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// Servicios para EcommerceOrderItem
export const ecommerceOrderItemService = {
    // Obtener todos los items de un pedido
    async getItemsByOrderId(orderId: string): Promise<EcommerceOrderItem[]> {
        const { data, error } = await supabase
            .from('ecommerce_order_items')
            .select('*')
            .eq('order_id', orderId);

        if (error) throw error;
        return data as EcommerceOrderItem[];
    },

    // Crear item de pedido
    async createOrderItem(item: Omit<EcommerceOrderItem, 'id' | 'created_at'>): Promise<EcommerceOrderItem> {
        const { data, error } = await supabase
            .from('ecommerce_order_items')
            .insert([item])
            .select()
            .single();

        if (error) throw error;
        return data as EcommerceOrderItem;
    },

    // Eliminar item de pedido
    async deleteOrderItem(id: string): Promise<void> {
        const { error } = await supabase
            .from('ecommerce_order_items')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// Servicios para EcommerceCoupon
export const ecommerceCouponService = {
    // Obtener todos los cupones de una tienda
    async getCouponsByStoreId(storeId: string): Promise<EcommerceCoupon[]> {
        const { data, error } = await supabase
            .from('ecommerce_coupons')
            .select('*')
            .eq('ecommerce_store_id', storeId);

        if (error) throw error;
        return data as EcommerceCoupon[];
    },

    // Obtener cupón por código
    async getCouponByCode(storeId: string, code: string): Promise<EcommerceCoupon | null> {
        const { data, error } = await supabase
            .from('ecommerce_coupons')
            .select('*')
            .eq('ecommerce_store_id', storeId)
            .eq('code', code)
            .single();

        if (error) throw error;
        return data as EcommerceCoupon;
    },

    // Crear cupón
    async createCoupon(coupon: Omit<EcommerceCoupon, 'id' | 'created_at' | 'updated_at'>): Promise<EcommerceCoupon> {
        const { data, error } = await supabase
            .from('ecommerce_coupons')
            .insert([coupon])
            .select()
            .single();

        if (error) throw error;
        return data as EcommerceCoupon;
    },

    // Actualizar cupón
    async updateCoupon(id: string, coupon: Partial<EcommerceCoupon>): Promise<EcommerceCoupon> {
        const { data, error } = await supabase
            .from('ecommerce_coupons')
            .update(coupon)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as EcommerceCoupon;
    },

    // Eliminar cupón
    async deleteCoupon(id: string): Promise<void> {
        const { error } = await supabase
            .from('ecommerce_coupons')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// Servicios para EcommerceCustomer
export const ecommerceCustomerService = {
    // Obtener todos los clientes de una tienda
    async getCustomersByStoreId(storeId: string): Promise<EcommerceCustomer[]> {
        const { data, error } = await supabase
            .from('ecommerce_customers')
            .select('*')
            .eq('ecommerce_store_id', storeId);

        if (error) throw error;
        return data as EcommerceCustomer[];
    },

    // Obtener cliente por ID
    async getCustomerById(id: string): Promise<EcommerceCustomer | null> {
        const { data, error } = await supabase
            .from('ecommerce_customers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as EcommerceCustomer;
    },

    // Obtener cliente por email
    async getCustomerByEmail(storeId: string, email: string): Promise<EcommerceCustomer | null> {
        const { data, error } = await supabase
            .from('ecommerce_customers')
            .select('*')
            .eq('ecommerce_store_id', storeId)
            .eq('email', email)
            .single();

        if (error) throw error;
        return data as EcommerceCustomer;
    },

    // Crear cliente
    async createCustomer(customer: Omit<EcommerceCustomer, 'id' | 'created_at' | 'updated_at'>): Promise<EcommerceCustomer> {
        const { data, error } = await supabase
            .from('ecommerce_customers')
            .insert([customer])
            .select()
            .single();

        if (error) throw error;
        return data as EcommerceCustomer;
    },

    // Actualizar cliente
    async updateCustomer(id: string, customer: Partial<EcommerceCustomer>): Promise<EcommerceCustomer> {
        const { data, error } = await supabase
            .from('ecommerce_customers')
            .update(customer)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as EcommerceCustomer;
    },

    // Eliminar cliente
    async deleteCustomer(id: string): Promise<void> {
        const { error } = await supabase
            .from('ecommerce_customers')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// Servicios para EcommercePayment
export const ecommercePaymentService = {
    // Obtener todos los pagos de un pedido
    async getPaymentsByOrderId(orderId: string): Promise<EcommercePayment[]> {
        const { data, error } = await supabase
            .from('ecommerce_payments')
            .select('*')
            .eq('order_id', orderId);

        if (error) throw error;
        return data as EcommercePayment[];
    },

    // Crear pago
    async createPayment(payment: Omit<EcommercePayment, 'id' | 'created_at'>): Promise<EcommercePayment> {
        const { data, error } = await supabase
            .from('ecommerce_payments')
            .insert([payment])
            .select()
            .single();

        if (error) throw error;
        return data as EcommercePayment;
    },

    // Actualizar pago
    async updatePayment(id: string, payment: Partial<EcommercePayment>): Promise<EcommercePayment> {
        const { data, error } = await supabase
            .from('ecommerce_payments')
            .update(payment)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as EcommercePayment;
    }
};

// Servicios para EcommerceShippingMethod
export const ecommerceShippingMethodService = {
    // Obtener todos los métodos de envío de una tienda
    async getShippingMethodsByStoreId(storeId: string): Promise<EcommerceShippingMethod[]> {
        const { data, error } = await supabase
            .from('ecommerce_shipping_methods')
            .select('*')
            .eq('ecommerce_store_id', storeId);

        if (error) throw error;
        return data as EcommerceShippingMethod[];
    },

    // Obtener método de envío por ID
    async getShippingMethodById(id: string): Promise<EcommerceShippingMethod | null> {
        const { data, error } = await supabase
            .from('ecommerce_shipping_methods')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as EcommerceShippingMethod;
    },

    // Crear método de envío
    async createShippingMethod(method: Omit<EcommerceShippingMethod, 'id' | 'created_at' | 'updated_at'>): Promise<EcommerceShippingMethod> {
        const { data, error } = await supabase
            .from('ecommerce_shipping_methods')
            .insert([method])
            .select()
            .single();

        if (error) throw error;
        return data as EcommerceShippingMethod;
    },

    // Actualizar método de envío
    async updateShippingMethod(id: string, method: Partial<EcommerceShippingMethod>): Promise<EcommerceShippingMethod> {
        const { data, error } = await supabase
            .from('ecommerce_shipping_methods')
            .update(method)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as EcommerceShippingMethod;
    },

    // Eliminar método de envío
    async deleteShippingMethod(id: string): Promise<void> {
        const { error } = await supabase
            .from('ecommerce_shipping_methods')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};