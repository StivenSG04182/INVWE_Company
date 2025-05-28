"use client"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Puzzle, Search, Download, Settings, Star, ExternalLink, Zap, Palette, BarChart3 } from "lucide-react"

interface Extension {
    id: string
    name: string
    description: string
    version: string
    author: string
    category: "ui" | "analytics" | "seo" | "performance" | "integrations"
    isInstalled: boolean
    isEnabled: boolean
    rating: number
    downloads: number
    isPremium: boolean
}

const ExtensionsTab = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")

    const [extensions, setExtensions] = useState<Extension[]>([
        {
            id: "1",
            name: "Advanced Animations",
            description: "Añade animaciones avanzadas con timeline y efectos personalizados",
            version: "2.1.0",
            author: "AnimateStudio",
            category: "ui",
            isInstalled: true,
            isEnabled: true,
            rating: 4.8,
            downloads: 15420,
            isPremium: true,
        },
        {
            id: "2",
            name: "Google Analytics 4",
            description: "Integración completa con Google Analytics 4 y eventos personalizados",
            version: "1.5.2",
            author: "Google",
            category: "analytics",
            isInstalled: true,
            isEnabled: false,
            rating: 4.9,
            downloads: 45230,
            isPremium: false,
        },
        {
            id: "3",
            name: "SEO Optimizer",
            description: "Optimización automática de SEO con meta tags y structured data",
            version: "3.0.1",
            author: "SEOTools",
            category: "seo",
            isInstalled: false,
            isEnabled: false,
            rating: 4.7,
            downloads: 8920,
            isPremium: true,
        },
        {
            id: "4",
            name: "Performance Monitor",
            description: "Monitorea el rendimiento de tu sitio en tiempo real",
            version: "1.2.0",
            author: "SpeedLabs",
            category: "performance",
            isInstalled: false,
            isEnabled: false,
            rating: 4.6,
            downloads: 3450,
            isPremium: false,
        },
        {
            id: "5",
            name: "Mailchimp Integration",
            description: "Conecta formularios directamente con Mailchimp",
            version: "2.3.1",
            author: "Mailchimp",
            category: "integrations",
            isInstalled: true,
            isEnabled: true,
            rating: 4.5,
            downloads: 12340,
            isPremium: false,
        },
        {
            id: "6",
            name: "Color Palette Generator",
            description: "Genera paletas de colores automáticamente basadas en tu contenido",
            version: "1.0.5",
            author: "ColorMagic",
            category: "ui",
            isInstalled: false,
            isEnabled: false,
            rating: 4.4,
            downloads: 2180,
            isPremium: true,
        },
    ])

    const categories = [
        { id: "all", name: "Todas", icon: Puzzle },
        { id: "ui", name: "UI/UX", icon: Palette },
        { id: "analytics", name: "Analytics", icon: BarChart3 },
        { id: "seo", name: "SEO", icon: Search },
        { id: "performance", name: "Performance", icon: Zap },
        { id: "integrations", name: "Integraciones", icon: ExternalLink },
    ]

    const filteredExtensions = extensions.filter((extension) => {
        const matchesSearch =
            extension.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            extension.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === "all" || extension.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const toggleExtension = (id: string) => {
        setExtensions((prev) => prev.map((ext) => (ext.id === id ? { ...ext, isEnabled: !ext.isEnabled } : ext)))
    }

    const installExtension = (id: string) => {
        setExtensions((prev) => prev.map((ext) => (ext.id === id ? { ...ext, isInstalled: true, isEnabled: true } : ext)))
    }

    const uninstallExtension = (id: string) => {
        setExtensions((prev) => prev.map((ext) => (ext.id === id ? { ...ext, isInstalled: false, isEnabled: false } : ext)))
    }

    const getCategoryIcon = (category: Extension["category"]) => {
        const categoryData = categories.find((cat) => cat.id === category)
        return categoryData ? <categoryData.icon className="h-4 w-4" /> : <Puzzle className="h-4 w-4" />
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold mb-2">Extensiones</h3>
                <p className="text-sm text-muted-foreground mb-4">Amplía las funcionalidades de tu editor con extensiones</p>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar extensiones..."
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
                                <category.icon className="h-3 w-3 mr-1" />
                                {category.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {filteredExtensions.map((extension) => (
                        <Card key={extension.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-muted rounded-lg">{getCategoryIcon(extension.category)}</div>
                                        <div>
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                {extension.name}
                                                {extension.isPremium && (
                                                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-xs">PRO</Badge>
                                                )}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                <span>v{extension.version}</span>
                                                <span>•</span>
                                                <span>por {extension.author}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {extension.isInstalled && (
                                        <Switch checked={extension.isEnabled} onCheckedChange={() => toggleExtension(extension.id)} />
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-3">{extension.description}</p>

                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            <span>{extension.rating}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Download className="h-3 w-3" />
                                            <span>{extension.downloads.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {categories.find((cat) => cat.id === extension.category)?.name}
                                    </Badge>
                                </div>

                                <div className="flex gap-2">
                                    {!extension.isInstalled ? (
                                        <Button size="sm" onClick={() => installExtension(extension.id)} className="flex-1">
                                            <Download className="h-3 w-3 mr-1" />
                                            Instalar
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => uninstallExtension(extension.id)}
                                            className="flex-1"
                                        >
                                            Desinstalar
                                        </Button>
                                    )}
                                    <Button size="sm" variant="outline">
                                        <Settings className="h-3 w-3 mr-1" />
                                        Config
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}

export default ExtensionsTab
