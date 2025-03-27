import { BaseService } from './base'
import { Invoice, InvoiceItem } from '@/types/entities'
import { DianService } from '../dian/services'
import { DianDocument } from '../dian/types'

export class InvoiceService extends BaseService {
  private dianService: DianService

  constructor(dianService: DianService) {
    super()
    this.dianService = dianService
  }

  async create(data: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'status' | 'cufe' | 'xml_document' | 'pdf_document'>) {
    const { data: invoice, error } = await this.supabase
      .from('invoices')
      .insert({
        ...data,
        status: 'draft'
      })
      .select()
      .single()

    if (error) throw error
    return invoice
  }

  async update(id: string, data: Partial<Invoice>) {
    const { data: invoice, error } = await this.supabase
      .from('invoices')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return invoice
  }

  async addItems(invoiceId: string, items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[]) {
    const { data, error } = await this.supabase
      .from('invoice_items')
      .insert(items.map(item => ({ ...item, invoice_id: invoiceId })))
      .select()

    if (error) throw error
    return data
  }

  async send(id: string): Promise<Invoice> {
    const { data: invoice, error } = await this.supabase
      .from('invoices')
      .select('*, company:companies(*), client:clients(*), items:invoice_items(*)')
      .eq('id', id)
      .single()

    if (error) throw error

    // Convertir a formato DIAN
    const dianDocument = this.toDianDocument(invoice)
    
    // Generar CUFE
    const cufe = await this.dianService.generateCUFE(dianDocument)
    
    // Generar XML
    const xml = await this.dianService.generateXML(dianDocument)
    
    // Firmar XML
    const signedXml = await this.dianService.signXML(xml, invoice.company.certificate)
    
    // Enviar a DIAN
    const response = await this.dianService.sendDocument(signedXml)
    
    if (!response.success) {
      throw new Error(response.message)
    }

    // Generar PDF
    const pdf = await this.dianService.generatePDF(dianDocument)

    // Actualizar factura
    return this.update(id, {
      status: 'pending',
      cufe,
      xml_document: signedXml,
      pdf_document: pdf.toString('base64')
    })
  }

  private toDianDocument(invoice: any): DianDocument {
    // Implementar la conversión del modelo de datos interno al formato DIAN
    throw new Error('Método no implementado')
  }
}