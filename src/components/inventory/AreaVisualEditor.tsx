'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { Save, Trash2, RotateCw, Move, Square, Circle, Maximize, Minimize, Undo, Redo, Grid, Layers, Copy, Eye, EyeOff, Lock, Unlock, Search, Plus, Settings, ChevronDown, Download, Upload, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type LayoutItem = {
  id: string
  x: number
  y: number
  width: number
  height: number
  type: 'section' | 'shelf' | 'zone' | 'block' | 'product'
  label: string
  color: string
  rotation: number
  productId?: string
  quantity?: number
  maxQuantity?: number
}

type AreaLayout = {
  items: LayoutItem[]
}

type AreaVisualEditorProps = {
  areaId: string
  agencyId: string
  initialLayout?: AreaLayout
  onSave?: (layout: AreaLayout) => Promise<void>
}

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

const DEFAULT_ITEMS: Record<string, Partial<LayoutItem>> = {
  section: { width: 150, height: 100, type: 'section', color: '#94a3b8' },
  shelf: { width: 80, height: 150, type: 'shelf', color: '#64748b' },
  zone: { width: 100, height: 100, type: 'zone', color: '#475569' },
  block: { width: 120, height: 80, type: 'block', color: '#334155' },
  product: { width: 80, height: 80, type: 'product', color: '#94a3b8' },
}

