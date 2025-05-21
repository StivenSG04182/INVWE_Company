"use client"

import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { AreaService } from "@/lib/services/inventory-service"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    ArrowLeft,
    Save,
    Trash2,
    Grid,
    Box,
    Shelf,
    Package,
    AlertTriangle,
    MousePointer,
    Square,
    Circle,
    Triangle,
    Check,
} from "lucide-react"
import { useState, useRef } from "react"
import { cn } from "@/lib/utils"

// Componentes del lado del cliente
const WorkspaceEditor = ({ area, onSave }) => {
    const [workspace, setWorkspace] = useState(area.workspace || {
        width: 800,
        height: 600,
        elements: [],
        gridSize: 20,
    })
    const [selectedTool, setSelectedTool] = useState("select")
    const [selectedElement, setSelectedElement] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const [showGrid, setShowGrid] = useState(true)
    const editorRef = useRef(null)

    // Elementos disponibles para arrastrar
    const elementTypes = [
        { id: "shelf", name: "Estantería", icon: Shelf, width: 120, height: 40 },
        { id: "box", name: "Caja", icon: Box, width: 60, height: 60 },
        { id: "package", name: "Paquete", icon: Package, width: 40, height: 40 },
        { id: "square", name: "Cuadrado", icon: Square, width: 80, height: 80 },
        { id: "circle", name: "Círculo", icon: Circle, width: 80, height: 80 },
        { id: "triangle", name: "Triángulo", icon: Triangle, width: 80, height: 80 },
    ]

    // Función para añadir un nuevo elemento
    const addElement = (type, x, y) => {
        const elementType = elementTypes.find(e => e.id === type)
        if (!elementType) return

        const newElement = {
            id: `element-${Date.now()}`,
            type,
            x,
            y,
            width: elementType.width,
            height: elementType.height,
            rotation: 0,
            name: `${elementType.name} ${workspace.elements.length + 1}`,
        }

        setWorkspace(prev => ({
            ...prev,
            elements: [...prev.elements, newElement],
        }))
        setSelectedElement(newElement.id)
    }

    // Función para actualizar la posición de un elemento
    const updateElementPosition = (id, x, y) => {
        setWorkspace(prev => ({
            ...prev,
            elements: prev.elements.map(el =>
                el.id === id ? { ...el, x, y } : el
            ),
        }))
    }

    // Función para eliminar un elemento
    const removeElement = (id) => {
        setWorkspace(prev => ({
            ...prev,
            elements: prev.elements.filter(el => el.id !== id),
        }))
        setSelectedElement(null)
    }

    // Función para guardar el workspace
    const handleSave = () => {
        onSave({ ...area, workspace })
    }

    // Componente para cada elemento en el workspace
    const WorkspaceElement = ({ element }) => {
        const isSelected = selectedElement === element.id
        const ElementIcon = elementTypes.find(e => e.id === element.type)?.icon || Box

        const handleClick = (e) => {
            e.stopPropagation()
            setSelectedElement(element.id)
        }

        const handleDragStart = (e) => {
            setIsDragging(true)
            const startX = e.clientX
            const startY = e.clientY
            const startElemX = element.x
            const startElemY = element.y

            const handleDragMove = (moveEvent) => {
                const dx = moveEvent.clientX - startX
                const dy = moveEvent.clientY - startY

                // Ajustar a la cuadrícula si está activada
                let newX = startElemX + dx
                let newY = startElemY + dy

                if (showGrid) {
                    newX = Math.round(newX / workspace.gridSize) * workspace.gridSize
                    newY = Math.round(newY / workspace.gridSize) * workspace.gridSize
                }

                updateElementPosition(element.id, newX, newY)
            }

            const handleDragEnd = () => {
                setIsDragging(false)
                document.removeEventListener('mousemove', handleDragMove)
                document.removeEventListener('mouseup', handleDragEnd)
            }

            document.addEventListener('mousemove', handleDragMove)
            document.addEventListener('mouseup', handleDragEnd)
        }

        return (
            <div
                className={cn(
                    "absolute flex items-center justify-center border-2 cursor-move",
                    isSelected ? "border-primary" : "border-transparent"
                )}
                style={{
                    left: `${element.x}px`,
                    top: `${element.y}px`,
                    width: `${element.width}px`,
                    height: `${element.height}px`,
                    transform: `rotate(${element.rotation}deg)`,
                    backgroundColor: isSelected ? "rgba(0, 0, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                    zIndex: isSelected ? 10 : 1,
                }}
                onClick={handleClick}
                onMouseDown={selectedTool === "select" ? handleDragStart : undefined}
            >
                <ElementIcon className="h-6 w-6 text-muted-foreground" />
                {isSelected && (
                    <div className="absolute -top-6 left-0 text-xs bg-background border px-1 py-0.5 rounded">
                        {element.name}
                    </div>
                )}
            </div>
        )
    }

    // Componente para la herramienta de elemento
    const ElementTool = ({ type }) => {
        const elementType = elementTypes.find(e => e.id === type)
        const Icon = elementType?.icon || Box

        return (
            <Button
                variant={selectedTool === type ? "default" : "outline"}
                size="sm"
                className="flex items-center justify-center h-10 w-10 p-0"
                onClick={() => setSelectedTool(type)}
            >
                <Icon className="h-5 w-5" />
            </Button>
        )
    }

    // Manejador de clics en el editor
    const handleEditorClick = (e) => {
        if (selectedTool === "select") {
            setSelectedElement(null)
            return
        }

        if (elementTypes.find(el => el.id === selectedTool)) {
            const rect = editorRef.current.getBoundingClientRect()
            let x = e.clientX - rect.left
            let y = e.clientY - rect.top

            // Ajustar a la cuadrícula si está activada
            if (showGrid) {
                x = Math.round(x / workspace.gridSize) * workspace.gridSize
                y = Math.round(y / workspace.gridSize) * workspace.gridSize
            }

            addElement(selectedTool, x, y)
            setSelectedTool("select") // Volver a la herramienta de selección después de añadir
        }
    }

    // Renderizar el panel de propiedades para el elemento seleccionado
    const renderPropertiesPanel = () => {
        if (!selectedElement) return (
            <div className="p-4 text-center text-muted-foreground">
                Selecciona un elemento para editar sus propiedades
            </div>
        )

        const element = workspace.elements.find(el => el.id === selectedElement)
        if (!element) return null

        return (
            <div className="p-4 space-y-4">
                <div>
                    <Label htmlFor="element-name">Nombre</Label>
                    <Input
                        id="element-name"
                        value={element.name}
                        onChange={(e) => {
                            setWorkspace(prev => ({
                                ...prev,
                                elements: prev.elements.map(el =>
                                    el.id === selectedElement ? { ...el, name: e.target.value } : el
                                ),
                            }))
                        }}
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label htmlFor="element-x">Posición X</Label>
                        <Input
                            id="element-x"
                            type="number"
                            value={element.x}
                            onChange={(e) => {
                                const x = parseInt(e.target.value) || 0
                                updateElementPosition(selectedElement, x, element.y)
                            }}
                        />
                    </div>
                    <div>
                        <Label htmlFor="element-y">Posición Y</Label>
                        <Input
                            id="element-y"
                            type="number"
                            value={element.y}
                            onChange={(e) => {
                                const y = parseInt(e.target.value) || 0
                                updateElementPosition(selectedElement, element.x, y)
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label htmlFor="element-width">Ancho</Label>
                        <Input
                            id="element-width"
                            type="number"
                            value={element.width}
                            onChange={(e) => {
                                const width = parseInt(e.target.value) || 10
                                setWorkspace(prev => ({
                                    ...prev,
                                    elements: prev.elements.map(el =>
                                        el.id === selectedElement ? { ...el, width } : el
                                    ),
                                }))
                            }}
                        />
                    </div>
                    <div>
                        <Label htmlFor="element-height">Alto</Label>
                        <Input
                            id="element-height"
                            type="number"
                            value={element.height}
                            onChange={(e) => {
                                const height = parseInt(e.target.value) || 10
                                setWorkspace(prev => ({
                                    ...prev,
                                    elements: prev.elements.map(el =>
                                        el.id === selectedElement ? { ...el, height } : el
                                    ),
                                }))
                            }}
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="element-rotation">Rotación (grados)</Label>
                    <Input
                        id="element-rotation"
                        type="number"
                        value={element.rotation}
                        onChange={(e) => {
                            const rotation = parseInt(e.target.value) || 0
                            setWorkspace(prev => ({
                                ...prev,
                                elements: prev.elements.map(el =>
                                    el.id === selectedElement ? { ...el, rotation } : el
                                ),
                            }))
                        }}
                    />
                </div>

                <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => removeElement(selectedElement)}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Elemento
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant={selectedTool === "select" ? "default" : "outline"}
                        size="sm"
                        className="flex items-center justify-center h-10 w-10 p-0"
                        onClick={() => setSelectedTool("select")}
                    >
                        <MousePointer className="h-5 w-5" />
                    </Button>

                    {elementTypes.map(type => (
                        <ElementTool key={type.id} type={type.id} />
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowGrid(!showGrid)}
                    >
                        <Grid className={cn("h-4 w-4 mr-2", showGrid ? "text-primary" : "text-muted-foreground")} />
                        {showGrid ? "Ocultar Cuadrícula" : "Mostrar Cuadrícula"}
                    </Button>

                    <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 gap-4">
                <div className="flex-1 border rounded-md overflow-hidden relative">
                    <div
                        ref={editorRef}
                        className="relative w-full h-[600px] overflow-auto bg-muted/20"
                        onClick={handleEditorClick}
                        style={{
                            backgroundImage: showGrid ? `
                linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
              ` : 'none',
                            backgroundSize: `${workspace.gridSize}px ${workspace.gridSize}px`,
                        }}
                    >
                        {workspace.elements.map(element => (
                            <WorkspaceElement key={element.id} element={element} />
                        ))}
                    </div>
                </div>

                <Card className="w-80 h-[600px] overflow-auto">
                    <CardHeader>
                        <CardTitle>Propiedades</CardTitle>
                        <CardDescription>
                            {selectedElement
                                ? "Editar elemento seleccionado"
                                : "Propiedades del área de trabajo"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderPropertiesPanel()}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// Componente del lado del cliente para el editor
const WorkspaceEditorClient = ({ area, agencyId }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [currentArea, setCurrentArea] = useState(area)
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState(null)
    const [saveSuccess, setSaveSuccess] = useState(false)

    const handleSave = async (updatedArea) => {
        setIsSaving(true)
        setSaveError(null)
        setSaveSuccess(false)

        try {
            // Aquí iría la lógica para guardar en la base de datos
            // Por ahora solo actualizamos el estado local
            setCurrentArea(updatedArea)
            setSaveSuccess(true)

            // Simular un retraso para mostrar el mensaje de éxito
            setTimeout(() => {
                setSaveSuccess(false)
            }, 3000)
        } catch (error) {
            console.error("Error al guardar el área de trabajo:", error)
            setSaveError("Ocurrió un error al guardar los cambios.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div>
            {saveSuccess && (
                <Alert className="mb-4">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Guardado exitoso</AlertTitle>
                    <AlertDescription>
                        Los cambios en el área de trabajo se han guardado correctamente.
                    </AlertDescription>
                </Alert>
            )}

            {saveError && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{saveError}</AlertDescription>
                </Alert>
            )}

            <WorkspaceEditor area={currentArea} onSave={handleSave} />
        </div>
    )
}

// Componente principal (lado del servidor)
const AreaWorkspacePage = async ({ params, searchParams }) => {
    const user = await getAuthUserDetails()
    if (!user) return redirect("/sign-in")

    const agencyId = params.agencyId
    if (!user.Agency) {
        return redirect("/agency")
    }

    // Obtener área si existe un ID
    let area = null
    const areaId = searchParams?.areaId

    try {
        if (areaId) {
            area = await AreaService.getAreaById(areaId)
            if (!area) {
                return (
                    <div className="container mx-auto p-6">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>El área no existe o ha sido eliminada.</AlertDescription>
                        </Alert>
                        <div className="mt-4">
                            <Button variant="outline" asChild>
                                <Link href={`/agency/${agencyId}/areas`}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Volver a áreas
                                </Link>
                            </Button>
                        </div>
                    </div>
                )
            }
        } else {
            // Si no hay ID, crear un área nueva
            area = {
                name: "Nueva Área de Trabajo",
                description: "Descripción del área de trabajo",
                agencyId,
                workspace: {
                    width: 800,
                    height: 600,
                    elements: [],
                    gridSize: 20,
                },
            }
        }
    } catch (error) {
        console.error("Error al cargar área:", error)
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Ocurrió un error al cargar la información del área.</AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button variant="outline" asChild>
                        <Link href={`/agency/${agencyId}/areas`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a áreas
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center mb-6">
                <Button variant="ghost" size="sm" asChild className="mr-4">
                    <Link href={`/agency/${agencyId}/areas`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a áreas
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">
                    {area._id ? `Editar Área: ${area.name}` : "Nueva Área de Trabajo"}
                </h1>
                {area._id && (
                    <Badge variant="outline" className="ml-4">
                        ID: {area._id.toString().substring(0, 8)}
                    </Badge>
                )}
            </div>

            <WorkspaceEditorClient area={area} agencyId={agencyId} />
        </div>
    )
}

export default AreaWorkspacePage