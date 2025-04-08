"use client";

import React, { useState, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Expand, Move, MousePointer, Edit, Type, CuboidIcon as Cube, Square, Link as LinkIcon } from "lucide-react";

// Definición de tipos
interface Product {
    id: string;
    name: string;
    image?: string;
    price: number;
    stock: number;
    sku: string;
    category?: string;
    sold?: number;
}

interface Container {
    id: string;
    position: { x: number, y: number };
    size: { width: number, height: number };
    product: Product | null;
    capacity: number;
    occupied: number;
    isDragging?: boolean;
    isSelected?: boolean;
    isRectangular?: boolean;
}

// Función para determinar el color según el nivel de stock
const getStockColor = (container: Container): number => {
    if (!container.product) return 0xcccccc; // Gris para contenedores vacíos
    
    const stockPercentage = (container.occupied / container.capacity) * 100;
    
    if (stockPercentage >= 90) return 0x22c55e; // Verde para lleno
    if (stockPercentage > 50) return 0x94a3b8; // Gris para por encima de la mitad
    if (stockPercentage >= 20) return 0xfacc15; // Amarillo para menos de la mitad
    return 0xef4444; // Rojo para por acabarse o acabado
};

// Componente para mostrar información al pasar el mouse sobre un contenedor
const ContainerTooltip = ({ product, containerId, capacity, occupied }: { 
    product: Product | null, 
    containerId: string,
    capacity: number,
    occupied: number
}) => {
    if (!product) return null;

    return (
        <div className="bg-white p-3 rounded-md shadow-lg border z-50 max-w-xs">
            <div className="font-bold text-lg">{product.name}</div>
            <p className="text-sm text-gray-500">Ubicación: {containerId}</p>
            <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                    <span>Valor:</span>
                    <span className="font-medium">${product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Stock:</span>
                    <span className="font-medium">{product.stock} unidades</span>
                </div>
                <div className="flex justify-between">
                    <span>Ocupación:</span>
                    <span className="font-medium">{occupied}/{capacity}</span>
                </div>
            </div>
            <Button variant="link" size="sm" className="mt-2 p-0 h-auto">Vista detallada</Button>
        </div>
    );
};

// Componente para representar un estante/contenedor en 3D
const Shelf = ({ container, onClick, isSelected, onHover, onLeaveHover }: { 
    container: Container, 
    onClick: () => void, 
    isSelected: boolean,
    onHover: () => void,
    onLeaveHover: () => void
}) => {
    // Referencia al mesh para animaciones
    const meshRef = useRef<THREE.Mesh>(null);

    // Color base según nivel de stock y color cuando está seleccionado
    const baseColor = getStockColor(container);
    const selectedColor = 0x48bb78;

    // Animación suave al seleccionar
    useFrame(() => {
        if (!meshRef.current) return;

        // Animación de elevación cuando está seleccionado
        const targetY = isSelected ? 0.1 : 0;
        meshRef.current.position.y = THREE.MathUtils.lerp(
            meshRef.current.position.y,
            targetY,
            0.1
        );

        // Cambio de color cuando está seleccionado
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        const targetColor = isSelected ? selectedColor : baseColor;
        material.color.lerp(new THREE.Color(targetColor), 0.1);
    });

    return (
        <mesh
            ref={meshRef}
            position={[container.position.x, 0, container.position.y]}
            onClick={onClick}
            onPointerOver={onHover}
            onPointerOut={onLeaveHover}
            receiveShadow
            castShadow
        >
            <boxGeometry args={[container.size.width, 0.5, container.size.height]} />
            <meshStandardMaterial color={baseColor} />

            {/* Etiqueta con ID del contenedor */}
            <Text
                position={[0, 0.3, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.3}
                color="#000000"
                anchorX="center"
                anchorY="middle"
            >
                {container.id}
            </Text>
            
            {/* Información del producto al pasar el mouse */}
            {container.product && container.isSelected && (
                <Html
                    position={[0, 1, 0]}
                    className="pointer-events-none"
                    transform
                    occlude
                    distanceFactor={10}
                >
                    <div className="bg-white p-2 rounded shadow-lg text-xs w-40">
                        <div className="font-bold">{container.product.name}</div>
                        <div>Stock: {container.product.stock}</div>
                    </div>
                </Html>
            )}
        </mesh>
    );
};

// Componente para mostrar información del producto seleccionado
const ProductInfo = ({ product, containerId, capacity, occupied }: { 
    product: Product | null, 
    containerId: string,
    capacity: number,
    occupied: number
}) => {
    if (!product) return null;

    return (
        <div className="fixed top-4 right-4 w-72 z-10">
            <Card>
                <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>Ubicación: {containerId} | SKU: {product.sku}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Valor unitario:</span>
                            <span className="font-medium">${product.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Capacidad:</span>
                            <span className="font-medium">{capacity} unidades</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Items guardados:</span>
                            <span className="font-medium">{occupied} unidades</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total inventario:</span>
                            <span className="font-medium">{product.stock} unidades</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Cantidad vendida:</span>
                            <span className="font-medium">{product.sold || 0} unidades</span>
                        </div>
                        {product.category && (
                            <div className="flex justify-between">
                                <span>Categoría:</span>
                                <span className="font-medium">{product.category}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">Vista detallada</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

// Componente principal para la escena 3D
const InventoryScene = ({ viewMode, isEditMode }: { viewMode: '2d' | '3d', isEditMode: boolean }) => {
    // Estado para el contenedor seleccionado y el que tiene hover
    const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
    const [hoveredContainer, setHoveredContainer] = useState<Container | null>(null);
    
    // Datos de ejemplo para los contenedores (estanterías)
    const [containers, setContainers] = useState<Container[]>([
        // Sección A
        { id: "A1", position: { x: -5, y: -5 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "A2", position: { x: -5, y: -3 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "A3", position: { x: -5, y: -1 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "A4", position: { x: -5, y: 1 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "A5", position: { x: -5, y: 3 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "A6", position: { x: -5, y: 5 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },

        // Sección B
        { id: "B1", position: { x: -2, y: -5 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "B2", position: { x: -2, y: -3 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "B3", position: { x: -2, y: -1 }, size: { width: 2.5, height: 2.5 }, product: { id: "p1", name: "Pennywort", price: 12.23, stock: 192, sku: "B3-1234", sold: 45 }, capacity: 200, occupied: 192, isRectangular: true },
        { id: "B4", position: { x: -2, y: 1 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "B5", position: { x: -2, y: 3 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "B6", position: { x: -2, y: 5 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },

        // Sección C
        { id: "C1", position: { x: 1, y: -5 }, size: { width: 1.5, height: 1.5 }, product: { id: "p2", name: "Apple", price: 14.81, stock: 72, sku: "C1-5678", category: "Fruits", sold: 28 }, capacity: 100, occupied: 72, isRectangular: true },
        { id: "C2", position: { x: 1, y: -3 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "C3", position: { x: 1, y: -1 }, size: { width: 2.5, height: 1.5 }, product: { id: "p3", name: "Bell Pepper", price: 8.50, stock: 22, sku: "C3-9012", category: "Vegetables", sold: 15 }, capacity: 100, occupied: 22, isRectangular: true },
        { id: "C4", position: { x: 1, y: 1 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "C5", position: { x: 1, y: 3 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "C6", position: { x: 1, y: 5 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },

        // Sección D
        { id: "D1", position: { x: 4, y: -5 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "D2", position: { x: 4, y: -3 }, size: { width: 1.5, height: 1.5 }, product: { id: "p4", name: "Cucumber", price: 5.25, stock: 5, sku: "D2-3456", category: "Vegetables", sold: 95 }, capacity: 100, occupied: 5, isRectangular: true },
        { id: "D3", position: { x: 4, y: -1 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "D4", position: { x: 4, y: 1 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "D5", position: { x: 4, y: 3 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "D6", position: { x: 4, y: 5 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },

        // Sección E (abajo)
        { id: "E1", position: { x: -3.5, y: 8 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "E2", position: { x: -1, y: 8 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
        { id: "E3", position: { x: 1.5, y: 8 }, size: { width: 1.5, height: 1.5 }, product: { id: "p5", name: "Avocado", price: 18.99, stock: 78, sku: "E3-7890", category: "Fruits", sold: 32 }, capacity: 100, occupied: 78, isRectangular: true },
        { id: "E4", position: { x: 4, y: 8 }, size: { width: 1.5, height: 1.5 }, product: null, capacity: 100, occupied: 0, isRectangular: true },
    ]);

    // Manejar clic en un contenedor
    const handleContainerClick = (container: Container) => {
        setSelectedContainer(container.id === selectedContainer?.id ? null : container);
    };

    // Manejar hover en un contenedor
    const handleContainerHover = (container: Container) => {
        setHoveredContainer(container);
    };

    // Manejar cuando se deja de hacer hover en un contenedor
    const handleContainerLeaveHover = () => {
        setHoveredContainer(null);
    };

    // Añadir un nuevo contenedor en modo edición
    const addContainer = () => {
        if (!isEditMode) return;
        
        const newId = `X${containers.length + 1}`;
        const newContainer: Container = {
            id: newId,
            position: { x: 0, y: 0 },
            size: { width: 2, height: 2 },
            product: null,
            capacity: 100,
            occupied: 0,
            isRectangular: true,
        };
        
        setContainers([...containers, newContainer]);
    };

    return (
        <>
            {/* Información del producto seleccionado */}
            {selectedContainer?.product && (
                <ProductInfo 
                    product={selectedContainer.product} 
                    containerId={selectedContainer.id} 
                    capacity={selectedContainer.capacity} 
                    occupied={selectedContainer.occupied} 
                />
            )}

            {/* Información del producto al hacer hover - Ahora fuera del contexto 3D */}
            {hoveredContainer?.product && hoveredContainer.id !== selectedContainer?.id && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                    <ContainerTooltip 
                        product={hoveredContainer.product} 
                        containerId={hoveredContainer.id} 
                        capacity={hoveredContainer.capacity} 
                        occupied={hoveredContainer.occupied} 
                    />
                </div>
            )}

            {/* Escena 3D */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

            {/* Suelo */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} receiveShadow>
                <planeGeometry args={[30, 30]} />
                <meshStandardMaterial color="#f0f0f0" />
            </mesh>

            {/* Contenedores/Estanterías */}
            {containers.map((container) => (
                <Shelf
                    key={container.id}
                    container={container}
                    onClick={() => handleContainerClick(container)}
                    isSelected={selectedContainer?.id === container.id}
                    onHover={() => handleContainerHover(container)}
                    onLeaveHover={handleContainerLeaveHover}
                />
            ))}

            {/* Controles de cámara */}
            <OrbitControls
                enableDamping
                dampingFactor={0.05}
                minDistance={5}
                maxDistance={20}
                maxPolarAngle={Math.PI / 2}
            />

            {/* Botón para añadir contenedor en modo edición */}
            {isEditMode && (
                <Html 
                    position={[8, 0, 8]}
                    transform
                    occlude
                    distanceFactor={10}
                >
                    <div className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer" onClick={addContainer}>
                        Añadir Contenedor
                    </div>
                </Html>
            )}
        </>
    );
};

// Página principal
export default function AreaPage() {
    // Estado para el modo de visualización y edición
    const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
    const [isEditMode, setIsEditMode] = useState(false);

    return (
        <div className="h-screen w-full">
            <div className="p-4 h-16 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">Gestión de Área de Inventario</h1>
                    
                    {/* Barra de herramientas */}
                    <TooltipProvider>
                        <ToggleGroup type="single" className="ml-4">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ToggleGroupItem value="expand" aria-label="Expandir">
                                        <Expand className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipTrigger>
                                <TooltipContent>Expandir</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ToggleGroupItem value="move" aria-label="Mover">
                                        <Move className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipTrigger>
                                <TooltipContent>Mover</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ToggleGroupItem value="select" aria-label="Seleccionar">
                                        <MousePointer className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipTrigger>
                                <TooltipContent>Seleccionar</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ToggleGroupItem 
                                        value="edit" 
                                        aria-label="Editar"
                                        pressed={isEditMode}
                                        onClick={() => setIsEditMode(!isEditMode)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipTrigger>
                                <TooltipContent>Editar</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ToggleGroupItem value="rename" aria-label="Renombrar">
                                        <Type className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipTrigger>
                                <TooltipContent>Renombrar</TooltipContent>
                            </Tooltip>
                        </ToggleGroup>
                        
                        <ToggleGroup type="single" value={viewMode} className="ml-4">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ToggleGroupItem 
                                        value="3d" 
                                        aria-label="Vista 3D"
                                        onClick={() => setViewMode('3d')}
                                    >
                                        <Cube className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipTrigger>
                                <TooltipContent>Vista 3D</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ToggleGroupItem 
                                        value="2d" 
                                        aria-label="Vista 2D"
                                        onClick={() => setViewMode('2d')}
                                    >
                                        <Square className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipTrigger>
                                <TooltipContent>Vista 2D</TooltipContent>
                            </Tooltip>
                        </ToggleGroup>
                    </TooltipProvider>
                </div>
                
                <div className="flex gap-2">
                    <Button variant="outline">Exportar</Button>
                    <Button>Añadir Producto</Button>
                </div>
            </div>

            <div className="flex h-[calc(100vh-4rem)]">
                {/* Visualización 3D/2D (central) */}
                <div className="flex-1">
                    <Canvas shadows camera={{ position: [0, 10, 10], fov: 50 }}>
                        <InventoryScene viewMode={viewMode} isEditMode={isEditMode} />
                    </Canvas>
                </div>
                
                {/* Panel lateral derecho (Productos) */}
                <div className="w-64 border-l p-4">
                    <h2 className="font-semibold mb-4">Productos</h2>
                    <ScrollArea className="h-[calc(100vh-20rem)]">
                        <div className="space-y-2">
                            <div className="p-2 border rounded-md hover:bg-accent cursor-pointer">
                                <div className="font-medium">Pennywort</div>
                                <div className="text-sm text-muted-foreground">Stock: 192</div>
                            </div>
                            <div className="p-2 border rounded-md hover:bg-accent cursor-pointer">
                                <div className="font-medium">Apple</div>
                                <div className="text-sm text-muted-foreground">Stock: 72</div>
                            </div>
                            <div className="p-2 border rounded-md hover:bg-accent cursor-pointer">
                                <div className="font-medium">Bell Pepper</div>
                                <div className="text-sm text-muted-foreground">Stock: 22</div>
                            </div>
                            <div className="p-2 border rounded-md hover:bg-accent cursor-pointer">
                                <div className="font-medium">Cucumber</div>
                                <div className="text-sm text-muted-foreground">Stock: 5</div>
                            </div>
                            <div className="p-2 border rounded-md hover:bg-accent cursor-pointer">
                                <div className="font-medium">Avocado</div>
                                <div className="text-sm text-muted-foreground">Stock: 78</div>
                            </div>
                        </div>
                    </ScrollArea>
                    
                    <h2 className="font-semibold mt-6 mb-4">Filtros</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Sección</label>
                            <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1">
                                <option value="">Todas</option>
                                <option value="A">Sección A</option>
                                <option value="B">Sección B</option>
                                <option value="C">Sección C</option>
                                <option value="D">Sección D</option>
                                <option value="E">Sección E</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Estado</label>
                            <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1">
                                <option value="">Todos</option>
                                <option value="occupied">Ocupados</option>
                                <option value="available">Disponibles</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}