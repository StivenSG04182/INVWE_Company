/**
 * Tipos específicos para la integración con la DIAN
 */

export interface DianResponse {
  success: boolean
  message: string
  trackId?: string
  errors?: DianError[]
}

export interface DianError {
  code: string
  message: string
  detail?: string
}

export interface DianDocument {
  documentType: DianDocumentType
  documentNumber: string
  issueDate: string
  dueDate?: string
  supplier: DianParty
  customer: DianParty
  items: DianItem[]
  totals: DianTotals
  taxes: DianTax[]
}

export interface DianParty {
  taxId: string
  taxIdType: string
  name: string
  address: {
    line: string
    city: string
    department: string
    country: string
    postalCode?: string
  }
  email: string
  phone?: string
}

export interface DianItem {
  code: string
  description: string
  quantity: number
  unitMeasure: string
  unitPrice: number
  taxRate: number
  taxAmount: number
  subtotal: number
  total: number
}

export interface DianTotals {
  subtotal: number
  taxTotal: number
  total: number
  payableAmount: number
}

export interface DianTax {
  taxType: string
  taxableAmount: number
  taxAmount: number
  percent: number
}

export type DianDocumentType = 
  | 'invoice'
  | 'credit-note'
  | 'debit-note'
  | 'support-document'

// Nuevos tipos para la generación de CUFE y firma digital
export interface CUFEParams {
  invoiceNumber: string
  issueDate: string
  amount: number
  taxAmount: number
  totalAmount: number
  customerTaxId: string
  technicalKey: string
  softwarePin: string
}

export interface XMLSignParams {
  certificate: string
  privateKey: string
  password: string
  xmlContent: string
}