"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, User, CreditCard, Package } from "lucide-react"
import Link from "next/link"
import { TransactionActions } from "./transaction-actions"

interface TransactionDetailViewProps {
    transaction: any
    agencyId: string
}

export const TransactionDetailView = ({ transaction, agencyId }: TransactionDetailViewProps) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "bg-green-100 text-green-800 border-green-200"
            case "PENDING":
                return "bg-amber-100 text-amber-800 border-amber-200"
            case "CANCELLED":
                return "bg-red-100 text-red-800 border-red-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "Completada"
            case "PENDING":
                return "Pendiente"
            case "CANCELLED":
                return "Cancelada"
            default:
                return "Desconocido"
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/agency/${agencyId}/finance?tab=transactions`}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">
                            Transacción {transaction.reference || transaction.id.substring(0, 8)}
                        </h1>
                        <p className="text-muted-foreground">Detalles completos de la transacción de venta</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                        {getStatusText(transaction.status)}
                    </Badge>
                    <TransactionActions transaction={transaction} agencyId={agencyId} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Detalles de la transacción */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Información de la Transacción
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Referencia</p>
                                    <p className="font-medium">{transaction.reference || "No asignada"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Fecha de venta</p>
                                    <p className="font-medium">{new Date(transaction.saleDate).toLocaleDateString("es-CO")}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Área</p>
                                    <p className="font-medium">{transaction.Area?.name || "Área principal"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Cajero</p>
                                    <p className="font-medium">{transaction.Cashier?.name || "Sistema"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items de la venta */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Productos Vendidos</CardTitle>
                            <CardDescription>Detalle de los productos incluidos en esta transacción</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {transaction.Items && transaction.Items.length > 0 ? (
                                    <>
                                        {transaction.Items.map((item: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{item.Product?.name || "Producto"}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Cantidad: {item.quantity} × ${Number(item.unitPrice).toLocaleString("es-CO")}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">${Number(item.total).toLocaleString("es-CO")}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <Separator />
                                        <div className="flex justify-between items-center font-medium text-lg">
                                            <span>Total</span>
                                            <span>${Number(transaction.total).toLocaleString("es-CO")} COP</span>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">
                                        No hay productos registrados en esta transacción
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Información del cliente */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Información del Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {transaction.Customer ? (
                                <>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                                        <p className="font-medium">{transaction.Customer.name}</p>
                                    </div>
                                    {transaction.Customer.email && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                                            <p className="font-medium">{transaction.Customer.email}</p>
                                        </div>
                                    )}
                                    {transaction.Customer.phone && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                                            <p className="font-medium">{transaction.Customer.phone}</p>
                                        </div>
                                    )}
                                    {transaction.Customer.address && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                                            <p className="font-medium">{transaction.Customer.address}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-muted-foreground">Cliente general</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Resumen financiero */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Resumen Financiero
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${Number(transaction.subtotal || transaction.total).toLocaleString("es-CO")}</span>
                                </div>
                                {transaction.tax && Number(transaction.tax) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Impuestos</span>
                                        <span>${Number(transaction.tax).toLocaleString("es-CO")}</span>
                                    </div>
                                )}
                                {transaction.discount && Number(transaction.discount) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Descuento</span>
                                        <span>-${Number(transaction.discount).toLocaleString("es-CO")}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between font-medium text-lg">
                                    <span>Total</span>
                                    <span>${Number(transaction.total).toLocaleString("es-CO")} COP</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información adicional */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Información Adicional
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Fecha de creación</p>
                                <p className="font-medium">{new Date(transaction.createdAt).toLocaleString("es-CO")}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Última actualización</p>
                                <p className="font-medium">{new Date(transaction.updatedAt).toLocaleString("es-CO")}</p>
                            </div>
                            {transaction.SubAccount && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tienda</p>
                                    <p className="font-medium">{transaction.SubAccount.name}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
