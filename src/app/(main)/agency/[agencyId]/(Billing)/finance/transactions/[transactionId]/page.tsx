import { getAuthUserDetails } from "@/lib/queries"
import { db } from "@/lib/db"
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

    // Obtener la transacción con todas las relaciones
    const transaction = await db.sale.findUnique({
        where: {
            id: params.transactionId,
            agencyId: params.agencyId,
        },
        include: {
            Customer: true,
            Cashier: true,
            Area: true,
            Items: {
                include: {
                    Product: true,
                },
            },
            SubAccount: true,
        },
    })

    if (!transaction) {
        notFound()
    }

    return (
        <div className="container mx-auto py-6">
            <TransactionDetailView transaction={transaction} agencyId={params.agencyId} />
        </div>
    )
}
