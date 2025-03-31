/**
 * Hook para acceder al contexto de e-commerce
 * Este hook proporciona acceso a todas las funcionalidades relacionadas con el e-commerce
 * de manera aislada del resto del sistema.
 */

import { useEcommerce as useEcommerceContext } from '@/lib/e-commerce/context/EcommerceContext';

/**
 * Hook para acceder a la funcionalidad de e-commerce
 * @returns Contexto de e-commerce con estado y acciones para plantillas y tiendas
 */
export const useEcommerce = () => {
    return useEcommerceContext();
};

/**
 * Este hook es un alias para mantener compatibilidad con el código existente
 * que utiliza useTemplate. En nuevas implementaciones, se recomienda usar useEcommerce.
 */
export const useEcommerceTemplate = () => {
    const {
        templates,
        selectedTemplate,
        isLoadingTemplates,
        templatesError,
        loadTemplates,
        selectTemplate,
        createTemplate,
        updateTemplate,
        deleteTemplate
    } = useEcommerceContext();

    return {
        templates,
        selectedTemplate,
        isLoading: isLoadingTemplates,
        error: templatesError,
        loadTemplates,
        selectTemplate,
        createTemplate,
        updateTemplate,
        deleteTemplate
    };
};

/**
 * Este hook es un alias para mantener compatibilidad con el código existente
 * que utiliza useStore. En nuevas implementaciones, se recomienda usar useEcommerce.
 */
export const useEcommerceStore = () => {
    const {
        stores,
        selectedStore,
        isLoadingStores,
        storesError,
        loadStores,
        selectStore,
        createStore,
        updateStore,
        deleteStore
    } = useEcommerceContext();

    return {
        stores,
        selectedStore,
        isLoading: isLoadingStores,
        error: storesError,
        loadStores,
        selectStore,
        createStore,
        updateStore,
        deleteStore
    };
};