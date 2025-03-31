import { useState, useEffect } from 'react';
import { Template, TemplateSettings, ColorScheme } from '@/lib/e-commerce/store/types';
import { DesignCustomizationOptions } from '@/lib/e-commerce/ai/design-processor';

export const useCustomization = (initialTemplate: Template | null = null) => {
    const [template, setTemplate] = useState<Template | null>(initialTemplate);
    const [customizations, setCustomizations] = useState<DesignCustomizationOptions>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<boolean>(false);

    // Aplicar las personalizaciones a la plantilla para obtener una vista previa
    const previewTemplate = () => {
        if (!template) return null;

        // Crear una copia profunda de la plantilla
        const previewTemplate = JSON.parse(JSON.stringify(template));

        // Aplicar personalizaciones de colores
        if (customizations.colors) {
            previewTemplate.settings.colors = {
                ...previewTemplate.settings.colors,
                ...customizations.colors
            };
        }

        // Aplicar personalizaciones de fuentes
        if (customizations.fonts) {
            previewTemplate.settings.fonts = {
                ...previewTemplate.settings.fonts,
                ...customizations.fonts,
                sizes: {
                    ...previewTemplate.settings.fonts.sizes,
                    ...customizations.fonts?.sizes
                }
            };
        }

        // Aplicar personalizaciones de layout
        if (customizations.layout) {
            previewTemplate.settings.layout = {
                ...previewTemplate.settings.layout,
                ...customizations.layout
            };
        }

        // Aplicar personalizaciones de componentes
        if (customizations.components) {
            customizations.components.forEach(componentUpdate => {
                const componentIndex = previewTemplate.components.findIndex(
                    c => c.id === componentUpdate.id
                );

                if (componentIndex >= 0) {
                    // Actualizar configuraciones del componente
                    if (componentUpdate.settings) {
                        previewTemplate.components[componentIndex].settings = {
                            ...previewTemplate.components[componentIndex].settings,
                            ...componentUpdate.settings
                        };
                    }

                    // Actualizar contenido del componente
                    if (componentUpdate.content) {
                        previewTemplate.components[componentIndex].content = {
                            ...previewTemplate.components[componentIndex].content || {},
                            ...componentUpdate.content
                        };
                    }
                }
            });
        }

        return previewTemplate;
    };

    // Guardar las personalizaciones en el servidor
    const saveCustomizations = async (createNew: boolean = false, name?: string) => {
        try {
            setIsLoading(true);
            setError(null);

            if (!template) {
                throw new Error('No hay plantilla para personalizar');
            }

            const response = await fetch('/api/admin/e-commerce/ai/customize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    templateId: template.id,
                    customization: customizations,
                    save: true,
                    createNew,
                    name: name || `${template.name} (Personalizada)`
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar las personalizaciones');
            }

            const savedTemplate = await response.json();
            setTemplate(savedTemplate);
            setCustomizations({});
            return savedTemplate;
        } catch (err) {
            console.error('Error al guardar las personalizaciones:', err);
            setError(err instanceof Error ? err.message : 'Error al guardar las personalizaciones');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Actualizar un color específico
    const updateColor = (colorKey: keyof ColorScheme, value: string) => {
        setCustomizations(prev => ({
            ...prev,
            colors: {
                ...prev.colors,
                [colorKey]: value
            }
        }));
    };

    // Actualizar una fuente específica
    const updateFont = (fontKey: 'heading' | 'body', value: string) => {
        setCustomizations(prev => ({
            ...prev,
            fonts: {
                ...prev.fonts,
                [fontKey]: value
            }
        }));
    };

    // Actualizar un tamaño de fuente específico
    const updateFontSize = (sizeKey: 'h1' | 'h2' | 'h3' | 'body', value: number) => {
        setCustomizations(prev => ({
            ...prev,
            fonts: {
                ...prev.fonts,
                sizes: {
                    ...prev.fonts?.sizes,
                    [sizeKey]: value
                }
            }
        }));
    };

    // Actualizar una configuración de layout específica
    const updateLayout = (layoutKey: keyof TemplateSettings['layout'], value: string) => {
        setCustomizations(prev => ({
            ...prev,
            layout: {
                ...prev.layout,
                [layoutKey]: value
            }
        }));
    };

    // Actualizar un componente específico
    const updateComponent = (componentId: string, settings?: Record<string, any>, content?: Record<string, any>) => {
        setCustomizations(prev => {
            const existingComponents = prev.components || [];
            const componentIndex = existingComponents.findIndex(c => c.id === componentId);

            let updatedComponents;

            if (componentIndex >= 0) {
                // Actualizar componente existente
                updatedComponents = [...existingComponents];
                updatedComponents[componentIndex] = {
                    ...updatedComponents[componentIndex],
                    id: componentId,
                    settings: settings ? { ...updatedComponents[componentIndex].settings, ...settings } : updatedComponents[componentIndex].settings,
                    content: content ? { ...updatedComponents[componentIndex].content, ...content } : updatedComponents[componentIndex].content
                };
            } else {
                // Añadir nuevo componente
                updatedComponents = [
                    ...existingComponents,
                    { id: componentId, settings, content }
                ];
            }

            return {
                ...prev,
                components: updatedComponents
            };
        });
    };

    // Restablecer todas las personalizaciones
    const resetCustomizations = () => {
        setCustomizations({});
    };

    // Cargar una plantilla desde el servidor
    const loadTemplate = async (templateId: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/admin/e-commerce/templates/${templateId}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al cargar la plantilla');
            }

            const loadedTemplate = await response.json();
            setTemplate(loadedTemplate);
            setCustomizations({});
            return loadedTemplate;
        } catch (err) {
            console.error('Error al cargar la plantilla:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar la plantilla');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        template,
        setTemplate,
        customizations,
        setCustomizations,
        isLoading,
        error,
        previewMode,
        setPreviewMode,
        previewTemplate,
        saveCustomizations,
        updateColor,
        updateFont,
        updateFontSize,
        updateLayout,
        updateComponent,
        resetCustomizations,
        loadTemplate
    };
};