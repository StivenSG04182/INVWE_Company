"use client"
import { useState } from "react"
import type React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useEditor } from "@/providers/editor/editor-provider"
import { Save, RotateCcw, Redo2, Clock, Tag, GitBranch, Download, Upload, Trash2, Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Version {
    id: string
    name: string
    description: string
    timestamp: Date
    elements: any[]
    isStarred: boolean
    tags: string[]
}

const HistoryTab = () => {
    const { state, dispatch } = useEditor()
    const [versions, setVersions] = useState<Version[]>([
        {
            id: "1",
            name: "Versión inicial",
            description: "Primera versión de la página",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
            elements: [],
            isStarred: true,
            tags: ["inicial", "base"],
        },
        {
            id: "2",
            name: "Agregado hero section",
            description: "Se añadió la sección principal con call-to-action",
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
            elements: [],
            isStarred: false,
            tags: ["hero", "cta"],
        },
    ])

    const [newVersionName, setNewVersionName] = useState("")
    const [newVersionDescription, setNewVersionDescription] = useState("")
    const [newVersionTags, setNewVersionTags] = useState("")

    const saveCurrentVersion = () => {
        if (!newVersionName.trim()) return

        const newVersion: Version = {
            id: Date.now().toString(),
            name: newVersionName,
            description: newVersionDescription,
            timestamp: new Date(),
            elements: JSON.parse(JSON.stringify(state.editor.elements)),
            isStarred: false,
            tags: newVersionTags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
        }

        setVersions((prev) => [newVersion, ...prev])
        setNewVersionName("")
        setNewVersionDescription("")
        setNewVersionTags("")
    }

    const restoreVersion = (version: Version) => {
        dispatch({
            type: "LOAD_DATA",
            payload: {
                elements: version.elements,
                withLive: false,
            },
        })
    }

    const toggleStarVersion = (versionId: string) => {
        setVersions((prev) =>
            prev.map((version) => (version.id === versionId ? { ...version, isStarred: !version.isStarred } : version)),
        )
    }

    const deleteVersion = (versionId: string) => {
        setVersions((prev) => prev.filter((version) => version.id !== versionId))
    }

    const exportVersion = (version: Version) => {
        const data = JSON.stringify(version, null, 2)
        const blob = new Blob([data], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${version.name.replace(/\s+/g, "_")}.json`
        a.click()
    }

    const importVersion = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const version = JSON.parse(e.target?.result as string)
                    setVersions((prev) => [{ ...version, id: Date.now().toString() }, ...prev])
                } catch (error) {
                    console.error("Error importing version:", error)
                }
            }
            reader.readAsText(file)
        }
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold mb-2">Historial de Versiones</h3>
                <p className="text-sm text-muted-foreground mb-4">Guarda y restaura diferentes versiones de tu página</p>

                {/* Quick Actions */}
                <div className="flex gap-2 mb-4">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dispatch({ type: "UNDO" })}
                        disabled={!(state.history.currentIndex > 0)}
                    >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Deshacer
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dispatch({ type: "REDO" })}
                        disabled={!(state.history.currentIndex < state.history.history.length - 1)}
                    >
                        <Redo2 className="h-4 w-4 mr-1" />
                        Rehacer
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                        <label>
                            <Upload className="h-4 w-4 mr-1" />
                            Importar
                            <input type="file" accept=".json" onChange={importVersion} className="hidden" />
                        </label>
                    </Button>
                </div>

                {/* Save New Version */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Guardar Nueva Versión</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <Label className="text-xs">Nombre de la versión</Label>
                            <Input
                                placeholder="ej. Versión con nuevo diseño"
                                value={newVersionName}
                                onChange={(e) => setNewVersionName(e.target.value)}
                                className="h-8"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Descripción (opcional)</Label>
                            <Textarea
                                placeholder="Describe los cambios realizados..."
                                value={newVersionDescription}
                                onChange={(e) => setNewVersionDescription(e.target.value)}
                                className="h-16 resize-none"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Tags (separados por comas)</Label>
                            <Input
                                placeholder="ej. hero, responsive, final"
                                value={newVersionTags}
                                onChange={(e) => setNewVersionTags(e.target.value)}
                                className="h-8"
                            />
                        </div>
                        <Button onClick={saveCurrentVersion} disabled={!newVersionName.trim()} className="w-full" size="sm">
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Versión
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                    {versions.map((version) => (
                        <Card key={version.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-sm">{version.name}</h4>
                                            {version.isStarred && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                                        </div>
                                        {version.description && <p className="text-xs text-muted-foreground mb-2">{version.description}</p>}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>{formatDistanceToNow(version.timestamp, { addSuffix: true, locale: es })}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6"
                                            onClick={() => toggleStarVersion(version.id)}
                                        >
                                            <Star className={`h-3 w-3 ${version.isStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => exportVersion(version)}>
                                            <Download className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 text-destructive"
                                            onClick={() => deleteVersion(version.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>

                                {version.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {version.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                <Tag className="h-2 w-2 mr-1" />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => restoreVersion(version)} className="flex-1">
                                        <GitBranch className="h-3 w-3 mr-1" />
                                        Restaurar
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

export default HistoryTab
