"use client"
import { useState } from "react"
import type React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEditor } from "@/providers/editor/editor-provider"
import { Type, Download, Upload, Save } from "lucide-react"

const ThemesTab = () => {
    const { state, dispatch } = useEditor()
    const [selectedTheme, setSelectedTheme] = useState("default")

    const predefinedThemes = [
        {
            id: "default",
            name: "Por Defecto",
            colors: {
                primary: "#3b82f6",
                secondary: "#64748b",
                accent: "#f59e0b",
                background: "#ffffff",
                foreground: "#0f172a",
            },
            fonts: {
                heading: "Inter",
                body: "Inter",
            },
        },
        {
            id: "dark",
            name: "Oscuro",
            colors: {
                primary: "#8b5cf6",
                secondary: "#6b7280",
                accent: "#10b981",
                background: "#0f172a",
                foreground: "#f8fafc",
            },
            fonts: {
                heading: "Inter",
                body: "Inter",
            },
        },
        {
            id: "modern",
            name: "Moderno",
            colors: {
                primary: "#06b6d4",
                secondary: "#84cc16",
                accent: "#f97316",
                background: "#fafafa",
                foreground: "#171717",
            },
            fonts: {
                heading: "Poppins",
                body: "Inter",
            },
        },
        {
            id: "elegant",
            name: "Elegante",
            colors: {
                primary: "#7c3aed",
                secondary: "#a855f7",
                accent: "#ec4899",
                background: "#fefefe",
                foreground: "#1f2937",
            },
            fonts: {
                heading: "Playfair Display",
                body: "Source Sans Pro",
            },
        },
    ]

    const [customTheme, setCustomTheme] = useState({
        colors: {
            primary: "#3b82f6",
            secondary: "#64748b",
            accent: "#f59e0b",
            background: "#ffffff",
            foreground: "#0f172a",
            muted: "#f1f5f9",
            border: "#e2e8f0",
        },
        fonts: {
            heading: "Inter",
            body: "Inter",
            mono: "JetBrains Mono",
        },
        spacing: {
            xs: "0.25rem",
            sm: "0.5rem",
            md: "1rem",
            lg: "1.5rem",
            xl: "2rem",
        },
        borderRadius: {
            sm: "0.25rem",
            md: "0.5rem",
            lg: "0.75rem",
            xl: "1rem",
        },
    })

    const applyTheme = (theme: (typeof predefinedThemes)[0]) => {
        // Aplicar tema globalmente
        const root = document.documentElement
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value)
        })
    }

    const exportTheme = () => {
        const themeData = JSON.stringify(customTheme, null, 2)
        const blob = new Blob([themeData], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "theme.json"
        a.click()
    }

    const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const theme = JSON.parse(e.target?.result as string)
                    setCustomTheme(theme)
                } catch (error) {
                    console.error("Error importing theme:", error)
                }
            }
            reader.readAsText(file)
        }
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold mb-2">Sistema de Temas</h3>
                <p className="text-sm text-muted-foreground mb-4">Personaliza la apariencia global de tu sitio</p>
            </div>

            <ScrollArea className="flex-1">
                <Tabs defaultValue="presets" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mx-6 mb-4">
                        <TabsTrigger value="presets">Presets</TabsTrigger>
                        <TabsTrigger value="colors">Colores</TabsTrigger>
                        <TabsTrigger value="typography">Tipografía</TabsTrigger>
                    </TabsList>

                    <TabsContent value="presets" className="px-6 space-y-4">
                        <div className="grid gap-4">
                            {predefinedThemes.map((theme) => (
                                <Card
                                    key={theme.id}
                                    className={`cursor-pointer transition-all hover:shadow-md ${selectedTheme === theme.id ? "ring-2 ring-primary" : ""
                                        }`}
                                    onClick={() => {
                                        setSelectedTheme(theme.id)
                                        applyTheme(theme)
                                    }}
                                >
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">{theme.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2 mb-3">
                                            {Object.entries(theme.colors)
                                                .slice(0, 5)
                                                .map(([key, color]) => (
                                                    <div
                                                        key={key}
                                                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                                        style={{ backgroundColor: color }}
                                                        title={key}
                                                    />
                                                ))}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {theme.fonts.heading} • {theme.fonts.body}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button variant="outline" className="flex-1" onClick={exportTheme}>
                                <Download className="h-4 w-4 mr-2" />
                                Exportar
                            </Button>
                            <Button variant="outline" className="flex-1" asChild>
                                <label>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Importar
                                    <input type="file" accept=".json" onChange={importTheme} className="hidden" />
                                </label>
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="colors" className="px-6 space-y-4">
                        <div className="space-y-4">
                            {Object.entries(customTheme.colors).map(([key, value]) => (
                                <div key={key} className="space-y-2">
                                    <Label className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                                    <div className="flex gap-2">
                                        <div
                                            className="w-10 h-10 rounded-md border-2 border-white shadow-sm"
                                            style={{ backgroundColor: value }}
                                        />
                                        <Input
                                            type="color"
                                            value={value}
                                            onChange={(e) =>
                                                setCustomTheme((prev) => ({
                                                    ...prev,
                                                    colors: { ...prev.colors, [key]: e.target.value },
                                                }))
                                            }
                                            className="w-16 h-10 p-1 border-0"
                                        />
                                        <Input
                                            value={value}
                                            onChange={(e) =>
                                                setCustomTheme((prev) => ({
                                                    ...prev,
                                                    colors: { ...prev.colors, [key]: e.target.value },
                                                }))
                                            }
                                            className="flex-1"
                                            placeholder="#000000"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button className="w-full">
                            <Save className="h-4 w-4 mr-2" />
                            Aplicar Colores
                        </Button>
                    </TabsContent>

                    <TabsContent value="typography" className="px-6 space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Fuente para Títulos</Label>
                                <Select
                                    value={customTheme.fonts.heading}
                                    onValueChange={(value) =>
                                        setCustomTheme((prev) => ({
                                            ...prev,
                                            fonts: { ...prev.fonts, heading: value },
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Inter">Inter</SelectItem>
                                        <SelectItem value="Poppins">Poppins</SelectItem>
                                        <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                                        <SelectItem value="Roboto">Roboto</SelectItem>
                                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Fuente para Texto</Label>
                                <Select
                                    value={customTheme.fonts.body}
                                    onValueChange={(value) =>
                                        setCustomTheme((prev) => ({
                                            ...prev,
                                            fonts: { ...prev.fonts, body: value },
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Inter">Inter</SelectItem>
                                        <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                                        <SelectItem value="Roboto">Roboto</SelectItem>
                                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                                        <SelectItem value="Lato">Lato</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Fuente Monoespaciada</Label>
                                <Select
                                    value={customTheme.fonts.mono}
                                    onValueChange={(value) =>
                                        setCustomTheme((prev) => ({
                                            ...prev,
                                            fonts: { ...prev.fonts, mono: value },
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                                        <SelectItem value="Fira Code">Fira Code</SelectItem>
                                        <SelectItem value="Source Code Pro">Source Code Pro</SelectItem>
                                        <SelectItem value="Monaco">Monaco</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-semibold mb-2" style={{ fontFamily: customTheme.fonts.heading }}>
                                    Vista Previa de Título
                                </h4>
                                <p className="text-sm" style={{ fontFamily: customTheme.fonts.body }}>
                                    Este es un ejemplo de texto con la fuente seleccionada para el cuerpo del texto.
                                </p>
                                <code
                                    className="text-xs bg-background p-1 rounded mt-2 block"
                                    style={{ fontFamily: customTheme.fonts.mono }}
                                >
                                    console.log("Fuente monoespaciada");
                                </code>
                            </div>
                        </div>

                        <Button className="w-full">
                            <Type className="h-4 w-4 mr-2" />
                            Aplicar Tipografía
                        </Button>
                    </TabsContent>
                </Tabs>
            </ScrollArea>
        </div>
    )
}

export default ThemesTab
