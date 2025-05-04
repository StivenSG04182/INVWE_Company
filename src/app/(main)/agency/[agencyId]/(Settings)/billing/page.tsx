import React from 'react'
import { paypal } from '@/lib/paypal'
import { addOnProducts, pricingCards } from '@/lib/constants'
import { db } from '@/lib/db'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import clsx from 'clsx'
import PricingCard from './_components/pricing-card'
import SubscriptionHelper from './_components/subscription-helper'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAgencyDetails } from '@/lib/queries'
import BillingForm from './components/billing-form'

type Props = {
  params: { agencyId: string }
}

const page = async ({ params }: Props) => {
  const user = await currentUser()
  if (!user) return redirect('/')

  const agencyDetails = await getAgencyDetails(params.agencyId)

  if (!agencyDetails) return redirect('/')

  // Obtener los planes de PayPal
  const paypalPlans = await paypal.listPlans()
  
  // Obtener los add-ons (planes adicionales)
  const addOns = paypalPlans.plans?.filter(plan => 
    addOnProducts.some(addOn => addOn.id === plan.id)
  ) || []

  const agencySubscription = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    select: {
      customerId: true,
      Subscription: true,
    },
  })

  // Obtener los planes disponibles
  const prices = paypalPlans.plans?.filter(plan => 
    pricingCards.some(card => card.priceId === plan.id)
  ) || []

  const currentPlanDetails = pricingCards.find(
    (c) => c.priceId === agencySubscription?.Subscription?.priceId
  )

  // Obtener el historial de transacciones si hay una suscripción activa
  let allCharges: any[] = []
  if (agencySubscription?.Subscription?.subscritiptionId) {
    const transactions = await paypal.listTransactions(agencySubscription.Subscription.subscritiptionId)
    
    allCharges = transactions.transactions?.map((transaction: any) => ({
      description: transaction.description || 'Suscripción',
      id: transaction.id,
      date: `${new Date(transaction.create_time).toLocaleTimeString()} ${new Date(
        transaction.create_time
      ).toLocaleDateString()}`,
      status: transaction.status,
      amount: `$${transaction.amount_with_breakdown.gross_amount.value}`,
    })) || []
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <BillingForm agencyDetails={agencyDetails} />
      <SubscriptionHelper
        prices={prices}
        customerId={agencySubscription?.customerId || ''}
        planExists={agencySubscription?.Subscription?.active === true}
      />
      <h1 className="text-4xl p-4">Billing</h1>
      <Separator className=" mb-6" />
      <h2 className="text-2xl p-4">Current Plan</h2>
      <div className="flex flex-col lg:!flex-row justify-between gap-8">
        <PricingCard
          planExists={agencySubscription?.Subscription?.active === true}
          prices={prices}
          customerId={agencySubscription?.customerId || ''}
          amt={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.price || '$0'
              : '$0'
          }
          buttonCta={
            agencySubscription?.Subscription?.active === true
              ? 'Change Plan'
              : 'Get Started'
          }
          highlightDescription="Want to modify your plan? You can do this here. If you have
          further question contact support@invwe-app.com"
          highlightTitle="Plan Options"
          description={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.description || 'Lets get started'
              : 'Lets get started! Pick a plan that works best for you.'
          }
          duration="/ month"
          features={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.features || []
              : currentPlanDetails?.features ||
                pricingCards.find((pricing) => pricing.title === 'Starter')
                  ?.features ||
                []
          }
          title={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.title || 'Starter'
              : 'Starter'
          }
        />
        {addOns.map((addOn) => (
          <PricingCard
            planExists={agencySubscription?.Subscription?.active === true}
            prices={prices}
            customerId={agencySubscription?.customerId || ''}
            key={addOn.id}
            amt={
              addOn.billing_cycles?.[0]?.pricing_scheme?.fixed_price?.value
                ? `$${addOn.billing_cycles[0].pricing_scheme.fixed_price.value}`
                : '$0'
            }
            buttonCta="Subscribe"
            description="Dedicated support line & teams channel for support"
            duration="/ month"
            features={[]}
            title={'24/7 priority support'}
            highlightTitle="Get support now!"
            highlightDescription="Get priority support and skip the long long with the click of a button."
          />
        ))}
      </div>
      <h2 className="text-2xl p-4">Payment History</h2>
      <Table className="bg-card border-[1px] border-border rounded-md">
        <TableHeader className="rounded-md">
          <TableRow>
            <TableHead className="w-[200px]">Description</TableHead>
            <TableHead className="w-[200px]">Invoice Id</TableHead>
            <TableHead className="w-[300px]">Date</TableHead>
            <TableHead className="w-[200px]">Paid</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {allCharges.map((charge) => (
            <TableRow key={charge.id}>
              <TableCell>{charge.description}</TableCell>
              <TableCell className="text-muted-foreground">
                {charge.id}
              </TableCell>
              <TableCell>{charge.date}</TableCell>
              <TableCell>
                <p
                  className={clsx('', {
                    'text-emerald-500': charge.status.toLowerCase() === 'completed',
                    'text-orange-600':
                      charge.status.toLowerCase() === 'pending',
                    'text-red-600': charge.status.toLowerCase() === 'failed',
                  })}
                >
                  {charge.status.toUpperCase()}
                </p>
              </TableCell>
              <TableCell className="text-right">{charge.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default page