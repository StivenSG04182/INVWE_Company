import type React from "react"
import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package, Percent, Upload, Plus } from "lucide-react"

export default async function ProductsLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: { agencyId: string }
}) {
    const user = await getAuthUserDetails()
    if (!user) return redirect("/sign-in")

    const agencyId = params.agencyId
    if (!user.Agency) {
        return redirect("/agency")
    }

    return (
        <div>
            <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div className="flex items-center">
                    <Package className="h-6 w-6 mr-2" />
                    <h1 className="text-xl font-semibold">Gestión de Productos</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/agency/${agencyId}/products/discounts`}>
                            <Percent className="h-4 w-4 mr-2" />
                            Descuentos
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/agency/${agencyId}/products/bulk`}>
                            <Upload className="h-4 w-4 mr-2" />
                            Carga Masiva
                        </Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href={`/agency/${agencyId}/products/new`}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Producto
                        </Link>
                    </Button>
                </div>
            </div>
            {children}
        </div>
    )
}
