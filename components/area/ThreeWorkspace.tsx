"use client"

import { useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Html, Line } from "@react-three/drei"
import * as THREE from "three"
import {
    Expand,
    Navigation,
    SquareDashedMousePointer,
    ArrowDownZA,
    Boxes,
    X,
    Trash2,
    Move,
    Undo,
    Redo,
} from "lucide-react"

// Actualizar el tipo de herramienta para que coincida con la nueva funcionalidad
type Tool = "camera" | "navigate" | "edit" | "elements" | "view-toggle"

// Definir sub-herramientas de edición
type EditSubTool = "select" | "move" | "delete" | null

// Definir tipos de elementos
type ElementType = "wall" | "box" | "door" | "window" | "shelf" | "none"

// Definir tipos de objetos con objetos JavaScript simples
type SceneObject = {
    id: string
    type: ElementType
    position: { x: number; y: number; z: number }
    rotation: number
    scale: { x: number; y: number; z: number }
    points?: { x: number; y: number; z: number }[] // For walls and other traced elements
    selected: boolean
}

// Dimensiones por defecto cuando los modelos no están cargados
const defaultDimensions = {
    wall: { width: 4, height: 2.5, depth: 0.2 },
    box: { width: 1, height: 1, depth: 1 },
    door: { width: 1, height: 2, depth: 0.1 },
    window: { width: 1, height: 1, depth: 0.1 },
    shelf: { width: 2, height: 1.8, depth: 0.4 },
}

