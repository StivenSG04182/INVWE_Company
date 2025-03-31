'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Template, Store } from '@/lib/e-commerce/store/types';

type EcommerceContextType = {
    // Estado de las plantillas
    templates: Template[];
    selectedTemplate: Template | null;
    isLoadingTemplates: boolean;
    templatesError: string | null;

    // Estado de las tiendas
    stores: Store[];
    selectedStore: Store | null;
    isLoadingStores: boolean;
    storesError: string | null;

    // Acciones para plantillas
    loadTemplates: (category?: string) => Promise<Template[]>;
    selectTemplate: (templateId: string) => void;
    createTemplate: (template: Partial<Template>) => Promise<Template>;
    updateTemplate: (templateId: string, updates: Partial<Template>) => Promise<Template>;
    deleteTemplate: (templateId: string) => Promise<boolean>;

    // Acciones para tiendas
    loadStores: (companyId?: string) => Promise<Store[]>;
    selectStore: (storeId: string) => void;
    createStore: (store: Partial<Store>) => Promise<Store>;
    updateStore: (storeId: string, updates: Partial<Store>) => Promise<Store>;
    deleteStore: (storeId: string) => Promise<boolean>;
};

const EcommerceContext = createContext<EcommerceContextType | undefined>(undefined);

export const EcommerceProvider = ({ children }: { children: ReactNode }) => {
    // Estado para plantillas
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);
    const [templatesError, setTemplatesError] = useState<string | null>(null);

    // Estado para tiendas
    const [stores, setStores] = useState<Store[]>([]);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [isLoadingStores, setIsLoadingStores] = useState<boolean>(false);
    const [storesError, setStoresError] = useState<string | null>(null);

    // Cargar plantillas
    const loadTemplates = async (category?: string): Promise<Template[]> => {
        try {
            setIsLoadingTemplates(true);
            setTemplatesError(null);

            const url = new URL('/api/admin/e-commerce/templates', window.location.origin);
            if (category) url.searchParams.append('category', category);

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error('Error al cargar las plantillas');

            const data = await response.json();
            setTemplates(data);
            return data;
        } catch (error) {
            console.error('Error al cargar plantillas:', error);
            setTemplatesError('No se pudieron cargar las plantillas. Por favor, inténtalo de nuevo.');
            return [];
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    // Seleccionar una plantilla
    const selectTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId) || null;
        setSelectedTemplate(template);
    };

    // Crear una nueva plantilla
    const createTemplate = async (template: Partial<Template>): Promise<Template> => {
        try {
            setIsLoadingTemplates(true);
            setTemplatesError(null);

            const response = await fetch('/api/admin/e-commerce/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ template }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al crear la plantilla');
            }

            const newTemplate = await response.json();
            setTemplates(prev => [...prev, newTemplate]);
            return newTemplate;
        } catch (error) {
            console.error('Error al crear plantilla:', error);
            setTemplatesError('No se pudo crear la plantilla. Por favor, inténtalo de nuevo.');
            throw error;
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    // Actualizar una plantilla existente
    const updateTemplate = async (templateId: string, updates: Partial<Template>): Promise<Template> => {
        try {
            setIsLoadingTemplates(true);
            setTemplatesError(null);

            const response = await fetch(`/api/admin/e-commerce/templates/${templateId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al actualizar la plantilla');
            }

            const updatedTemplate = await response.json();
            setTemplates(prev => prev.map(t => t.id === templateId ? updatedTemplate : t));

            if (selectedTemplate?.id === templateId) {
                setSelectedTemplate(updatedTemplate);
            }

            return updatedTemplate;
        } catch (error) {
            console.error('Error al actualizar plantilla:', error);
            setTemplatesError('No se pudo actualizar la plantilla. Por favor, inténtalo de nuevo.');
            throw error;
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    // Eliminar una plantilla
    const deleteTemplate = async (templateId: string): Promise<boolean> => {
        try {
            setIsLoadingTemplates(true);
            setTemplatesError(null);

            const response = await fetch(`/api/admin/e-commerce/templates/${templateId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al eliminar la plantilla');
            }

            setTemplates(prev => prev.filter(t => t.id !== templateId));

            if (selectedTemplate?.id === templateId) {
                setSelectedTemplate(null);
            }

            return true;
        } catch (error) {
            console.error('Error al eliminar plantilla:', error);
            setTemplatesError('No se pudo eliminar la plantilla. Por favor, inténtalo de nuevo.');
            return false;
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    // Cargar tiendas
    const loadStores = async (companyId?: string): Promise<Store[]> => {
        try {
            setIsLoadingStores(true);
            setStoresError(null);

            const url = new URL('/api/admin/e-commerce/stores', window.location.origin);
            if (companyId) url.searchParams.append('companyId', companyId);

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error('Error al cargar las tiendas');

            const data = await response.json();
            setStores(data);
            return data;
        } catch (error) {
            console.error('Error al cargar tiendas:', error);
            setStoresError('No se pudieron cargar las tiendas. Por favor, inténtalo de nuevo.');
            return [];
        } finally {
            setIsLoadingStores(false);
        }
    };

    // Seleccionar una tienda
    const selectStore = (storeId: string) => {
        const store = stores.find(s => s.id === storeId) || null;
        setSelectedStore(store);
    };

    // Crear una nueva tienda
    const createStore = async (store: Partial<Store>): Promise<Store> => {
        try {
            setIsLoadingStores(true);
            setStoresError(null);

            const response = await fetch('/api/admin/e-commerce/stores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(store),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al crear la tienda');
            }

            const newStore = await response.json();
            setStores(prev => [...prev, newStore]);
            return newStore;
        } catch (error) {
            console.error('Error al crear tienda:', error);
            setStoresError('No se pudo crear la tienda. Por favor, inténtalo de nuevo.');
            throw error;
        } finally {
            setIsLoadingStores(false);
        }
    };

    // Actualizar una tienda existente
    const updateStore = async (storeId: string, updates: Partial<Store>): Promise<Store> => {
        try {
            setIsLoadingStores(true);
            setStoresError(null);

            const response = await fetch(`/api/admin/e-commerce/stores/${storeId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al actualizar la tienda');
            }

            const updatedStore = await response.json();
            setStores(prev => prev.map(s => s.id === storeId ? updatedStore : s));

            if (selectedStore?.id === storeId) {
                setSelectedStore(updatedStore);
            }

            return updatedStore;
        } catch (error) {
            console.error('Error al actualizar tienda:', error);
            setStoresError('No se pudo actualizar la tienda. Por favor, inténtalo de nuevo.');
            throw error;
        } finally {
            setIsLoadingStores(false);
        }
    };

    // Eliminar una tienda
    const deleteStore = async (storeId: string): Promise<boolean> => {
        try {
            setIsLoadingStores(true);
            setStoresError(null);

            const response = await fetch(`/api/admin/e-commerce/stores/${storeId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al eliminar la tienda');
            }

            setStores(prev => prev.filter(s => s.id !== storeId));

            if (selectedStore?.id === storeId) {
                setSelectedStore(null);
            }

            return true;
        } catch (error) {
            console.error('Error al eliminar tienda:', error);
            setStoresError('No se pudo eliminar la tienda. Por favor, inténtalo de nuevo.');
            return false;
        } finally {
            setIsLoadingStores(false);
        }
    };

    const value = {
        // Estado de las plantillas
        templates,
        selectedTemplate,
        isLoadingTemplates,
        templatesError,

        // Estado de las tiendas
        stores,
        selectedStore,
        isLoadingStores,
        storesError,

        // Acciones para plantillas
        loadTemplates,
        selectTemplate,
        createTemplate,
        updateTemplate,
        deleteTemplate,

        // Acciones para tiendas
        loadStores,
        selectStore,
        createStore,
        updateStore,
        deleteStore,
    };

    return (
        <EcommerceContext.Provider value={value}>
            {children}
        </EcommerceContext.Provider>
    );
};

export const useEcommerce = () => {
    const context = useContext(EcommerceContext);
    if (context === undefined) {
        throw new Error('useEcommerce debe ser usado dentro de un EcommerceProvider');
    }
    return context;
};