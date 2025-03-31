/**
 * Validador de plantillas para e-commerce
 * Este módulo se encarga de validar las plantillas para asegurar que cumplen con los requisitos necesarios
 */

import { Template, TemplateComponent, TemplateSettings } from '../store/types';

/**
 * Valida una plantilla completa
 */
export function validateTemplate(template: Template): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar campos obligatorios
    if (!template.name) errors.push('La plantilla debe tener un nombre');
    if (!template.description) errors.push('La plantilla debe tener una descripción');
    if (!template.previewUrl) errors.push('La plantilla debe tener una URL de vista previa');
    if (!template.category) errors.push('La plantilla debe tener una categoría');

    // Validar componentes
    const componentsValidation = validateComponents(template.components);
    errors.push(...componentsValidation.errors);

    // Validar configuraciones
    const settingsValidation = validateSettings(template.settings);
    errors.push(...settingsValidation.errors);

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Valida los componentes de una plantilla
 */
export function validateComponents(components: TemplateComponent[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Verificar que existen los componentes requeridos
    const hasHeader = components.some(c => c.type === 'header');
    const hasFooter = components.some(c => c.type === 'footer');

    if (!hasHeader) errors.push('La plantilla debe tener un componente de tipo header');
    if (!hasFooter) errors.push('La plantilla debe tener un componente de tipo footer');

    // Verificar que cada componente tiene los campos necesarios
    components.forEach(component => {
        if (!component.id) errors.push(`Un componente no tiene ID`);
        if (!component.type) errors.push(`El componente ${component.id || 'sin ID'} no tiene tipo`);
        if (!component.name) errors.push(`El componente ${component.id || 'sin ID'} no tiene nombre`);

        // Validaciones específicas por tipo de componente
        switch (component.type) {
            case 'header':
                if (!component.settings || typeof component.settings.showCart === 'undefined') {
                    errors.push(`El componente header debe especificar si muestra el carrito`);
                }
                break;
            case 'hero':
                if (!component.content || !component.content.title) {
                    errors.push(`El componente hero debe tener un título`);
                }
                if (!component.content || !component.content.imageUrl) {
                    errors.push(`El componente hero debe tener una imagen`);
                }
                break;
            case 'productGrid':
            case 'productCarousel':
                if (!component.settings || typeof component.settings.maxProducts === 'undefined') {
                    errors.push(`El componente ${component.type} debe especificar el número máximo de productos`);
                }
                break;
        }
    });

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Valida las configuraciones de una plantilla
 */
export function validateSettings(settings: TemplateSettings): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar esquema de colores
    if (!settings.colors) {
        errors.push('La plantilla debe tener un esquema de colores');
    } else {
        if (!settings.colors.primary) errors.push('Falta el color primario');
        if (!settings.colors.secondary) errors.push('Falta el color secundario');
        if (!settings.colors.background) errors.push('Falta el color de fondo');
        if (!settings.colors.text) errors.push('Falta el color de texto');
    }

    // Validar fuentes
    if (!settings.fonts) {
        errors.push('La plantilla debe tener configuración de fuentes');
    } else {
        if (!settings.fonts.heading) errors.push('Falta la fuente para títulos');
        if (!settings.fonts.body) errors.push('Falta la fuente para el cuerpo');
        if (!settings.fonts.sizes) {
            errors.push('Faltan los tamaños de fuente');
        } else {
            if (!settings.fonts.sizes.h1) errors.push('Falta el tamaño para h1');
            if (!settings.fonts.sizes.body) errors.push('Falta el tamaño para el cuerpo');
        }
    }

    // Validar layout
    if (!settings.layout) {
        errors.push('La plantilla debe tener configuración de layout');
    } else {
        if (!settings.layout.headerType) errors.push('Falta el tipo de header');
        if (!settings.layout.footerType) errors.push('Falta el tipo de footer');
        if (!settings.layout.productListLayout) errors.push('Falta el layout de lista de productos');
        if (!settings.layout.productDetailLayout) errors.push('Falta el layout de detalle de producto');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Verifica si una plantilla es compatible con una tienda
 */
export function isTemplateCompatibleWithStore(template: Template, storeProducts: number): boolean {
    // Verificar si la plantilla requiere un número mínimo de productos
    const productComponents = template.components.filter(
        c => c.type === 'productGrid' || c.type === 'productCarousel'
    );

    if (productComponents.length > 0) {
        // Si hay componentes de productos, verificar que la tienda tenga suficientes productos
        const minRequiredProducts = Math.min(
            ...productComponents.map(c => c.settings.maxProducts || 0)
        );

        if (storeProducts < minRequiredProducts) {
            return false;
        }
    }

    return true;
}

/**
 * Genera una versión simplificada de la plantilla para previsualización
 */
export function generateTemplatePreview(template: Template): any {
    return {
        id: template.id,
        name: template.name,
        description: template.description,
        previewUrl: template.previewUrl,
        components: template.components.map(c => ({
            id: c.id,
            type: c.type,
            name: c.name,
        })),
        colors: template.settings.colors,
    };
}