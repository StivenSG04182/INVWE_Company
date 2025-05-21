import SubaccountProductForm from '@/components/inventory/SubaccountProductForm'
import BlurPage from '@/components/global/blur-page'
import React from 'react'

type Props = {
    params: { subaccountId: string }
}

const NewProductPage = async ({ params }: Props) => {
    const subaccountId = params.subaccountId

    return (
        <BlurPage>
            <SubaccountProductForm
                subaccountId={subaccountId}
                product={{
                    name: '',
                    sku: '',
                    price: 0
                }}
            />
        </BlurPage>
    )
}

export default NewProductPage