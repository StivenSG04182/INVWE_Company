import { useState, useEffect } from 'react';
import { Template } from '@/lib/e-commerce/store/types';
import { getTemplatePresets } from '@/lib/e-commerce/templates/generator';

const STORAGE_KEY = 'selectedTemplate';

export const useTemplate = (defaultTemplate: string | null = null) => {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(defaultTemplate);
    const [templates, setTemplates] = useState<Array<{ id: string; name: string; description: string; previewUrl: string; category: string }>>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Cargar las plantillas disponibles
    useEffect(() => {
        const loadTemplates = async () => {
            try {
                setIsLoading(true);
                // En un caso real, esto podría ser una llamada a la API
                // Por ahora, usamos los presets predefinidos
                const availableTemplates = getTemplatePresets();
                setTemplates(availableTemplates);

                // Recuperar la plantilla seleccionada del almacenamiento local
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored && !selectedTemplate) {
                    setSelectedTemplate(JSON.parse(stored));
                }

                setError(null);
            } catch (err) {
                console.error('Error al cargar las plantillas:', err);
                setError('No se pudieron cargar las plantillas');
            } finally {
                setIsLoading(false);
            }
        };

        loadTemplates();
    }, [selectedTemplate]);

    // Guardar la plantilla seleccionada en el almacenamiento local
    useEffect(() => {
        if (selectedTemplate) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTemplate));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [selectedTemplate]);

    // Obtener los detalles de la plantilla seleccionada
    const getSelectedTemplateDetails = () => {
        if (!selectedTemplate) return null;
        return templates.find(template => template.id === selectedTemplate) || null;
    };

    return {
        selectedTemplate,
        setSelectedTemplate,
        templates,
        isLoading,
        error,
        getSelectedTemplateDetails
    };
};