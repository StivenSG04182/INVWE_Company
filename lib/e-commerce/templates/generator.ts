/**
 * Generador de plantillas para e-commerce
 * Este módulo se encarga de generar y gestionar las plantillas para las tiendas de e-commerce
 */

import { Template, TemplateComponent, TemplateSettings } from '../store/types';

// Plantillas predefinidas para diferentes tipos de tiendas
const TEMPLATE_PRESETS = {
    modern: {
        name: 'Modern Store',
        description: 'Una plantilla moderna y minimalista para tiendas de e-commerce',
        previewUrl: '/templates/modern-store/preview.jpg',
        category: 'general',
        isDefault: true,
        isCustomizable: true,
        components: [
            {
                id: 'header',
                type: 'header',
                name: 'Encabezado',
                isRequired: true,
                settings: {
                    showSearch: true,
                    showCart: true,
                    showCategories: true,
                },
            },
            {
                id: 'hero',
                type: 'hero',
                name: 'Banner Principal',
                isRequired: true,
                settings: {
                    showButton: true,
                    fullWidth: true,
                },
                content: {
                    title: 'Bienvenido a nuestra tienda',
                    subtitle: 'Descubre nuestros productos exclusivos',
                    buttonText: 'Comprar ahora',
                    buttonLink: '/products',
                    imageUrl: '/templates/modern-store/hero.jpg',
                },
            },
            {
                id: 'featured',
                type: 'productGrid',
                name: 'Productos Destacados',
                isRequired: true,
                settings: {
                    columns: 4,
                    showPrice: true,
                    showRating: true,
                    maxProducts: 8,
                },
            },
            {
                id: 'categories',
                type: 'categoryGrid',
                name: 'Categorías',
                isRequired: false,
                settings: {
                    columns: 3,
                    style: 'card',
                },
            },
            {
                id: 'testimonials',
                type: 'testimonials',
                name: 'Testimonios',
                isRequired: false,
                settings: {
                    style: 'carousel',
                    maxItems: 5,
                },
            },
            {
                id: 'footer',
                type: 'footer',
                name: 'Pie de Página',
                isRequired: true,
                settings: {
                    showNewsletter: true,
                    showSocialLinks: true,
                    showPaymentMethods: true,
                },
            },
        ],
        settings: {
            colors: {
                primary: '#3b82f6',
                secondary: '#10b981',
                accent: '#f59e0b',
                background: '#ffffff',
                text: '#1f2937',
            },
            fonts: {
                heading: 'Inter',
                body: 'Inter',
                sizes: {
                    h1: 36,
                    h2: 24,
                    h3: 18,
                    body: 16,
                },
            },
            layout: {
                headerType: 'fixed',
                footerType: 'standard',
                productListLayout: 'grid',
                productDetailLayout: 'standard',
            },
        },
    },
    minimal: {
        name: 'Minimal Store',
        description: 'Una plantilla minimalista y elegante para tiendas de e-commerce',
        previewUrl: '/templates/minimal-store/preview.jpg',
        category: 'general',
        isDefault: false,
        isCustomizable: true,
        components: [
            {
                id: 'header',
                type: 'header',
                name: 'Encabezado',
                isRequired: true,
                settings: {
                    showSearch: true,
                    showCart: true,
                    showCategories: false,
                },
            },
            {
                id: 'hero',
                type: 'hero',
                name: 'Banner Principal',
                isRequired: true,
                settings: {
                    showButton: true,
                    fullWidth: true,
                },
                content: {
                    title: 'Simplicidad y Elegancia',
                    subtitle: 'Menos es más',
                    buttonText: 'Explorar',
                    buttonLink: '/products',
                    imageUrl: '/templates/minimal-store/hero.jpg',
                },
            },
            {
                id: 'featured',
                type: 'productGrid',
                name: 'Productos Destacados',
                isRequired: true,
                settings: {
                    columns: 3,
                    showPrice: true,
                    showRating: false,
                    maxProducts: 6,
                },
            },
            {
                id: 'footer',
                type: 'footer',
                name: 'Pie de Página',
                isRequired: true,
                settings: {
                    showNewsletter: false,
                    showSocialLinks: true,
                    showPaymentMethods: true,
                },
            },
        ],
        settings: {
            colors: {
                primary: '#000000',
                secondary: '#4b5563',
                accent: '#d1d5db',
                background: '#ffffff',
                text: '#1f2937',
            },
            fonts: {
                heading: 'Montserrat',
                body: 'Montserrat',
                sizes: {
                    h1: 32,
                    h2: 22,
                    h3: 18,
                    body: 16,
                },
            },
            layout: {
                headerType: 'minimal',
                footerType: 'minimal',
                productListLayout: 'grid',
                productDetailLayout: 'minimal',
            },
        },
    },
    luxury: {
        name: 'Luxury Store',
        description: 'Una plantilla elegante y sofisticada para tiendas de productos de lujo',
        previewUrl: '/templates/luxury-store/preview.jpg',
        category: 'fashion',
        isDefault: false,
        isCustomizable: true,
        components: [
            {
                id: 'header',
                type: 'header',
                name: 'Encabezado',
                isRequired: true,
                settings: {
                    showSearch: true,
                    showCart: true,
                    showCategories: true,
                },
            },
            {
                id: 'hero',
                type: 'hero',
                name: 'Banner Principal',
                isRequired: true,
                settings: {
                    showButton: true,
                    fullWidth: true,
                },
                content: {
                    title: 'Exclusividad y Elegancia',
                    subtitle: 'Descubre nuestra colección de lujo',
                    buttonText: 'Ver colección',
                    buttonLink: '/products',
                    imageUrl: '/templates/luxury-store/hero.jpg',
                },
            },
            {
                id: 'featured',
                type: 'productCarousel',
                name: 'Productos Destacados',
                isRequired: true,
                settings: {
                    showPrice: true,
                    showRating: false,
                    maxProducts: 5,
                },
            },
            {
                id: 'story',
                type: 'textWithImage',
                name: 'Nuestra Historia',
                isRequired: false,
                settings: {
                    imagePosition: 'right',
                },
                content: {
                    title: 'Nuestra Historia',
                    text: 'Una historia de pasión por la excelencia y el lujo...',
                    imageUrl: '/templates/luxury-store/story.jpg',
                },
            },
            {
                id: 'footer',
                type: 'footer',
                name: 'Pie de Página',
                isRequired: true,
                settings: {
                    showNewsletter: true,
                    showSocialLinks: true,
                    showPaymentMethods: true,
                },
            },
        ],
        settings: {
            colors: {
                primary: '#9f7e69',
                secondary: '#2c2c2c',
                accent: '#d4af37',
                background: '#ffffff',
                text: '#1a1a1a',
            },
            fonts: {
                heading: 'Playfair Display',
                body: 'Lato',
                sizes: {
                    h1: 40,
                    h2: 28,
                    h3: 20,
                    body: 16,
                },
            },
            layout: {
                headerType: 'elegant',
                footerType: 'standard',
                productListLayout: 'grid',
                productDetailLayout: 'elegant',
            },
        },
    },
};

