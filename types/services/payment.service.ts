import { BaseService } from './base'
import { Payment, PaymentStatus } from '@/types/entities'

export class PaymentService extends BaseService {
  async create(data: Omit<Payment, 'id' | 'created_at' | 'status'>) {
    const { data: payment, error } = await this.supabase
      .from('payments')
      .insert({
        ...data,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return payment
  }

  async updateStatus(id: string, status: PaymentStatus) {
    const { data: payment, error } = await this.supabase
      .from('payments')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return payment
  }

  async getByInvoice(invoiceId: string) {
    const { data, error } = await this.supabase
      .from('payments')
      .select()
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async processPayment(id: string) {
    // Implementar procesamiento de pago con pasarela
    throw new Error('Método no implementado')
  }
}