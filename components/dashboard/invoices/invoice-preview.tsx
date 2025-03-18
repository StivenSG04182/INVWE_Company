"use client"

import { Card } from '@/components/ui/card'

interface InvoicePreviewProps {
  data: any // TODO: Tipado correcto
}

export function InvoicePreview({ data }: InvoicePreviewProps) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Vista Previa</h3>
      <div className="border rounded-lg p-4 bg-white">
        <pre className="text-xs overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </Card>
  )
}