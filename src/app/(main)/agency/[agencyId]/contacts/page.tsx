import BlurPage from '@/components/global/blur-page'
import { db } from '@/lib/db'
import { Contact, SubAccount, Ticket } from '@prisma/client'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import format from 'date-fns/format'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'

type Props = {
    params:{agencyId:string}
}

const ContactPage = async ({params}: Props) => {
  // Obtener todas las subcuentas de la agencia con sus contactos
  const subAccounts = await db.subAccount.findMany({
    where: {
      agencyId: params.agencyId,
    },
    include: {
      Contact: {
        include: {
          Ticket: {
            select: {
              value: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  // Aplanar todos los contactos de todas las subcuentas
  const allContacts = subAccounts.flatMap(subaccount => subaccount.Contact)
  
  const formatTotal = (tickets: Ticket[]) => {
    if (!tickets || !tickets.length) return '$0.00'
    const amt = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
    })

    const laneAmt = tickets.reduce(
      (sum, ticket) => sum + (Number(ticket?.value) || 0),
      0
    )

    return amt.format(laneAmt)
  }
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className='text-4xl'>Contactos</h1>
        <Button asChild>
          <Link href={`/agency/${params.agencyId}/contacts/new`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Contacto
          </Link>
        </Button>
      </div>
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Nombre</TableHead>
            <TableHead className="w-[300px]">Email</TableHead>
            <TableHead className="w-[200px]">Activo</TableHead>
            <TableHead>Fecha de Creación</TableHead>
            <TableHead className="text-right">Total Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {allContacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <Avatar>
                  <AvatarImage alt="@shadcn" />
                  <AvatarFallback className="bg-primary text-white">
                    {contact.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>
                {formatTotal(contact.Ticket) === '$0.00' ? (
                  <Badge variant={'destructive'}>Inactivo</Badge>
                ) : (
                  <Badge className="bg-emerald-700">Activo</Badge>
                )}
              </TableCell>
              <TableCell>{format(contact.createdAt, 'dd/MM/yyyy')}</TableCell>
              <TableCell className="text-right">
                {formatTotal(contact.Ticket)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default ContactPage