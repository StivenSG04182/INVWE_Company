import { getAuthUserDetails, getAgencyDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { PaymentForm } from "@/components/forms/payment-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const NewPaymentPage = async ({
    params,
    searchParams,
}: {
    params: { agencyId: string }
    searchParams: { invoiceId?: string }
}) => {
    const user = await getAuthUserDetails()
    if (!user) return redirect("/sign-in")

    const agencyId = params.agencyId
    if (!user.Agency) {
        return redirect("/agency")
    }

    // Obtener detalles de la agencia y subcuentas
    const agency = await getAgencyDetails(agencyId)
    if (!agency) return redirect("/agency")

    // Obtener facturas pendientes
    const invoices = await db.invoice.findMany({
        where: {
            agencyId: agencyId,
            status: {
                in: ["PENDING", "OVERDUE"],
            },
            ...(searchParams.invoiceId ? { id: searchParams.invoiceId } : {}),
        },
        include: {
            Customer: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    // Valores por defecto si se proporciona un ID de factura
    const defaultValues = searchParams.invoiceId
        ? {
            invoiceId: searchParams.invoiceId,
            subAccountId: invoices.find((inv) => inv.id === searchParams.invoiceId)?.subAccountId || undefined,
        }
        : {}

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex items-center">
                <Link href={`/agency/${agencyId}/finance?tab=payments`}>
                    <Button variant="ghost" className="flex items-center gap-2 px-0">
                        <ArrowLeft className="h-4 w-4" />
                        Volver a Pagos
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registrar Pago</CardTitle>
                    <CardDescription>
                        Registre un nuevo pago para una factura pendiente. Seleccione la subcuenta y la factura correspondiente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PaymentForm
                        agencyId={agencyId}
                        subAccounts={agency.SubAccount.map((sa) => ({ id: sa.id, name: sa.name }))}
                        invoices={invoices.map((inv) => ({
                            id: inv.id,
                            invoiceNumber: inv.invoiceNumber,
                            total: Number(inv.total),
                            status: inv.status,
                            customerName: inv.Customer?.name,
                        }))}
                        defaultValues={defaultValues}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default NewPaymentPage
