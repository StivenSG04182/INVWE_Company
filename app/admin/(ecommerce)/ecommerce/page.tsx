"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Input } from '@/components/ui/input'
import { useState } from 'react'

const templates = [
    { id: 1, name: 'Tienda Moderna', category: 'General' },
    { id: 2, name: 'Moda Urbana', category: 'Moda' },
    { id: 3, name: 'Tecnología', category: 'Electrónica' },
]

export default function EcommercePage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [hoveredCard, setHoveredCard] = useState<number | null>(null)

    const filteredTemplates = templates.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col min-h-screen p-8">
            <div className="flex gap-4 mb-8">
                <Input
                    placeholder="Buscar plantilla..."
                    className="max-w-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                    onClick={() => router.push('./ecommerce/ai-generator')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                    AI Generator
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                    <div
                        key={template.id}
                        className="relative group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-64"
                        onMouseEnter={() => setHoveredCard(template.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div className="h-full p-6 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{template.category}</p>
                            </div>

                            {(hoveredCard === template.id) && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl backdrop-blur-sm">
                                    <div className="flex gap-4">
                                        <Button
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors"
                                            onClick={() => console.log('Preview', template.id)}
                                        >
                                            Preview
                                        </Button>
                                        <Button
                                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 transition-colors"
                                            onClick={() => console.log('Customize', template.id)}
                                        >
                                            Customize
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
