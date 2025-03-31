/**
 * Generador de plantillas con IA
 * Este módulo se encarga de generar plantillas de e-commerce utilizando IA
 */

import { Template, TemplateSettings, ColorScheme } from '../store/types';
import { generateTemplate } from '../templates/generator';

// Tipos para las opciones de generación de plantillas con IA
export interface AITemplateGenerationOptions {
    storeType: string;
    colorScheme: string;
    style: string;
    productFocus: string;
    targetAudience: string;
    brandPersonality: string;
    customInstructions?: string;
}

// Mapeo de tipos de tienda a presets de plantillas
const STORE_TYPE_TO_PRESET: Record<string, keyof typeof PRESET_MAPPINGS> = {
    'general': 'modern',
    'fashion': 'luxury',
    'electronics': 'modern',
    'home': 'minimal',
    'beauty': 'luxury',
    'food': 'minimal',
};

// Mapeo de esquemas de colores predefinidos
const COLOR_SCHEMES: Record<string, ColorScheme> = {
    'modern': {
        primary: '#3b82f6',
        secondary: '#10b981',
        accent: '#f59e0b',
        background: '#ffffff',
        text: '#1f2937',
    },
    'dark': {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#ec4899',
        background: '#1f2937',
        text: '#f9fafb',
    },
    'earthy': {
        primary: '#84cc16',
        secondary: '#65a30d',
        accent: '#ca8a04',
        background: '#f5f5f4',
        text: '#44403c',
    },
    'luxury': {
        primary: '#9f7e69',
        secondary: '#2c2c2c',
        accent: '#d4af37',
        background: '#ffffff',
        text: '#1a1a1a',
    },
    'vibrant': {
        primary: '#f43f5e',
        secondary: '#8b5cf6',
        accent: '#f59e0b',
        background: '#ffffff',
        text: '#1f2937',
    },
    'minimal': {
        primary: '#000000',
        secondary: '#4b5563',
        accent: '#d1d5db',
        background: '#ffffff',
        text: '#1f2937',
    },
};

// Mapeo de estilos a configuraciones de fuentes
const FONT_STYLES: Record<string, TemplateSettings['fonts']> = {
    'modern': {
        heading: 'Inter',
        body: 'Inter',
        sizes: {
            h1: 36,
            h2: 24,
            h3: 18,
            body: 16,
        },
    },
    'elegant': {
        heading: 'Playfair Display',
        body: 'Lato',
        sizes: {
            h1: 40,
            h2: 28,
            h3: 20,
            body: 16,
        },
    },
    'playful': {
        heading: 'Poppins',
        body: 'Poppins',
        sizes: {
            h1: 38,
            h2: 26,
            h3: 20,
            body: 16,
        },
    },
    'minimal': {
        heading: 'Montserrat',
        body: 'Montserrat',
        sizes: {
            h1: 32,
            h2: 22,
            h3: 18,
            body: 16,
        },
    },
    'bold': {
        heading: 'Raleway',
        body: 'Open Sans',
        sizes: {
            h1: 42,
            h2: 30,
            h3: 22,
            body: 16,
        },
    },
};

// Mapeo de presets para diferentes tipos de plantillas
const PRESET_MAPPINGS = {
    'modern': {
        name: 'Modern Store',
        description: 'Una plantilla moderna y minimalista para tiendas de e-commerce',
        previewUrl: '/templates/modern-store/preview.jpg',
        category: 'general',
    },
    'minimal': {
        name: 'Minimal Store',
        description: 'Una plantilla minimalista y elegante para tiendas de e-commerce',
        previewUrl: '/templates/minimal-store/preview.jpg',
        category: 'general',
    },
    'luxury': {
        name: 'Luxury Store',
        description: 'Una plantilla elegante y sofisticada para tiendas de productos de lujo',
        previewUrl: '/templates/luxury-store/preview.jpg',
        category: 'fashion',
    },
};

/**
 * Genera una plantilla utilizando IA basada en las opciones proporcionadas
 */
export async function generateAITemplate(options: AITemplateGenerationOptions): Promise<Template> {
    // Determinar el preset base según el tipo de tienda
    const presetKey = STORE_TYPE_TO_PRESET[options.storeType] || 'modern';

    // Generar la plantilla base
    const baseTemplate = generateTemplate(presetKey as any);

    // Personalizar la plantilla según las opciones de IA
    const customizedTemplate = customizeTemplateWithAI(baseTemplate, options);

    return customizedTemplate;
}

