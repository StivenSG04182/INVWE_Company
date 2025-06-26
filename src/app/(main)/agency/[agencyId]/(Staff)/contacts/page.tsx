import BlurPage from '@/components/global/blur-page'
import { db } from '@/lib/db'
import { SubAccount, User } from '@prisma/client'
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
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Edit, PlusCircle, Users } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CustomModal from '@/components/global/custom-modal'
import SendInvitation from '@/components/forms/send-invitation'
import EditUserForm from '@/components/forms/edit-user-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

type Props = {
  params: { agencyId: string }
}

type UserWithDetails = User & {
  Agency: {
    SubAccount: SubAccount[]
  } | null
  Permissions: {
    SubAccount: SubAccount
  }[]
}

const ContactPage = async ({ params }: Props) => {
  const teamMembers = await db.user.findMany({
    where: {
      Agency: {
        id: params.agencyId,
      },
    },
    include: {
      Agency: { include: { SubAccount: true } },
      Permissions: { include: { SubAccount: true } },
    },
  })
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className='text-4xl'>Directorio de Equipo</h1>
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Invitar Usuario
              </Button>
            </DialogTrigger>
            <CustomModal
              title="Invitar Usuario"
              subheading="Envía una invitación para añadir un nuevo usuario al sistema"
            >
              <SendInvitation agencyId={params.agencyId} />
            </CustomModal>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={4} className="text-center bg-muted/50">Información Personal</TableHead>
            <TableHead colSpan={3} className="text-center bg-muted/30">Información de Contacto</TableHead>
            <TableHead colSpan={4} className="text-center bg-muted/50">Información Laboral</TableHead>
            <TableHead colSpan={3} className="text-center bg-muted/30">Información Adicional</TableHead>
          </TableRow>
          <TableRow>
            {/* Información Personal */}
            <TableHead className="w-[200px]">Nombre</TableHead>
            <TableHead className="w-[120px]">Fecha de Nacimiento</TableHead>
            <TableHead className="w-[100px]">Género</TableHead>
            <TableHead className="w-[120px]">Estado Civil</TableHead>
            
            {/* Información de Contacto */}
            <TableHead className="w-[200px]">Dirección</TableHead>
            <TableHead className="w-[150px]">Teléfono</TableHead>
            <TableHead className="w-[200px]">Correo Electrónico</TableHead>
            
            {/* Información Laboral */}
            <TableHead className="w-[150px]">Cargo</TableHead>
            <TableHead className="w-[120px]">Fecha de Ingreso</TableHead>
            <TableHead className="w-[100px]">Salario</TableHead>
            <TableHead className="w-[150px]">Jornada Laboral</TableHead>
            
            {/* Información Adicional */}
            <TableHead className="w-[150px]">Seguro Social</TableHead>
            <TableHead className="w-[150px]">Rol</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {teamMembers.map((member) => (
            <TableRow key={member.id}>
              {/* Información Personal */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback className="bg-primary text-white">
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{member.name}</span>
                </div>
              </TableCell>
              <TableCell>{member.birthDate ? format(member.birthDate, 'dd/MM/yyyy') : '-'}</TableCell>
              <TableCell>{member.gender || '-'}</TableCell>
              <TableCell>{member.maritalStatus || '-'}</TableCell>
              
              {/* Información de Contacto */}
              <TableCell>{member.address || '-'}</TableCell>
              <TableCell>{member.phone || '-'}</TableCell>
              <TableCell>{member.email}</TableCell>
              
              {/* Información Laboral */}
              <TableCell>{member.position || '-'}</TableCell>
              <TableCell>{member.hireDate ? format(member.hireDate, 'dd/MM/yyyy') : '-'}</TableCell>
              <TableCell>{member.salary ? `COL$ ${member.salary}` : '-'}</TableCell>
              <TableCell>{member.workSchedule || '-'}</TableCell>
              
              {/* Información Adicional */}
              <TableCell>{member.socialSecurityNumber || '-'}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {member.role === 'AGENCY_OWNER' ? 'Propietario' :
                    member.role === 'AGENCY_ADMIN' ? 'Administrador' :
                      member.role === 'SUBACCOUNT_USER' ? 'Usuario' : 'Invitado'}
                </Badge>
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Editar información de {member.name}</DialogTitle>
                    </DialogHeader>
                    <EditUserForm user={member} />
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default ContactPage