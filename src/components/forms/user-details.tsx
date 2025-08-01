'use client'
import { AuthUserWithAgencySigebarOptionsSubAccounts, UserWithPermissionsAndSubAccounts } from '@/lib/types'
import { SubAccount, User } from '@prisma/client'
import React, { useState, useEffect } from 'react'
import { useModal } from '@/providers/modal-provider'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { changeUserPermissions, getAuthUserDetails, getUserPermissions, saveActivityLogsNotification, updateUser } from '@/lib/queries'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import SidebarOptionsPermissions from './sidebar-options-permissions'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import FileUpload from '../global/file-upload'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Button } from '../ui/button'
import Loading from '../global/loading'
import { Separator } from '../ui/separator'
import { Switch } from '../ui/switch'
import { v4 } from 'uuid'

type Props = {
    id: string | null
    type: 'agency' | 'subaccount'
    userData?: Partial<User>
    subAccounts?: SubAccount[]
}

const UserDetails = ({id,type,userData,subAccounts,}: Props) => {
    const [subAccountPermissions, setSubAccountsPermissions] =
    useState<UserWithPermissionsAndSubAccounts | null>(null)
  
    const { data, setClose } = useModal()
    const [roleState, setRoleState] = useState('')
    const [loadingPermissions, setLoadingPermissions] = useState(false)
    const [authUserData, setAuthUserData] =
    useState<AuthUserWithAgencySigebarOptionsSubAccounts | null>(null)
    const { toast } = useToast()
    const router = useRouter()
    //Get authUSerDtails

  useEffect(() => {
    if (data.user) {
      const fetchDetails = async () => {
        const response = await getAuthUserDetails()
        if (response) setAuthUserData(response)
      }
      fetchDetails()
    }
  }, [data])
  
  const userDataSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    avatarUrl: z.string(),
    role: z.enum([
      'AGENCY_OWNER',
      'AGENCY_ADMIN',
      'SUBACCOUNT_USER',
      'SUBACCOUNT_GUEST',
    ]),
  })

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: 'onChange',
    defaultValues: {
      name: userData ? userData.name : data?.user?.name,
      email: userData ? userData.email : data?.user?.email,
      avatarUrl: userData ? userData.avatarUrl : data?.user?.avatarUrl,
      role: userData ? userData.role : data?.user?.role,
    },
  })

    useEffect(() =>{
      if (!data.user) return
      const getPermissions = async () => {
      if (!data.user) return
      const permission = await getUserPermissions(data.user.id)
      setSubAccountsPermissions(permission)
    }
    getPermissions()
    }, [data,form])

    useEffect(() => {
      if (data.user) {
        form.reset(data.user)
      }
      if (userData) {
        form.reset(userData)
      }
    }, [userData, data, form])
    
    const onChangePermission = async (subAccountId : string, val: boolean, permissionsId :string | undefined) => {
    if(!data.user?.email)return
    setLoadingPermissions(true)
    const response = await changeUserPermissions(
      permissionsId ? permissionsId:
      v4(),
      data.user.email,
      subAccountId,
      val
    )
    if(type==="agency"){
      await saveActivityLogsNotification({
        agencyId: authUserData?.Agency?.id,
        description: `Gave ${userData?.name} access to | ${
          subAccountPermissions?.Permissions.find(
            (p) => p.subAccountId === subAccountId
          )?.SubAccount.name
        } `,
        subaccountId: subAccountPermissions?.Permissions.find(
          (p) => p.subAccountId === subAccountId
        )?.SubAccount.id,
      })
    }
    if(response){
      toast({
        title: 'Exito',
        description: 'La petición fue exitosa',
      })
      if(subAccountPermissions){
        subAccountPermissions.Permissions.find((perm) => {
          if (perm.subAccountId === subAccountId) {
            return { ...perm, access: !perm.access }
          }
          return perm
        }) 
      }
      else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron editar los permisos',
        })
      }
    }
    router.refresh()
    setLoadingPermissions(false)
    }

    const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
      if (!id) return
      if (userData || data?.user) {
        const updatedUser = await updateUser(values)
        authUserData?.Agency?.SubAccount.filter((subacc) =>
          authUserData.Permissions.find(
            (p) => p.subAccountId === subacc.id && p.access
          )
        ).forEach(async (subaccount) => {
          await saveActivityLogsNotification({
            agencyId: undefined,
            description: `Updated ${userData?.name} information`,
            subaccountId: subaccount.id,
          })
        })
  
        if (updatedUser) {
          toast({
            title: 'Exito!',
            description: 'Se actualizó la información exitosamente',
          })
          setClose()
          router.refresh()
        } else {
          toast({
            variant: 'destructive',
            title: 'Upps!',
            description: 'No se ha podido actualizar la información del usuario',
          })
        }
      } else {
        console.log('Error could not submit')
      }
    }

    

    return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Detalles del Usuario</CardTitle>
        <CardDescription>Añadir o Actualizar la información</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto de Perfil</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="avatar"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Nombre completo del usuario</FormLabel>
                  <FormControl>
                    <Input
                      required
                      placeholder="Nombre completo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Correo</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={
                        userData?.role === 'AGENCY_OWNER' ||
                        form.formState.isSubmitting
                      }
                      placeholder="Correo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Rol del usuario</FormLabel>
                  <Select
                    disabled={field.value === 'AGENCY_OWNER'}
                    onValueChange={(value) => {
                      if (
                        value === 'SUBACCOUNT_USER' ||
                        value === 'SUBACCOUNT_GUEST'
                      ) {
                        setRoleState(
                          'You need to have subaccounts to assign Subaccount access to team members.'
                        )
                      } else {
                        setRoleState('')
                      }
                      field.onChange(value)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar un rol de usuario..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* typo ? */}
                      <SelectItem value="AGENCY_ADMIN">
                        Administrador de Agencia
                      </SelectItem>
                      {(data?.user?.role === 'AGENCY_OWNER' ||
                        userData?.role === 'AGENCY_OWNER') && (
                        <SelectItem value="AGENCY_OWNER">
                          Dueño de Agencia
                        </SelectItem>
                      )}
                      <SelectItem value="SUBACCOUNT_USER">
                        Usuario de Tienda
                      </SelectItem>
                      <SelectItem value="SUBACCOUNT_GUEST">
                        Invitado de Tienda
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground">{roleState}</p>
                </FormItem>
              )}
            />
            <Button
            disabled={form.formState.isSubmitting}
            type="submit"
            >
              {form.formState.isSubmitting ? <Loading/> : 'Guardar Detalles de Usuario'}
            </Button>
            {authUserData?.role === 'AGENCY_OWNER' && (
              <div>
                <Separator className="my-4" />
                <FormLabel>Permisos de Usuario</FormLabel>
                <FormDescription className="mb-4">
                  Puede dar acceso a tiendas a los miembros del equipo activando
                  el control de acceso para cada tienda. Esto solo es visible para
                  los propietarios de la agencia
                </FormDescription>
                <div className='flex flex-col gap-4'>
                {subAccounts?.map((subAccount) => {
                    const subAccountPermissionsDetails =
                      subAccountPermissions?.Permissions.find(
                        (p) => p.subAccountId === subAccount.id
                      )
                    return (
                      <div
                        key={subAccount.id}
                        className="flex flex-col gap-2 rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{subAccount.name}</p>
                          </div>
                          <Switch
                            disabled={loadingPermissions}
                            checked={subAccountPermissionsDetails?.access}
                            onCheckedChange={(permission) => {
                              onChangePermission(
                                subAccount.id,
                                permission,
                                subAccountPermissionsDetails?.id
                              )
                            }}
                          />
                        </div>
                        
                        {subAccountPermissionsDetails?.access && subAccountPermissionsDetails?.id && (
                          <SidebarOptionsPermissions 
                            subAccountId={subAccount.id} 
                            permissionId={subAccountPermissionsDetails.id} 
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default UserDetails