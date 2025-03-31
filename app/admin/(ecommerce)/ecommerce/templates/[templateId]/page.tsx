"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import Link from 'next/link'
import { Template } from '@/lib/e-commerce/store/types'
import { useCustomization } from '@/hooks/use-customization'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function TemplateEditPage() {
    const params = useParams()
    const router = useRouter()
    const templateId = params.templateId as string
    const isNew = templateId === 'new'
    
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [templateName, setTemplateName] = useState('')
    const [templateDescription, setTemplateDescription] = useState('')
    const [templateCategory, setTemplateCategory] = useState('General')
    
    const { 
        template, 
        setTemplate, 
        loadTemplate,
        saveTemplate,
        updateColors,
        updateFonts,
        updateLayout,
        previewTemplate
    } = useCustomization()

    useEffect(() => {
        const initTemplate = async () => {
            try {
                setLoading(true)
                if (!isNew && templateId) {
                    const loadedTemplate = await loadTemplate(templateId)
                    setTemplateName(loadedTemplate.name)
                    setTemplateDescription(loadedTemplate.description)
                    setTemplateCategory(loadedTemplate.category)
                } else {
                    // Cargar plantilla por defecto para nueva creación
                    const response = await fetch('/api/admin/e-commerce/templates?preset=modern')
                    if (!response.ok) throw new Error('No se pudo cargar la plantilla predeterminada')
                    const defaultTemplate = await response.json()
                    setTemplate(defaultTemplate)
                    setTemplateName('Nueva Plantilla')
                    setTemplateDescription('Descripción de la nueva plantilla')
                    setTemplateCategory('General')
                }
            } catch (err) {
                console.error('Error al inicializar la plantilla:', err)
                setError('No se pudo cargar la plantilla. Por favor, inténtalo de nuevo.')
            } finally {
                setLoading(false)
            }
        }

        initTemplate()
    }, [templateId, isNew, loadTemplate, setTemplate])

    const handleSave = async () => {
        if (!template) return
        
        try {
            setSaving(true)
            const updatedTemplate = {
                ...template,
                name: templateName,
                description: templateDescription,
                category: templateCategory
            }
            
            const savedTemplate = await saveTemplate(updatedTemplate, templateName)
            
            if (isNew) {
                // Redirigir a la página de edición con el nuevo ID
                router.push(`/admin/ecommerce/templates/${savedTemplate.id}`)
            }
            
        } catch (err) {
            console.error('Error al guardar la plantilla:', err)
            setError('No se pudo guardar la plantilla. Por favor, inténtalo de nuevo.')
        } finally {
            setSaving(false)
        }
    }

    const handlePreview = () => {
        if (isNew) {
            // Para plantillas nuevas, mostrar una vista previa temporal
            const previewData = previewTemplate()
            // Aquí podrías abrir una modal con la vista previa
            console.log('Vista previa temporal:', previewData)
        } else {
            // Para plantillas existentes, navegar a la página de vista previa
            router.push(`/admin/ecommerce/templates/${templateId}/preview`)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error || !template) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg max-w-md w-full text-center">
                    <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
                        Error
                    </h2>
                    <p className="text-red-600 dark:text-red-300 mb-4">
                        {error || 'No se pudo cargar la plantilla'}
                    </p>
                    <Link href="/admin/ecommerce/templates">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft size={16} />
                            Volver a plantillas
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="bg-white dark:bg-gray-800 p-4 border-b flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/admin/ecommerce/templates">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-semibold">
                        {isNew ? 'Crear Nueva Plantilla' : `Editar: ${templateName}`}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className="gap-2" 
                        onClick={handlePreview}
                    >
                        <Eye size={16} />
                        Vista Previa
                    </Button>
                    <Button 
                        className="gap-2 bg-green-600 hover:bg-green-700" 
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                        ) : (
                            <Save size={16} />
                        )}
                        Guardar
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="templateName">Nombre de la Plantilla</Label>
                                    <Input
                                        id="templateName"
                                        value={templateName}
                                        onChange={(e) => setTemplateName(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                
                                <div>
                                    <Label htmlFor="templateDescription">Descripción</Label>
                                    <Input
                                        id="templateDescription"
                                        value={templateDescription}
                                        onChange={(e) => setTemplateDescription(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                
                                <div>
                                    <Label htmlFor="templateCategory">Categoría</Label>
                                    <Select 
                                        value={templateCategory} 
                                        onValueChange={setTemplateCategory}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Selecciona una categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="General">General</SelectItem>
                                            <SelectItem value="Moda">Moda</SelectItem>
                                            <SelectItem value="Electrónica">Electrónica</SelectItem>
                                            <SelectItem value="Hogar">Hogar</SelectItem>
                                            <SelectItem value="Alimentos">Alimentos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="design">
                        <TabsList className="mb-4">
                            <TabsTrigger value="design">Diseño</TabsTrigger>
                            <TabsTrigger value="components">Componentes</TabsTrigger>
                            <TabsTrigger value="settings">Configuración</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="design" className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-4">Colores</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="primaryColor">Color Primario</Label>
                                        <div className="flex mt-1">
                                            <Input
                                                id="primaryColor"
                                                type="color"
                                                value={template.settings.colors.primary || '#3b82f6'}
                                                onChange={(e) => updateColors('primary', e.target.value)}
                                                className="w-12 h-10 p-1"
                                            />
                                            <Input
                                                value={template.settings.colors.primary || '#3b82f6'}
                                                onChange={(e) => updateColors('primary', e.target.value)}
                                                className="ml-2 flex-1"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="secondaryColor">Color Secundario</Label>
                                        <div className="flex mt-1">
                                            <Input
                                                id="secondaryColor"
                                                type="color"
                                                value={template.settings.colors.secondary || '#6b7280'}
                                                onChange={(e) => updateColors('secondary', e.target.value)}
                                                className="w-12 h-10 p-1"
                                            />
                                            <Input
                                                value={template.settings.colors.secondary || '#6b7280'}
                                                onChange={(e) => updateColors('secondary', e.target.value)}
                                                className="ml-2 flex-1"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="accentColor">Color de Acento</Label>
                                        <div className="flex mt-1">
                                            <Input
                                                id="accentColor"
                                                type="color"
                                                value={template.settings.colors.accent || '#8b5cf6'}
                                                onChange={(e) => updateColors('accent', e.target.value)}
                                                className="w-12 h-10 p-1"
                                            />
                                            <Input
                                                value={template.settings.colors.accent || '#8b5cf6'}
                                                onChange={(e) => updateColors('accent', e.target.value)}
                                                className="ml-2 flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-4">Tipografía</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="headingFont">Fuente de Títulos</Label>
                                        <Select 
                                            value={template.settings.fonts.heading || 'Inter'} 
                                            onValueChange={(value) => updateFonts('heading', value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Selecciona una fuente" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Inter">Inter</SelectItem>
                                                <SelectItem value="Roboto">Roboto</SelectItem>
                                                <SelectItem value="Montserrat">Montserrat</SelectItem>
                                                <SelectItem value="Poppins">Poppins</SelectItem>
                                                <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="bodyFont">Fuente de Texto</Label>
                                        <Select 
                                            value={template.settings.fonts.body || 'Inter'} 
                                            onValueChange={(value) => updateFonts('body', value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Selecciona una fuente" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Inter">Inter</SelectItem>
                                                <SelectItem value="Roboto">Roboto</SelectItem>
                                                <SelectItem value="Open Sans">Open Sans</SelectItem>
                                                <SelectItem value="Lato">Lato</SelectItem>
                                                <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="components" className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-4">Componentes de la Plantilla</h3>
                                <div className="space-y-4">
                                    {template.components.map((component, index) => (
                                        <div key={component.id} className="border p-4 rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-medium">{component.type}</h4>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm">
                                                        Editar
                                                    </Button>
                                                    <Button variant="destructive" size="sm">
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {component.description || `Componente #${index + 1}`}
                                            </p>
                                        </div>
                                    ))}
                                    
                                    <Button className="w-full mt-4">
                                        Añadir Componente
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="settings" className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-4">Configuración de Diseño</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="containerWidth">Ancho del Contenedor</Label>
                                        <Select 
                                            value={template.settings.layout.containerWidth || 'max-w-7xl'} 
                                            onValueChange={(value) => updateLayout('containerWidth', value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Selecciona un ancho" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="max-w-5xl">Estrecho</SelectItem>
                                                <SelectItem value="max-w-6xl">Medio</SelectItem>
                                                <SelectItem value="max-w-7xl">Ancho</SelectItem>
                                                <SelectItem value="max-w-full">Completo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="spacing">Espaciado</Label>
                                        <Select 
                                            value={template.settings.layout.spacing || 'normal'} 
                                            onValueChange={(value) => updateLayout('spacing', value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Selecciona un espaciado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="compact">Compacto</SelectItem>
                                                <SelectItem value="normal">Normal</SelectItem>
                                                <SelectItem value="relaxed">Relajado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}