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
  // Identificamos las categorías principales y las subopciones
  const mainCategories: any[] = [];
  const configCategories: any[] = []; // Categorías de configuración que irán al final
  const subOptions: any[] = [];
  const optionsMap: Record<string, any> = {};

  // Definimos el orden específico de las categorías según lo solicitado
  const categoryOrder: Record<string, number> = {
    'Dashboard & Visión general': 1,
    'Gestión de Inventario': 2,
    'Tienda & E-Commerce': 3,
    'Ventas & Facturación': 4,
    'Personal & RRHH': 5,
    'Clientes & CRM': 6,
    'Comunicaciones': 7,
    'Reportes & Analíticas': 8,
  };

  // Lista de categorías a excluir
  const excludedCategories = ['Launchpad', 'Settings', 'Gestión de Cuentas'];

  // Primero, creamos un mapa de todas las opciones usando su id
  options.forEach(option => {
    // Excluimos las categorías no deseadas
    if (excludedCategories.includes(option.name)) {
      return;
    }

    optionsMap[option.id] = {
      ...option,
      children: [],
      // Asignamos el orden según nuestra configuración o un valor alto por defecto
      order: categoryOrder[option.name] || 999
    };

    // Identificamos si es una categoría principal (tiene # en el link) o una subopción
    if (option.link === '#') {
      mainCategories.push(optionsMap[option.id]);
    } else {
      subOptions.push(optionsMap[option.id]);
    }
  });

  // Crear categorías principales que no existen pero son necesarias
  // Verificamos si existe la categoría 'Dashboard & Visión general'
  if (!mainCategories.find(cat => cat.name === 'Dashboard & Visión general')) {
    // Creamos una categoría virtual para agrupar las opciones de Dashboard
    mainCategories.push({
      id: 'dashboard-category',
      name: 'Dashboard & Visión general',
      link: '#',
      icon: 'chart',
      order: categoryOrder['Dashboard & Visión general'],
      children: []
    });
  }

  // Asignamos las subopciones a sus categorías principales correspondientes
  // basándonos en los comentarios y la estructura en queries.ts
  subOptions.forEach(subOption => {
    // Buscamos la categoría principal a la que pertenece esta subopción
    const categoryName = getCategoryForOption(subOption.name);

    if (categoryName && !excludedCategories.includes(categoryName)) {
      // Buscamos la categoría principal por nombre
      const mainCategory = mainCategories.find(cat => cat.name === categoryName);
      if (mainCategory) {
        mainCategory.children.push(subOption);
      } else {
        // Si no encontramos la categoría, la tratamos como opción independiente
        mainCategories.push(subOption);
      }
    } else if (!excludedCategories.includes(subOption.name)) {
      // Si no tiene categoría asociada, la tratamos como opción independiente
      mainCategories.push(subOption);
    }
  });

  // Ordenamos las categorías principales por el campo order
  mainCategories.sort((a, b) => a.order - b.order);

  // Ordenamos los hijos de cada categoría por el campo order
  mainCategories.forEach(category => {
    if (category.children && category.children.length > 0) {
      category.children.sort((a: any, b: any) => a.order - b.order);
    }
  });

  // Separamos las opciones de configuración que deben ir al final
  const regularOptions: any[] = [];
  const configOptions: any[] = [];

  mainCategories.forEach(option => {
    // Verificamos si es una opción de configuración
    if (
      option.name === 'Configuración & Administración'
    ) {
      configOptions.push(option);
    } else {
      regularOptions.push(option);
    }
  });

  return { regularOptions, configOptions };
};

// Función auxiliar para determinar a qué categoría pertenece una opción
const getCategoryForOption = (optionName: string): string | null => {
  // Mapeo de opciones a sus categorías principales
  const categoryMap: Record<string, string> = {
    // Dashboard & Visión general
    'Dashboard': 'Dashboard & Visión general',
    'Análisis': 'Dashboard & Visión general',
    'Actividad': 'Dashboard & Visión general',
    'Visión general': 'Dashboard & Visión general',
    'Integraciones': 'Dashboard & Visión general',

    // Gestión de Inventario
    'Productos': 'Gestión de Inventario',
    'Stock': 'Gestión de Inventario',
    'Movimientos': 'Gestión de Inventario',
    'Proveedores': 'Gestión de Inventario',
    'Áreas de Inventario': 'Gestión de Inventario',

    // Tienda & E-Commerce
    'Tiendas': 'Tienda & E-Commerce',
    'E-Commerce': 'Tienda & E-Commerce',
    'Envíos': 'Tienda & E-Commerce',

    // Ventas & Facturación
    'Transacciones': 'Ventas & Facturación',
    'Facturas': 'Ventas & Facturación',
    'Notas Crédito/Débito': 'Ventas & Facturación',
    'Pagos': 'Ventas & Facturación',
    'Billing': 'Ventas & Facturación',
    
    // Clientes & CRM
    'Clientes': 'Clientes & CRM',
    'CRM': 'Clientes & CRM',
    'All Sub-Accounts': 'Clientes & CRM',

    // Personal & RRHH
    'Empleados': 'Personal & RRHH',
    'Horarios & Nómina': 'Personal & RRHH',
    'Contactos': 'Personal & RRHH',
    'Pipelines': 'Personal & RRHH',

    // Comunicaciones
    'Campañas': 'Comunicaciones',
    'Bandeja de entrada': 'Comunicaciones',
    'Medios': 'Comunicaciones',
    'Chat': 'Comunicaciones',

    // Reportes & Analíticas
    'Ventas': 'Reportes & Analíticas',
    'Inventario': 'Reportes & Analíticas',
    'Desempeño': 'Reportes & Analíticas',
    'Finanzas': 'Reportes & Analíticas',
    'Reportes Productos': 'Reportes & Analíticas',
    'Reportes': 'Reportes & Analíticas',
    
    // Configuración & Administración
    'Ajustes de Empresa': 'Configuración & Administración',
    'Usuarios & Permisos': 'Configuración & Administración',
    'Facturación': 'Configuración & Administración',
    'Configuración Inicial': 'Configuración & Administración',
    'General Settings': 'Configuración & Administración',
    'Automatización': 'Configuración & Administración',
    'Soporte': 'Configuración & Administración',
    'Configuración DIAN': 'Configuración & Administración',
    
  };
  return categoryMap[optionName] || null;
};

