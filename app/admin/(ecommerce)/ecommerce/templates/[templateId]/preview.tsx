"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'
import { Template } from '@/lib/e-commerce/store/types'
import { useCustomization } from '@/hooks/use-customization'

export default function TemplatePreviewPage() {
    const params = useParams()
    const router = useRouter()
    const templateId = params.templateId as string
    
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { loadTemplate, previewTemplate } = useCustomization()
    const [template, setTemplate] = useState<Template | null>(null)
    const [previewData, setPreviewData] = useState<any>(null)

    useEffect(() => {
        const loadTemplateData = async () => {
            try {
                setLoading(true)
                const loadedTemplate = await loadTemplate(templateId)
                setTemplate(loadedTemplate)
                
                // Generar datos de vista previa
                const preview = previewTemplate()
                setPreviewData(preview)
            } catch (err) {
                console.error('Error al cargar la plantilla:', err)
                setError('No se pudo cargar la vista previa. Por favor, inténtalo de nuevo.')
            } finally {
                setLoading(false)
            }
        }

        if (templateId) {
            loadTemplateData()
        }
    }, [templateId, loadTemplate, previewTemplate])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error || !template || !previewData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg max-w-md w-full text-center">
                    <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
                        Error
                    </h2>
                    <p className="text-red-600 dark:text-red-300 mb-4">
                        {error || 'No se pudo cargar la vista previa'}
                    </p>
                    <Link href={`/admin/ecommerce/templates/${templateId}`}>
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft size={16} />
                            Volver a la edición
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Barra de herramientas */}
            <div className="bg-white dark:bg-gray-800 p-4 border-b flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/ecommerce/templates/${templateId}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-semibold">
                        Vista Previa: {template.name}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Button 
                        className="gap-2 bg-blue-600 hover:bg-blue-700" 
                        onClick={() => router.push(`/admin/ecommerce/templates/${templateId}`)}
                    >
                        <Edit size={16} />
                        Editar Plantilla
                    </Button>
                </div>
            </div>

            {/* Contenedor de la vista previa */}
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
                <div className="max-w-screen-xl mx-auto p-4">
                    {/* Dispositivo simulado */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mx-auto max-w-4xl">
                        {/* Barra de navegación simulada */}
                        <div className="bg-gray-200 dark:bg-gray-700 p-2 flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="flex-1 bg-white dark:bg-gray-600 rounded-md h-6 mx-2"></div>
                        </div>

                        {/* Contenido de la vista previa */}
                        <div 
                            className="p-4"
                            style={{
                                fontFamily: previewData.settings?.fonts?.body || 'Inter',
                                color: previewData.settings?.colors?.text || '#1f2937',
                                backgroundColor: previewData.settings?.colors?.background || '#ffffff'
                            }}
                        >
                            {/* Header */}
                            <header 
                                className="py-4 mb-6 border-b"
                                style={{
                                    borderColor: previewData.settings?.colors?.border || '#e5e7eb'
                                }}
                            >
                                <div className="flex justify-between items-center">
                                    <h1 
                                        className="text-2xl font-bold"
                                        style={{
                                            fontFamily: previewData.settings?.fonts?.heading || 'Inter',
                                            color: previewData.settings?.colors?.primary || '#3b82f6'
                                        }}
                                    >
                                        {template.name}
                                    </h1>
                                    <nav className="flex gap-4">
                                        <a href="#" className="hover:underline">Inicio</a>
                                        <a href="#" className="hover:underline">Productos</a>
                                        <a href="#" className="hover:underline">Categorías</a>
                                        <a href="#" className="hover:underline">Contacto</a>
                                    </nav>
                                </div>
                            </header>

                            {/* Componentes de la plantilla */}
                            <div className="space-y-8">
                                {previewData.components?.map((component: any, index: number) => {
                                    // Renderizar diferentes tipos de componentes
                                    switch (component.type) {
                                        case 'hero':
                                            return (
                                                <div 
                                                    key={index} 
                                                    className="rounded-lg overflow-hidden relative h-64"
                                                    style={{
                                                        backgroundColor: previewData.settings?.colors?.secondary || '#6b7280'
                                                    }}
                                                >
                                                    {component.content?.imageUrl && (
                                                        <div 
                                                            className="absolute inset-0 bg-center bg-cover"
                                                            style={{
                                                                backgroundImage: `url(${component.content.imageUrl})`,
                                                                opacity: 0.7
                                                            }}
                                                        ></div>
                                                    )}
                                                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6">
                                                        <h2 
                                                            className="text-3xl font-bold mb-2"
                                                            style={{
                                                                color: '#ffffff',
                                                                fontFamily: previewData.settings?.fonts?.heading || 'Inter',
                                                            }}
                                                        >
                                                            {component.content?.title || 'Título del Hero'}
                                                        </h2>
                                                        <p 
                                                            className="text-lg mb-4"
                                                            style={{
                                                                color: '#f3f4f6',
                                                            }}
                                                        >
                                                            {component.content?.subtitle || 'Subtítulo descriptivo para tu tienda'}
                                                        </p>
                                                        <button 
                                                            className="px-6 py-2 rounded-md font-medium"
                                                            style={{
                                                                backgroundColor: previewData.settings?.colors?.accent || '#8b5cf6',
                                                                color: '#ffffff'
                                                            }}
                                                        >
                                                            {component.content?.buttonText || 'Comprar Ahora'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        
                                        case 'featured':
                                            return (
                                                <div key={index} className="py-6">
                                                    <h2 
                                                        className="text-2xl font-semibold mb-4 text-center"
                                                        style={{
                                                            fontFamily: previewData.settings?.fonts?.heading || 'Inter',
                                                            color: previewData.settings?.colors?.primary || '#3b82f6'
                                                        }}
                                                    >
                                                        {component.content?.title || 'Productos Destacados'}
                                                    </h2>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {[1, 2, 3].map((item) => (
                                                            <div 
                                                                key={item} 
                                                                className="rounded-lg overflow-hidden border"
                                                                style={{
                                                                    borderColor: previewData.settings?.colors?.border || '#e5e7eb'
                                                                }}
                                                            >
                                                                <div className="bg-gray-200 h-32"></div>
                                                                <div className="p-3">
                                                                    <h3 className="font-medium">Producto {item}</h3>
                                                                    <p 
                                                                        className="text-sm"
                                                                        style={{
                                                                            color: previewData.settings?.colors?.secondary || '#6b7280'
                                                                        }}
                                                                    >
                                                                        $99.99
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        
                                        case 'content':
                                            return (
                                                <div 
                                                    key={index} 
                                                    className="py-6 px-4 rounded-lg"
                                                    style={{
                                                        backgroundColor: previewData.settings?.colors?.background2 || '#f9fafb'
                                                    }}
                                                >
                                                    <h2 
                                                        className="text-2xl font-semibold mb-3"
                                                        style={{
                                                            fontFamily: previewData.settings?.fonts?.heading || 'Inter',
                                                            color: previewData.settings?.colors?.primary || '#3b82f6'
                                                        }}
                                                    >
                                                        {component.content?.title || 'Acerca de Nosotros'}
                                                    </h2>
                                                    <p className="mb-4">
                                                        {component.content?.text || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.'}
                                                    </p>
                                                </div>
                                            );
                                        
                                        default:
                                            return (
                                                <div key={index} className="border p-4 rounded-lg text-center">
                                                    Componente: {component.type}
                                                </div>
                                            );
                                    }
                                })}
                            </div>

                            {/* Footer */}
                            <footer 
                                className="mt-8 pt-6 border-t text-center"
                                style={{
                                    borderColor: previewData.settings?.colors?.border || '#e5e7eb'
                                }}
                            >
                                <p 
                                    className="text-sm"
                                    style={{
                                        color: previewData.settings?.colors?.secondary || '#6b7280'
                                    }}
                                >
                                    © 2023 {template.name}. Todos los derechos reservados.
                                </p>
                            </footer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}