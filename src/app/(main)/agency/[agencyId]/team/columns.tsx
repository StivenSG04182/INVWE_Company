'use client'

import clsx from 'clsx'
import { ColumnDef } from '@tanstack/react-table'
import { Agency, AgencySidebarOption, Permissions, Prisma, Role, SubAccount, User, } from '@prisma/client'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Copy, Edit, MoreHorizontal, Trash } from 'lucide-react'
import { useModal } from '@/providers/modal-provider'
import UserDetails from '@/components/forms/user-details'
import { deleteUser, getUser } from '@/lib/queries'
import { useToast } from '@/components/ui/use-toast'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UsersWithAgencySubAccountPermissionsSidebarOptions } from '@/lib/types'
import CustomModal from '@/components/global/custom-modal'

export const columns: ColumnDef<UsersWithAgencySubAccountPermissionsSidebarOptions>[] =
  [
    {
      accessorKey: 'id',
      header: '',
      cell: () => {
        return null
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const avatarUrl = row.getValue('avatarUrl') as string
        return (
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 relative flex-none">
              <Image
                src={avatarUrl}
                fill
                className="rounded-full object-cover"
                alt="avatar image"
              />
            </div>
            <span>{row.getValue('name')}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'avatarUrl',
      header: '',
      cell: () => {
        return null
      },
    },
    { accessorKey: 'email', header: 'Email' },

    {
      accessorKey: 'SubAccount',
      header: 'Owned Accounts',
      cell: ({ row }) => {
        const isAgencyOwner = row.getValue('role') === 'AGENCY_OWNER'
        const ownedAccounts = row.original?.Permissions.filter(
          (per) => per.access
        )

        if (isAgencyOwner)
          return (
            <div className="flex flex-col items-start">
              <div className="flex flex-col gap-2">
                <Badge className="bg-slate-600 whitespace-nowrap">
                  Agency - {row?.original?.Agency?.name}
                </Badge>
              </div>
            </div>
          )
        return (
          <div className="flex flex-col items-start">
            <div className="flex flex-col gap-2">
              {ownedAccounts?.length ? (
                ownedAccounts.map((account) => (
                  <Badge
                    key={account.id}
                    className="bg-slate-600 w-fit whitespace-nowrap"
                  >
                    Sub Account - {account.SubAccount.name}
                  </Badge>
                ))
              ) : (
                <div className="text-muted-foreground">No Access Yet</div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role: Role = row.getValue('role')
        return (
          <Badge
            className={clsx({
              'bg-emerald-500': role === 'AGENCY_OWNER',
              'bg-orange-400': role === 'AGENCY_ADMIN',
              'bg-primary': role === 'SUBACCOUNT_USER',
              'bg-muted': role === 'SUBACCOUNT_GUEST',
            })}
          >
            {role}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const rowData = row.original

        return <CellActions rowData={rowData} />
      },
    },
  ]

interface CellActionsProps {
  rowData: UsersWithAgencySubAccountPermissionsSidebarOptions
}

const CellActions: React.FC<CellActionsProps> = ({ rowData }) => {
  const { data, setOpen } = useModal()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  if (!rowData) return
  if (!rowData.Agency) return

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => navigator.clipboard.writeText(rowData?.email)}
          >
            <Copy size={15} /> Copiar correo electrónico
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => {
              setOpen(
                <CustomModal
                  subheading="Sólo puede cambiar los permisos si el usuario tiene una subcuenta propia."
                  title="Editar datos de usuario"
                >
                  <UserDetails
                    type="agency"
                    id={rowData?.Agency?.id || null}
                    subAccounts={rowData?.Agency?.SubAccount}
                  />
                </CustomModal>,
                async () => {
                  return { user: await getUser(rowData?.id) }
                }
              )
            }}
          >
            <Edit size={15} />
            Edit Details
          </DropdownMenuItem>
          {rowData.role !== 'AGENCY_OWNER' && (
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                className="flex gap-2"
                // WIP : complete this function to remove the user
                onClick={() => {}}
              >
                <Trash size={15} /> Eliminar usuario
              </DropdownMenuItem>
            </AlertDialogTrigger>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">
          ¿Está completamente seguro?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
          Esta acción no se puede deshacer. Esto eliminará permanentemente el usuario
          y los datos relacionados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive"
            onClick={async () => {
              setLoading(true)
              await deleteUser(rowData.id)
              toast({
                title: 'Usuario eliminado',
                description:
                  'El usuario ha sido eliminado de esta agencia ya no tiene acceso a la agencia',
              })
              setLoading(false)
              router.refresh()
            }}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}