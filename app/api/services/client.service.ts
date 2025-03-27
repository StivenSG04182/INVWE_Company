import { BaseService } from './base'
import { Client } from '@/types/entities'

export class ClientService extends BaseService {
  async create(data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
    const { data: client, error } = await this.supabase
      .from('clients')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return client
  }

  async update(id: string, data: Partial<Client>) {
    const { data: client, error } = await this.supabase
      .from('clients')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return client
  }

  async getByCompany(companyId: string) {
    const { data, error } = await this.supabase
      .from('clients')
      .select()
      .eq('company_id', companyId)
      .order('business_name')

    if (error) throw error
    return data
  }

  async validateTaxId(taxId: string): Promise<boolean> {
    // Implementar validación con API de la DIAN
    throw new Error('Método no implementado')
  }
}