"use client"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useEditor } from "@/providers/editor/editor-provider"
import { Eye, Lock, Trash2, Search, ChevronRight, ChevronDown, Move } from "lucide-react"
import type { EditorElement } from "@/providers/editor/editor-provider"

const LayersTab = () => {
    const { state, dispatch } = useEditor()
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set(["__body"]))

    const toggleExpanded = (id: string) => {
        const newExpanded = new Set(expandedLayers)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedLayers(newExpanded)
    }

    const selectElement = (element: EditorElement) => {
        dispatch({
            type: "CHANGE_CLICKED_ELEMENT",
            payload: { elementDetails: element },
        })
    }

    const deleteElement = (element: EditorElement) => {
        dispatch({
            type: "DELETE_ELEMENT",
            payload: { elementDetails: element },
        })
    }

    const renderLayerItem = (element: EditorElement, depth = 0) => {
        const hasChildren = Array.isArray(element.content) && element.content.length > 0
        const isExpanded = expandedLayers.has(element.id)
        const isSelected = state.editor.selectedElement.id === element.id
        const matchesSearch = element.name.toLowerCase().includes(searchTerm.toLowerCase())

        if (searchTerm && !matchesSearch && !hasChildrenMatching(element, searchTerm)) {
            return null
        }

        return (
            <div key={element.id} className="w-full">
                <div
                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors hover:bg-muted/50 ${isSelected ? "bg-primary/10 border border-primary/20" : ""
                        }`}
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                    onClick={() => selectElement(element)}
                >
                    {hasChildren && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0"
                            onClick={(e) => {
                                e.stopPropagation()
                                toggleExpanded(element.id)
                            }}
                        >
                            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </Button>
                    )}

                    {!hasChildren && <div className="w-4" />}

                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Move className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm truncate">{element.name}</span>
                        <Badge variant="outline" className="text-xs">
                            {element.type}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                            <Eye className="h-3 w-3" />
                        </Button>

                        <Button variant="ghost" size="icon" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                            <Lock className="h-3 w-3" />
                        </Button>

                        {element.type !== "__body" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    deleteElement(element)
                                }}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div className="ml-2">{element.content.map((child) => renderLayerItem(child, depth + 1))}</div>
                )}
            </div>
        )
    }

    const hasChildrenMatching = (element: EditorElement, search: string): boolean => {
        if (Array.isArray(element.content)) {
            return element.content.some(
                (child) => child.name.toLowerCase().includes(search.toLowerCase()) || hasChildrenMatching(child, search),
            )
        }
        return false
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold mb-2">Capas</h3>
                <p className="text-sm text-muted-foreground mb-4">Gestiona la estructura de tu página</p>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar capas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1 p-2">
                <div className="space-y-1 group">{state.editor.elements.map((element) => renderLayerItem(element))}</div>
            </ScrollArea>
        </div>
    )
}

export default LayersTab
