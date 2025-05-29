"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionsPanel } from "@/components/finance/transactions-panel"
import { InvoicesPanel } from "@/components/finance/invoices-panel"
import { NotesPanel } from "@/components/finance/notes-panel"
import { PaymentsPanel } from "@/components/finance/payments-panel"
import { useSearchParams, useRouter } from "next/navigation"

export const UnifiedFinanceDashboard = ({ agencyId }: { agencyId: string }) => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const defaultTab = searchParams.get("tab") || "transactions"

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        params.set("tab", value)
        router.push(`?${params.toString()}`, { scroll: false })
    }

    return (
        <div className="space-y-6 p-4">
            <div className="flex flex-col space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Gestión Financiera</h1>
                <p className="text-muted-foreground">
                    Administre transacciones, facturas, pagos y notas de crédito/débito en un solo lugar.
                </p>
            </div>

            <Tabs defaultValue={defaultTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
                    <TabsTrigger value="transactions">Transacciones</TabsTrigger>
                    <TabsTrigger value="invoices">Facturas</TabsTrigger>
{/*                     <TabsTrigger value="payments">Pagos</TabsTrigger>
                    <TabsTrigger value="notes">Notas Crédito/Débito</TabsTrigger> */}
                </TabsList>

                <TabsContent value="transactions" className="space-y-4">
                    <TransactionsPanel agencyId={agencyId} />
                </TabsContent>

                <TabsContent value="invoices" className="space-y-4">
                    <InvoicesPanel agencyId={agencyId} />
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                    <PaymentsPanel agencyId={agencyId} />
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                    <NotesPanel agencyId={agencyId} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
