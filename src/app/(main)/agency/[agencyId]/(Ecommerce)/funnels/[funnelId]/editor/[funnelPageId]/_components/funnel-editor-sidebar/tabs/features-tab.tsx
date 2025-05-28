"use client"
import { useState } from "react"
import type React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
    Zap,
    MousePointer,
    Eye,
    Smartphone,
    Globe,
    Shield,
    BarChart3,
    Bell,
    Search,
    MessageCircle,
    Share2,
    Download,
    Upload,
    Save,
    Settings,
    Layout,
    Database,
} from "lucide-react"

const FeaturesTab = () => {
    const [features, setFeatures] = useState({
        interactions: {
            hoverEffects: true,
            clickAnimations: true,
            scrollAnimations: true,
            parallaxScrolling: false,
            stickyElements: false,
            infiniteScroll: false,
            lazyLoading: true,
            smoothScrolling: true,
        },
        responsive: {
            autoResize: true,
            fluidGrid: true,
            adaptiveImages: true,
            touchGestures: true,
            orientationChange: true,
            deviceDetection: true,
        },
        performance: {
            imageOptimization: true,
            codeMinification: true,
            caching: true,
            preloading: false,
            compressionLevel: [80],
            loadingStrategy: "lazy",
        },
        seo: {
            metaTags: true,
            structuredData: true,
            sitemap: true,
            robotsTxt: true,
            canonicalUrls: true,
            openGraph: true,
            twitterCards: true,
        },
        analytics: {
            pageViews: true,
            userInteractions: true,
            conversionTracking: false,
            heatmaps: false,
            sessionRecording: false,
            realTimeAnalytics: false,
        },
        social: {
            socialSharing: false,
            socialLogin: false,
            socialComments: false,
            socialFeeds: false,
        },
        ecommerce: {
            shoppingCart: false,
            wishlist: false,
            productComparison: false,
            reviewSystem: false,
            inventoryTracking: false,
            paymentIntegration: false,
        },
        forms: {
            formValidation: true,
            autoSave: false,
            multiStep: false,
            fileUpload: false,
            captcha: false,
            emailNotifications: false,
        },
        accessibility: {
            keyboardNavigation: true,
            screenReader: true,
            highContrast: false,
            fontSize: false,
            colorBlind: false,
            focusIndicators: true,
        },
        security: {
            ssl: true,
            xssProtection: true,
            csrfProtection: false,
            rateLimiting: false,
            contentSecurityPolicy: false,
        },
    })

    const [customSettings, setCustomSettings] = useState({
        loadingScreen: {
            enabled: false,
            type: "spinner",
            message: "Cargando...",
            duration: [2],
        },
        notifications: {
            enabled: false,
            position: "top-right",
            autoClose: [5],
            showProgress: true,
        },
        search: {
            enabled: false,
            placeholder: "Buscar...",
            suggestions: true,
            filters: false,
        },
        chat: {
            enabled: false,
            position: "bottom-right",
            welcomeMessage: "¡Hola! ¿En qué puedo ayudarte?",
            offlineMessage: "Estamos fuera de línea",
        },
    })

    const updateFeature = (category: string, feature: string, value: any) => {
        setFeatures((prev) => ({
            ...prev,
            [category]: {
                ...prev[category as keyof typeof prev],
                [feature]: value,
            },
        }))
    }

    const updateCustomSetting = (category: string, setting: string, value: any) => {
        setCustomSettings((prev) => ({
            ...prev,
            [category]: {
                ...prev[category as keyof typeof prev],
                [setting]: value,
            },
        }))
    }

    const featureCategories = [
        {
            id: "interactions",
            name: "Interacciones",
            icon: MousePointer,
            description: "Efectos y animaciones de usuario",
        },
        {
            id: "responsive",
            name: "Responsive",
            icon: Smartphone,
            description: "Adaptabilidad a dispositivos",
        },
        {
            id: "performance",
            name: "Performance",
            icon: Zap,
            description: "Optimización y velocidad",
        },
        {
            id: "seo",
            name: "SEO",
            icon: Globe,
            description: "Optimización para buscadores",
        },
        {
            id: "analytics",
            name: "Analytics",
            icon: BarChart3,
            description: "Seguimiento y métricas",
        },
        {
            id: "social",
            name: "Social",
            icon: Share2,
            description: "Integración con redes sociales",
        },
        {
            id: "ecommerce",
            name: "E-commerce",
            icon: Database,
            description: "Funcionalidades de tienda",
        },
        {
            id: "forms",
            name: "Formularios",
            icon: Layout,
            description: "Características de formularios",
        },
        {
            id: "accessibility",
            name: "Accesibilidad",
            icon: Eye,
            description: "Accesibilidad web",
        },
        {
            id: "security",
            name: "Seguridad",
            icon: Shield,
            description: "Protección y seguridad",
        },
    ]

    const exportSettings = () => {
        const settings = { features, customSettings }
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "page-features.json"
        a.click()
    }

    const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const settings = JSON.parse(e.target?.result as string)
                    if (settings.features) setFeatures(settings.features)
                    if (settings.customSettings) setCustomSettings(settings.customSettings)
                } catch (error) {
                    console.error("Error importing settings:", error)
                }
            }
            reader.readAsText(file)
        }
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold mb-2">Funcionalidades de Página</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Configura comportamientos, interacciones y características avanzadas
                </p>

                <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                        <Save className="h-4 w-4 mr-1" />
                        Guardar
                    </Button>
                    <Button size="sm" variant="outline" onClick={exportSettings}>
                        <Download className="h-4 w-4 mr-1" />
                        Exportar
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                        <label>
                            <Upload className="h-4 w-4 mr-1" />
                            Importar
                            <input type="file" accept=".json" onChange={importSettings} className="hidden" />
                        </label>
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <Tabs defaultValue="features" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mx-6 mb-4">
                        <TabsTrigger value="features">Características</TabsTrigger>
                        <TabsTrigger value="custom">Personalizado</TabsTrigger>
                    </TabsList>

                    <TabsContent value="features" className="px-6 space-y-4">
                        <div className="grid gap-4">
                            {featureCategories.map((category) => (
                                <Card key={category.id}>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <category.icon className="h-4 w-4" />
                                            {category.name}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">{category.description}</p>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {Object.entries(features[category.id as keyof typeof features]).map(([feature, value]) => (
                                            <div key={feature} className="flex items-center justify-between">
                                                <Label className="text-sm capitalize">{feature.replace(/([A-Z])/g, " $1").toLowerCase()}</Label>
                                                {typeof value === "boolean" ? (
                                                    <Switch
                                                        checked={value}
                                                        onCheckedChange={(checked) => updateFeature(category.id, feature, checked)}
                                                    />
                                                ) : Array.isArray(value) ? (
                                                    <div className="w-24">
                                                        <Slider
                                                            value={value}
                                                            onValueChange={(newValue) => updateFeature(category.id, feature, newValue)}
                                                            max={100}
                                                            min={0}
                                                            step={10}
                                                        />
                                                    </div>
                                                ) : (
                                                    <Select
                                                        value={value}
                                                        onValueChange={(newValue) => updateFeature(category.id, feature, newValue)}
                                                    >
                                                        <SelectTrigger className="w-24 h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="lazy">Lazy</SelectItem>
                                                            <SelectItem value="eager">Eager</SelectItem>
                                                            <SelectItem value="auto">Auto</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="custom" className="px-6 space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    Pantalla de Carga
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Habilitar pantalla de carga</Label>
                                    <Switch
                                        checked={customSettings.loadingScreen.enabled}
                                        onCheckedChange={(checked) => updateCustomSetting("loadingScreen", "enabled", checked)}
                                    />
                                </div>
                                {customSettings.loadingScreen.enabled && (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-sm">Tipo de carga</Label>
                                            <Select
                                                value={customSettings.loadingScreen.type}
                                                onValueChange={(value) => updateCustomSetting("loadingScreen", "type", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="spinner">Spinner</SelectItem>
                                                    <SelectItem value="progress">Barra de progreso</SelectItem>
                                                    <SelectItem value="dots">Puntos animados</SelectItem>
                                                    <SelectItem value="custom">Personalizado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm">Mensaje</Label>
                                            <Input
                                                value={customSettings.loadingScreen.message}
                                                onChange={(e) => updateCustomSetting("loadingScreen", "message", e.target.value)}
                                                placeholder="Mensaje de carga..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm">Duración mínima: {customSettings.loadingScreen.duration[0]}s</Label>
                                            <Slider
                                                value={customSettings.loadingScreen.duration}
                                                onValueChange={(value) => updateCustomSetting("loadingScreen", "duration", value)}
                                                max={10}
                                                min={0.5}
                                                step={0.5}
                                            />
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Bell className="h-4 w-4" />
                                    Notificaciones
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Habilitar notificaciones</Label>
                                    <Switch
                                        checked={customSettings.notifications.enabled}
                                        onCheckedChange={(checked) => updateCustomSetting("notifications", "enabled", checked)}
                                    />
                                </div>
                                {customSettings.notifications.enabled && (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-sm">Posición</Label>
                                            <Select
                                                value={customSettings.notifications.position}
                                                onValueChange={(value) => updateCustomSetting("notifications", "position", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="top-left">Superior izquierda</SelectItem>
                                                    <SelectItem value="top-right">Superior derecha</SelectItem>
                                                    <SelectItem value="bottom-left">Inferior izquierda</SelectItem>
                                                    <SelectItem value="bottom-right">Inferior derecha</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm">Auto-cerrar: {customSettings.notifications.autoClose[0]}s</Label>
                                            <Slider
                                                value={customSettings.notifications.autoClose}
                                                onValueChange={(value) => updateCustomSetting("notifications", "autoClose", value)}
                                                max={15}
                                                min={1}
                                                step={1}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm">Mostrar progreso</Label>
                                            <Switch
                                                checked={customSettings.notifications.showProgress}
                                                onCheckedChange={(checked) => updateCustomSetting("notifications", "showProgress", checked)}
                                            />
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Search className="h-4 w-4" />
                                    Búsqueda Global
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Habilitar búsqueda</Label>
                                    <Switch
                                        checked={customSettings.search.enabled}
                                        onCheckedChange={(checked) => updateCustomSetting("search", "enabled", checked)}
                                    />
                                </div>
                                {customSettings.search.enabled && (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-sm">Placeholder</Label>
                                            <Input
                                                value={customSettings.search.placeholder}
                                                onChange={(e) => updateCustomSetting("search", "placeholder", e.target.value)}
                                                placeholder="Texto del placeholder..."
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm">Sugerencias automáticas</Label>
                                            <Switch
                                                checked={customSettings.search.suggestions}
                                                onCheckedChange={(checked) => updateCustomSetting("search", "suggestions", checked)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm">Filtros avanzados</Label>
                                            <Switch
                                                checked={customSettings.search.filters}
                                                onCheckedChange={(checked) => updateCustomSetting("search", "filters", checked)}
                                            />
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    Chat en Vivo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Habilitar chat</Label>
                                    <Switch
                                        checked={customSettings.chat.enabled}
                                        onCheckedChange={(checked) => updateCustomSetting("chat", "enabled", checked)}
                                    />
                                </div>
                                {customSettings.chat.enabled && (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-sm">Posición</Label>
                                            <Select
                                                value={customSettings.chat.position}
                                                onValueChange={(value) => updateCustomSetting("chat", "position", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="bottom-left">Inferior izquierda</SelectItem>
                                                    <SelectItem value="bottom-right">Inferior derecha</SelectItem>
                                                    <SelectItem value="top-left">Superior izquierda</SelectItem>
                                                    <SelectItem value="top-right">Superior derecha</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm">Mensaje de bienvenida</Label>
                                            <Textarea
                                                value={customSettings.chat.welcomeMessage}
                                                onChange={(e) => updateCustomSetting("chat", "welcomeMessage", e.target.value)}
                                                placeholder="Mensaje de bienvenida..."
                                                className="h-16 resize-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm">Mensaje fuera de línea</Label>
                                            <Input
                                                value={customSettings.chat.offlineMessage}
                                                onChange={(e) => updateCustomSetting("chat", "offlineMessage", e.target.value)}
                                                placeholder="Mensaje cuando está offline..."
                                            />
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </ScrollArea>
        </div>
    )
}

export default FeaturesTab
