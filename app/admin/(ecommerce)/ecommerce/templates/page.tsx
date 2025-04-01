"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Eye } from 'lucide-react'


export default function TemplatesPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, ] = useState(1)
    const [itemsPerPage] = useState(6)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [templates, setTemplates] = useState<Array<{
        id: string;
        name: string;
        description: string;
        previewUrl: string;
        category: string;
    }>>([]);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true)
                const response = await fetch('/api/admin/e-commerce/templates')
                if (!response.ok) throw new Error('Error al cargar las plantillas')
                const data = await response.json()
                setTemplates(data)
            } catch (err) {
                console.error('Error al cargar plantillas:', err)
                setError('No se pudieron cargar las plantillas. Por favor, inténtalo de nuevo.')
            } finally {
                setLoading(false)
            }
        }

        fetchTemplates()
    }, [])

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory ? template.category === selectedCategory : true
        return matchesSearch && matchesCategory
    })

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const paginatedTemplates = filteredTemplates.slice(indexOfFirstItem, indexOfLastItem)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg max-w-md w-full text-center">
                    <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
                        Error
                    </h2>
                    <p className="text-red-600 dark:text-red-300 mb-4">
                        {error}
                    </p>
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => window.location.reload()}
                    >
                        Reintentar
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-bold">Plantillas de E-commerce</h1>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                                placeholder="Buscar plantilla..."
                                className="pl-10 w-full md:w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todas las categorías</option>
                            {Array.from(new Set(templates.map(t => t.category))).map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    <Button
                        onClick={() => router.push('/admin/ecommerce/templates/new')}
                        className="bg-blue-600 hover:bg-blue-700 gap-2"
                    >
                        <Plus size={16} />
                        Nueva Plantilla
                    </Button>
                </div>
            </div>

            {filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No se encontraron plantillas</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                        {searchQuery ?
                            `No hay resultados para "${searchQuery}". Intenta con otra búsqueda.` :
                            'No hay plantillas disponibles. Crea una nueva para comenzar.'}
                    </p>
                    {!searchQuery && (
                        <Button
                            onClick={() => router.push('/admin/ecommerce/templates/new')}
                            className="bg-blue-600 hover:bg-blue-700 gap-2"
                        >
                            <Plus size={16} />
                            Crear Plantilla
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-80"
                        >
                            <div
                                className="h-40 bg-gray-200 dark:bg-gray-700 relative"
                                style={{
                                    backgroundImage: template.previewUrl ? `url(${template.previewUrl})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                    {template.category}
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
                                    {template.description}
                                </p>

                                <div className="flex gap-2 mt-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 gap-1"
                                        onClick={() => router.push(`/admin/ecommerce/templates/${template.id}/preview`)}
                                    >
                                        <Eye size={14} />
                                        Vista Previa
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="flex-1 gap-1 bg-blue-600 hover:bg-blue-700"
                                        onClick={() => router.push(`/admin/ecommerce/templates/${template.id}`)}
                                    >
                                        <Edit size={14} />
                                        Editar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}