export const AreaVisualEditor = ({
  areaId,
  agencyId,
  initialLayout = { items: [] },
  onSave,
}: AreaVisualEditorProps) => {
  const [layout, setLayout] = useState<AreaLayout>(initialLayout)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 })
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 })
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<AreaLayout[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(100)
  const [activeTab, setActiveTab] = useState('elements')
  const [showProperties, setShowProperties] = useState(true)
  const [copiedItem, setCopiedItem] = useState<LayoutItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    position: false,
    appearance: false,
    dimensions: false
  })
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Obtener el elemento seleccionado
  const selectedItem = selectedItemId
    ? layout.items.find((item) => item.id === selectedItemId) || null
    : null

  // Inicializar el historial cuando se carga el componente
  useEffect(() => {
    if (initialLayout && initialLayout.items.length > 0) {
      setHistory([initialLayout])
      setHistoryIndex(0)
    }
  }, [])

  // Añadir al historial cuando cambia el layout
  const addToHistory = (newLayout: AreaLayout) => {
    // Si estamos en medio del historial, eliminar los estados futuros
    const newHistory = history.slice(0, historyIndex + 1)
    // Añadir el nuevo estado
    newHistory.push(JSON.parse(JSON.stringify(newLayout)))
    // Limitar el historial a 20 estados para evitar problemas de memoria
    if (newHistory.length > 20) {
      newHistory.shift()
    }
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  // Deshacer
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setLayout(JSON.parse(JSON.stringify(history[historyIndex - 1])))
    }
  }

  // Rehacer
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setLayout(JSON.parse(JSON.stringify(history[historyIndex + 1])))
    }
  }

  // Cargar productos cuando se abre el modal
  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true)
      // Aquí deberías hacer una llamada a tu API para obtener los productos
      // Por ahora, usaremos datos de ejemplo
      const productsData = [
        { id: 'prod1', name: 'Producto 1', sku: 'SKU001', quantity: 5, maxQuantity: 100 },
        { id: 'prod2', name: 'Producto 2', sku: 'SKU002', quantity: 80, maxQuantity: 100 },
        { id: 'prod3', name: 'Producto 3', sku: 'SKU003', quantity: 20, maxQuantity: 100 },
        { id: 'prod4', name: 'Producto 4', sku: 'SKU004', quantity: 8, maxQuantity: 100 },
        { id: 'prod5', name: 'Producto 5', sku: 'SKU005', quantity: 50, maxQuantity: 100 },
      ]
      setProducts(productsData)
    } catch (error) {
      console.error('Error al cargar productos:', error)
      toast.error('Error al cargar productos')
    } finally {
      setIsLoadingProducts(false)
    }
  }

  // Filtrar productos según el término de búsqueda
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
  )

  // Determinar el color del producto según su cantidad
  const getProductColor = (quantity: number, maxQuantity: number) => {
    const percentage = maxQuantity > 0 ? (quantity / maxQuantity) * 100 : 0
    
    if (percentage < 10 || quantity < 10) {
      return '#ef4444' // Rojo para menos del 10% o menos de 10 unidades
    } else if (percentage > 75) {
      return '#22c55e' // Verde para más del 75%
    } else {
      return '#94a3b8' // Gris para valores intermedios
    }
  }

  // Añadir un nuevo elemento al layout
  const addItem = (type: 'section' | 'shelf' | 'zone' | 'block' | 'product') => {
    if (type === 'product') {
      setIsProductModalOpen(true)
      loadProducts()
      return
    }
    
    const defaultItem = DEFAULT_ITEMS[type]
    const newItem: LayoutItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: Math.max(0, (CANVAS_WIDTH - (defaultItem.width || 100)) / 2),
      y: Math.max(0, (CANVAS_HEIGHT - (defaultItem.height || 100)) / 2),
      width: defaultItem.width || 100,
      height: defaultItem.height || 100,
      type: type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${layout.items.length + 1}`,
      color: defaultItem.color || '#94a3b8',
      rotation: 0,
    }

    const newLayout = {
      ...layout,
      items: [...layout.items, newItem],
    }

    setLayout(newLayout)
    setSelectedItemId(newItem.id)
    addToHistory(newLayout)
  }
  
  // Añadir un elemento de producto después de seleccionarlo en el modal
  const addProductItem = (product: any) => {
    const defaultItem = DEFAULT_ITEMS['product']
    const productColor = getProductColor(product.quantity, product.maxQuantity)
    
    const newItem: LayoutItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: Math.max(0, (CANVAS_WIDTH - (defaultItem.width || 100)) / 2),
      y: Math.max(0, (CANVAS_HEIGHT - (defaultItem.height || 100)) / 2),
      width: defaultItem.width || 100,
      height: defaultItem.height || 100,
      type: 'product',
      label: product.name,
      color: productColor,
      rotation: 0,
      productId: product.id,
      quantity: product.quantity,
      maxQuantity: product.maxQuantity
    }

    const newLayout = {
      ...layout,
      items: [...layout.items, newItem],
    }

    setLayout(newLayout)
    setSelectedItemId(newItem.id)
    addToHistory(newLayout)
    setIsProductModalOpen(false)
    setSelectedProduct(null)
  }

  // Eliminar un elemento del layout
  const removeItem = (id: string) => {
    if (!id) return

    const newLayout = {
      ...layout,
      items: layout.items.filter((item) => item.id !== id),
    }

    setLayout(newLayout)
    setSelectedItemId(null)
    addToHistory(newLayout)
  }

  // Actualizar un elemento del layout
  const updateItem = (id: string, updates: Partial<LayoutItem>) => {
    if (!id) return

    const newLayout = {
      ...layout,
      items: layout.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }

    setLayout(newLayout)
  }

  // Finalizar una actualización y guardar en el historial
  const finalizeUpdate = () => {
    addToHistory(layout)
  }

  // Iniciar el arrastre de un elemento
  const handleDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setSelectedItemId(id)

    const item = layout.items.find((item) => item.id === id)
    if (!item) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / canvas.offsetWidth * CANVAS_WIDTH
    const y = (e.clientY - rect.top) / canvas.offsetHeight * CANVAS_HEIGHT

    setIsDragging(true)
    setDragOffset({
      x: x - item.x,
      y: y - item.y,
    })
    setDragStartPos({ x: item.x, y: item.y })
  }

  // Iniciar el redimensionamiento de un elemento
  const handleResizeStart = (e: React.MouseEvent, id: string, direction: string) => {
    e.stopPropagation()
    setSelectedItemId(id)

    const item = layout.items.find((item) => item.id === id)
    if (!item) return

    setIsResizing(true)
    setResizeDirection(direction)
    setResizeStartSize({ width: item.width, height: item.height })
    setResizeStartPos({ x: item.x, y: item.y })

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    setDragStartPos({
      x: (e.clientX - rect.left) / canvas.offsetWidth * CANVAS_WIDTH,
      y: (e.clientY - rect.top) / canvas.offsetHeight * CANVAS_HEIGHT,
    })
  }

  // Manejar el movimiento del ratón para arrastrar o redimensionar
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return
    if (!selectedItemId) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / canvas.offsetWidth * CANVAS_WIDTH
    const y = (e.clientY - rect.top) / canvas.offsetHeight * CANVAS_HEIGHT

    if (isDragging) {
      // Arrastrar el elemento
      const newX = Math.max(0, Math.min(CANVAS_WIDTH - (selectedItem?.width || 0), x - dragOffset.x))
      const newY = Math.max(0, Math.min(CANVAS_HEIGHT - (selectedItem?.height || 0), y - dragOffset.y))

      updateItem(selectedItemId, { x: newX, y: newY })
    } else if (isResizing && resizeDirection) {
      // Redimensionar el elemento
      const deltaX = x - dragStartPos.x
      const deltaY = y - dragStartPos.y

      let newWidth = resizeStartSize.width
      let newHeight = resizeStartSize.height
      let newX = selectedItem?.x || 0
      let newY = selectedItem?.y || 0

      if (resizeDirection.includes('e')) {
        newWidth = Math.max(20, resizeStartSize.width + deltaX)
        newWidth = Math.min(newWidth, CANVAS_WIDTH - newX)
      }
      if (resizeDirection.includes('w')) {
        const maxDeltaX = resizeStartSize.width - 20
        const adjustedDeltaX = Math.max(-maxDeltaX, Math.min(resizeStartPos.x, deltaX))
        newWidth = resizeStartSize.width - adjustedDeltaX
        newX = resizeStartPos.x + adjustedDeltaX
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(20, resizeStartSize.height + deltaY)
        newHeight = Math.min(newHeight, CANVAS_HEIGHT - newY)
      }
      if (resizeDirection.includes('n')) {
        const maxDeltaY = resizeStartSize.height - 20
        const adjustedDeltaY = Math.max(-maxDeltaY, Math.min(resizeStartPos.y, deltaY))
        newHeight = resizeStartSize.height - adjustedDeltaY
        newY = resizeStartPos.y + adjustedDeltaY
      }

      updateItem(selectedItemId, { width: newWidth, height: newHeight, x: newX, y: newY })
    }
  }

  // Finalizar el arrastre o redimensionamiento
  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      finalizeUpdate()
    }
    setIsDragging(false)
    setIsResizing(false)
    setResizeDirection(null)
  }

  // Rotar el elemento seleccionado
  const rotateItem = () => {
    if (!selectedItemId) return

    const item = layout.items.find((item) => item.id === selectedItemId)
    if (!item) return

    const newRotation = (item.rotation || 0) + 90
    updateItem(selectedItemId, { rotation: newRotation % 360 })
    finalizeUpdate()
  }

  // Guardar el layout
  const saveLayout = async () => {
    if (!onSave) return

    try {
      setIsLoading(true)
      await onSave(layout)
      toast.success('Layout guardado correctamente')
    } catch (error) {
      console.error('Error al guardar el layout:', error)
      toast.error('Error al guardar el layout')
    } finally {
      setIsLoading(false)
    }
  }

  // Duplicate selected item
  const duplicateItem = () => {
    if (!selectedItemId) return
    
    const item = layout.items.find((item) => item.id === selectedItemId)
    if (!item) return
    
    const newItem: LayoutItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: item.x + 20,
      y: item.y + 20,
    }
    
    const newLayout = {
      ...layout,
      items: [...layout.items, newItem],
    }
    
    setLayout(newLayout)
    setSelectedItemId(newItem.id)
    addToHistory(newLayout)
  }
  
  // Copy selected item
  const copyItem = () => {
    if (!selectedItemId) return
    
    const item = layout.items.find((item) => item.id === selectedItemId)
    if (!item) return
    
    setCopiedItem({...item})
    toast.success('Elemento copiado')
  }
  
  // Paste copied item
  const pasteItem = () => {
    if (!copiedItem) return
    
    const newItem: LayoutItem = {
      ...copiedItem,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: copiedItem.x + 20,
      y: copiedItem.y + 20,
    }
    
    const newLayout = {
      ...layout,
      items: [...layout.items, newItem],
    }
    
    setLayout(newLayout)
    setSelectedItemId(newItem.id)
    addToHistory(newLayout)
    toast.success('Elemento pegado')
  }
  
  // Export layout as JSON
  const exportLayout = () => {
    const dataStr = JSON.stringify(layout, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `area-layout-${areaId}-${new Date().toISOString().slice(0,10)}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }
  
  // Import layout from JSON file
  const importLayout = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedLayout = JSON.parse(e.target?.result as string) as AreaLayout
        setLayout(importedLayout)
        addToHistory(importedLayout)
        toast.success('Layout importado correctamente')
      } catch (error) {
        console.error('Error al importar el layout:', error)
        toast.error('Error al importar el layout')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Modal de selección de producto */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Seleccionar Producto</DialogTitle>
            <DialogDescription>
              Selecciona un producto para añadir al área de inventario.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                className="pl-8"
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
              />
            </div>
            <div className="border rounded-md max-h-[300px] overflow-y-auto">
              {isLoadingProducts ? (
                <div className="p-4 text-center text-muted-foreground">Cargando productos...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No se encontraron productos</div>
              ) : (
                <div className="divide-y">
                  {filteredProducts.map((product) => {
                    const productColor = getProductColor(product.quantity, product.maxQuantity);
                    return (
                      <div 
                        key={product.id} 
                        className={cn(
                          "p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50",
                          selectedProduct?.id === product.id && "bg-muted"
                        )}
                        onClick={() => setSelectedProduct(product)}
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-md flex items-center justify-center" 
                            style={{ backgroundColor: productColor }}
                          >
                            <Package className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.sku}</div>
                          </div>
                        </div>
                        <div className="text-sm">
                          {product.quantity} / {product.maxQuantity}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>Cancelar</Button>
            <Button 
              onClick={() => selectedProduct && addProductItem(selectedProduct)}
              disabled={!selectedProduct || isLoadingProducts}
            >
              Añadir Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Header with tools */}
      <div className="bg-background border-b sticky top-0 z-10 p-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Editor de Área</h2>
            
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={undo}
                      disabled={historyIndex <= 0}
                    >
                      <Undo className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Deshacer</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                    >
                      <Redo className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rehacer</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="h-4 border-r mx-1"></div>
            
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowGrid(!showGrid)}
                    >
                      <Grid className={cn("h-4 w-4", showGrid ? "text-primary" : "text-muted-foreground")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{showGrid ? "Ocultar cuadrícula" : "Mostrar cuadrícula"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="flex items-center gap-1 bg-muted/30 rounded px-2 py-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                >
                  <Minimize className="h-3 w-3" />
                </Button>
                <span className="text-xs w-8 text-center">{zoom}%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                >
                  <Maximize className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportLayout}>Exportar como JSON</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <label>
              <Button variant="outline" size="sm" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <input 
                type="file" 
                className="hidden" 
                accept=".json" 
                onChange={importLayout}
              />
            </label>
            
            <Button
              onClick={saveLayout}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="lg:col-span-3 xl:col-span-2 overflow-y-auto">
          <Card className="h-full">
            <CardHeader className="p-3">
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="elements" className="flex-1">Elementos</TabsTrigger>
                  <TabsTrigger value="layers" className="flex-1">Capas</TabsTrigger>
                </TabsList>
                <TabsContent value="elements" className="mt-2">
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Buscar elementos..." 
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="flex flex-col items-center justify-center h-20 hover:bg-primary/5 hover:border-primary/50"
                        onClick={() => addItem('section')}
                      >
                        <div className="w-12 h-8 border-2 border-primary/70 mb-1 bg-primary/10"></div>
                        <span className="text-xs">Sección</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex flex-col items-center justify-center h-20 hover:bg-primary/5 hover:border-primary/50"
                        onClick={() => addItem('shelf')}
                      >
                        <div className="w-8 h-12 border-2 border-primary/70 mb-1 bg-primary/10"></div>
                        <span className="text-xs">Estante</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex flex-col items-center justify-center h-20 hover:bg-primary/5 hover:border-primary/50"
                        onClick={() => addItem('zone')}
                      >
                        <div className="w-10 h-10 rounded-full border-2 border-primary/70 mb-1 bg-primary/10"></div>
                        <span className="text-xs">Zona</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex flex-col items-center justify-center h-20 hover:bg-primary/5 hover:border-primary/50"
                        onClick={() => addItem('block')}
                      >
                        <div className="w-12 h-8 bg-primary/10 border-2 border-primary/70 mb-1 flex items-center justify-center text-xs">BA</div>
                        <span className="text-xs">Bloque</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex flex-col items-center justify-center h-20 hover:bg-primary/5 hover:border-primary/50"
                        onClick={() => addItem('product')}
                      >
                        <div className="w-10 h-10 rounded-md border-2 border-primary/70 mb-1 bg-primary/10 flex items-center justify-center">
                          <Package className="h-5 w-5 text-primary/70" />
                        </div>
                        <span className="text-xs">Producto</span>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="layers" className="mt-2">
                  <div className="space-y-2">
                    {layout.items.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay elementos</p>
                      </div>
                    ) : (
                      layout.items.map((item) => (
                        <div 
                          key={item.id}
                          className={cn(
                            "flex items-center p-2 rounded-md cursor-pointer",
                            selectedItemId === item.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                          )}
                          onClick={() => setSelectedItemId(item.id)}
                        >
                          <div 
                            className="w-4 h-4 mr-2 rounded-sm" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm truncate flex-1">{item.label}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-50 hover:opacity-100">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardHeader>
            
            <CardContent className="p-3 space-y-4">
              {/* El contenido de las pestañas ahora está dentro del componente Tabs */}
            </CardContent>
          </Card>
        </div>

        {/* Main workspace */}
        <div className="lg:col-span-6 xl:col-span-8 overflow-hidden">
          <Card className="h-full">
            <CardContent className="p-0 h-full flex items-center justify-center bg-[url('/grid-pattern.svg')] bg-muted/20">
              <div 
                className="relative"
                style={{
                  width: `${CANVAS_WIDTH}px`,
                  height: `${CANVAS_HEIGHT}px`,
                  transform: `scale(${zoom / 100})`,
                  transition: 'transform 0.2s ease'
                }}
              >
                <div
                  ref={canvasRef}
                  className={cn(
                    "relative w-full h-full border border-muted-foreground/30 rounded-md bg-background overflow-hidden shadow-md",
                    showGrid ? "bg-[url('/grid-pattern.svg')] bg-muted/10" : ""
                  )}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onClick={() => setSelectedItemId(null)}
                >
                  {layout.items.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'absolute border cursor-move',
                        selectedItemId === item.id ? 'ring-2 ring-primary' : ''
                      )}
                      style={{
                        left: `${(item.x / CANVAS_WIDTH) * 100}%`,
                        top: `${(item.y / CANVAS_HEIGHT) * 100}%`,
                        width: `${(item.width / CANVAS_WIDTH) * 100}%`,
                        height: `${(item.height / CANVAS_HEIGHT) * 100}%`,
                        backgroundColor: item.color || '#94a3b8',
                        transform: `rotate(${item.rotation || 0}deg)`,
                        zIndex: selectedItemId === item.id ? 10 : 1,
                      }}
                      onMouseDown={(e) => handleDragStart(e, item.id)}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedItemId(item.id)
                      }}
                    >
                      <div className="flex items-center justify-center h-full text-xs font-medium">
                        {item.type === 'product' ? (
                          <div className="flex flex-col items-center justify-center w-full h-full">
                            <Package className="h-4 w-4 mb-1" />
                            <span className="text-[10px] leading-tight">{item.label || `Item ${item.id.substring(0, 4)}`}</span>
                            {item.quantity !== undefined && (
                              <span className="text-[8px] mt-1">{item.quantity} unidades</span>
                            )}
                          </div>
                        ) : (
                          item.label || `Item ${item.id.substring(0, 4)}`
                        )}
                      </div>

                      {selectedItemId === item.id && (
                        <>
                          {/* Controladores de redimensionamiento */}
                          <div
                            className="absolute w-3 h-3 bg-primary rounded-full top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 cursor-nw-resize z-20"
                            onMouseDown={(e) => handleResizeStart(e, item.id, 'nw')}
                          />
                          <div
                            className="absolute w-3 h-3 bg-primary rounded-full top-0 right-0 transform translate-x-1/2 -translate-y-1/2 cursor-ne-resize z-20"
                            onMouseDown={(e) => handleResizeStart(e, item.id, 'ne')}
                          />
                          <div
                            className="absolute w-3 h-3 bg-primary rounded-full bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2 cursor-sw-resize z-20"
                            onMouseDown={(e) => handleResizeStart(e, item.id, 'sw')}
                          />
                          <div
                            className="absolute w-3 h-3 bg-primary rounded-full bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 cursor-se-resize z-20"
                            onMouseDown={(e) => handleResizeStart(e, item.id, 'se')}
                          />
                          <div
                            className="absolute w-3 h-3 bg-primary rounded-full top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-n-resize z-20"
                            onMouseDown={(e) => handleResizeStart(e, item.id, 'n')}
                          />
                          <div
                            className="absolute w-3 h-3 bg-primary rounded-full bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 cursor-s-resize z-20"
                            onMouseDown={(e) => handleResizeStart(e, item.id, 's')}
                          />
                          <div
                            className="absolute w-3 h-3 bg-primary rounded-full left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-w-resize z-20"
                            onMouseDown={(e) => handleResizeStart(e, item.id, 'w')}
                          />
                          <div
                            className="absolute w-3 h-3 bg-primary rounded-full right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 cursor-e-resize z-20"
                            onMouseDown={(e) => handleResizeStart(e, item.id, 'e')}
                          />
                        </>
                      )}
                    </div>
                  ))}

                  {layout.items.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Square className="h-12 w-12 text-muted-foreground/30 mb-2" />
                      <p className="text-muted-foreground text-sm">Arrastra elementos desde el panel de herramientas</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar - Properties */}
        <div className="lg:col-span-3 xl:col-span-2 overflow-y-auto">
          <Card className="h-full">
            <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Propiedades</CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setShowProperties(!showProperties)}
              >
                <ChevronDown className={cn("h-4 w-4 transition-transform", !showProperties && "rotate-180")} />
              </Button>
            </CardHeader>
            
            <CardContent className={cn("p-3 space-y-4", !showProperties && "hidden")}>
              {selectedItem ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-label">Etiqueta</Label>
                    <Input
                      id="item-label"
                      value={selectedItem.label}
                      onChange={(e) => updateItem(selectedItem.id, { label: e.target.value })}
                      onBlur={finalizeUpdate}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="item-color">Apariencia</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setCollapsedSections(prev => ({ ...prev, appearance: !prev.appearance }))}
                      >
                        <ChevronDown className={cn("h-4 w-4 transition-transform", collapsedSections.appearance && "rotate-180")} />
                      </Button>
                    </div>
                    
                    {!collapsedSections.appearance && (
                      <div className="space-y-3">
                        <Label htmlFor="item-color" className="text-xs text-muted-foreground">Color</Label>
                        <div className="grid grid-cols-5 gap-2">
                          {['#94a3b8', '#f87171', '#60a5fa', '#4ade80', '#facc15', '#c084fc', '#fb923c', '#a1a1aa', '#22c55e', '#06b6d4'].map((color) => (
                            <button
                              key={color}
                              className={cn(
                                'w-full aspect-square rounded-md border',
                                selectedItem.color === color ? 'ring-2 ring-primary ring-offset-2' : ''
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => {
                                updateItem(selectedItem.id, { color })
                                finalizeUpdate()
                              }}
                            />
                          ))}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="item-rotation" className="text-xs text-muted-foreground">Rotación: {selectedItem.rotation || 0}°</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={rotateItem}
                            >
                              <RotateCw className="h-4 w-4" />
                            </Button>
                          </div>
                          <Slider
                            id="item-rotation"
                            min={0}
                            max={359}
                            step={1}
                            value={[selectedItem.rotation || 0]}
                            onValueChange={(value) => updateItem(selectedItem.id, { rotation: value[0] })}
                            onValueCommit={finalizeUpdate}
                            className="py-2"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Posición</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setCollapsedSections(prev => ({ ...prev, position: !prev.position }))}
                      >
                        <ChevronDown className={cn("h-4 w-4 transition-transform", collapsedSections.position && "rotate-180")} />
                      </Button>
                    </div>
                    
                    {!collapsedSections.position && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="item-x" className="text-xs text-muted-foreground">X</Label>
                          <Input
                            id="item-x"
                            type="number"
                            value={Math.round(selectedItem.x)}
                            onChange={(e) => updateItem(selectedItem.id, { x: Number(e.target.value) })}
                            onBlur={finalizeUpdate}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="item-y" className="text-xs text-muted-foreground">Y</Label>
                          <Input
                            id="item-y"
                            type="number"
                            value={Math.round(selectedItem.y)}
                            onChange={(e) => updateItem(selectedItem.id, { y: Number(e.target.value) })}
                            onBlur={finalizeUpdate}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Dimensiones</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setCollapsedSections(prev => ({ ...prev, dimensions: !prev.dimensions }))}
                      >
                        <ChevronDown className={cn("h-4 w-4 transition-transform", collapsedSections.dimensions && "rotate-180")} />
                      </Button>
                    </div>
                    
                    {!collapsedSections.dimensions && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="item-width" className="text-xs text-muted-foreground">Ancho</Label>
                          <Input
                            id="item-width"
                            type="number"
                            value={Math.round(selectedItem.width)}
                            onChange={(e) => updateItem(selectedItem.id, { width: Number(e.target.value) })}
                            onBlur={finalizeUpdate}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="item-height" className="text-xs text-muted-foreground">Alto</Label>
                          <Input
                            id="item-height"
                            type="number"
                            value={Math.round(selectedItem.height)}
                            onChange={(e) => updateItem(selectedItem.id, { height: Number(e.target.value) })}
                            onBlur={finalizeUpdate}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedItem.type === 'product' && (
                    <div className="space-y-2 mt-4 border-t pt-4">
                      <div className="flex justify-between items-center">
                        <Label>Información del Producto</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsProductModalOpen(true);
                            loadProducts();
                          }}
                        >
                          Cambiar Producto
                        </Button>
                      </div>
                      
                      <div className="mt-2 p-3 bg-muted/30 rounded-md">
                        <div className="flex items-center space-x-3 mb-2">
                          <div 
                            className="w-8 h-8 rounded-md flex items-center justify-center" 
                            style={{ backgroundColor: selectedItem.color }}
                          >
                            <Package className="h-4 w-4 text-white" />
                          </div>
                          <div className="font-medium">{selectedItem.label}</div>
                        </div>
                        
                        {selectedItem.quantity !== undefined && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">Cantidad</Label>
                              <div className="font-medium">{selectedItem.quantity}</div>
                            </div>
                            {selectedItem.maxQuantity !== undefined && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Máximo</Label>
                                <div className="font-medium">{selectedItem.maxQuantity}</div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-3">
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full rounded-full" 
                              style={{
                                width: `${selectedItem.maxQuantity ? (selectedItem.quantity! / selectedItem.maxQuantity! * 100) : 0}%`,
                                backgroundColor: selectedItem.color
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0</span>
                            <span>{selectedItem.maxQuantity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={copyItem}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={duplicateItem}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Duplicar
                    </Button>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => removeItem(selectedItem.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Settings className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Selecciona un elemento para ver sus propiedades</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}