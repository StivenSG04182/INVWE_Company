"use client"

import { Suspense, useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { 
  getProducts, 
  getMovements, 
  getAreas, 
  getCategories,
  getClients,
  getAgencyDetails
} from "@/lib/queries2"
import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Box,
  DollarSign,
  Package,
  Repeat,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  ShoppingCart,
  Warehouse,
  Filter,
  Search,
  Download,
  RefreshCw,
  Target,
  Clock,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  LineChart,
  Line,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  Tooltip,
} from "recharts"

// Componentes del dashboard

const DashboardSkeleton = () => (
  <div className="space-y-6 p-4 sm:p-6">
    <Skeleton className="h-16 sm:h-20 w-full" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-28 sm:h-32 w-full" />
      ))}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Skeleton className="h-80 sm:h-96 w-full" />
      <Skeleton className="h-80 sm:h-96 w-full" />
    </div>
  </div>
)

// Componente de filtros
const FilterSection = ({ filters, onFiltersChange }) => (
  <motion.div
    className="bg-white dark:bg-gray-900 rounded-lg border p-4 sm:p-6 shadow-sm"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <h3 className="font-semibold">Filtros</h3>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onFiltersChange({ periodo: "30d", categoria: "todas", area: "todas", busqueda: "" })}
        className="sm:ml-auto"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Limpiar
      </Button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label htmlFor="periodo">Período</Label>
        <Select value={filters.periodo} onValueChange={(value) => onFiltersChange({ ...filters, periodo: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 días</SelectItem>
            <SelectItem value="30d">Últimos 30 días</SelectItem>
            <SelectItem value="90d">Últimos 3 meses</SelectItem>
            <SelectItem value="1y">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoria">Categoría</Label>
        <Select value={filters.categoria} onValueChange={(value) => onFiltersChange({ ...filters, categoria: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="electronicos">Electrónicos</SelectItem>
            <SelectItem value="ropa">Ropa</SelectItem>
            <SelectItem value="hogar">Hogar</SelectItem>
            <SelectItem value="deportes">Deportes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="area">Área</Label>
        <Select value={filters.area} onValueChange={(value) => onFiltersChange({ ...filters, area: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Todas las áreas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="almacen-a">Almacén A</SelectItem>
            <SelectItem value="almacen-b">Almacén B</SelectItem>
            <SelectItem value="tienda-1">Tienda 1</SelectItem>
            <SelectItem value="tienda-2">Tienda 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="busqueda">Buscar</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="busqueda"
            placeholder="Buscar productos..."
            value={filters.busqueda}
            onChange={(e) => onFiltersChange({ ...filters, busqueda: e.target.value })}
            className="pl-8"
          />
        </div>
      </div>
    </div>
  </motion.div>
)

// Componente de tarjeta de estadística responsive
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="w-full"
  >
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 h-full">
      <div
        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
          color === "blue"
            ? "from-blue-500 to-blue-600"
            : color === "green"
              ? "from-green-500 to-green-600"
              : color === "red"
                ? "from-red-500 to-red-600"
                : "from-purple-500 to-purple-600"
        }`}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate pr-2">{title}</CardTitle>
        <div
          className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
            color === "blue"
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
              : color === "green"
                ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                : color === "red"
                  ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                  : "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
          }`}
        >
          <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xl sm:text-2xl font-bold mb-2 truncate">{value}</div>
        {trend && (
          <div className="flex items-center text-xs sm:text-sm">
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1 flex-shrink-0" />
            ) : (
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mr-1 flex-shrink-0" />
            )}
            <span className={`${trend === "up" ? "text-green-600" : "text-red-600"} font-medium`}>{trendValue}%</span>
            <span className="text-muted-foreground ml-1 hidden sm:inline">vs mes anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
)

// Componente principal del dashboard
export default function InventoryDashboard({ params }: { params: { subaccountId: string } }) {
  const [filters, setFilters] = useState({
    periodo: "30d",
    categoria: "todas",
    area: "todas",
    busqueda: "",
  })

  // Estados para datos reales
  const [products, setProducts] = useState<any[]>([])
  const [movements, setMovements] = useState<any[]>([])
  const [areas, setAreas] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [agencyDetails, setAgencyDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Cargar datos reales
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        
        // Obtener datos de la agencia para el subaccount
        const agencyData = await getAgencyDetails(params.subaccountId)
        if (agencyData) {
          setAgencyDetails(agencyData)
          
          // Cargar todos los datos en paralelo
          const [productsData, movementsData, areasData, categoriesData, clientsData] = await Promise.all([
            getProducts(agencyData.id, params.subaccountId),
            getMovements(agencyData.id, params.subaccountId),
            getAreas(agencyData.id, params.subaccountId),
            getCategories(agencyData.id),
            getClients(agencyData.id, params.subaccountId)
          ])

          setProducts(productsData)
          setMovements(movementsData)
          setAreas(areasData)
          setCategories(categoriesData)
          setClients(clientsData)
        }
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [params.subaccountId])

  // Datos calculados en tiempo real
  const dashboardData = useMemo(() => {
    if (!products.length) return {
      totalProducts: 0,
      activeProducts: 0,
      lowStockProducts: 0,
      inventoryValue: 0,
    }

    const activeProducts = products.filter(p => p.active).length
    const lowStockProducts = products.filter(p => p.quantity <= (p.minStock || 0)).length
    const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0)

    return {
      totalProducts: products.length,
      activeProducts,
      lowStockProducts,
      inventoryValue,
    }
  }, [products])

  // Datos para gráficos calculados en tiempo real
  const chartData = useMemo(() => {
    if (!products.length || !movements.length) return {
      inventoryData: [],
      categoryData: [],
      movementTrendData: [],
      performanceData: [],
      heatmapData: [],
      topProductsData: []
    }

    // Datos de inventario por mes (últimos 6 meses)
    const now = new Date()
    const inventoryData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' })
      
      // Calcular productos y valor para este mes
      const productsInMonth = products.length // Simplificado
      const valueInMonth = products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
      
      return {
        name: monthName,
        productos: productsInMonth,
        valor: valueInMonth,
        entradas: Math.floor(Math.random() * 20) + 10, // Temporal
        salidas: Math.floor(Math.random() * 15) + 8,   // Temporal
        rotacion: Math.random() * 3 + 1.5,             // Temporal
      }
    }).reverse()

    // Datos por categoría
    const categoryCounts = {}
    products.forEach(product => {
      const categoryName = product.Category?.name || 'Sin categoría'
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1
    })

    const categoryData = Object.entries(categoryCounts).map(([name, count], index) => ({
      name,
      value: Math.round(((count as number) / products.length) * 100),
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5],
      productos: count as number
    }))

    // Datos de movimientos por día de la semana
    const movementTrendData = [
      { name: "Lun", entradas: 0, salidas: 0, transferencias: 0 },
      { name: "Mar", entradas: 0, salidas: 0, transferencias: 0 },
      { name: "Mié", entradas: 0, salidas: 0, transferencias: 0 },
      { name: "Jue", entradas: 0, salidas: 0, transferencias: 0 },
      { name: "Vie", entradas: 0, salidas: 0, transferencias: 0 },
      { name: "Sáb", entradas: 0, salidas: 0, transferencias: 0 },
      { name: "Dom", entradas: 0, salidas: 0, transferencias: 0 },
    ]

    // Contar movimientos por día
    movements.forEach(movement => {
      const day = new Date(movement.date).getDay()
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
      const dayIndex = dayNames.indexOf(dayNames[day])
      
      if (dayIndex >= 0) {
        if (movement.type === 'entrada') movementTrendData[dayIndex].entradas++
        else if (movement.type === 'salida') movementTrendData[dayIndex].salidas++
        else if (movement.type === 'transferencia') movementTrendData[dayIndex].transferencias++
      }
    })

    // Datos de rendimiento por área
    const performanceData = areas.map(area => ({
      area: area.name,
      eficiencia: Math.floor(Math.random() * 20) + 80, // Temporal
      capacidad: Math.floor(Math.random() * 30) + 70,  // Temporal
      utilizacion: Math.floor(Math.random() * 25) + 65, // Temporal
    }))

    // Top productos por rotación
    const topProductsData = products
      .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
      .slice(0, 5)
      .map(product => ({
        name: product.name,
        ventas: Math.floor(Math.random() * 100) + 20, // Temporal
        stock: product.quantity || 0,
        rotacion: Math.floor(Math.random() * 30) + 70, // Temporal
      }))

    // Datos de actividad por hora (simplificado)
    const heatmapData = [
      { hora: "08:00", lunes: 12, martes: 15, miercoles: 8, jueves: 18, viernes: 22, sabado: 6, domingo: 3 },
      { hora: "10:00", lunes: 18, martes: 22, miercoles: 14, jueves: 25, viernes: 28, sabado: 12, domingo: 8 },
      { hora: "12:00", lunes: 25, martes: 28, miercoles: 22, jueves: 32, viernes: 35, sabado: 18, domingo: 12 },
      { hora: "14:00", lunes: 22, martes: 25, miercoles: 18, jueves: 28, viernes: 32, sabado: 15, domingo: 10 },
      { hora: "16:00", lunes: 15, martes: 18, miercoles: 12, jueves: 22, viernes: 25, sabado: 10, domingo: 6 },
      { hora: "18:00", lunes: 8, martes: 12, miercoles: 6, jueves: 15, viernes: 18, sabado: 5, domingo: 3 },
    ]

    return {
      inventoryData,
      categoryData,
      movementTrendData,
      performanceData,
      heatmapData,
      topProductsData
    }
  }, [products, movements, areas])

  const { totalProducts, activeProducts, lowStockProducts, inventoryValue } = dashboardData
  const { inventoryData, categoryData, movementTrendData, performanceData, heatmapData, topProductsData } = chartData

  // Mostrar skeleton mientras carga
  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 max-w-[1600px] mx-auto">
        {/* Header mejorado y responsive */}
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Dashboard de Inventario
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                Gestiona tu inventario y monitorea el rendimiento en tiempo real
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="px-2 sm:px-3 py-1">
                <Activity className="h-3 w-3 mr-1" />
                En línea
              </Badge>
              <Badge variant="secondary" className="px-2 sm:px-3 py-1 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Última actualización: </span>hace 2 min
              </Badge>
              <Button size="sm" variant="outline" className="hidden sm:flex bg-transparent">
                <Download className="h-3 w-3 mr-1" />
                Exportar
              </Button>
            </div>
          </div>
          <Separator />
        </motion.div>

        {/* Sección de filtros */}
        <FilterSection filters={filters} onFiltersChange={setFilters} />

        {/* Tarjetas de estadísticas responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total de Productos"
            value={totalProducts.toLocaleString()}
            icon={Package}
            trend="up"
            trendValue="12.5"
            color="blue"
            delay={0.1}
          />
          <StatCard
            title="Productos Activos"
            value={activeProducts.toLocaleString()}
            icon={Box}
            trend="up"
            trendValue="8.2"
            color="green"
            delay={0.2}
          />
          <StatCard
            title="Stock Bajo"
            value={lowStockProducts.toLocaleString()}
            icon={AlertCircle}
            trend="down"
            trendValue="15.3"
            color="red"
            delay={0.3}
          />
          <StatCard
            title="Valor de Inventario"
            value={`$${inventoryValue.toLocaleString()}`}
            icon={DollarSign}
            trend="up"
            trendValue="22.1"
            color="purple"
            delay={0.4}
          />
        </div>

        {/* Gráficos principales - Grid responsive */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Gráfico de tendencia de inventario */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="w-full"
          >
            <Card className="border-0 shadow-lg h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Tendencia de Inventario
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Evolución del inventario en los últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-full h-[250px] sm:h-[300px]">
                  <ChartContainer
                    config={{
                      productos: {
                        label: "Productos",
                        color: "hsl(var(--chart-1))",
                      },
                      valor: {
                        label: "Valor ($)",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="w-full h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={inventoryData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="productos"
                          stroke="hsl(var(--chart-1))"
                          fill="hsl(var(--chart-1))"
                          fillOpacity={0.3}
                        />
                        <Line
                          type="monotone"
                          dataKey="rotacion"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gráfico de distribución por categorías */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="w-full"
          >
            <Card className="border-0 shadow-lg h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Warehouse className="h-4 w-4 sm:h-5 sm:w-5" />
                  Distribución por Categorías
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Porcentaje de productos por categoría
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-full h-[250px] sm:h-[300px]">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Porcentaje",
                      },
                    }}
                    className="w-full h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {categoryData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {item.name} ({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Nuevos gráficos adicionales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Gráfico de rendimiento por área */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="w-full"
          >
            <Card className="border-0 shadow-lg h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                  Rendimiento por Área
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Eficiencia y utilización por ubicación
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-full h-[250px] sm:h-[300px]">
                  <ChartContainer
                    config={{
                      eficiencia: {
                        label: "Eficiencia (%)",
                        color: "hsl(var(--chart-1))",
                      },
                      utilizacion: {
                        label: "Utilización (%)",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="w-full h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="area" fontSize={10} angle={-45} textAnchor="end" height={60} />
                        <YAxis fontSize={12} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="eficiencia" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="utilizacion" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top productos con gráfico radial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="w-full"
          >
            <Card className="border-0 shadow-lg h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  Top Productos
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Productos con mayor rotación</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-full h-[250px] sm:h-[300px]">
                  <ChartContainer
                    config={{
                      rotacion: {
                        label: "Rotación (%)",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="w-full h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart data={topProductsData} innerRadius="20%" outerRadius="80%">
                        <RadialBar dataKey="rotacion" fill="hsl(var(--chart-1))" />
                        <Tooltip content={<ChartTooltipContent />} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {topProductsData.slice(0, 3).map((product, index) => (
                    <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="truncate pr-2">{product.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {product.rotacion}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gráfico de movimientos por hora */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="w-full lg:col-span-2 xl:col-span-1"
          >
            <Card className="border-0 shadow-lg h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  Actividad por Hora
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Movimientos durante el día</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-full h-[250px] sm:h-[300px]">
                  <ChartContainer
                    config={{
                      lunes: { label: "Lun", color: "#3b82f6" },
                      martes: { label: "Mar", color: "#10b981" },
                      miercoles: { label: "Mié", color: "#f59e0b" },
                      jueves: { label: "Jue", color: "#ef4444" },
                      viernes: { label: "Vie", color: "#8b5cf6" },
                      sabado: { label: "Sáb", color: "#06b6d4" },
                      domingo: { label: "Dom", color: "#84cc16" },
                    }}
                    className="w-full h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={heatmapData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hora" fontSize={10} />
                        <YAxis fontSize={12} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="lunes" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="viernes" stroke="#8b5cf6" strokeWidth={2} />
                        <Line type="monotone" dataKey="sabado" stroke="#06b6d4" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sección inferior con movimientos y accesos rápidos - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Movimientos recientes mejorados */}
          <motion.div
            className="lg:col-span-2 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Card className="border-0 shadow-lg h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                  Movimientos Recientes
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Últimas transacciones de inventario</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[300px] sm:h-[400px] pr-2 sm:pr-4">
                  {movements && movements.length > 0 ? (
                    <div className="space-y-3">
                      {movements.slice(0, 10).map((movement, index) => (
                        <motion.div
                          key={movement.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-xl border bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-md gap-3 sm:gap-4"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            <div
                              className={`p-2 rounded-lg flex-shrink-0 ${
                                movement.type === "entrada"
                                  ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                                  : movement.type === "salida"
                                    ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                                    : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                              }`}
                            >
                              {movement.type === "entrada" ? (
                                <ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                              ) : movement.type === "salida" ? (
                                <ArrowDownCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                              ) : (
                                <Repeat className="h-4 w-4 sm:h-5 sm:w-5" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm sm:text-base truncate">
                                {movement.Product?.name || 'Producto desconocido'}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {movement.type === "entrada"
                                  ? "Entrada"
                                  : movement.type === "salida"
                                    ? "Salida"
                                    : "Transferencia"}
                                {" • "}
                                <span className="truncate">{movement.Area?.name || 'Área desconocida'}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-right gap-2 sm:gap-1">
                            <div>
                              <p className="font-medium text-sm sm:text-base">{movement.quantity} unidades</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {movement.Product?.price ? `$${(Number(movement.Product.price) * movement.quantity).toLocaleString()}` : 'N/A'}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(movement.date).toLocaleDateString("es-CO", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[250px] sm:h-[300px] text-muted-foreground">
                      <Repeat className="h-8 w-8 sm:h-12 sm:w-12 mb-4 opacity-50" />
                      <p className="text-sm sm:text-base">No hay movimientos recientes</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Accesos rápidos mejorados y responsive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="w-full"
          >
            <Card className="border-0 shadow-lg h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                  Accesos Rápidos
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Funciones principales del sistema</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start h-10 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-sm sm:text-base"
                    size="lg"
                  >
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    Gestionar Productos
                  </Button>
                  <Button
                    className="w-full justify-start h-10 sm:h-12 bg-transparent text-sm sm:text-base"
                    variant="outline"
                    size="lg"
                  >
                    <Box className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    Nuevo Producto
                  </Button>
                  <Button
                    className="w-full justify-start h-10 sm:h-12 bg-transparent text-sm sm:text-base"
                    variant="outline"
                    size="lg"
                  >
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    Ver Reportes
                  </Button>
                  <Button
                    className="w-full justify-start h-10 sm:h-12 bg-transparent text-sm sm:text-base"
                    variant="outline"
                    size="lg"
                  >
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    Gestionar Usuarios
                  </Button>
                </div>

                <Separator className="my-4" />

                {/* Gráfico de movimientos semanales responsive */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-3">Movimientos Esta Semana</h4>
                  <div className="w-full h-[150px] sm:h-[200px]">
                    <ChartContainer
                      config={{
                        entradas: {
                          label: "Entradas",
                          color: "hsl(var(--chart-1))",
                        },
                        salidas: {
                          label: "Salidas",
                          color: "hsl(var(--chart-2))",
                        },
                        transferencias: {
                          label: "Transferencias",
                          color: "hsl(var(--chart-3))",
                        },
                      }}
                      className="w-full h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={movementTrendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" fontSize={10} />
                          <YAxis fontSize={10} />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="entradas" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="salidas" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="transferencias" fill="hsl(var(--chart-3))" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
