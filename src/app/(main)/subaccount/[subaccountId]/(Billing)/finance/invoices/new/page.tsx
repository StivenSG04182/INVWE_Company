import { getAuthUserDetails, getAgencyDetails } from "@/lib/queries"
import { getClientsForPOS } from "@/lib/queries2"
import { redirect } from "next/navigation"
import { getActiveProductsForInvoicing, getTaxesForAgency, getDianConfigForAgency } from "@/lib/client-queries"
import { InvoiceForm } from "@/components/forms/invoice-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const NewInvoicePage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  if (!user.Agency) {
    return redirect("/agency")
  }

  // Obtener detalles de la agencia y tiendas
  const agency = await getAgencyDetails(agencyId)
  if (!agency) return redirect("/agency")

  // Obtener clientes utilizando la función getClientsForPOS que incluye datos fiscales
  const clients = await import('@/lib/queries2').then(module => 
    module.getClientsForPOS(agencyId)
  )
  
  // Mapear los clientes para usar en el formulario
  const customers = clients.map(client => ({
    id: client.id,
    name: client.name,
    email: client.email || undefined,
    phone: client.phone || undefined,
    address: client.address || undefined
  }))

  // Obtener productos con información de descuentos usando la función de client-queries
  const products = await getActiveProductsForInvoicing(agencyId)

  // Obtener impuestos usando la función de client-queries
  const taxes = await getTaxesForAgency(agencyId)
  
  // Verificar si la agencia tiene configuración DIAN para facturación electrónica
  const dianConfig = await getDianConfigForAgency(agencyId)

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center">
        <Link href={`/agency/${agencyId}/finance?tab=invoices`}>
          <Button variant="ghost" className="flex items-center gap-2 px-0">
            <ArrowLeft className="h-4 w-4" />
            Volver a Facturas
          </Button>
        </Link>
      </div>

      {!dianConfig && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Advertencia:</strong>
          <span className="block sm:inline"> No se ha configurado la facturación electrónica para esta agencia. Solo podrá generar facturas físicas.</span>
        </div>
      )}
      
      {dianConfig && clients.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Información:</strong>
          <span className="block sm:inline"> Para generar facturas electrónicas, debe seleccionar un cliente con datos fiscales completos.</span>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Nueva Factura</CardTitle>
          <CardDescription>
            Cree una nueva factura para un cliente. Seleccione la tienda, productos y servicios a facturar.
            {dianConfig && <span className="block mt-1 text-green-600">Facturación electrónica disponible.</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceForm
            agencyId={agencyId}
            subAccounts={[]}
            customers={customers.map((c) => ({
              id: c.id,
              name: c.name,
              email: c.email || undefined,
              phone: c.phone || undefined,
              address: c.address || undefined
            }))}
            products={products.map((p) => {
              // Verificar si el descuento está activo (dentro del rango de fechas)
              const now = new Date();
              const hasValidDiscount = p.discount && 
                (!p.discountStartDate || new Date(p.discountStartDate) <= now) && 
                (!p.discountEndDate || new Date(p.discountEndDate) >= now) &&
                (!p.discountMinimumPrice || Number(p.price) >= Number(p.discountMinimumPrice));
              
              return {
                id: p.id,
                name: p.name,
                price: Number(p.price),
                description: p.description || undefined,
                discount: hasValidDiscount ? Number(p.discount) : 0,
                hasDiscount: !!hasValidDiscount,
                originalPrice: Number(p.price),
              };
            })}
            taxes={taxes.map((t) => ({
              id: t.id,
              name: t.name,
              rate: Number(t.rate),
            }))}
            hasDianConfig={!!dianConfig}
            defaultValues={{
              invoiceType: dianConfig ? 'BOTH' : 'PHYSICAL',
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default NewInvoicePage