/**
 * Personaliza una plantilla existente utilizando opciones de IA
 */
function customizeTemplateWithAI(template: Template, options: AITemplateGenerationOptions): Template {
    // Personalizar nombre y descripción
    const storeTypeName = options.storeType.charAt(0).toUpperCase() + options.storeType.slice(1);
    const customTemplate = {
        ...template,
        name: `${storeTypeName} ${options.style.charAt(0).toUpperCase() + options.style.slice(1)} Store`,
        description: `Una tienda de ${options.storeType} con un diseño ${options.style} enfocada en ${options.targetAudience}`,
    };

    // Aplicar esquema de colores
    const colorScheme = COLOR_SCHEMES[options.colorScheme] || COLOR_SCHEMES.modern;

    // Aplicar estilo de fuentes
    const fontStyle = FONT_STYLES[options.style] || FONT_STYLES.modern;

    // Personalizar configuraciones
    const customSettings: TemplateSettings = {
        ...customTemplate.settings,
        colors: colorScheme,
        fonts: fontStyle,
    };

    // Personalizar componentes según el enfoque de productos
    const customComponents = [...customTemplate.components];

    // Ajustar el componente hero según la personalidad de la marca
    const heroComponent = customComponents.find(c => c.type === 'hero');
    if (heroComponent && heroComponent.content) {
        let title = '';
        let subtitle = '';

        switch (options.brandPersonality) {
            case 'professional':
                title = `Calidad y Profesionalismo`;
                subtitle = `Productos de ${options.storeType} de la más alta calidad`;
                break;
            case 'friendly':
                title = `¡Bienvenido a Nuestra Tienda!`;
                subtitle = `Descubre nuestros increíbles productos de ${options.storeType}`;
                break;
            case 'luxury':
                title = `Exclusividad y Elegancia`;
                subtitle = `Productos premium de ${options.storeType}`;
                break;
            case 'innovative':
                title = `Innovación en ${storeTypeName}`;
                subtitle = `Descubre el futuro de ${options.storeType}`;
                break;
            default:
                title = `Bienvenido a nuestra tienda de ${options.storeType}`;
                subtitle = `Descubre nuestros productos`;
        }

        heroComponent.content = {
            ...heroComponent.content,
            title,
            subtitle,
        };
    }

    // Ajustar la configuración de productos según el enfoque
    const productComponent = customComponents.find(c => c.type === 'productGrid' || c.type === 'productCarousel');
    if (productComponent) {
        switch (options.productFocus) {
            case 'featured':
                productComponent.settings = {
                    ...productComponent.settings,
                    showPrice: true,
                    showRating: true,
                    maxProducts: 4,
                };
                break;
            case 'new':
                productComponent.settings = {
                    ...productComponent.settings,
                    showPrice: true,
                    showRating: false,
                    maxProducts: 6,
                };
                break;
            case 'bestsellers':
                productComponent.settings = {
                    ...productComponent.settings,
                    showPrice: true,
                    showRating: true,
                    maxProducts: 8,
                };
                break;
        }
    }

    return {
        ...customTemplate,
        components: customComponents,
        settings: customSettings,
        updatedAt: new Date(),
    };
}

/**
 * Genera una vista previa de la plantilla basada en opciones de IA
 */
export function generateAITemplatePreview(options: AITemplateGenerationOptions): any {
    // Determinar el preset base según el tipo de tienda
    const presetKey = STORE_TYPE_TO_PRESET[options.storeType] || 'modern';
    const preset = PRESET_MAPPINGS[presetKey as keyof typeof PRESET_MAPPINGS];

    // Obtener el esquema de colores
    const colorScheme = COLOR_SCHEMES[options.colorScheme] || COLOR_SCHEMES.modern;

    // Generar una vista previa simplificada
    return {
        name: `${options.storeType.charAt(0).toUpperCase() + options.storeType.slice(1)} ${options.style.charAt(0).toUpperCase() + options.style.slice(1)} Store`,
        description: preset.description,
        previewUrl: preset.previewUrl,
        colors: colorScheme,
        style: options.style,
        targetAudience: options.targetAudience,
    };
}