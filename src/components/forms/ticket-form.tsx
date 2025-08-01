import { getSubAccountTeamMembers, saveActivityLogsNotification, searchContacts, upsertTicket } from '@/lib/queries'
import { TicketFormSchema, TicketWithTags } from '@/lib/types'
import { useModal } from '@/providers/modal-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { Contact, Tag, User } from '@prisma/client'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from '../ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { CheckIcon, ChevronDownIcon, User2 } from 'lucide-react'
import { Popover, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { PopoverContent } from '@radix-ui/react-popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../ui/command'
import { cn } from '@/lib/utils'
import Loading from '../global/loading'
import TagCreator from '../global/tag-creator'

type Props = {
    laneId: string
    subaccountId: string
    getNewTicket: (ticket: TicketWithTags[0]) => void
}

const TicketForm = ({laneId, subaccountId, getNewTicket}: Props) => {
    const { data: defaultData, setClose } = useModal()
    const router = useRouter()
    const [tags, setTags] = useState<Tag[]>([])
    const [contact, setContact] = useState('')
    const [search, setSearch] = useState('')
    const [contactList, setContactList] = useState<Contact[]>([])
    const saveTimerRef = useRef<ReturnType<typeof setTimeout>>()
    const [allTeamMembers, setAllTeamMembers] = useState<User[]>([])
    const [assignedTo, setAssignedTo] = useState(
        defaultData.ticket?.Assigned?.id || ''
        )

        const form = useForm<z.infer<typeof TicketFormSchema>>({
            mode: 'onChange',
            resolver: zodResolver(TicketFormSchema),
            defaultValues: {
              name: defaultData.ticket?.name || '',
              description: defaultData.ticket?.description || '',
              value: String(defaultData.ticket?.value || 0),
            },
          })
          const isLoading = form.formState.isLoading
        useEffect(() => {
            if (subaccountId) {
              const fetchData = async () => {
                const response = await getSubAccountTeamMembers(subaccountId)
                if (response) setAllTeamMembers(response)
              }
              fetchData()
            }
          }, [subaccountId])  

          useEffect(() => {
            if (defaultData.ticket) {
              form.reset({
                name: defaultData.ticket.name || '',
                description: defaultData.ticket?.description || '',
                value: String(defaultData.ticket?.value || 0),
              })
              if (defaultData.ticket.customerId)
                setContact(defaultData.ticket.customerId)
        
              const fetchData = async () => {
                const response = await searchContacts(
                  //@ts-ignore
                  defaultData.ticket?.Customer?.name
                )
                setContactList(response)
              }
              fetchData()
            }
          }, [defaultData, form])

          const onSubmit = async (values: z.infer<typeof TicketFormSchema>) => {
            if (!laneId) return
            try {
              const response = await upsertTicket(
                {
                  ...values,
                  laneId,
                  id: defaultData.ticket?.id,
                  assignedUserId: assignedTo,
                  ...(contact ? { customerId: contact } : {}),
                },
                tags
              )
        
              await saveActivityLogsNotification({
                agencyId: undefined,
                description: `Ticket actualizado | ${response?.name}`,
                subaccountId,
              })
        
              toast({
                title: 'Éxito',
                description: 'Detalles guardados',
              })
              if (response) getNewTicket(response)
              router.refresh()
            } catch (error) {
              toast({
                variant: 'destructive',
                title: '¡Ups!',
                description: 'No se pudieron guardar los detalles del objetivo',
              })
            }
            setClose()
          }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Detalles del ticket</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
          onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del ticket</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />   
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor del ticket</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Valor"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <h3>Agregar etiquetas</h3>
            {/* WIP : Add Tag creator */}
            <TagCreator
              subAccountId={subaccountId}
              getSelectedTags={setTags}
              defaultTags={defaultData.ticket?.Tags || []}
            />
            <FormLabel>Asignar a miembro del equipo</FormLabel>
            <Select
              onValueChange={setAssignedTo}
              defaultValue={assignedTo}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage alt="contact" />
                        <AvatarFallback className="bg-primary text-sm text-white">
                          <User2 size={14} />
                        </AvatarFallback>
                      </Avatar>

                      <span className="text-sm text-muted-foreground">
                        No asignado
                      </span>
                    </div>
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {allTeamMembers.map((teamMember) => (
                  <SelectItem
                    key={teamMember.id}
                    value={teamMember.id}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          alt="contact"
                          src={teamMember.avatarUrl}
                        />
                        <AvatarFallback className="bg-primary text-sm text-white">
                          <User2 size={14} />
                        </AvatarFallback>
                      </Avatar>

                      <span className="text-sm text-muted-foreground">
                        {teamMember.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormLabel>Cliente</FormLabel>
            <Popover>
              <PopoverTrigger
              asChild
              className='w-full'
              >
                <Button
                variant="outline"
                role='combobox'
                className='justify-between'
                >
                {contact ? contactList.find((c) => c.id ===contact)?.name : 'Seleccionar cliente...'}
                <ChevronDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50'/>
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[400px] p-0'>
              <Command>
                  <CommandInput
                    placeholder="Buscar..."
                    className="h-9"
                    value={search}
                    onChangeCapture={async (value) => {
                      //@ts-ignore
                      setSearch(value.target.value)
                      if (saveTimerRef.current)
                        clearTimeout(saveTimerRef.current)
                      saveTimerRef.current = setTimeout(async () => {
                        const response = await searchContacts(
                          //@ts-ignore
                          value.target.value
                        )
                        setContactList(response)
                        setSearch('')
                      }, 1000)
                    }}
                  />
                  <CommandEmpty>No se encontró cliente.</CommandEmpty>
                  <CommandGroup>
                    {contactList.map((c) => (
                      <CommandItem
                        key={c.id}
                        value={c.id}
                        onSelect={(currentValue) => {
                          setContact(
                            currentValue === contact ? '' : currentValue
                          )
                        }}
                      >
                        {c.name}
                        <CheckIcon
                          className={cn(
                            'ml-auto h-4 w-4',
                            contact === c.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
            className='w-20 mt-4'
            disabled={isLoading}
            type='submit'
            >{form.formState.isSubmitting ? <Loading /> : 'Guardar'}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default TicketForm