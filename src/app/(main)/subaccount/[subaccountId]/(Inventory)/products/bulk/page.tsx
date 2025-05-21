import SubaccountBulkProductForm from '@/components/inventory/SubaccountBulkProductForm'
import BlurPage from '@/components/global/blur-page'
import React from 'react'

type Props = {
    params: { subaccountId: string }
}

const BulkProductsPage = async ({ params }: Props) => {
    const subaccountId = params.subaccountId

    return (
        <BlurPage>
            <SubaccountBulkProductForm
                subaccountId={subaccountId}
            />
        </BlurPage>
    )
}

export default BulkProductsPage