'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

type AnalyticsChartsProps = {
    monthlyData: Array<{
        name: string
        ventas: number
        tickets: number
    }>
    categoryData: Array<{
        name: string
        value: number
    }>
    topProducts: Array<{
        name: string
        ventas: number
    }>
}

export default function AnalyticsCharts({ monthlyData, categoryData, topProducts }: AnalyticsChartsProps) {
    // Colores para el gráfico de categorías
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

    return (
        <div className="mt-8">
            <Tabs defaultValue="ventas" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="ventas">Ventas</TabsTrigger>
                    <TabsTrigger value="tickets">Tickets</TabsTrigger>
                    <TabsTrigger value="categorias">Categorías</TabsTrigger>
                    <TabsTrigger value="productos">Productos</TabsTrigger>
                </TabsList>

                <TabsContent value="ventas">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rendimiento de Ventas</CardTitle>
                            <CardDescription>Visualización de ventas a lo largo del tiempo</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={monthlyData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="ventas" fill="#8884d8" name="Ventas ($)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tickets">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tickets por Mes</CardTitle>
                            <CardDescription>Número de tickets generados mensualmente</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={monthlyData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="tickets" fill="#82ca9d" name="Tickets" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="categorias">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ventas por Categoría</CardTitle>
                            <CardDescription>Distribución de ventas por categoría de producto</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="productos">
                    <Card>
                        <CardHeader>
                            <CardTitle>Productos Más Vendidos</CardTitle>
                            <CardDescription>Top 5 productos con mayor volumen de ventas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={topProducts}
                                        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis type="category" dataKey="name" />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="ventas" fill="#8884d8" name="Unidades vendidas" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}