"use client"

import { useEffect, useState } from 'react'
import { InvoiceItem } from '@/types/invoices'

interface Totals {
  subtotal: number
  taxTotal: number
  total: number
}

export function useInvoiceCalculations(items: InvoiceItem[]) {
  const [totals, setTotals] = useState<Totals>({
    subtotal: 0,
    taxTotal: 0,
    total: 0
  })

  useEffect(() => {
    const calculatedTotals = items.reduce((acc, item) => {
      const subtotal = item.quantity * item.unit_price
      const taxAmount = subtotal * (item.tax_rate / 100)

      return {
        subtotal: acc.subtotal + subtotal,
        taxTotal: acc.taxTotal + taxAmount,
        total: acc.total + subtotal + taxAmount
      }
    }, { subtotal: 0, taxTotal: 0, total: 0 })

    setTotals(calculatedTotals)
  }, [items])

  return totals
}