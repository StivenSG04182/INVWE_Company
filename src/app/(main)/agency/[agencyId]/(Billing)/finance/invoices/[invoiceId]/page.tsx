import { getAuthUserDetails } from "@/lib/queries"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { InvoiceDetailView } from "@/components/finance/invoice-detail-view"

interface InvoiceDetailPageProps {
    params: {
        domain: string
        agencyId: string
        invoiceId: string
    }
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
    const user = await getAuthUserDetails()
    if (!user) {
        return redirect("/sign-in")
    }
    const hasAccess =
        user.Agency?.id === params.agencyId || user.Agency?.SubAccount?.some((sa) => sa.agencyId === params.agencyId)

    if (!hasAccess) {
        return redirect("/unauthorized")
    }

    // Obtener la factura con todas las relaciones
    const invoice = await db.invoice.findUnique({
        where: {
            id: params.invoiceId,
            agencyId: params.agencyId,
        },
        include: {
            Customer: true,
            Items: {
                include: {
                    Product: true,
                },
            },
            Payments: true,
            Taxes: {
                include: {
                    Tax: true,
                },
            },
            SubAccount: true,
        },
    })

    if (!invoice) {
        notFound()
    }

    return (
        <div className="container mx-auto py-6">
            <InvoiceDetailView invoice={invoice} agencyId={params.agencyId} />
        </div>
    )
}
