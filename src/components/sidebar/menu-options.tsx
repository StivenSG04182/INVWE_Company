'use client'

import { Agency, AgencySidebarOption, SubAccount, SubAccountSidebarOption } from '@prisma/client'
import React, { useEffect, useMemo, useState } from 'react'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '../ui/sheet'
import { Button } from '../ui/button'
import { ChevronsUpDown, Compass, Menu, PlusCircleIcon, ChevronDown, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import { AspectRatio } from '../ui/aspect-ratio'
import Image from 'next/image'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import { useModal } from '@/providers/modal-provider'
import CustomModal from '../global/custom-modal'
import SubAccountDetails from '../forms/subaccount-details'
import { Separator } from '../ui/separator'
import { icons } from '@/lib/constants'

type Props = {
  defaultOpen?: boolean
  subAccounts: SubAccount[]
  sidebarOpt: AgencySidebarOption[] | SubAccountSidebarOption[]
  sidebarLogo: string
  details: any
  user: any
  id: string
}

// Función para organizar las opciones en una estructura jerárquica
const organizeSidebarOptions = (options: AgencySidebarOption[] | SubAccountSidebarOption[]) => {
  // Para debug
  console.log('Opciones recibidas:', options);

  const rootOptions: any[] = [];
  const optionsMap: Record<string, any> = {};

  // Primero, creamos un mapa de todas las opciones usando su id
  options.forEach(option => {
    optionsMap[option.id] = {
      ...option,
      children: []
    };
  });

  // Para debug
  console.log('Mapa inicial:', optionsMap);

  // Luego, organizamos las opciones en una estructura jerárquica
  options.forEach(option => {
    // Para debug
    console.log('Procesando opción:', option);

    if (option.parentId) {
      // Buscamos el padre directamente en el mapa de opciones
      const parentOption = optionsMap[option.parentId];
      if (parentOption) {
        // Para debug
        console.log('Encontrado padre para:', option.name, 'Padre:', parentOption.name);
        
        parentOption.children.push(optionsMap[option.id]);
      } else {
        // Si no encontramos el padre, la tratamos como opción raíz
        console.log('No se encontró padre para:', option.name, 'ParentId:', option.parentId);
        rootOptions.push(optionsMap[option.id]);
      }
    } else {
      // Si no tiene padre, es una opción raíz
      rootOptions.push(optionsMap[option.id]);
    }
  });

  // Para debug
  console.log('Opciones raíz antes de ordenar:', rootOptions);

  // Ordenamos las opciones raíz por el campo order
  rootOptions.sort((a, b) => a.order - b.order);

  // Ordenamos los hijos de cada opción por el campo order
  rootOptions.forEach(option => {
    if (option.children && option.children.length > 0) {
      option.children.sort((a: any, b: any) => a.order - b.order);
    }
  });

  // Para debug
  console.log('Estructura final:', rootOptions);

  return rootOptions;
};

// Componente para renderizar una opción del sidebar y sus subopciones
const SidebarOptionItem = ({ 
  option, 
  defaultOpen, 
  level = 0 
}: { 
  option: any, 
  defaultOpen: boolean,
  level?: number
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = option.children && option.children.length > 0;
  
  // Para debug
  console.log('Renderizando opción:', option.name, 'Level:', level, 'HasChildren:', hasChildren);
  if (hasChildren) {
    console.log('Hijos de', option.name, ':', option.children);
  }

  let val;
  const result = icons.find(
    (icon) => icon.value === option.icon
  );
  if (result) {
    val = <result.path />
  }

  // Si es una opción principal (level 0) y tiene hijos, no debería navegar al hacer clic
  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="w-full">
      <CommandItem
        key={option.id}
        className={clsx(
          "w-full transition-all duration-200",
          level === 0 ? "hover:bg-accent/50" : "hover:bg-accent/30",
          level > 0 && "pl-8",
          "rounded-lg"
        )}
      >
        <Link
          href={option.link}
          className={clsx(
            "flex items-center gap-2 hover:bg-transparent rounded-md transition-all w-full py-2",
            level === 0 ? "font-medium" : "text-sm text-muted-foreground"
          )}
          onClick={handleClick}
        >
          {level === 0 && (
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
              {val}
            </div>
          )}
          <span>{option.name}</span>
          {hasChildren && (
            <div className="ml-auto">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          )}
        </Link>
      </CommandItem>
      
      {hasChildren && isExpanded && (
        <div className="transition-all duration-200 ease-in-out pl-4">
          {option.children.map((child: any) => (
            <SidebarOptionItem 
              key={child.id} 
              option={child} 
              defaultOpen={defaultOpen} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const MenuOptions = ({
  details,
  id,
  sidebarLogo,
  sidebarOpt,
  subAccounts,
  user,
  defaultOpen,
}: Props) => {
  const { setOpen } = useModal()
  const [isMounted, setIsMounted] = useState(false)
  const [organizedOptions, setOrganizedOptions] = useState<any[]>([]);

  const openState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  )

  useEffect(() => {
    setIsMounted(true)
    const organized = organizeSidebarOptions(sidebarOpt);
    setOrganizedOptions(organized);
  }, [sidebarOpt])

  if (!isMounted) return

  return (
    <Sheet
      modal={false}
      {...openState}
    >
      <SheetTrigger
        asChild
        className="absolute left-4 top-4 z-[100] md:!hidden"
      >
        <Button
          variant="outline"
          size={'icon'}
          className="rounded-full"
        >
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent
        showX={!defaultOpen}
        side={'left'}
        className={clsx(
          'bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] p-6',
          {
            'hidden md:inline-block z-0 w-[300px]': defaultOpen,
            'inline-block md:hidden z-[100] w-full': !defaultOpen,
          }
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center mb-8">
            <AspectRatio ratio={16 / 5} className="w-full max-w-[200px]">
              <Image
                src={sidebarLogo}
                alt="Sidebar Logo"
                fill
                className="rounded-md object-contain"
              />
            </AspectRatio>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="w-full mb-6 flex items-center justify-between py-6 hover:bg-accent/50"
                variant="ghost"
              >
                <div className="flex items-center text-left gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
                    <Compass className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">{details.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {details.address}
                    </span>
                  </div>
                </div>
                <ChevronsUpDown
                  size={16}
                  className="text-muted-foreground"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 h-80 mt-4 z-[200]">
              <Command className="rounded-lg">
                <CommandInput placeholder="Buscar cuentas..." />
                <CommandList className="pb-16">
                  <CommandEmpty>No se encontraron resultados</CommandEmpty>
                  {(user?.role === 'AGENCY_OWNER' ||
                    user?.role === 'AGENCY_ADMIN') &&
                    user?.Agency && (
                      <CommandGroup heading="Agencia">
                        <CommandItem className="!bg-transparent my-2 text-primary border-[1px] border-border p-2 rounded-md hover:!bg-muted cursor-pointer transition-all">
                          {defaultOpen ? (
                            <Link
                              href={`/agency/${user?.Agency?.id}`}
                              className="flex gap-4 w-full h-full"
                            >
                              <div className="relative w-16">
                                <Image
                                  src={user?.Agency?.agencyLogo}
                                  alt="Agency Logo"
                                  fill
                                  className="rounded-md object-contain"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <span className="font-semibold">{user?.Agency?.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {user?.Agency?.address}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href={`/agency/${user?.Agency?.id}`}
                                className="flex gap-4 w-full h-full"
                              >
                                <div className="relative w-16">
                                  <Image
                                    src={user?.Agency?.agencyLogo}
                                    alt="Agency Logo"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                                <div className="flex flex-col flex-1">
                                  <span className="font-semibold">{user?.Agency?.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {user?.Agency?.address}
                                  </span>
                                </div>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      </CommandGroup>
                    )}
                  <CommandGroup heading="Cuentas">
                    {!!subAccounts
                      ? subAccounts.map((subaccount) => (
                          <CommandItem key={subaccount.id}>
                            {defaultOpen ? (
                              <Link
                                href={`/subaccount/${subaccount.id}`}
                                className="flex gap-4 w-full h-full"
                              >
                                <div className="relative w-16">
                                  <Image
                                    src={subaccount.subAccountLogo}
                                    alt="subaccount Logo"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                                <div className="flex flex-col flex-1">
                                  <span className="font-semibold">{subaccount.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {subaccount.address}
                                  </span>
                                </div>
                              </Link>
                            ) : (
                              <SheetClose asChild>
                                <Link
                                  href={`/subaccount/${subaccount.id}`}
                                  className="flex gap-4 w-full h-full"
                                >
                                  <div className="relative w-16">
                                    <Image
                                      src={subaccount.subAccountLogo}
                                      alt="subaccount Logo"
                                      fill
                                      className="rounded-md object-contain"
                                    />
                                  </div>
                                  <div className="flex flex-col flex-1">
                                    <span className="font-semibold">{subaccount.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {subaccount.address}
                                    </span>
                                  </div>
                                </Link>
                              </SheetClose>
                            )}
                          </CommandItem>
                        ))
                      : 'No hay cuentas'}
                  </CommandGroup>
                </CommandList>
                {(user?.role === 'AGENCY_OWNER' ||
                  user?.role === 'AGENCY_ADMIN') && (
                  <SheetClose>
                    <Button
                      className="w-full flex gap-2"
                      onClick={() => {
                        setOpen(
                          <CustomModal
                            title="Crear Subcuenta"
                            subheading="Puedes cambiar entre tu cuenta de agencia y la subcuenta desde el sidebar"
                          >
                            <SubAccountDetails
                              agencyDetails={user?.Agency as Agency}
                              userId={user?.id as string}
                              userName={user?.name}
                            />
                          </CustomModal>
                        )
                      }}
                    >
                      <PlusCircleIcon size={15} />
                      Crear Subcuenta
                    </Button>
                  </SheetClose>
                )}
              </Command>
            </PopoverContent>
          </Popover>

          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground mb-4">MENÚ</p>
            <Separator className="mb-4" />
            <nav className="relative">
              <Command className="rounded-lg overflow-visible bg-transparent">
                <CommandInput placeholder="Buscar..." />
                <CommandList className="py-4 overflow-visible">
                  <CommandEmpty>No se encontraron resultados</CommandEmpty>
                  <CommandGroup className="overflow-visible">
                    {organizedOptions.map((option) => (
                      <SidebarOptionItem 
                        key={option.id} 
                        option={option} 
                        defaultOpen={defaultOpen} 
                      />
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MenuOptions