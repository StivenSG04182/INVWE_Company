"use client"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useEditor } from "@/providers/editor/editor-provider"
import { Code, Download, Copy, Eye, FileCode, Palette, Settings } from "lucide-react"

const CodeTab = () => {
    const { state } = useEditor()
    const [customCSS, setCustomCSS] = useState("")
    const [customJS, setCustomJS] = useState("")

    const generateHTML = () => {
        const renderElement = (element: any): string => {
            if (!element) return ""

            const { type, content, styles, id } = element
            const styleString = Object.entries(styles || {})
                .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
                .join("; ")

            switch (type) {
                case "__body":
                    return `<body style="${styleString}">${Array.isArray(content) ? content.map(renderElement).join("") : ""}</body>`
                case "container":
                    return `<div style="${styleString}">${Array.isArray(content) ? content.map(renderElement).join("") : ""}</div>`
                case "text":
                    return `<p style="${styleString}">${content?.innerText || ""}</p>`
                case "link":
                    return `<a href="${content?.href || "#"}" style="${styleString}">${content?.innerText || ""}</a>`
                case "video":
                    return `<iframe src="${content?.src || ""}" style="${styleString}"></iframe>`
                case "image":
                    return `<img src="${content?.src || ""}" alt="${content?.alt || ""}" style="${styleString}" />`
                case "button":
                    return `<button style="${styleString}">${content?.innerText || ""}</button>`
                case "2Col":
                    return `<div style="${styleString}">${Array.isArray(content) ? content.map(renderElement).join("") : ""}</div>`
                default:
                    return `<div style="${styleString}">${Array.isArray(content) ? content.map(renderElement).join("") : content?.innerText || ""}</div>`
            }
        }

        const bodyElement = state.editor.elements.find((el) => el.type === "__body")
        const htmlContent = bodyElement ? renderElement(bodyElement) : ""

        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Página Generada</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        ${customCSS}
    </style>
</head>
${htmlContent}
<script>
    ${customJS}
</script>
</html>`
    }

    const generateCSS = () => {
        const extractStyles = (element: any, selector = ""): string => {
            if (!element) return ""

            let css = ""
            const { type, content, styles, id } = element

            if (styles && Object.keys(styles).length > 0) {
                const currentSelector = selector ? `${selector} .element-${id}` : `.element-${id}`
                const styleString = Object.entries(styles)
                    .map(([key, value]) => `  ${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value};`)
                    .join("\n")

                css += `${currentSelector} {\n${styleString}\n}\n\n`
            }

            if (Array.isArray(content)) {
                content.forEach((child) => {
                    css += extractStyles(child, selector)
                })
            }

            return css
        }

        let allCSS = "/* Estilos generados automáticamente */\n\n"
        state.editor.elements.forEach((element) => {
            allCSS += extractStyles(element)
        })

        return allCSS + customCSS
    }

    const generateReactComponent = () => {
        const renderElement = (element: any, depth = 0): string => {
            if (!element) return ""

            const { type, content, styles, id } = element
            const indent = "  ".repeat(depth)

            const styleObj = styles ? JSON.stringify(styles, null, 2).replace(/"/g, "'") : "{}"

            switch (type) {
                case "__body":
                    return `${indent}<div style={${styleObj}}>\n${Array.isArray(content) ? content.map((child) => renderElement(child, depth + 1)).join("\n") : ""}\n${indent}</div>`
                case "container":
                    return `${indent}<div style={${styleObj}}>\n${Array.isArray(content) ? content.map((child) => renderElement(child, depth + 1)).join("\n") : ""}\n${indent}</div>`
                case "text":
                    return `${indent}<p style={${styleObj}}>${content?.innerText || ""}</p>`
                case "link":
                    return `${indent}<a href="${content?.href || "#"}" style={${styleObj}}>${content?.innerText || ""}</a>`
                case "video":
                    return `${indent}<iframe src="${content?.src || ""}" style={${styleObj}} />`
                case "image":
                    return `${indent}<img src="${content?.src || ""}" alt="${content?.alt || ""}" style={${styleObj}} />`
                case "button":
                    return `${indent}<button style={${styleObj}}>${content?.innerText || ""}</button>`
                default:
                    return `${indent}<div style={${styleObj}}>${Array.isArray(content) ? content.map((child) => renderElement(child, depth + 1)).join("\n") : content?.innerText || ""}</div>`
            }
        }

        const bodyElement = state.editor.elements.find((el) => el.type === "__body")
        const componentContent = bodyElement ? renderElement(bodyElement, 1) : ""

        return `import React from 'react';

const GeneratedComponent = () => {
  return (
${componentContent}
  );
};

export default GeneratedComponent;`
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
    }

    const previewHTML = () => {
        const html = generateHTML()
        const newWindow = window.open()
        if (newWindow) {
            newWindow.document.write(html)
            newWindow.document.close()
        }
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold mb-2">Exportar Código</h3>
                <p className="text-sm text-muted-foreground mb-4">Genera y exporta el código de tu página</p>
            </div>

            <ScrollArea className="flex-1">
                <Tabs defaultValue="html" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mx-6 mb-4">
                        <TabsTrigger value="html">HTML</TabsTrigger>
                        <TabsTrigger value="css">CSS</TabsTrigger>
                        <TabsTrigger value="react">React</TabsTrigger>
                        <TabsTrigger value="custom">Custom</TabsTrigger>
                    </TabsList>

                    <TabsContent value="html" className="px-6 space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <FileCode className="h-4 w-4" />
                                    Código HTML
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-muted p-3 rounded-md mb-3">
                                    <pre className="text-xs overflow-x-auto">
                                        <code>{generateHTML()}</code>
                                    </pre>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => copyToClipboard(generateHTML())}>
                                        <Copy className="h-4 w-4 mr-1" />
                                        Copiar
                                    </Button>
                                    <Button size="sm" onClick={() => downloadFile(generateHTML(), "page.html", "text/html")}>
                                        <Download className="h-4 w-4 mr-1" />
                                        Descargar
                                    </Button>
                                    <Button size="sm" onClick={previewHTML}>
                                        <Eye className="h-4 w-4 mr-1" />
                                        Vista Previa
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="css" className="px-6 space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Palette className="h-4 w-4" />
                                    Estilos CSS
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-muted p-3 rounded-md mb-3">
                                    <pre className="text-xs overflow-x-auto">
                                        <code>{generateCSS()}</code>
                                    </pre>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => copyToClipboard(generateCSS())}>
                                        <Copy className="h-4 w-4 mr-1" />
                                        Copiar
                                    </Button>
                                    <Button size="sm" onClick={() => downloadFile(generateCSS(), "styles.css", "text/css")}>
                                        <Download className="h-4 w-4 mr-1" />
                                        Descargar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="react" className="px-6 space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Code className="h-4 w-4" />
                                    Componente React
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-muted p-3 rounded-md mb-3">
                                    <pre className="text-xs overflow-x-auto">
                                        <code>{generateReactComponent()}</code>
                                    </pre>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => copyToClipboard(generateReactComponent())}>
                                        <Copy className="h-4 w-4 mr-1" />
                                        Copiar
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => downloadFile(generateReactComponent(), "Component.jsx", "text/javascript")}
                                    >
                                        <Download className="h-4 w-4 mr-1" />
                                        Descargar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="custom" className="px-6 space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    CSS Personalizado
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Textarea
                                    placeholder="/* Agrega tu CSS personalizado aquí */"
                                    value={customCSS}
                                    onChange={(e) => setCustomCSS(e.target.value)}
                                    className="h-32 font-mono text-xs"
                                />
                                <Button size="sm" className="w-full">
                                    Aplicar CSS
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Code className="h-4 w-4" />
                                    JavaScript Personalizado
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Textarea
                                    placeholder="// Agrega tu JavaScript personalizado aquí"
                                    value={customJS}
                                    onChange={(e) => setCustomJS(e.target.value)}
                                    className="h-32 font-mono text-xs"
                                />
                                <Button size="sm" className="w-full">
                                    Aplicar JavaScript
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </ScrollArea>
        </div>
    )
}

export default CodeTab