/**
 * Genera una nueva plantilla basada en un preset
 */
export function generateTemplate(presetKey: keyof typeof TEMPLATE_PRESETS): Template {
    const preset = TEMPLATE_PRESETS[presetKey];

    if (!preset) {
        throw new Error(`Preset de plantilla no encontrado: ${presetKey}`);
    }

    return {
        id: `template_${Date.now()}`,
        name: preset.name,
        description: preset.description,
        previewUrl: preset.previewUrl,
        category: preset.category,
        isDefault: preset.isDefault,
        isCustomizable: preset.isCustomizable,
        components: [...preset.components],
        settings: { ...preset.settings },
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

/**
 * Obtiene todos los presets de plantillas disponibles
 */
export function getTemplatePresets() {
    return Object.entries(TEMPLATE_PRESETS).map(([key, preset]) => ({
        id: key,
        name: preset.name,
        description: preset.description,
        previewUrl: preset.previewUrl,
        category: preset.category,
    }));
}

/**
 * Personaliza una plantilla existente con nuevas configuraciones
 */
export function customizeTemplate(template: Template, settings: Partial<TemplateSettings>): Template {
    return {
        ...template,
        settings: {
            ...template.settings,
            ...settings,
        },
        updatedAt: new Date(),
    };
}

/**
 * Añade o actualiza un componente en una plantilla
 */
export function updateTemplateComponent(template: Template, component: TemplateComponent): Template {
    const existingIndex = template.components.findIndex(c => c.id === component.id);

    const updatedComponents = [...template.components];

    if (existingIndex >= 0) {
        // Actualizar componente existente
        updatedComponents[existingIndex] = component;
    } else {
        // Añadir nuevo componente
        updatedComponents.push(component);
    }

    return {
        ...template,
        components: updatedComponents,
        updatedAt: new Date(),
    };
}

/**
 * Elimina un componente de una plantilla
 */
export function removeTemplateComponent(template: Template, componentId: string): Template {
    const component = template.components.find(c => c.id === componentId);

    if (!component) {
        return template;
    }

    if (component.isRequired) {
        throw new Error(`No se puede eliminar el componente requerido: ${component.name}`);
    }

    return {
        ...template,
        components: template.components.filter(c => c.id !== componentId),
        updatedAt: new Date(),
    };
}