// Componente para renderizar una opción del sidebar y sus subopciones
const SidebarOptionItem = ({
  option,
  defaultOpen,
  level = 0,
  expandedOptionId,
  setExpandedOptionId
}: {
  option: any,
  defaultOpen: boolean,
  level?: number,
  expandedOptionId: string | null,
  setExpandedOptionId: (id: string | null) => void
}) => {
  const hasChildren = option.children && option.children.length > 0;
  const isExpanded = expandedOptionId === option.id;

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
      if (isExpanded) {
        // Si ya está expandido, lo cerramos
        setExpandedOptionId(null);
      } else {
        // Si no está expandido, lo expandimos y cerramos cualquier otro
        setExpandedOptionId(option.id);
      }
    }
  };

  // Si es una categoría principal (link=#) o tiene hijos, mostrar como desplegable
  const isCategory = option.link === '#' || hasChildren;
  
  // Procesar la URL para eliminar los paréntesis en las rutas
  const processedLink = option.link.replace(/\(([^)]+)\)\//g, '');
  

  return (
    <div className="w-full">
      <CommandItem
        key={option.id}
        className={clsx(
          "w-full transition-all duration-200",
          level === 0 ? "hover:bg-accent/50" : "hover:bg-accent/30",
          level > 0 && "pl-3", // Reducido de pl-4
          isCategory && "font-medium", // Cambiado de font-semibold a font-medium
          "rounded-lg"
        )}
      >
        <Link
          href={processedLink}
          className={clsx(
            "flex items-center gap-1.5 hover:bg-transparent rounded-md transition-all w-full py-1.5", // Reducido gap-2 a gap-1.5 y py-2 a py-1.5
            level === 0 ? "text-sm font-medium" : "text-xs text-muted-foreground" // Reducido tamaño de texto
          )}
          onClick={handleClick}
        >
          {level === 0 && (
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10"> {/* Reducido de w-8 h-8 a w-6 h-6 */}
              {val}
            </div>
          )}
          <span>{option.name}</span>
          {isCategory && (
            <div className="ml-auto">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />} {/* Reducido de size={16} a size={14} */}
            </div>
          )}
        </Link>
      </CommandItem>

      {hasChildren && isExpanded && (
        <div className="transition-all duration-200 ease-in-out pl-3 border-l border-primary/10 ml-3 mt-0.5 mb-1"> {/* Reducido espaciado y grosor del borde */}
          {option.children.map((child: any) => (
            <SidebarOptionItem
              key={child.id}
              option={child}
              defaultOpen={defaultOpen}
              level={level + 1}
              expandedOptionId={expandedOptionId}
              setExpandedOptionId={setExpandedOptionId}
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
  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(null);

  const openState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  )

  const [configOptions, setConfigOptions] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true)
    const { regularOptions, configOptions } = organizeSidebarOptions(sidebarOpt);
    setOrganizedOptions(regularOptions);
    setConfigOptions(configOptions);
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
                className="w-full mb-6 flex items-center justify-between py-6 hover:bg-accent/40 overflow-hidden"
                variant="ghost">
                <div className="flex items-center text-left gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
                    <Compass className="text-primary" />
                  </div>
                  <div className="flex flex-col flex-1 ">
                    <span className="font-semibold truncate">{details.name}</span>
                    <span className="text-xs text-muted-foreground truncate min-w-2">{details.address}</span>
                  </div>
                </div>
                <ChevronsUpDown size={16} className="text-muted-foreground" />
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

          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-x-auto">
              <p className="text-xs font-medium text-muted-foreground mb-4">MENÚ</p>
              <Separator className="mb-4" />
              <nav className="relative">
                <Command className="rounded-lg overflow-visible bg-transparent ">
                  <CommandInput placeholder="Buscar..." />
                  <CommandList className="py-4 overflow-visible">
                    <CommandEmpty>No se encontraron resultados</CommandEmpty>
                    <CommandGroup className="overflow-visible">
                      {organizedOptions.map((option) => (
                        <SidebarOptionItem
                          key={option.id}
                          option={option}
                          defaultOpen={defaultOpen}
                          expandedOptionId={expandedOptionId}
                          setExpandedOptionId={setExpandedOptionId}
                        />
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </nav>
            </div>

            {configOptions.length > 0 && (
              <div className="mt-auto pt-4">
                <Separator className="my-4" />
                <p className="text-xs font-medium text-muted-foreground mb-4">CONFIGURACIÓN</p>
                <nav className="relative">
                  <Command className="rounded-lg overflow-visible bg-transparent overflow-x-auto">
                    <CommandList className="py-4 overflow-visible">
                      <CommandGroup className="overflow-visible">
                        {configOptions.map((option) => (
                          <SidebarOptionItem
                            key={option.id}
                            option={option}
                            defaultOpen={defaultOpen}
                            expandedOptionId={expandedOptionId}
                            setExpandedOptionId={setExpandedOptionId}
                          />
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </nav>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MenuOptions