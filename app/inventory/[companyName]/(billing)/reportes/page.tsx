"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download, BarChart, PieChart, TrendingUp } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

export default function ReportsPage() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        to: new Date(),
    });

    // Mock data - Replace with actual API call and data processing
    const monthlySales = [
        { month: "Enero", amount: 12500 },
        { month: "Febrero", amount: 15000 },
        { month: "Marzo", amount: 18200 },
        { month: "Abril", amount: 16800 },
        { month: "Mayo", amount: 21000 },
    ];

    const paymentMethods = [
        { method: "Tarjeta de Crédito", percentage: 45 },
        { method: "Efectivo", percentage: 30 },
        { method: "Transferencia", percentage: 20 },
        { method: "Otros", percentage: 5 },
    ];

    const topProducts = [
        { name: "Producto 1", sales: 120, revenue: 3600 },
        { name: "Producto 2", sales: 85, revenue: 2550 },
        { name: "Producto 3", sales: 65, revenue: 1950 },
        { name: "Producto 4", sales: 50, revenue: 1500 },
        { name: "Producto 5", sales: 45, revenue: 1350 },
    ];

    // Calculate total revenue
    const totalRevenue = monthlySales.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate average monthly revenue
    const avgMonthlyRevenue = totalRevenue / monthlySales.length;

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Reportes Financieros"
                        description="Análisis y estadísticas de ventas e ingresos"
                    />
                    <Button size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Reporte
                    </Button>
                </div>
                <Separator />
                <div className="flex items-center gap-x-4">
                    <DatePickerWithRange
                        date={date}
                        setDate={setDate}
                    />
                </div>
                
                {/* Summary Cards */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Ingresos Totales
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat("es-CO", {
                                    style: "currency",
                                    currency: "COP",
                                    maximumFractionDigits: 0
                                }).format(totalRevenue)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +20.1% respecto al periodo anterior
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Promedio Mensual
                            </CardTitle>
                            <BarChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat("es-CO", {
                                    style: "currency",
                                    currency: "COP",
                                    maximumFractionDigits: 0
                                }).format(avgMonthlyRevenue)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Basado en los últimos 5 meses
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Método de Pago Principal
                            </CardTitle>
                            <PieChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {paymentMethods[0].method}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {paymentMethods[0].percentage}% de las transacciones
                            </p>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Top Products Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Productos Más Vendidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Unidades Vendidas</TableHead>
                                    <TableHead>Ingresos</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topProducts.map((product, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.sales}</TableCell>
                                        <TableCell>
                                            {new Intl.NumberFormat("es-CO", {
                                                style: "currency",
                                                currency: "COP",
                                                maximumFractionDigits: 0
                                            }).format(product.revenue)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                
                {/* Monthly Sales Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ventas Mensuales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mes</TableHead>
                                    <TableHead>Ingresos</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {monthlySales.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.month}</TableCell>
                                        <TableCell>
                                            {new Intl.NumberFormat("es-CO", {
                                                style: "currency",
                                                currency: "COP",
                                                maximumFractionDigits: 0
                                            }).format(item.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}