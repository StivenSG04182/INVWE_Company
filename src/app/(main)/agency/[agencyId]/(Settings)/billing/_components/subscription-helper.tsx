'use client'
import SubscriptionFormWrapper from '@/components/forms/subscription-form/subscription-form-wrapper'
import CustomModal from '@/components/global/custom-modal'
import { useModal } from '@/providers/modal-provider'
import { useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'

type Props = {
  prices: any[]
  customerId: string
  planExists: boolean
}

const SubscriptionHelper = ({ customerId, planExists, prices }: Props) => {
  const { setOpen } = useModal()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')

  useEffect(() => {
    if (plan)
      setOpen(
        <CustomModal
          title="Actualiza tu plan!"
          subheading="Suscribete ahora para tener acceso a las opciones premium!"
        >
          <SubscriptionFormWrapper
            planExists={planExists}
            customerId={customerId}
          />
        </CustomModal>,
        async () => ({
          plans: {
            defaultPriceId: plan ? plan : '',
            plans: prices,
          },
        })
      )
  }, [plan])

  return <div>Ayudante de suscripción</div>
}

export default SubscriptionHelper