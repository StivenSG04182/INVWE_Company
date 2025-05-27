import React from 'react'
import { Agency } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

type Props = {
  agencyDetails: Agency
}

const BillingForm = ({ agencyDetails }: Props) => {
  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Información de Facturación</CardTitle>
        <CardDescription>
          Detalles de facturación para tu agencia
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre de la Empresa</Label>
            <Input 
              id="name" 
              value={agencyDetails.name} 
              disabled 
              className="bg-muted"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email de la Empresa</Label>
            <Input 
              id="email" 
              value={agencyDetails.companyEmail} 
              disabled 
              className="bg-muted"
            />
          </div>
        </div>
        <Separator />
        <div className="flex justify-end">
          <Button variant="outline">Actualizar Información</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default BillingForm 