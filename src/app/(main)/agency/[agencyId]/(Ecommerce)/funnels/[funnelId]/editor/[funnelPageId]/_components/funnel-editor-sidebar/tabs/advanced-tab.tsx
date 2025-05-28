"use client"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Code, Zap, Shield, Globe, Monitor, Smartphone, Tablet, Save, RotateCcw } from "lucide-react"

const AdvancedTab = () => {
    const [settings, setSettings] = useState({
        performance: {
            lazyLoading: true,
            imageOptimization: true,
            codeMinification: true,
            caching: true,
            compressionLevel: [80],
        },
        responsive: {
            breakpoints: {
                mobile: 768,
                tablet: 1024,
                desktop: 1200,
            },
            fluidTypography: true,
            adaptiveImages: true,
        },
        seo: {
            autoMetaTags: true,
            structuredData: true,
            sitemap: true,
            robotsTxt: true,
            canonicalUrls: true,
        },
        accessibility: {
            altTextGeneration: true,
            keyboardNavigation: true,
            screenReaderSupport: true,
            colorContrastCheck: true,
            focusIndicators: true,
        },
        security: {
            contentSecurityPolicy: true,
            xssProtection: true,
            clickjackingProtection: true,
            httpsRedirect: true,
        },
        analytics: {
            pageViews: true,
            userInteractions: true,
            performanceMetrics: true,
            errorTracking: true,
        },
    })

    const [customCode, setCustomCode] = useState({
        headCode: "",
        bodyCode: "",
        footerCode: "",
        customCSS: "",
        customJS: "",
    })

    const updateSetting = (category: string, key: string, value: any) => {
        setSettings((prev) => ({
            ...prev,
            [category]: {
                ...prev[category as keyof typeof prev],
                [key]: value,
            },
        }))
    }

    const updateCustomCode = (key: string, value: string) => {
        setCustomCode((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const resetSettings = () => {
        // Reset to default settings
        setSettings({
            performance: {
                lazyLoading: true,
                imageOptimization: true,
                codeMinification: true,
                caching: true,
                compressionLevel: [80],
            },
            responsive: {
                breakpoints: {
                    mobile: 768,
                    tablet: 1024,
                    desktop: 1200,
                },
                fluidTypography: true,
                adaptiveImages: true,
            },
            seo: {
                autoMetaTags: true,
                structuredData: true,
                sitemap: true,
                robotsTxt: true,
                canonicalUrls: true,
            },
            accessibility: {
                altTextGeneration: true,
                keyboardNavigation: true,
                screenReaderSupport: true,
                colorContrastCheck: true,
                focusIndicators: true,
            },
            security: {
                contentSecurityPolicy: true,
                xssProtection: true,
                clickjackingProtection: true,
                httpsRedirect: true,
            },
            analytics: {
                pageViews: true,
                userInteractions: true,
                performanceMetrics: true,
                errorTracking: true,
            },
        })
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold mb-2">Configuración Avanzada</h3>
                <p className="text-sm text-muted-foreground mb-4">Personaliza aspectos técnicos y avanzados del editor</p>
                <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                        <Save className="h-4 w-4 mr-1" />
                        Guardar
                    </Button>
                    <Button size="sm" variant="outline" onClick={resetSettings}>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reset
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <Tabs defaultValue="performance" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mx-6 mb-4">
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="responsive">Responsive</TabsTrigger>
                        <TabsTrigger value="code">Código</TabsTrigger>
                    </TabsList>

                    <TabsContent value="performance" className="px-6 space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    Optimización de Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Lazy Loading de Imágenes</Label>
                                    <Switch
                                        checked={settings.performance.lazyLoading}
                                        onCheckedChange={(value) => updateSetting("performance", "lazyLoading", value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Optimización de Imágenes</Label>
                                    <Switch
                                        checked={settings.performance.imageOptimization}
                                        onCheckedChange={(value) => updateSetting("performance", "imageOptimization", value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Minificación de Código</Label>
                                    <Switch
                                        checked={settings.performance.codeMinification}
                                        onCheckedChange={(value) => updateSetting("performance", "codeMinification", value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Cache del Navegador</Label>
                                    <Switch
                                        checked={settings.performance.caching}
                                        onCheckedChange={(value) => updateSetting("performance", "caching", value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">Nivel de Compresión: {settings.performance.compressionLevel[0]}%</Label>
                                    <Slider
                                        value={settings.performance.compressionLevel}
                                        onValueChange={(value) => updateSetting("performance", "compressionLevel", value)}
                                        max={100}
                                        min={10}
                                        step={10}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Seguridad
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Content Security Policy</Label>
                                    <Switch
                                        checked={settings.security.contentSecurityPolicy}
                                        onCheckedChange={(value) => updateSetting("security", "contentSecurityPolicy", value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Protección XSS</Label>
                                    <Switch
                                        checked={settings.security.xssProtection}
                                        onCheckedChange={(value) => updateSetting("security", "xssProtection", value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Protección Clickjacking</Label>
                                    <Switch
                                        checked={settings.security.clickjackingProtection}
                                        onCheckedChange={(value) => updateSetting("security", "clickjackingProtection", value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Redirección HTTPS</Label>
                                    <Switch
                                        checked={settings.security.httpsRedirect}
                                        onCheckedChange={(value) => updateSetting("security", "httpsRedirect", value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    SEO y Accesibilidad
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Meta Tags Automáticos</Label>
                                    <Switch
                                        checked={settings.seo.autoMetaTags}
                                        onCheckedChange={(value) => updateSetting("seo", "autoMetaTags", value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Structured Data</Label>
                                    <Switch
                                        checked={settings.seo.structuredData}
                                        onCheckedChange={(value) => updateSetting("seo", "structuredData", value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Generación Alt Text</Label>
                                    <Switch
                                        checked={settings.accessibility.altTextGeneration}
                                        onCheckedChange={(value) => updateSetting("accessibility", "altTextGeneration", value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Navegación por Teclado</Label>
                                    <Switch
                                        checked={settings.accessibility.keyboardNavigation}
                                        onCheckedChange={(value) => updateSetting("accessibility", "keyboardNavigation", value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="responsive" className="px-6 space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Monitor className="h-4 w-4" />
                                    Breakpoints Personalizados
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm flex items-center gap-1">
                                            <Smartphone className="h-3 w-3" />
                                            Móvil (px)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={settings.responsive.breakpoints.mobile}
                                            onChange={(e) =>
                                                updateSetting("responsive", "breakpoints", {
                                                    ...settings.responsive.breakpoints,
                                                    mobile: Number.parseInt(e.target.value),
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm flex items-center gap-1">
                                            <Tablet className="h-3 w-3" />
                                            Tablet (px)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={settings.responsive.breakpoints.tablet}
                                            onChange={(e) =>
                                                updateSetting("responsive", "breakpoints", {
                                                    ...settings.responsive.breakpoints,
                                                    tablet: Number.parseInt(e.target.value),
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm flex items-center gap-1">
                                        <Monitor className="h-3 w-3" />
                                        Desktop (px)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={settings.responsive.breakpoints.desktop}
                                        onChange={(e) =>
                                            updateSetting("responsive", "breakpoints", {
                                                ...settings.responsive.breakpoints,
                                                desktop: Number.parseInt(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Tipografía Fluida</Label>
                                    <Switch
                                        checked={settings.responsive.fluidTypography}
                                        onCheckedChange={(value) => updateSetting("responsive", "fluidTypography", value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Imágenes Adaptativas</Label>
                                    <Switch
                                        checked={settings.responsive.adaptiveImages}
                                        onCheckedChange={(value) => updateSetting("responsive", "adaptiveImages", value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="code" className="px-6 space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Code className="h-4 w-4" />
                                    Código Personalizado
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm">Código en {"<head>"}</Label>
                                    <Textarea
                                        placeholder="<!-- Meta tags, scripts, etc. -->"
                                        value={customCode.headCode}
                                        onChange={(e) => updateCustomCode("headCode", e.target.value)}
                                        className="h-20 font-mono text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">Código en {"<body>"}</Label>
                                    <Textarea
                                        placeholder="<!-- Scripts, tracking codes, etc. -->"
                                        value={customCode.bodyCode}
                                        onChange={(e) => updateCustomCode("bodyCode", e.target.value)}
                                        className="h-20 font-mono text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">CSS Personalizado</Label>
                                    <Textarea
                                        placeholder="/* Estilos personalizados */"
                                        value={customCode.customCSS}
                                        onChange={(e) => updateCustomCode("customCSS", e.target.value)}
                                        className="h-32 font-mono text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">JavaScript Personalizado</Label>
                                    <Textarea
                                        placeholder="// Código JavaScript personalizado"
                                        value={customCode.customJS}
                                        onChange={(e) => updateCustomCode("customJS", e.target.value)}
                                        className="h-32 font-mono text-xs"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </ScrollArea>
        </div>
    )
}

export default AdvancedTab
