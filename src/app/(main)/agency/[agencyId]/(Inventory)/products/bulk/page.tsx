import BulkProductForm from '@/components/inventory/BulkProductForm'
import { getAuthUserDetails } from '@/lib/queries'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
    params: { agencyId: string }
}

const BulkProductsPage = async ({ params }: Props) => {
    const user = await getAuthUserDetails()
    if (!user) return redirect('/sign-in')

    const agencyId = params.agencyId
    if (!user.Agency) {
        return redirect('/agency')
    }

    return (
        <BulkProductForm
            agencyId={agencyId}
        />
    )
}

export default BulkProductsPage