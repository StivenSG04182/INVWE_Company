"use client"

import { Card } from '@/components/ui/card'

interface InvoicePreviewProps {
  data: any;
  loading: boolean;
  company: {
    name?: string;
    nit?: string;
    phone?: string;
    address?: string;
  };
  params?: {
    companyName?: string;
  };
}

export default function invoicePreviewPage({ data, loading, company, params }: InvoicePreviewProps) {
  const companyName = typeof params?.companyName === "string" ? params.companyName : "";

  return (
    <Card className="p-4 border-t-2 border-b-2 border-solid border-gray-500">
      <h3 className="text-lg font-semibold mb-4">Vista Previa</h3>
      <div className="border rounded-lg p-4 bg-white">
        {companyName && (
          <p className="font-semibold text-gray-900">
            Nombre de la empresa: {companyName}
          </p>
        )}
        <span className="font-semibold text-gray-900">
          {loading ? "Loading..." : company?.name || "Company Name"}
        </span>
        <span className="font-semibold text-gray-900">
          {loading ? "Loading..." : company?.nit || "Company NIT"}
        </span>
        <span className="font-semibold text-gray-900">
          {loading ? "Loading..." : company?.phone || "Company Phone"}
        </span>
        <span className="font-semibold text-gray-900">
          {loading ? "Loading..." : company?.address || "Company Address"}
        </span>

        <h2 className="font-semibold text-gray-900 mt-4">RESPONSABLE DE IVA</h2>
        <h3 className="font-semibold text-gray-900">Autorretenedor de ICA</h3>
        <h4 className="text-lg font-semibold mt-4 mb-2">Items</h4>

        <pre className="text-xs overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </Card>
  )
}
