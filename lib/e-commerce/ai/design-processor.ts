/**
 * Procesador de diseños con IA
 * Este módulo se encarga de procesar y aplicar diseños generados por IA a las tiendas
 */

import { Template, Store, TemplateSettings } from '../store/types';
import { customizeTemplate } from '../templates/generator';
import { validateTemplate } from '../templates/validator';

// Tipos para las opciones de personalización de diseño
export interface DesignCustomizationOptions {
    colors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        background?: string;
        text?: string;
    };
    fonts?: {
        heading?: string;
        body?: string;
        sizes?: {
            h1?: number;
            h2?: number;
            h3?: number;
            body?: number;
        };
    };
    layout?: {
        headerType?: string;
        footerType?: string;
        productListLayout?: string;
        productDetailLayout?: string;
    };
    components?: {
        id: string;
        settings?: Record<string, any>;
        content?: Record<string, any>;
    }[];
}

/**
 * Aplica un diseño personalizado a una plantilla
 */
export function applyCustomDesign(template: Template, options: DesignCustomizationOptions): Template {
    // Crear una copia de la configuración actual
    const currentSettings = { ...template.settings };

    // Aplicar nuevas configuraciones de colores si se proporcionan
    if (options.colors) {
        currentSettings.colors = {
            ...currentSettings.colors,
            ...options.colors,
        };
    }

    // Aplicar nuevas configuraciones de fuentes si se proporcionan
    if (options.fonts) {
        currentSettings.fonts = {
            ...currentSettings.fonts,
            ...options.fonts,
            sizes: {
                ...currentSettings.fonts.sizes,
                ...options.fonts.sizes,
            },
        };
    }

    // Aplicar nuevas configuraciones de layout si se proporcionan
    if (options.layout) {
        currentSettings.layout = {
            ...currentSettings.layout,
            ...options.layout,
        };
    }

    // Crear una copia de la plantilla con las nuevas configuraciones
    let customizedTemplate = customizeTemplate(template, currentSettings);

    // Aplicar cambios a componentes específicos si se proporcionan
    if (options.components && options.components.length > 0) {
        const updatedComponents = [...customizedTemplate.components];

        options.components.forEach(componentUpdate => {
            const componentIndex = updatedComponents.findIndex(c => c.id === componentUpdate.id);

            if (componentIndex >= 0) {
                // Actualizar configuraciones del componente
                if (componentUpdate.settings) {
                    updatedComponents[componentIndex].settings = {
                        ...updatedComponents[componentIndex].settings,
                        ...componentUpdate.settings,
                    };
                }

                // Actualizar contenido del componente
                if (componentUpdate.content) {
                    updatedComponents[componentIndex].content = {
                        ...updatedComponents[componentIndex].content || {},
                        ...componentUpdate.content,
                    };
                }
            }
        });

        customizedTemplate = {
            ...customizedTemplate,
            components: updatedComponents,
        };
    }

    // Validar la plantilla personalizada
    const validation = validateTemplate(customizedTemplate);
    if (!validation.isValid) {
        throw new Error(`Diseño personalizado inválido: ${validation.errors.join(', ')}`);
    }

    return customizedTemplate;
}

/**
 * Genera una paleta de colores basada en un color principal
 */
export function generateColorPalette(primaryColor: string): {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
} {
    // Esta es una implementación simplificada
    // En un caso real, se utilizaría un algoritmo más sofisticado o una API de color

    // Convertir el color hexadecimal a componentes RGB
    const r = parseInt(primaryColor.slice(1, 3), 16);
    const g = parseInt(primaryColor.slice(3, 5), 16);
    const b = parseInt(primaryColor.slice(5, 7), 16);

    // Generar colores complementarios
    const secondary = `#${(255 - r).toString(16).padStart(2, '0')}${(255 - g).toString(16).padStart(2, '0')}${(255 - b).toString(16).padStart(2, '0')}`;

    // Generar color de acento (variación del primario)
    const accent = `#${Math.min(255, r + 50).toString(16).padStart(2, '0')}${Math.min(255, g + 20).toString(16).padStart(2, '0')}${Math.min(255, b).toString(16).padStart(2, '0')}`;

    // Determinar si el color primario es oscuro o claro para elegir el fondo y texto
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const background = brightness < 128 ? '#ffffff' : '#1a1a1a';
    const text = brightness < 128 ? '#1a1a1a' : '#ffffff';

    return {
        primary: primaryColor,
        secondary,
        accent,
        background,
        text,
    };
}

/**
 * Analiza el logo de una tienda para extraer colores dominantes
 */
export async function extractColorsFromLogo(logoUrl: string): Promise<string[]> {
    // Esta función requeriría una implementación real con análisis de imágenes
    // Podría utilizar una API externa o una biblioteca de procesamiento de imágenes

    // Implementación simulada para demostración
    return [
        '#3b82f6', // Azul
        '#10b981', // Verde
        '#f59e0b', // Naranja
    ];
}

/**
 * Aplica un diseño generado por IA a una tienda
 */
export async function applyAIDesignToStore(store: Store, template: Template): Promise<Store> {
    // Actualizar la tienda con la nueva plantilla
    const updatedStore: Store = {
        ...store,
        templateId: template.id,
        updatedAt: new Date(),
    };

    // Si la tienda tiene un logo, intentar extraer colores para personalizar aún más
    if (store.logoUrl) {
        try {
            const dominantColors = await extractColorsFromLogo(store.logoUrl);

            if (dominantColors.length > 0) {
                // Generar una paleta basada en el color dominante del logo
                const colorPalette = generateColorPalette(dominantColors[0]);

                // Personalizar la plantilla con los colores extraídos
                const customOptions: DesignCustomizationOptions = {
                    colors: colorPalette,
                };

                // Aplicar el diseño personalizado
                const customizedTemplate = applyCustomDesign(template, customOptions);

                // Aquí se guardaría la plantilla personalizada en la base de datos
                // y se actualizaría el ID en la tienda
                // Este paso dependería de la implementación específica del sistema
            }
        } catch (error) {
            console.error('Error al extraer colores del logo:', error);
            // Continuar con la plantilla sin personalización adicional
        }
    }

    return updatedStore;
}