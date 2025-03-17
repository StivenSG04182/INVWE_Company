"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/services/base'
import { Product } from '@/types/entities'

export function useProducts(companyId: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('company_id', companyId)
          .order('name')

        if (error) throw error
        setProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'))
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [companyId])

  return { products, loading, error }
}