// Actualizar el componente para implementar la nueva funcionalidad de botones
export const ThreeWorkspace = () => {
    const [activeTool, setActiveTool] = useState<Tool>("navigate")
    const [editSubTool, setEditSubTool] = useState<EditSubTool>(null)
    const [is3DMode, setIs3DMode] = useState(true)
    const [showElementsPanel, setShowElementsPanel] = useState(false)
    const [showEditPanel, setShowEditPanel] = useState(false)
    const [selectedElementType, setSelectedElementType] = useState<ElementType>("none")
    const [isDrawing, setIsDrawing] = useState(false)

    // Historial para deshacer/rehacer
    const [objects, setObjects] = useState<SceneObject[]>([
        // Objetos de ejemplo
        {
            id: "1",
            type: "wall",
            position: { x: -2, y: 0, z: 0 },
            rotation: 0,
            scale: { x: 4, y: 2.5, z: 0.2 },
            selected: false,
        },
        {
            id: "2",
            type: "box",
            position: { x: 2, y: 0.5, z: 2 },
            rotation: Math.PI / 4,
            scale: { x: 1, y: 1, z: 1 },
            selected: false,
        },
    ])
    const [history, setHistory] = useState<SceneObject[][]>([])
    const [redoStack, setRedoStack] = useState<SceneObject[][]>([])

    // Actualizar objetos con seguimiento de historial
    const updateObjects = (newObjects: SceneObject[]) => {
        setHistory([...history, objects])
        setObjects(newObjects)
        setRedoStack([])
    }

    // Función para deshacer
    const handleUndo = () => {
        if (history.length > 0) {
            const previousState = history[history.length - 1]
            const newHistory = history.slice(0, -1)

            setRedoStack([...redoStack, objects])
            setObjects(previousState)
            setHistory(newHistory)
        }
    }

    // Función para rehacer
    const handleRedo = () => {
        if (redoStack.length > 0) {
            const nextState = redoStack[redoStack.length - 1]
            const newRedoStack = redoStack.slice(0, -1)

            setHistory([...history, objects])
            setObjects(nextState)
            setRedoStack(newRedoStack)
        }
    }

    const toggleViewMode = () => {
        setIs3DMode(!is3DMode)
        // Al cambiar el modo de vista, activar la herramienta de navegación
        setActiveTool("navigate")
        setShowEditPanel(false)
        setShowElementsPanel(false)
    }

    const handleToolChange = (tool: Tool) => {
        setActiveTool(tool)

        // Reiniciar sub-herramientas
        setEditSubTool(null)

        // Mostrar/ocultar paneles correspondientes
        if (tool === "elements") {
            setShowElementsPanel(true)
            setShowEditPanel(false)
            setSelectedElementType("none") // Reset selected element
        } else if (tool === "edit") {
            setShowElementsPanel(false)
            setShowEditPanel(true)
        } else {
            setShowElementsPanel(false)
            setShowEditPanel(false)
            setIsDrawing(false) // Stop drawing when changing tools
        }
    }

    const handleElementSelect = (elementType: ElementType) => {
        setSelectedElementType(elementType)
        setIsDrawing(true)
    }

    const handleEditSubToolSelect = (subTool: EditSubTool) => {
        setEditSubTool(subTool)
    }

    // Eliminar objetos seleccionados
    const handleDeleteSelected = () => {
        const newObjects = objects.filter((obj) => !obj.selected)
        if (newObjects.length !== objects.length) {
            updateObjects(newObjects)
        }
    }

    return (
        <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 relative">
                <Canvas
                    camera={
                        is3DMode
                            ? { position: [5, 5, 5], fov: 50, near: 0.1, far: 1000 }
                            : { position: [0, 10, 0], zoom: 50, near: 0.1, far: 1000 }
                    }
                    orthographic={!is3DMode}
                    shadows
                >
                    <WorkspaceScene
                        activeTool={activeTool}
                        editSubTool={editSubTool}
                        is3DMode={is3DMode}
                        isEditMode={activeTool === "edit"}
                        selectedElementType={selectedElementType}
                        isDrawing={isDrawing && activeTool === "elements"}
                        setIsDrawing={setIsDrawing}
                        objects={objects}
                        updateObjects={updateObjects}
                    />
                    <OrbitControls
                        enabled={
                            activeTool === "camera" || activeTool === "navigate" || (activeTool === "edit" && editSubTool !== "move")
                        }
                        makeDefault
                        minPolarAngle={is3DMode ? 0 : Math.PI / 4}
                        maxPolarAngle={is3DMode ? Math.PI / 1.5 : Math.PI / 2.5}
                        enableZoom={activeTool === "camera" || activeTool === "edit"}
                        enablePan={activeTool === "camera" || activeTool === "edit"}
                        enableRotate={activeTool === "camera" || activeTool === "edit" || (activeTool === "navigate" && is3DMode)}
                    />
                    <Grid
                        infiniteGrid
                        cellSize={1}
                        cellThickness={0.5}
                        sectionSize={5}
                        sectionThickness={1}
                        fadeDistance={50}
                        fadeStrength={1.5}
                        visible={activeTool !== "navigate" || !is3DMode}
                    />
                    <GizmoHelper alignment="bottom-right" margin={[80, 80]} visible={activeTool !== "navigate"}>
                        <GizmoViewport labelColor="white" axisHeadScale={1} />
                    </GizmoHelper>
                </Canvas>
            </div>

            {/* Elements panel that appears when elements tool is selected */}
            {showElementsPanel && (
                <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">Add Elements</h3>
                        {isDrawing && (
                            <button className="text-red-500 hover:text-red-700" onClick={() => setIsDrawing(false)}>
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            className={`p-2 ${selectedElementType === "wall" ? "bg-blue-100" : "bg-gray-100"} rounded hover:bg-gray-200 flex flex-col items-center`}
                            onClick={() => handleElementSelect("wall")}
                        >
                            <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center mb-1">
                                <span className="text-xs">Wall</span>
                            </div>
                            <span className="text-xs">Wall</span>
                        </button>
                        <button
                            className={`p-2 ${selectedElementType === "box" ? "bg-blue-100" : "bg-gray-100"} rounded hover:bg-gray-200 flex flex-col items-center`}
                            onClick={() => handleElementSelect("box")}
                        >
                            <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center mb-1">
                                <span className="text-xs">Box</span>
                            </div>
                            <span className="text-xs">Box</span>
                        </button>
                        <button
                            className={`p-2 ${selectedElementType === "door" ? "bg-blue-100" : "bg-gray-100"} rounded hover:bg-gray-200 flex flex-col items-center`}
                            onClick={() => handleElementSelect("door")}
                        >
                            <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center mb-1">
                                <span className="text-xs">Door</span>
                            </div>
                            <span className="text-xs">Door</span>
                        </button>
                        <button
                            className={`p-2 ${selectedElementType === "window" ? "bg-blue-100" : "bg-gray-100"} rounded hover:bg-gray-200 flex flex-col items-center`}
                            onClick={() => handleElementSelect("window")}
                        >
                            <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center mb-1">
                                <span className="text-xs">Window</span>
                            </div>
                            <span className="text-xs">Window</span>
                        </button>
                        <button
                            className={`p-2 ${selectedElementType === "shelf" ? "bg-blue-100" : "bg-gray-100"} rounded hover:bg-gray-200 flex flex-col items-center`}
                            onClick={() => handleElementSelect("shelf")}
                        >
                            <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center mb-1">
                                <span className="text-xs">Shelf</span>
                            </div>
                            <span className="text-xs">Shelf</span>
                        </button>
                    </div>

                    {isDrawing && (
                        <div className="mt-4 p-2 bg-blue-50 rounded">
                            <p className="text-xs text-blue-800">
                                {selectedElementType === "wall"
                                    ? "Click to place wall points. Double-click to finish."
                                    : `Click to place the ${selectedElementType}.`}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Edit panel that appears when edit tool is selected */}
            {showEditPanel && (
                <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">Edit Tools</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            className={`p-2 ${editSubTool === "select" ? "bg-blue-100" : "bg-gray-100"} rounded hover:bg-gray-200 flex flex-col items-center`}
                            onClick={() => handleEditSubToolSelect("select")}
                        >
                            <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center mb-1">
                                <SquareDashedMousePointer className="w-6 h-6" />
                            </div>
                            <span className="text-xs">Select</span>
                        </button>
                        <button
                            className={`p-2 ${editSubTool === "move" ? "bg-blue-100" : "bg-gray-100"} rounded hover:bg-gray-200 flex flex-col items-center`}
                            onClick={() => handleEditSubToolSelect("move")}
                        >
                            <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center mb-1">
                                <Move className="w-6 h-6" />
                            </div>
                            <span className="text-xs">Move</span>
                        </button>
                        <button
                            className={`p-2 ${editSubTool === "delete" ? "bg-blue-100" : "bg-gray-100"} rounded hover:bg-gray-200 flex flex-col items-center`}
                            onClick={() => handleEditSubToolSelect("delete")}
                        >
                            <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center mb-1">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <span className="text-xs">Delete</span>
                        </button>
                    </div>

                    <div className="mt-4 flex justify-between">
                        <button
                            className="p-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center"
                            onClick={handleUndo}
                            disabled={history.length === 0}
                        >
                            <Undo className={`w-5 h-5 ${history.length === 0 ? "text-gray-400" : "text-gray-700"}`} />
                            <span className="text-xs ml-1">Undo</span>
                        </button>
                        <button
                            className="p-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center"
                            onClick={handleRedo}
                            disabled={redoStack.length === 0}
                        >
                            <span className="text-xs mr-1">Redo</span>
                            <Redo className={`w-5 h-5 ${redoStack.length === 0 ? "text-gray-400" : "text-gray-700"}`} />
                        </button>
                    </div>

                    {editSubTool === "delete" && (
                        <div className="mt-4">
                            <button
                                className="w-full p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center"
                                onClick={handleDeleteSelected}
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                <span className="text-xs">Delete Selected</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                <button
                    className={`p-4 rounded-lg ${activeTool === "camera" ? "bg-gray-500" : "hover:bg-gray-500"}`}
                    onClick={() => handleToolChange("camera")}
                    title="Zoom and camera control"
                >
                    <Expand className="w-6 h-6 text-gray-900" />
                </button>
                <button
                    className={`p-4 rounded-lg ${activeTool === "navigate" ? "bg-gray-500" : "hover:bg-gray-500"}`}
                    onClick={() => handleToolChange("navigate")}
                    title="Navigate mode"
                >
                    <Navigation className="w-6 h-6 text-gray-900" />
                </button>
                <button
                    className={`p-4 rounded-lg ${activeTool === "edit" ? "bg-gray-500" : "hover:bg-gray-500"}`}
                    onClick={() => handleToolChange("edit")}
                    title="Edit existing elements"
                >
                    <SquareDashedMousePointer className="w-6 h-6 text-gray-900" />
                </button>
                <button
                    className={`p-4 rounded-lg ${activeTool === "elements" ? "bg-gray-500" : "hover:bg-gray-500"}`}
                    onClick={() => handleToolChange("elements")}
                    title="Add elements"
                >
                    <ArrowDownZA className="w-6 h-6 text-gray-900" />
                </button>
                <button
                    className={`p-4 rounded-lg ${is3DMode ? "" : "bg-gray-500"}`}
                    onClick={toggleViewMode}
                    title="Toggle 2D/3D view"
                >
                    <Boxes className="w-6 h-6 text-gray-900" />
                </button>
            </div>
        </div>
    )
}

// Componente de elemento que renderiza el modelo 3D o geometría apropiada
function Element({
    object,
    onClick,
    onMove,
    onDelete,
    editSubTool,
}: {
    object: SceneObject
    onClick: (e: any) => void
    onMove?: (position: { x: number; y: number; z: number }) => void
    onDelete?: () => void
    editSubTool: EditSubTool
}) {
    const [isDragging, setIsDragging] = useState(false)
    const dragRef = useRef<{ x: number; y: number; z: number } | null>(null)

    // Obtener dimensiones por defecto para este tipo de elemento
    const dimensions = defaultDimensions[object.type as keyof typeof defaultDimensions] || {
        width: 1,
        height: 1,
        depth: 1,
    }

    // Manejar clic según la sub-herramienta de edición
    const handleClick = (e: any) => {
        if (editSubTool === "delete" && object.selected) {
            if (onDelete) {
                onDelete()
            }
            e.stopPropagation()
        } else {
            onClick(e)
        }
    }

    // Manejar arrastre para operaciones de movimiento
    const handlePointerDown = (e: any) => {
        if (editSubTool === "move" && object.selected && onMove) {
            e.stopPropagation()
            setIsDragging(true)
            dragRef.current = { x: e.point.x, y: e.point.y, z: e.point.z }
        }
    }

    const handlePointerMove = (e: any) => {
        if (isDragging && dragRef.current && onMove) {
            const newPosition = {
                x: object.position.x + (e.point.x - dragRef.current.x),
                y: object.position.y + (e.point.y - dragRef.current.y),
                z: object.position.z + (e.point.z - dragRef.current.z),
            }
            dragRef.current = { x: e.point.x, y: e.point.y, z: e.point.z }
            onMove(newPosition)
        }
    }

    const handlePointerUp = () => {
        setIsDragging(false)
        dragRef.current = null
    }

    // Para paredes, renderizar basado en puntos si están disponibles
    if (object.type === "wall" && object.points && object.points.length > 1) {
        return (
            <group onClick={handleClick}>
                {/* Render wall segments between points */}
                {object.points.slice(0, -1).map((point, index) => {
                    const nextPoint = object.points![index + 1]
                    const midPoint = {
                        x: (point.x + nextPoint.x) / 2,
                        y: (point.y + nextPoint.y) / 2,
                        z: (point.z + nextPoint.z) / 2,
                    }

                    // Calcular dirección y longitud
                    const dx = nextPoint.x - point.x
                    const dz = nextPoint.z - point.z
                    const length = Math.sqrt(dx * dx + dz * dz)
                    const angle = Math.atan2(dz, dx)

                    return (
                        <group
                            key={`wall-segment-${index}`}
                            position={[midPoint.x, object.position.y, midPoint.z]}
                            rotation={[0, angle, 0]}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                        >
                            <mesh castShadow receiveShadow>
                                <boxGeometry args={[length, dimensions.height, dimensions.depth]} />
                                <meshStandardMaterial
                                    color={object.selected ? "#3b82f6" : "#94a3b8"}
                                    emissive={object.selected ? "#3b82f6" : undefined}
                                    emissiveIntensity={object.selected ? 0.2 : 0}
                                />
                            </mesh>
                        </group>
                    )
                })}

                {/* Show points for editing */}
                {object.selected &&
                    object.points.map((point, index) => (
                        <mesh
                            key={`point-${index}`}
                            position={[point.x, object.position.y, point.z]}
                            onClick={(e) => {
                                e.stopPropagation()
                                // Handle point editing here
                            }}
                        >
                            <sphereGeometry args={[0.1, 16, 16]} />
                            <meshBasicMaterial color="#ff0000" />
                        </mesh>
                    ))}
            </group>
        )
    }

    // For other elements, render basic geometries
    return (
        <group
            position={[object.position.x, object.position.y, object.position.z]}
            rotation={[0, object.rotation, 0]}
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {/* Render appropriate geometry based on element type */}
            {object.type === "box" && (
                <mesh castShadow receiveShadow scale={[object.scale.x, object.scale.y, object.scale.z]}>
                    <boxGeometry />
                    <meshStandardMaterial
                        color={object.selected ? "#3b82f6" : "#f59e0b"}
                        emissive={object.selected ? "#3b82f6" : undefined}
                        emissiveIntensity={object.selected ? 0.2 : 0}
                    />
                </mesh>
            )}

            {object.type === "door" && (
                <mesh castShadow receiveShadow scale={[object.scale.x, object.scale.y, object.scale.z]}>
                    <boxGeometry />
                    <meshStandardMaterial
                        color={object.selected ? "#3b82f6" : "#10b981"}
                        emissive={object.selected ? "#3b82f6" : undefined}
                        emissiveIntensity={object.selected ? 0.2 : 0}
                    />
                </mesh>
            )}

            {object.type === "window" && (
                <mesh castShadow receiveShadow scale={[object.scale.x, object.scale.y, object.scale.z]}>
                    <boxGeometry />
                    <meshStandardMaterial
                        color={object.selected ? "#3b82f6" : "#60a5fa"}
                        transparent
                        opacity={0.7}
                        emissive={object.selected ? "#3b82f6" : undefined}
                        emissiveIntensity={object.selected ? 0.2 : 0}
                    />
                </mesh>
            )}

            {object.type === "shelf" && (
                <mesh castShadow receiveShadow scale={[object.scale.x, object.scale.y, object.scale.z]}>
                    <boxGeometry />
                    <meshStandardMaterial
                        color={object.selected ? "#3b82f6" : "#8b5cf6"}
                        emissive={object.selected ? "#3b82f6" : undefined}
                        emissiveIntensity={object.selected ? 0.2 : 0}
                    />
                </mesh>
            )}

            {/* Show label when selected */}
            {object.selected && (
                <Html>
                    <div className="bg-white text-black px-2 py-1 text-xs rounded shadow-lg">
                        {object.type.charAt(0).toUpperCase() + object.type.slice(1)}
                    </div>
                </Html>
            )}
        </group>
    )
}

// Update the WorkspaceScene component to handle the new functionality
function WorkspaceScene({
    activeTool,
    editSubTool,
    is3DMode,
    isEditMode,
    selectedElementType,
    isDrawing,
    setIsDrawing,
    objects,
    updateObjects,
}: {
    activeTool: Tool
    editSubTool: EditSubTool
    is3DMode: boolean
    isEditMode: boolean
    selectedElementType: ElementType
    isDrawing: boolean
    setIsDrawing: (drawing: boolean) => void
    objects: SceneObject[]
    updateObjects: (newObjects: SceneObject[]) => void
}) {
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null)
    const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number; z: number }[]>([])
    const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; z: number } | null>(null)
    const planeRef = useRef<THREE.Mesh>(null)

    // Generate a unique ID
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    }

    // Handle object selection
    const handleObjectClick = (id: string, e: any) => {
        if (isEditMode) {
            if (editSubTool === "select" || editSubTool === null) {
                setSelectedObjectId(id === selectedObjectId ? null : id)
                updateObjects(
                    objects.map((obj) => ({
                        ...obj,
                        selected: obj.id === id && obj.id !== selectedObjectId,
                    }))
                )
                e.stopPropagation()
            }
        }
    }

    // Handle object movement
    const handleObjectMove = (id: string, newPosition: { x: number; y: number; z: number }) => {
        if (isEditMode && editSubTool === "move") {
            updateObjects(objects.map((obj) => (obj.id === id ? { ...obj, position: newPosition } : obj)))
        }
    }

    // Handle object deletion
    const handleObjectDelete = (id: string) => {
        if (isEditMode && editSubTool === "delete") {
            updateObjects(objects.filter(obj => obj.id !== id))
            setSelectedObjectId(null)
        }
    }

    // Handle plane click for deselection or drawing
    const handlePlaneClick = (e: any) => {
        // Get the intersection point
        const point = {
            x: e.point.x,
            y: e.point.y,
            z: e.point.z,
        }

        if (isEditMode) {
            if (editSubTool === "select" || editSubTool === null) {
                // Deselect in edit mode
                setSelectedObjectId(null)
                updateObjects(
                    objects.map((obj) => ({
                        ...obj,
                        selected: false,
                    }))
                )
            }
        } else if (isDrawing && selectedElementType !== "none") {
            // Handle drawing based on element type
            if (selectedElementType === "wall") {
                // For walls, we collect points to create a path
                if (drawingPoints.length === 0) {
                    // Start drawing
                    setDrawingPoints([point])
                } else {
                    // Check if double-clicking near the first point to close
                    const firstPoint = drawingPoints[0]
                    const distance = Math.sqrt(Math.pow(point.x - firstPoint.x, 2) + Math.pow(point.z - firstPoint.z, 2))

                    if (drawingPoints.length > 1 && distance < 0.5) {
                        // Close the wall and create it
                        const newWall: SceneObject = {
                            id: generateId(),
                            type: "wall",
                            position: { x: 0, y: 1.25, z: 0 }, // Center height
                            rotation: 0,
                            scale: { x: 1, y: 1, z: 1 },
                            points: [...drawingPoints, firstPoint], // Close the loop
                            selected: false,
                        }

                        updateObjects([...objects, newWall])
                        setDrawingPoints([])
                        setIsDrawing(false)
                    } else {
                        // Add point to the wall
                        setDrawingPoints([...drawingPoints, point])
                    }
                }
            } else {
                // For other elements, place them directly
                const dimensions = defaultDimensions[selectedElementType as keyof typeof defaultDimensions] || {
                    width: 1,
                    height: 1,
                    depth: 1,
                }

                const newObject: SceneObject = {
                    id: generateId(),
                    type: selectedElementType,
                    position: {
                        x: point.x,
                        y: dimensions.height / 2, // Place on ground
                        z: point.z,
                    },
                    rotation: 0,
                    scale: {
                        x: dimensions.width,
                        y: dimensions.height,
                        z: dimensions.depth,
                    },
                    selected: false,
                }

                updateObjects([...objects, newObject])
                // Don't stop drawing for these elements to allow placing multiple
            }
        }
    }

    // Handle pointer move for drawing preview
    const handlePointerMove = (e: any) => {
        if (isDrawing && selectedElementType === "wall") {
            setHoveredPoint({
            x: e.point.x,
            y: e.point.y,
            z: e.point.z
        });
    }
}

    return (
        <group>
            {/* Background changes based on navigation mode */}
            <color attach="background" args={[activeTool === "navigate" ? "#f8f9fa" : "#e2e8f0"]} />

            {/* Workspace plane */}
            <mesh
                ref={planeRef}
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
                onClick={handlePlaneClick}
                onPointerMove={handlePointerMove}
            >
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial
                    color={activeTool === "navigate" ? "#ffffff" : "#f0f0f0"}
                    transparent
                    opacity={0.8}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Ambient light */}
            <ambientLight intensity={0.6} />

            {/* Directional light with shadows */}
            <directionalLight
                position={[10, 10, 10]}
                intensity={1}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />

            {/* Render objects */}
            {objects.map((object) => (
                <Element
                    key={object.id}
                    object={object}
                    onClick={(e) => handleObjectClick(object.id, e)}
                    onMove={(pos) => handleObjectMove(object.id, pos)}
                    onDelete={() => handleObjectDelete(object.id)}
                    editSubTool={editSubTool}
                />
            ))}

            {/* Drawing preview for walls */}
            {isDrawing && selectedElementType === "wall" && drawingPoints.length > 0 && (
                <>
                    <Line
                        points={[
                            ...drawingPoints.map((p) => [p.x, 0.05, p.z]),
                            hoveredPoint
                                ? hoveredPoint ? [hoveredPoint.x, 0.05, hoveredPoint.z] : [0, 0, 0]
                                : drawingPoints.length > 0 ? [drawingPoints[drawingPoints.length - 1].x, 0.05, drawingPoints[drawingPoints.length - 1].z] : [0, 0, 0]
                        ]}
                        color="red"
                        lineWidth={3}
                    />

                    {/* Show points */}
                    {drawingPoints.map((point, i) => (
                        <mesh key={`drawing-point-${i}`} position={[point.x, 0.1, point.z]}>
                            <sphereGeometry args={[0.1, 16, 16]} />
                            <meshBasicMaterial color="red" />
                        </mesh>
                    ))}

                    {/* Show close indicator when near first point */}
                    {drawingPoints.length > 1 &&
                        hoveredPoint &&
                        Math.sqrt(
                            Math.pow(hoveredPoint.x - drawingPoints[0].x, 2) + Math.pow(hoveredPoint.z - drawingPoints[0].z, 2),
                        ) < 0.5 && (
                            <mesh position={[drawingPoints[0].x, 0.15, drawingPoints[0].z]}>
                                <sphereGeometry args={[0.15, 16, 16]} />
                                <meshBasicMaterial color="green" />
                            </mesh>
                        )}
                </>
            )}

            {/* Mode indicator */}
            <Html position={[-45, 45, 0]}>
                <div className="bg-white/80 backdrop-blur-sm text-black px-3 py-1 rounded-lg text-sm">
                    {is3DMode ? "3D Mode" : "2D Mode"} - {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
                    {isEditMode && editSubTool && ` - ${editSubTool.charAt(0).toUpperCase() + editSubTool.slice(1)}`}
                    {isDrawing && selectedElementType !== "none" && ` - Drawing ${selectedElementType}`}
                </div>
            </Html>
        </group>
    )
}
