export const dynamic = "force-dynamic";
import { getAuthUserDetails } from "@/lib/queries"
import { getTransactionById } from "@/lib/client-queries"
import { notFound, redirect } from "next/navigation"
import { TransactionDetailView } from "@/components/finance/transaction-detail-view"

interface TransactionDetailPageProps {
    params: {
        domain: string
        agencyId: string
        transactionId: string
    }
}

export default async function TransactionDetailPage({ params }: TransactionDetailPageProps) {
    const user = await getAuthUserDetails()
    if (!user) {
        return redirect("/sign-in")
    }

    // Verificar acceso a la agencia
    const hasAccess =
        user.Agency?.id === params.agencyId || user.Agency?.SubAccount?.some((sa) => sa.agencyId === params.agencyId)

    if (!hasAccess) {
        return redirect("/unauthorized")
    }

    // Obtener la transacción usando la función de client-queries
    const transaction = await getTransactionById(params.agencyId, params.transactionId)

    if (!transaction) {
        notFound()
    }

    return (
        <div className="container mx-auto py-6">
            <TransactionDetailView transaction={transaction} agencyId={params.agencyId} />
        </div>
    )
}
