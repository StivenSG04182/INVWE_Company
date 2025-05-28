"use client"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Download, Star } from "lucide-react"

const TemplatesTab = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")

    const templates = [
        {
            id: 1,
            name: "Landing Page Moderna",
            category: "landing",
            preview: "/placeholder.svg?height=120&width=200",
            rating: 4.8,
            downloads: 1234,
            isPro: false,
        },
        {
            id: 2,
            name: "E-commerce Hero",
            category: "ecommerce",
            preview: "/placeholder.svg?height=120&width=200",
            rating: 4.9,
            downloads: 856,
            isPro: true,
        },
        {
            id: 3,
            name: "Blog Personal",
            category: "blog",
            preview: "/placeholder.svg?height=120&width=200",
            rating: 4.7,
            downloads: 642,
            isPro: false,
        },
        {
            id: 4,
            name: "Portfolio Creativo",
            category: "portfolio",
            preview: "/placeholder.svg?height=120&width=200",
            rating: 4.9,
            downloads: 923,
            isPro: true,
        },
        {
            id: 5,
            name: "Página de Contacto",
            category: "contact",
            preview: "/placeholder.svg?height=120&width=200",
            rating: 4.6,
            downloads: 445,
            isPro: false,
        },
        {
            id: 6,
            name: "Dashboard Analytics",
            category: "dashboard",
            preview: "/placeholder.svg?height=120&width=200",
            rating: 4.8,
            downloads: 567,
            isPro: true,
        },
    ]

    const categories = [
        { id: "all", name: "Todas" },
        { id: "landing", name: "Landing" },
        { id: "ecommerce", name: "E-commerce" },
        { id: "blog", name: "Blog" },
        { id: "portfolio", name: "Portfolio" },
        { id: "contact", name: "Contacto" },
        { id: "dashboard", name: "Dashboard" },
    ]

    const filteredTemplates = templates.filter((template) => {
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold mb-2">Plantillas</h3>
                <p className="text-sm text-muted-foreground mb-4">Comienza con plantillas prediseñadas</p>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar plantillas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                variant={selectedCategory === category.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory(category.id)}
                                className="text-xs"
                            >
                                {category.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="grid grid-cols-1 gap-4">
                    {filteredTemplates.map((template) => (
                        <Card key={template.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                            <div className="aspect-video bg-muted relative">
                                <img
                                    src={template.preview || "/placeholder.svg"}
                                    alt={template.name}
                                    className="w-full h-full object-cover"
                                />
                                {template.isPro && (
                                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500">PRO</Badge>
                                )}
                            </div>

                            <CardContent className="p-4">
                                <h4 className="font-medium text-sm mb-2">{template.name}</h4>

                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        <span>{template.rating}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Download className="h-3 w-3" />
                                        <span>{template.downloads}</span>
                                    </div>
                                </div>

                                <Button size="sm" className="w-full">
                                    Usar Plantilla
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}

export default TemplatesTab
