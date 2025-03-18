"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/services/base'
import { Client } from '@/types/entities'

export function useClients(companyId: string) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadClients() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('company_id', companyId)
          .order('business_name')

        if (error) throw error
        setClients(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'))
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [companyId])

  return { clients, loading, error }
}