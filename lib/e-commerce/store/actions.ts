'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

import { connectToEcommerceDb as connectToDatabase } from '@/lib/e-commerce/database/mongodb';
import { Store } from './types';
import { createStoreSchema, updateStoreSchema, storeSettingsSchema } from './validation';

/**
 * Crea una nueva tienda para un usuario y compañía específicos
 */
export async function createStore(data: { name: string; description?: string; companyId: string }) {
    try {
        // Validar los datos de entrada
        const validatedData = createStoreSchema.parse(data);

        // Obtener el usuario actual
        const { userId } = auth();
        if (!userId) {
            throw new Error('No autorizado');
        }

        // Conectar a la base de datos
        const db = await connectToDatabase();
        const storesCollection = db.collection('stores');

        // Verificar si ya existe una tienda con el mismo nombre para esta compañía
        const existingStore = await storesCollection.findOne({
            name: validatedData.name,
            companyId: validatedData.companyId
        });

        if (existingStore) {
            throw new Error('Ya existe una tienda con este nombre');
        }

        // Crear la configuración por defecto
        const defaultSettings = {
            currency: 'COP',
            language: 'es-CO',
            paymentMethods: [
                {
                    id: 'paypal',
                    name: 'PayPal',
                    isEnabled: true,
                    config: {}
                }
            ],
            shippingOptions: [
                {
                    id: 'standard',
                    name: 'Envío Estándar',
                    price: 10000,
                    isEnabled: true,
                    estimatedDeliveryTime: '3-5 días hábiles'
                }
            ],
            taxSettings: {
                isEnabled: true,
                rate: 19, // IVA en Colombia
                includeInPrice: false
            },
            contactInfo: {
                email: '',
                phone: '',
                address: ''
            }
        };

        // Crear la nueva tienda
        const newStore: Omit<Store, 'id'> = {
            ...validatedData,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            isPublished: false,
            settings: defaultSettings
        };

        const result = await storesCollection.insertOne(newStore);

        // Revalidar la ruta para actualizar los datos
        revalidatePath(`/${data.companyId}/stores`);

        // Redirigir a la página de la tienda
        redirect(`/${data.companyId}/stores/${result.insertedId}`);
    } catch (error) {
        console.error('Error al crear la tienda:', error);
        throw error;
    }
}

/**
 * Obtiene todas las tiendas de una compañía
 */
export async function getStoresByCompany(companyId: string) {
    try {
        // Obtener el usuario actual
        const { userId } = auth();
        if (!userId) {
            throw new Error('No autorizado');
        }

        // Conectar a la base de datos
        const db = await connectToDatabase();
        const storesCollection = db.collection('stores');

        // Buscar todas las tiendas de la compañía
        const stores = await storesCollection.find({
            companyId
        }).toArray();

        return stores;
    } catch (error) {
        console.error('Error al obtener las tiendas:', error);
        throw error;
    }
}

/**
 * Obtiene una tienda por su ID
 */
export async function getStoreById(storeId: string) {
    try {
        // Obtener el usuario actual
        const { userId } = auth();
        if (!userId) {
            throw new Error('No autorizado');
        }

        // Conectar a la base de datos
        const db = await connectToDatabase();
        const storesCollection = db.collection('stores');

        // Buscar la tienda por su ID
        const store = await storesCollection.findOne({
            _id: storeId
        });

        if (!store) {
            throw new Error('Tienda no encontrada');
        }

        return store;
    } catch (error) {
        console.error('Error al obtener la tienda:', error);
        throw error;
    }
}

/**
 * Actualiza una tienda existente
 */
export async function updateStore(storeId: string, data: Partial<Store>) {
    try {
        // Validar los datos de entrada
        const validatedData = updateStoreSchema.parse(data);

        // Obtener el usuario actual
        const { userId } = auth();
        if (!userId) {
            throw new Error('No autorizado');
        }

        // Conectar a la base de datos
        const db = await connectToDatabase();
        const storesCollection = db.collection('stores');

        // Verificar que la tienda existe y pertenece al usuario
        const store = await storesCollection.findOne({
            _id: storeId
        });

        if (!store) {
            throw new Error('Tienda no encontrada');
        }

        // Actualizar la tienda
        await storesCollection.updateOne(
            { _id: storeId },
            {
                $set: {
                    ...validatedData,
                    updatedAt: new Date()
                }
            }
        );

        // Revalidar la ruta para actualizar los datos
        revalidatePath(`/${store.companyId}/stores/${storeId}`);

        return { success: true };
    } catch (error) {
        console.error('Error al actualizar la tienda:', error);
        throw error;
    }
}

/**
 * Actualiza la configuración de una tienda
 */
export async function updateStoreSettings(storeId: string, settings: any) {
    try {
        // Validar los datos de entrada
        const validatedSettings = storeSettingsSchema.parse(settings);

        // Obtener el usuario actual
        const { userId } = auth();
        if (!userId) {
            throw new Error('No autorizado');
        }

        // Conectar a la base de datos
        const db = await connectToDatabase();
        const storesCollection = db.collection('stores');

        // Verificar que la tienda existe y pertenece al usuario
        const store = await storesCollection.findOne({
            _id: storeId
        });

        if (!store) {
            throw new Error('Tienda no encontrada');
        }

        // Actualizar la configuración de la tienda
        await storesCollection.updateOne(
            { _id: storeId },
            {
                $set: {
                    settings: validatedSettings,
                    updatedAt: new Date()
                }
            }
        );

        // Revalidar la ruta para actualizar los datos
        revalidatePath(`/${store.companyId}/stores/${storeId}`);

        return { success: true };
    } catch (error) {
        console.error('Error al actualizar la configuración de la tienda:', error);
        throw error;
    }
}

/**
 * Elimina una tienda
 */
export async function deleteStore(storeId: string) {
    try {
        // Obtener el usuario actual
        const { userId } = auth();
        if (!userId) {
            throw new Error('No autorizado');
        }

        // Conectar a la base de datos
        const db = await connectToDatabase();
        const storesCollection = db.collection('stores');

        // Verificar que la tienda existe y pertenece al usuario
        const store = await storesCollection.findOne({
            _id: storeId
        });

        if (!store) {
            throw new Error('Tienda no encontrada');
        }

        // Eliminar la tienda
        await storesCollection.deleteOne({ _id: storeId });

        // Revalidar la ruta para actualizar los datos
        revalidatePath(`/${store.companyId}/stores`);

        return { success: true };
    } catch (error) {
        console.error('Error al eliminar la tienda:', error);
        throw error;
    }
}