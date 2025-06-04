"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TransactionsPanel } from "@/components/finance/transactions-panel"
import { ImprovedInvoicesPanel } from "@/components/finance/improved-invoices-panel"
import { NotesPanel } from "@/components/finance/notes-panel"
import { PaymentsPanel } from "@/components/finance/payments-panel"
import { useSearchParams, useRouter } from "next/navigation"
import { TrendingUp, FileText, CreditCard, Receipt, DollarSign, CheckCircle, Clock } from "lucide-react"

export const UnifiedFinanceDashboard = ({ agencyId }: { agencyId: string }) => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const defaultTab = searchParams.get("tab") || "invoices"

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        params.set("tab", value)
        router.push(`?${params.toString()}`, { scroll: false })
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión Financiera</h1>
                        <p className="text-muted-foreground mt-2">
                            Centro de control para facturación electrónica, pagos y transacciones conforme a la normativa DIAN
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            DIAN Habilitado
                        </Badge>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                            Facturación Electrónica
                        </Badge>
                    </div>
                </div>

                {/* Quick Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Facturación Hoy</p>
                                    <p className="text-2xl font-bold text-green-600">$2,450,000</p>
                                    <p className="text-xs text-muted-foreground">+12% vs ayer</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Facturas Pendientes</p>
                                    <p className="text-2xl font-bold text-amber-600">23</p>
                                    <p className="text-xs text-muted-foreground">$890,000 COP</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pagos Recibidos</p>
                                    <p className="text-2xl font-bold text-blue-600">$1,890,000</p>
                                    <p className="text-xs text-muted-foreground">15 transacciones</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <CreditCard className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Documentos DIAN</p>
                                    <p className="text-2xl font-bold text-purple-600">156</p>
                                    <p className="text-xs text-muted-foreground">Este mes</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue={defaultTab} onValueChange={handleTabChange} className="space-y-6">
                <div className="border-b">
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-2xl h-auto p-1">
                        <TabsTrigger value="invoices" className="flex items-center gap-2 py-3">
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Facturas</span>
                        </TabsTrigger>
                        <TabsTrigger value="transactions" className="flex items-center gap-2 py-3">
                            <TrendingUp className="h-4 w-4" />
                            <span className="hidden sm:inline">Transacciones</span>
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="flex items-center gap-2 py-3">
                            <CreditCard className="h-4 w-4" />
                            <span className="hidden sm:inline">Pagos</span>
                        </TabsTrigger>
                        <TabsTrigger value="notes" className="flex items-center gap-2 py-3">
                            <Receipt className="h-4 w-4" />
                            <span className="hidden sm:inline">Notas</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="invoices" className="space-y-6 mt-6">
                    <ImprovedInvoicesPanel agencyId={agencyId} />
                </TabsContent>

                <TabsContent value="transactions" className="space-y-6 mt-6">
                    <TransactionsPanel agencyId={agencyId} />
                </TabsContent>

                <TabsContent value="payments" className="space-y-6 mt-6">
                    <PaymentsPanel agencyId={agencyId} />
                </TabsContent>

                <TabsContent value="notes" className="space-y-6 mt-6">
                    <NotesPanel agencyId={agencyId} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
