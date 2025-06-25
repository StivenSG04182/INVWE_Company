"use client"

import { useState, useEffect } from "react"
import Loading from "./loading"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, BarChart3, Users, ShoppingCart } from "lucide-react"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carga de 6 segundos
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 6000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">InventoryPro Dashboard</h1>
          <p className="text-slate-600 text-lg">Sistema de Gestión Inteligente - Carga Completada</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Package, title: "Productos", value: "1,234", color: "blue" },
            { icon: ShoppingCart, title: "Ventas Hoy", value: "$12,345", color: "green" },
            { icon: Users, title: "Personal", value: "24", color: "purple" },
            { icon: BarChart3, title: "Reportes", value: "156", color: "orange" },
          ].map(({ icon: Icon, title, value, color }, index) => (
            <Card key={title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
                <Icon className={`h-4 w-4 text-${color}-600`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button onClick={() => setIsLoading(true)} className="bg-blue-600 hover:bg-blue-700">
            Mostrar Loading Nuevamente
          </Button>
        </div>
      </div>
    </div>
  )
}
