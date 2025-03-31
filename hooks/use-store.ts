import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Store } from '@/lib/e-commerce/store/types';

const STORAGE_KEY = 'selectedStore';

export const useStore = (defaultStore: string | null = null) => {
    const params = useParams();
    const [selectedStore, setSelectedStore] = useState<string | null>(defaultStore || (params?.storeId as string) || null);
    const [stores, setStores] = useState<Store[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Cargar las tiendas disponibles para la compañía actual
    useEffect(() => {
        const loadStores = async () => {
            if (!params.companyId) return;
            
            try {
                setIsLoading(true);
                const response = await fetch(`/api/admin/e-commerce/stores?companyId=${params.companyId}`);
                
                if (!response.ok) {
                    throw new Error('Error al cargar las tiendas');
                }
                
                const data = await response.json();
                setStores(data);
                
                // Si no hay tienda seleccionada pero hay tiendas disponibles, seleccionar la primera
                if (!selectedStore && data.length > 0 && !params.storeId) {
                    setSelectedStore(data[0]._id);
                }
                
                // Si hay un storeId en los parámetros, usarlo
                if (params.storeId && params.storeId !== selectedStore) {
                    setSelectedStore(params.storeId as string);
                }
                
                setError(null);
            } catch (err) {
                console.error('Error al cargar las tiendas:', err);
                setError('No se pudieron cargar las tiendas');
            } finally {
                setIsLoading(false);
            }
        };

        loadStores();
    }, [params.companyId, params.storeId, selectedStore]);

    // Guardar la tienda seleccionada en el almacenamiento local
    useEffect(() => {
        if (selectedStore) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedStore));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [selectedStore]);

    // Obtener los detalles de la tienda seleccionada
    const getSelectedStoreDetails = () => {
        if (!selectedStore) return null;
        return stores.find(store => store.id === selectedStore || store._id === selectedStore) || null;
    };

    // Crear una nueva tienda
    const createStore = async (data: { name: string; description?: string; companyId: string }) => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/admin/e-commerce/stores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al crear la tienda');
            }
            
            const newStore = await response.json();
            setStores(prev => [...prev, newStore]);
            setSelectedStore(newStore._id);
            return newStore;
        } catch (err) {
            console.error('Error al crear la tienda:', err);
            setError(err instanceof Error ? err.message : 'Error al crear la tienda');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Actualizar una tienda existente
    const updateStore = async (storeId: string, data: Partial<Store>) => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/admin/e-commerce/stores/${storeId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar la tienda');
            }
            
            const updatedStore = await response.json();
            setStores(prev => prev.map(store => 
                (store.id === storeId || store._id === storeId) ? updatedStore : store
            ));
            return updatedStore;
        } catch (err) {
            console.error('Error al actualizar la tienda:', err);
            setError(err instanceof Error ? err.message : 'Error al actualizar la tienda');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Eliminar una tienda
    const deleteStore = async (storeId: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/admin/e-commerce/stores/${storeId}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar la tienda');
            }
            
            setStores(prev => prev.filter(store => store.id !== storeId && store._id !== storeId));
            
            // Si la tienda eliminada era la seleccionada, seleccionar otra
            if (selectedStore === storeId && stores.length > 1) {
                const remainingStores = stores.filter(store => store.id !== storeId && store._id !== storeId);
                if (remainingStores.length > 0) {
                    setSelectedStore(remainingStores[0].id || remainingStores[0]._id);
                } else {
                    setSelectedStore(null);
                }
            } else if (stores.length <= 1) {
                setSelectedStore(null);
            }
            
            return { success: true };
        } catch (err) {
            console.error('Error al eliminar la tienda:', err);
            setError(err instanceof Error ? err.message : 'Error al eliminar la tienda');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        selectedStore,
        setSelectedStore,
        stores,
        isLoading,
        error,
        getSelectedStoreDetails,
        createStore,
        updateStore,
        deleteStore
    };
};