import { getAuthUserDetails } from "@/lib/queries"
import { getInvoiceById } from "@/lib/client-queries"
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

    // Obtener la factura usando la función de client-queries
    const invoice = await getInvoiceById(params.agencyId, params.invoiceId)

    if (!invoice) {
        notFound()
    }

    return (
        <div className="container mx-auto py-6">
            <InvoiceDetailView invoice={invoice} agencyId={params.agencyId} />
        </div>
    )
}
