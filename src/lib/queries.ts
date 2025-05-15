"use server";

import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { db } from "./db";
import { redirect } from "next/navigation";
import { Agency, Lane, Plan, Prisma, Role, SubAccount, Tag, Ticket, User } from "@prisma/client";
import { v4 } from "uuid";
import { CreateFunnelFormSchema, UpsertFunnelPage, createMediaType } from "./types";
import { z } from "zod";
import { revalidatePath } from 'next/cache'

export const getAuthUserDetails = async () => {
  const user = await currentUser();
  if (!user) {
    return;
  }

  const userData = await db.user.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    include: {
      Agency: {
        include: {
          SidebarOption: true,
          SubAccount: {
            include: {
              SidebarOption: true,
            },
          },
        },
      },
      Permissions: true,
    },
  });
  return userData;
};

export const getAgencyDetails = async (agencyId: string): Promise<Agency | null> => {
  return await db.agency.findUnique({
    where: {
      id: agencyId
    },
    include: {
      SubAccount: true,
      Subscription: true
    }
  })
}

export const saveActivityLogsNotification = async ({
  agencyId,
  description,
  subaccountId,
}: {
  agencyId?: string;
  description: string;
  subaccountId?: string;
}) => {
  const authUser = await currentUser();
  let userData;
  if (!authUser) {
    // Si no hay usuario autenticado, buscar un usuario con acceso a la subcuenta o agencia
    const response = await db.user.findFirst({
      where: {
        OR: [
          // Buscar usuarios con rol SUBACCOUNT_USER
          {
            role: 'SUBACCOUNT_USER',
            Agency: {
              SubAccount: {
                some: { id: subaccountId },
              },
            },
          },
          // Buscar usuarios con rol SUBACCOUNT_GUEST
          {
            role: 'SUBACCOUNT_GUEST',
            Agency: {
              SubAccount: {
                some: { id: subaccountId },
              },
            },
          },
          // Buscar usuarios con rol AGENCY_OWNER
          {
            role: 'AGENCY_OWNER',
            Agency: {
              id: agencyId,
            },
          },
          // Buscar usuarios con rol AGENCY_ADMIN
          {
            role: 'AGENCY_ADMIN',
            Agency: {
              id: agencyId,
            },
          },
        ],
      },
    });
    if (response) {
      userData = response;
    }
  } else {
    userData = await db.user.findUnique({
      where: { email: authUser?.emailAddresses[0].emailAddress },
    });
  }

  if (!userData) {
    console.log("Could not find a user");
    return;
  }
  let foundAgencyId = agencyId;
  if (!foundAgencyId) {
    if (!subaccountId) {
      // Si no hay ID de agencia ni de subcuenta, simplemente registramos y retornamos
      console.log("No agency ID or subaccount ID provided for activity log");
      return;
    }
    const response = await db.subAccount.findUnique({
      where: { id: subaccountId },
    });
    if (response) foundAgencyId = response.agencyId;
  }
  if (!foundAgencyId) {
    console.log("No agency ID found for activity log after processing");
    return;
  }

  if (subaccountId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
        SubAccount: {
          connect: { id: subaccountId },
        },
      },
    });
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
      },
    });
  }
};

export const createTeamUser = async (agencyId: string, user: User) => {
  if (user.role === "AGENCY_OWNER") return null;
  const response = await db.user.create({ data: { ...user } });
  return response;
};

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");
  
  console.log('Verificando invitaciones para:', user.emailAddresses[0].emailAddress);
  
  // Primero verificamos si hay metadata en el usuario que indique una invitación
  const metadata = user.publicMetadata;
  const invitationId = metadata?.invitationId as string | undefined;
  
  // Buscar la invitación por ID si está disponible en los metadatos
  let invitationExists;
  
  if (invitationId) {
    console.log('Buscando invitación por ID:', invitationId);
    invitationExists = await db.invitation.findUnique({
      where: {
        id: invitationId,
        status: "PENDING",
      },
    });
  }
  
  // Si no se encontró por ID o no había ID, buscar por email
  if (!invitationExists) {
    console.log('Buscando invitación por email:', user.emailAddresses[0].emailAddress);
    invitationExists = await db.invitation.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
        status: "PENDING",
      },
    });
  }
  
  if (invitationExists) {
    // Verificar si la invitación ha expirado (24 horas desde su creación)
    const now = new Date();
    const createdAt = invitationExists.createdAt;
    const expirationTime = new Date(createdAt);
    expirationTime.setHours(expirationTime.getHours() + 24);
    
    if (now > expirationTime) {
      console.log('Invitación expirada:', invitationExists.email, 'Creada el:', createdAt, 'Expiró el:', expirationTime);
      
      // Actualizamos el estado de la invitación a REVOKED (usamos este estado en lugar de EXPIRED ya que no requiere migración)
      await db.invitation.update({
        where: { id: invitationExists.id },
        data: { status: "REVOKED" }
      });
      
      // Guardamos un log de la expiración
      await saveActivityLogsNotification({
        agencyId: invitationExists.agencyId,
        description: `Invitación para ${invitationExists.email} expirada (más de 24 horas)`,
        subaccountId: undefined,
      });
      
      // Redirigimos con un mensaje de error
      throw new Error('La invitación ha expirado. Por favor, solicita una nueva invitación.');
    }
    
    // La invitación es válida, procedemos a aceptarla
    const userDetails = await createTeamUser(invitationExists.agencyId, {
      email: invitationExists.email,
      agencyId: invitationExists.agencyId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invitationExists.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await saveActivityLogsNotification({
      agencyId: invitationExists?.agencyId,
      description: `Joined`,
      subaccountId: undefined,
    });

    if (userDetails) {
      // Actualizar metadatos del usuario en Clerk
      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || "SUBACCOUNT_USER",
        },
      });

      try {
        // Intentar revocar la invitación en Clerk
        console.log('Revocando invitación en Clerk para:', userDetails.email);
        
        // Obtener todas las invitaciones pendientes para este email
        const invitations = await clerkClient.invitations.getInvitationList({
          emailAddress: userDetails.email,
        });
        
        console.log(`Se encontraron ${invitations.length} invitaciones en Clerk para ${userDetails.email}`);
        
        // Filtrar solo las invitaciones pendientes
        const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
        console.log(`De las cuales ${pendingInvitations.length} están pendientes`);
        
        if (pendingInvitations.length > 0) {
          // Revocar todas las invitaciones pendientes para este email
          for (const invitation of pendingInvitations) {
            try {
              console.log(`Revocando invitación ID: ${invitation.id}, Status: ${invitation.status}`);
              await clerkClient.invitations.revokeInvitation(invitation.id);
              console.log('✅ Invitación revocada exitosamente en Clerk, ID:', invitation.id);
            } catch (revocationError) {
              console.error(`Error al revocar invitación específica ${invitation.id}:`, revocationError);
            }
          }
          
          // Verificar que se hayan revocado todas las invitaciones
          const checkInvitations = await clerkClient.invitations.getInvitationList({
            emailAddress: userDetails.email,
            status: 'pending'
          });
          
          if (checkInvitations.length > 0) {
            console.warn(`⚠️ Aún quedan ${checkInvitations.length} invitaciones pendientes después de intentar revocarlas`);
          } else {
            console.log('✅ Todas las invitaciones fueron revocadas correctamente');
          }
        } else {
          console.log('No se encontraron invitaciones pendientes en Clerk para:', userDetails.email);
        }
      } catch (clerkError) {
        // Si hay un error al revocar la invitación en Clerk, lo registramos pero continuamos
        console.error('Error al obtener o revocar invitaciones en Clerk:', clerkError);
      }

      // Eliminar la invitación de nuestra base de datos
      await db.invitation.delete({
        where: { email: userDetails.email },
      });

      return userDetails.agencyId;
    } else return null;
  } else {
    const agency = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    });
    return agency ? agency.agencyId : null;
  }
};

export const updateAgencyDetails = async (
  agencyId: string,
  agencyDetails: Partial<Agency>
) => {
  const response = await db.agency.update({
    where: { id: agencyId },
    data: { ...agencyDetails },
  });
  return response;
};

export const deleteAgency = async (agencyId: string) => {
  const response = await db.agency.delete({
    where: { id: agencyId },
  });
  return response;
};

export const initUser = async (newUser: Partial<User>) => {
  console.log('1. Iniciando initUser con:', newUser);

  const user = await currentUser();
  console.log('2. Usuario actual:', {
    id: user?.id,
    email: user?.emailAddresses[0]?.emailAddress
  });

  if (!user) {
    console.log('3. No hay usuario, retornando');
    return;
  }

  try {
    console.log('4. Intentando upsert en la base de datos');
    const userData = await db.user.upsert({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
      update: newUser,
      create: {
        id: user.id,
        avatarUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
        role: newUser.role || "SUBACCOUNT_USER",
      },
    });
    console.log('5. Datos de usuario guardados:', userData);

    // Actualización de metadatos en Clerk
    if (user.id) {
      console.log('6. Preparando actualización de metadatos en Clerk');
      try {
        await clerkClient.users.updateUser(user.id, {
          privateMetadata: {
            role: newUser.role || "SUBACCOUNT_USER",
            agencyId: userData.agencyId,
            email: user.emailAddresses[0].emailAddress
          },
        });
        console.log('7. Metadatos actualizados exitosamente');
      } catch (clerkError) {
        console.error('7.1. Error al actualizar metadatos de Clerk:', clerkError);
        throw clerkError;
      }
    }

    return userData;
  } catch (error) {
    console.error('8. Error general en initUser:', error);
    return null;
  }
};

export const upsertAgency = async (agency: Agency, price?: Plan) => {
  if (!agency.companyEmail) return null;
  try {
    // Verificar si el usuario existe antes de intentar conectarlo
    const userExists = await db.user.findUnique({
      where: { email: agency.companyEmail }
    });
    
    if (!userExists) {
      console.error('Error: No se puede crear la agencia porque el usuario con email', agency.companyEmail, 'no existe');
      return null;
    }
    
    const agencyDetails = await db.agency.upsert({
      where: { id: agency.id },
      update: agency,
      create: {
        users: { connect: { email: agency.companyEmail } },
        ...agency,
        SidebarOption: {
          create: [
            // 1. Dashboard & Visión general
            { name: "Dashboard & Visión general", icon: "layoutDashboard", link: "#" },
            { name: "Dashboard", icon: "category", link: `/agency/${agency.id}` },
            { name: "Análisis", icon: "chart", link: `/agency/${agency.id}/(Dashboard)/analytics` },
            { name: "Actividad", icon: "calendar", link: `/agency/${agency.id}/(Dashboard)/activity` },
            { name: "Visión general", icon: "chart", link: `/agency/${agency.id}/(Dashboard)/overview` }, 
            { name: "Integraciones", icon: "link", link: `/agency/${agency.id}/(Dashboard)/integrations` },

            // 2. Gestión de Inventario
            { name: "Gestión de Inventario", icon: "database", link: "#" },
            { name: "Productos", icon: "category", link: `/agency/${agency.id}/(Inventory)/products` },
            { name: "Stock", icon: "database", link: `/agency/${agency.id}/(Inventory)/stock` },
            { name: "Movimientos", icon: "compass", link: `/agency/${agency.id}/(Inventory)/movements` },
            { name: "Proveedores", icon: "person", link: `/agency/${agency.id}/(Inventory)/providers` },
            { name: "Áreas de Inventario", icon: "home", link: `/agency/${agency.id}/(Inventory)/areas` },

            // 3. Tienda & E-Commerce
            { name: "Tienda & E-Commerce", icon: "category", link: "#" },
            { name: "Tiendas", icon: "category", link: `/agency/${agency.id}/(Ecommerce)/stores` },
            { name: "E-Commerce", icon: "pipelines", link: `/agency/${agency.id}/(Ecommerce)/funnels` },
            { name: "Envíos", icon: "send", link: `/agency/${agency.id}/(Ecommerce)/shipping` },

            // 4. POS (Punto de Venta)
            { name: "POS (Punto de Venta)", icon: "shoppingCart", link: "#" },
            { name: "Terminal", icon: "payment", link: `/agency/${agency.id}/(POS)/terminal` },
            { name: "Ventas POS", icon: "receipt", link: `/agency/${agency.id}/(POS)/sales-pos` },
            { name: "Cierre de Caja", icon: "chart", link: `/agency/${agency.id}/(POS)/cash-closing` },  
            

            // 5. Ventas & Facturación
            { name: "Ventas & Facturación", icon: "payment", link: "#" },
            { name: "Transacciones", icon: "receipt", link: `/agency/${agency.id}/(Billing)/transactions` },
            { name: "Facturas", icon: "receipt", link: `/agency/${agency.id}/(Billing)/invoices` },
            { name: "Notas Crédito/Débito", icon: "receipt", link: `/agency/${agency.id}/(Billing)/notes` },
            { name: "Pagos", icon: "payment", link: `/agency/${agency.id}/(Billing)/payments` },

            // 6. Clientes & CRM
            { name: "Clientes & CRM", icon: "person", link: "#" },
            { name: "Clientes", icon: "person", link: `/agency/${agency.id}/(Customers)/clients` },
            { name: "CRM", icon: "contact", link: `/agency/${agency.id}/(Customers)/crm` },
            { name: "PQR", icon: "helpCircle", link: `/agency/${agency.id}/(Customers)/pqr` },

            // 7. Personal & RRHH
            { name: "Personal & RRHH", icon: "contact", link: "#" },
            { name: "Empleados", icon: "person", link: `/agency/${agency.id}/(Staff)/team` },
            { name: "Horarios & Nómina", icon: "calendar", link: `/agency/${agency.id}/(Staff)/schedule` },
            { name: "Contactos", icon: "contact", link: `/agency/${agency.id}/(Staff)/contacts` },
            { name: "Objetivos", icon: "flag", link: `/agency/${agency.id}/(Staff)/pipelines` },

            // 8. Comunicaciones
            { name: "Comunicaciones", icon: "messages", link: "#" },
            { name: "Campañas", icon: "send", link: `/agency/${agency.id}/(Communications)/campaigns` },
            { name: "Bandeja de entrada", icon: "messages", link: `/agency/${agency.id}/(Communications)/inbox` },
            { name: "Medios", icon: "database", link: `/agency/${agency.id}/(Communications)/media` },
            { name: "Chat", icon: "messages", link: `/agency/${agency.id}/(Communications)/chat` },

            // 9. Reportes & Analíticas
            { name: "Reportes & Analíticas", icon: "chartLine", link: "#" },
            { name: "Ventas", icon: "chart", link: `/agency/${agency.id}/(Reports)/sales-reports` },
            { name: "Inventario", icon: "database", link: `/agency/${agency.id}/(Reports)/inventory-reports` },
            { name: "Desempeño", icon: "chart", link: `/agency/${agency.id}/(Reports)/performance` },
            { name: "Finanzas", icon: "chart", link: `/agency/${agency.id}/(Reports)/financial-reports` },
            { name: "Reportes Productos", icon: "chart", link: `/agency/${agency.id}/(Reports)/product-reports` },
            { name: "Reportes POS", icon: "chart", link: `/agency/${agency.id}/(Reports)/reports-pos` },

            // 10. Configuración & Administración
            { name: "Configuración & Administración", icon: "settings", link: "#" },
            { name: "Ajustes de Empresa", icon: "settings", link: `/agency/${agency.id}/(Settings)/company-settings` },
            { name: "Usuarios & Permisos", icon: "settings", link: `/agency/${agency.id}/(Settings)/users` },
            { name: "Facturación Cuenta", icon: "payment", link: `/agency/${agency.id}/(Settings)/billing` },
            { name: "Configuración Inicial", icon: "settings", link: `/agency/${agency.id}/(Settings)/launchpad` }, 
            { name: "General Settings", icon: "tune", link: `/agency/${agency.id}/(Settings)/settings` },
            { name: "Soporte", icon: "settings", link: `/agency/${agency.id}/(Settings)/contact` },
            { name: "Configuración POS", icon: "settings", link: `/agency/${agency.id}/(Settings)/settings-pos` },
            { name: "Configuración DIAN", icon: "settings", link: `/agency/${agency.id}/(Settings)/dian-config` },
          ],
        },
      },
    });
    return agencyDetails;
  } catch (error) {
    console.error('Error al crear/actualizar la agencia:', error);
    // Proporcionar información más detallada sobre el error
    if (error instanceof Prisma.PrismaClientValidationError) {
      console.error('Error de validación de Prisma. Verifique que todos los campos requeridos estén presentes y con el formato correcto.');
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`Error conocido de Prisma: ${error.message}. Código: ${error.code}`);
    }
    return null;
  }
};


export const getNotificationAndUser = async (agencyId: string) => {
  try {
    const response = await db.notification.findMany({
      where: { agencyId },
      include: { User: true },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return response
  } catch (error) {
    console.log(error)
  }
}


export const upsertSubAccount = async (subAccount: SubAccount) => {
  console.log('1. Iniciando upsertSubAccount con:', {
    id: subAccount.id,
    companyEmail: subAccount.companyEmail,
    agencyId: subAccount.agencyId,
  })

  if (!subAccount.companyEmail) {
    console.log('2. Error: No se proporcionó email de compañía')
    return null
  }

  try {
    console.log('3. Buscando propietario de la agencia:', subAccount.agencyId)
    const agencyOwner = await db.user.findFirst({
      where: {
        Agency: { id: subAccount.agencyId },
        role: 'AGENCY_OWNER',
      },
    })

    if (!agencyOwner) {
      console.error(
        '4. Error: No se pudo crear subcuenta porque no se encontró propietario'
      )
      return null
    }

    console.log('5. Propietario encontrado:', agencyOwner.email)
    const permissionId = v4()
    console.log('6. Creando subcuenta con ID de permiso:', permissionId)

    const response = await db.subAccount.upsert({
      where: { id: subAccount.id },
      update: subAccount,
      create: {
        ...subAccount,
        Permissions: {
          create: {
            id: permissionId,
            email: agencyOwner.email,
            access: true,
          },
        },
        Pipeline: { create: { name: 'Lead Cycle' } },
        SidebarOption: {
          create: [
            // 1. Dashboard & Visión general
            { name: "Dashboard & Visión general", icon: "chart", link: "#" },
            { name: "Dashboard", icon: "category", link: `/subaccount/${subAccount.id}` },
            { name: "Análisis", icon: "chart", link: `/subaccount/${subAccount.id}/(Dashboard)/analytics` },
            { name: "Actividad", icon: "calendar", link: `/subaccount/${subAccount.id}/(Dashboard)/activity` },

            // 2. Gestión de Inventario
            { name: "Gestión de Inventario", icon: "database", link: "#" },
            { name: "Productos", icon: "category", link: `/subaccount/${subAccount.id}/(Inventory)/products` },
            { name: "Stock", icon: "database", link: `/subaccount/${subAccount.id}/(Inventory)/stock` },
            { name: "Movimientos", icon: "compass", link: `/subaccount/${subAccount.id}/(Inventory)/movements` },
            { name: "Proveedores", icon: "person", link: `/subaccount/${subAccount.id}/(Inventory)/providers` },
            { name: "Áreas de Inventario", icon: "home", link: `/subaccount/${subAccount.id}/(Inventory)/areas` },

            // 3. Tienda & E-Commerce
            { name: "Tienda & E-Commerce", icon: "category", link: "#" },
            { name: "Tiendas", icon: "store", link: `/subaccount/${subAccount.id}/(Ecommerce)/stores` },
            { name: "Envíos", icon: "send", link: `/subaccount/${subAccount.id}/(Ecommerce)/shipping` },

            // 4. POS (Punto de Venta)
            { name: "POS (Punto de Venta)", icon: "store", link: "#" },
            { name: "Terminal POS", icon: "payment", link: `/subaccount/${subAccount.id}/(POS)/terminal` },
            { name: "Ventas POS", icon: "receipt", link: `/subaccount/${subAccount.id}/(POS)/sales` },
            { name: "Configuración POS", icon: "settings", link: `/subaccount/${subAccount.id}/(POS)/settings` },
            { name: "Reportes POS", icon: "chart", link: `/subaccount/${subAccount.id}/(POS)/reports` },

            // 5. Ventas & Facturación
            { name: "Ventas & Facturación", icon: "payment", link: "#" },
            { name: "Transacciones", icon: "receipt", link: `/subaccount/${subAccount.id}/(Billing)/transactions` },
            { name: "Facturas", icon: "receipt", link: `/subaccount/${subAccount.id}/(Billing)/invoices` },
            { name: "Notas Crédito/Débito", icon: "receipt", link: `/subaccount/${subAccount.id}/(Billing)/notes` },
            { name: "Configuración DIAN", icon: "settings", link: `/(Billing)/dian-config` },
            { name: "Reportes", icon: "chart", link: `/subaccount/${subAccount.id}/(Billing)/reports` },
            { name: "Pagos", icon: "payment", link: `/subaccount/${subAccount.id}/(Billing)/payments` },
            { name: "Billing", icon: "payment", link: `/subaccount/${subAccount.id}/(Billing)/billing-store` },

            // 6. Clientes & CRM
            { name: "Clientes & CRM", icon: "person", link: "#" },
            { name: "Clientes", icon: "person", link: `/subaccount/${subAccount.id}/(Customers)/clients` },
            { name: "CRM", icon: "contact", link: `/subaccount/${subAccount.id}/(Customers)/crm` },
            { name: "PQR", icon: "contact", link: `/subaccount/${subAccount.id}/(Customers)/pqr` },

            // 7. Personal & RRHH
            { name: "Personal & RRHH", icon: "person", link: "#" },
            { name: "Empleados", icon: "person", link: `/subaccount/${subAccount.id}/(Staff)/team` },
            { name: "Horarios & Nómina", icon: "calendar", link: `/subaccount/${subAccount.id}/(Staff)/schedule` },
            { name: "Contactos", icon: "contact", link: `/subaccount/${subAccount.id}/(Staff)/contacts` },
            { name: "Objetivos", icon: "flag", link: `/subaccount/${subAccount.id}/(Staff)/pipelines` },

            // 8. Comunicaciones
            { name: "Comunicaciones", icon: "messages", link: "#" },
            { name: "Campañas", icon: "send", link: `/subaccount/${subAccount.id}/(Communications)/campaigns` },
            { name: "Bandeja de entrada", icon: "messages", link: `/subaccount/${subAccount.id}/(Communications)/inbox` },
            { name: "Medios", icon: "database", link: `/subaccount/${subAccount.id}/(Communications)/media` },
            { name: "Chat", icon: "messages", link: `/subaccount/${subAccount.id}/(Communications)/chat` },

            // 9. Reportes & Analíticas
            { name: "Reportes & Analíticas", icon: "chart", link: "#" },
            { name: "Ventas", icon: "chart", link: `/subaccount/${subAccount.id}/(Reports)/sales-reports` },
            { name: "Inventario", icon: "database", link: `/subaccount/${subAccount.id}/(Reports)/inventory-reports` },
            { name: "Desempeño", icon: "chart", link: `/subaccount/${subAccount.id}/(Reports)/performance` },

            // 10. Configuración & Administración
            { name: "Configuración & Administración", icon: "settings", link: "#" },
            { name: "Ajustes de Empresa", icon: "settings", link: `/subaccount/${subAccount.id}/(Settings)/company-settings` },
            { name: "Usuarios & Permisos", icon: "settings", link: `/subaccount/${subAccount.id}/(Settings)/users` },
            { name: "General Settings", icon: "tune", link: `/subaccount/${subAccount.id}/(Settings)/settings` },
          ],
        },
      },
    })

    console.log('7. Subcuenta creada/actualizada:', {
      id: response.id,
      name: response.name,
    })
    return response
  } catch (error) {
    console.error('8. Error al crear/actualizar subcuenta:', error)
    if (error instanceof Prisma.PrismaClientValidationError) {
      console.error(
        'Error de validación de Prisma. Verifica los campos obligatorios.'
      )
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(
        `Error conocido de Prisma: ${error.message}. Código: ${error.code}`
      )
    }
    return null
  }
}

export const getUserPermissions = async (userId: string) => {
  const response = await db.user.findUnique({
    where: { id: userId },
    select: { Permissions: { include: { SubAccount: true } } },
  })

  return response
}

export const updateUser = async (user: Partial<User>) => {
  const response = await db.user.update({
    where: { email: user.email },
    data: { ...user },
  })

  await clerkClient.users.updateUserMetadata(response.id, {
    privateMetadata: {
      role: user.role || 'SUBACCOUNT_USER',
    },
  })

  return response
}


export const changeUserPermissions = async (
  permissionsId: string | undefined,
  userEmail: string,
  subAccountId: string,
  permission: boolean
) => {
  try {
    const response = await db.permissions.upsert({
      where: { id: permissionsId },
      update: { access: permission },
      create: {
        access: permission,
        email: userEmail,
        subAccountId: subAccountId,
      }
    })
    return response
  } catch (erro) {
    console.log("💀Could not change permission")
  }
}

export const getSubaccountDetails = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
  })
  return response
}

export const deleteSubAccount = async (subaccountId: string) => {
  const response = await db.subAccount.delete({
    where: {
      id: subaccountId,
    },
  })
  return response
}

export const deleteUser = async (userId: string) => {
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  })
  const deletedUser = await db.user.delete({ where: { id: userId } })

  return deletedUser
}

export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  })

  return user
}


export const sendInvitation = async (role: Role, email: string, agencyId: string) => {
  console.log("Creando invitación con:", { role, email, agencyId })

  if (!email) {
    throw new Error("El email es requerido para crear una invitación")
  }

  if (!agencyId) {
    throw new Error("El ID de la agencia es requerido para crear una invitación")
  }

  try {
    // Primero verificamos si ya existe una invitación para este email
    const existingInvitation = await db.invitation.findFirst({
      where: {
        email,
        agencyId,
        status: "PENDING", // Solo nos importan las invitaciones pendientes
      },
    })

    if (existingInvitation) {
      throw new Error("Ya existe una invitación pendiente para este email")
    }

    // Si no existe, creamos la invitación en la base de datos
    const response = await db.invitation.create({
      data: {
        email,
        agencyId,
        role,
      },
    })

    try {
      // Intentamos crear la invitación en Clerk
      await clerkClient.invitations.createInvitation({
        emailAddress: email,
        redirectUrl: process.env.NEXT_PUBLIC_URL,
        publicMetadata: {
          throughInvitation: true,
          role,
        },
      })
    } catch (clerkError: any) {
      // Si Clerk falla porque ya existe una invitación, manejamos el error
      if (clerkError.errors && clerkError.errors[0] && clerkError.errors[0].code === "duplicate_record") {
        // Eliminamos la invitación que acabamos de crear en nuestra base de datos
        // para mantener la consistencia
        await db.invitation.delete({
          where: { id: response.id },
        })

        throw new Error("Ya existe una invitación pendiente para este email")
      }

      // Si es otro tipo de error de Clerk, lo propagamos
      throw clerkError
    }

    return response
  } catch (error) {
    console.error("Error en sendInvitation:", error)
    throw error
  }
}



export const getMedia = async (subaccountIdOrAgencyId: string, isAgencyId: boolean = false) => {
  console.log('getMedia llamado con:', { subaccountIdOrAgencyId, isAgencyId });
  
  if (!subaccountIdOrAgencyId) {
    console.log('No se proporcionó ID, devolviendo array vacío');
    // Si no hay ID, devolver un objeto con array Media vacío
    return { Media: [] }
  }
  
  let agencyId: string | null = null;
  
  if (isAgencyId) {
    // Si se proporciona directamente el agencyId
    console.log('Usando directamente el agencyId:', subaccountIdOrAgencyId);
    agencyId = subaccountIdOrAgencyId;
  } else {
    // Si se proporciona un subaccountId, obtenemos su agencyId
    console.log('Buscando agencyId para subaccountId:', subaccountIdOrAgencyId);
    const subaccount = await db.subAccount.findUnique({
      where: {
        id: subaccountIdOrAgencyId,
      },
      select: {
        agencyId: true
      }
    })
    
    if (!subaccount) {
      console.log('No se encontró la subcuenta, devolviendo array vacío');
      return { Media: [] }
    }
    
    agencyId = subaccount.agencyId;
    console.log('AgencyId encontrado:', agencyId);
  }
  
  // Obtenemos todas las subcuentas asociadas a la agencia
  console.log('Buscando subcuentas para agencyId:', agencyId);
  const agencySubaccounts = await db.subAccount.findMany({
    where: {
      agencyId: agencyId
    },
    select: {
      id: true
    }
  })
  
  const subaccountIds = agencySubaccounts.map(sub => sub.id)
  console.log('IDs de subcuentas encontrados:', subaccountIds);
  
  // Verificamos si hay subcuentas
  if (subaccountIds.length === 0) {
    console.log('No se encontraron subcuentas para la agencia, buscando solo por agencyId');
  }
  
  // Construimos la consulta para buscar medios
  let whereClause: any = {};
  
  if (subaccountIds.length > 0) {
    // Si hay subcuentas, buscamos por subcuentas y agencyId
    whereClause = {
      OR: [
        {
          subAccountId: {
            in: subaccountIds
          }
        },
        {
          agencyId: agencyId
        }
      ]
    };
  } else {
    // Si no hay subcuentas, buscamos solo por agencyId
    whereClause = {
      agencyId: agencyId
    };
  }
  
  console.log('Buscando medios con condición:', JSON.stringify(whereClause, null, 2));
  
  // Ejecutamos la consulta
  const mediaFiles = await db.media.findMany({
    where: whereClause,
    include: {
      Subaccount: {
        select: {
          name: true,
          agencyId: true
        }
      }
    }
  }).catch(async (error) => {
    console.log('Error en la consulta principal, intentando consulta alternativa:', error.message);
    
    // Si falla la consulta con include, intentamos sin incluir la relación Subaccount
    return await db.media.findMany({
      where: whereClause
    });
  });
  
  // Verificamos si realmente se encontraron archivos
  if (mediaFiles.length === 0) {
    console.log('ADVERTENCIA: No se encontraron archivos multimedia para la agencia:', agencyId);
    
    // Intentamos una búsqueda directa solo por agencyId para verificar
    const directMediaFiles = await db.media.findMany({
      where: {
        agencyId: agencyId
      }
    }).catch(async (error) => {
      console.log('Error en la búsqueda directa, devolviendo array vacío:', error.message);
      return [];
    });
    
    console.log(`Búsqueda directa por agencyId: ${directMediaFiles.length} archivos encontrados`);
    
    // Si encontramos archivos en la búsqueda directa pero no en la original, usamos estos
    if (directMediaFiles.length > 0) {
      console.log('Usando resultados de búsqueda directa por agencyId');
      return { 
        Media: directMediaFiles,
        id: isAgencyId ? null : subaccountIdOrAgencyId
      }
    }
  }
  
  console.log(`Se encontraron ${mediaFiles.length} archivos multimedia`);
  if (mediaFiles.length > 0) {
    console.log('Primer archivo encontrado:', {
      id: mediaFiles[0].id,
      name: mediaFiles[0].name,
      subAccountId: mediaFiles[0].subAccountId,
      agencyId: mediaFiles[0].agencyId
    });
  }
  
  // Devolvemos los medios en el formato esperado por los componentes
  return { 
    Media: mediaFiles,
    id: isAgencyId ? null : subaccountIdOrAgencyId
  }
}

export const createMedia = async (
  subaccountId: string,
  mediaFile: createMediaType
) => {
  try {
    console.log('createMedia llamado con:', { subaccountId, mediaFile });
    
    // Verificamos si se proporcionó un agencyId directamente
    if (mediaFile.agencyId) {
      console.log('Usando agencyId proporcionado directamente:', mediaFile.agencyId);
      
      const response = await db.media.create({
        data: {
          link: mediaFile.link,
          name: mediaFile.name,
          subAccountId: subaccountId,
          agencyId: mediaFile.agencyId,
        }
      })
      
      console.log('Media creado exitosamente con agencyId proporcionado:', response);
      return response
    }
    
    // Si no se proporcionó agencyId, intentamos obtenerlo de la subcuenta
    console.log('Buscando agencyId para subaccountId:', subaccountId);
    const subaccount = await db.subAccount.findUnique({
      where: {
        id: subaccountId,
      },
      select: {
        agencyId: true
      }
    })
    
    console.log('Resultado de búsqueda de subcuenta:', subaccount);
    
    if (!subaccount) {
      console.error('Subcuenta no encontrada y no se proporcionó agencyId');
      // En lugar de lanzar un error, creamos el media sin agencyId
      const response = await db.media.create({
        data: {
          link: mediaFile.link,
          name: mediaFile.name,
          subAccountId: subaccountId,
          // No incluimos agencyId ya que no está disponible
        }
      })
      
      console.log('Media creado sin agencyId:', response);
      return response
    }
    
    // Si encontramos la subcuenta, procedemos normalmente
    console.log('Usando agencyId de la subcuenta:', subaccount.agencyId);
    
    const response = await db.media.create({
      data: {
        link: mediaFile.link,
        name: mediaFile.name,
        subAccountId: subaccountId,
        agencyId: subaccount.agencyId, // Agregamos el agencyId obtenido de la subcuenta
      }
    })
    
    console.log('Media creado exitosamente:', response);
    return response
  } catch (error) {
    console.error('Error al crear media:', error)
    throw error
  }
}


export const deleteMedia = async (mediaId: string) => {
  try {
    // Primero obtenemos el media para verificar si existe
    const mediaToDelete = await db.media.findUnique({
      where: {
        id: mediaId
      }
    })
    
    if (!mediaToDelete) {
      throw new Error('Media no encontrado')
    }
    
    // Eliminamos el media
    const response = await db.media.delete({
      where: {
        id: mediaId
      }
    })
    
    // Registramos la actividad
    await saveActivityLogsNotification({
      agencyId: mediaToDelete.agencyId || undefined,
      description: `Eliminó un archivo multimedia: ${mediaToDelete.name}`,
      subaccountId: mediaToDelete.subAccountId || undefined
    })
    
    // Devolvemos la respuesta sin depender de la relación Subaccount
    return response
  } catch (error) {
    console.error('Error al eliminar media:', error)
    throw error
  }
}

export const getPipelineDetails = async (pipelineId: string) => {
  const response = await db.pipeline.findUnique(
    {
      where: {
        id: pipelineId,
      },
    }
  )
  return response
}

export const getLanesWithTicketAndTags = async (pipelineId: string) => {
  const response = await db.lane.findMany({
    where: {
      pipelineId,
    },
    orderBy: { order: "asc" },
    include: {
      Tickets: {
        orderBy: {
          order: 'asc',
        },
        include: {
          Tags: true,
          Assigned: true,
          Customer: true,
        }
      }
    }
  })
  return response
}

export const upsertFunnel = async (
  agencyId: string,
  funnel: z.infer<typeof CreateFunnelFormSchema> & { liveProducts: string },
  funnelId: string
) => {
  console.log('=== INICIO upsertFunnel ===');
  console.log('Parámetros recibidos:', { agencyId, funnelId });
  console.log('Datos del funnel:', JSON.stringify(funnel, null, 2));
  
  try {
    // Aseguramos que el embudo esté conectado a la agencia correcta
    console.log('Intentando operación upsert en la base de datos...');
    const response = await db.funnel.upsert({
      where: { id: funnelId },
      update: {
        ...funnel,
        agencyId: agencyId, // Aseguramos que el agencyId se actualice correctamente
      },
      create: {
        ...funnel,
        id: funnelId || v4(),
        agencyId: agencyId,
      },
    });

    console.log('Operación upsert completada con éxito');
    console.log('Respuesta de la base de datos:', JSON.stringify(response, null, 2));

    // Revalidamos la ruta para asegurar que los cambios se reflejen inmediatamente
    console.log(`Revalidando ruta: /agency/${agencyId}/funnels`);
    revalidatePath(`/agency/${agencyId}/funnels`, 'page');
    
    console.log('=== FIN upsertFunnel (éxito) ===');
    return response;
  } catch (error) {
    console.error('=== ERROR en upsertFunnel ===');
    console.error('Detalles del error:', error);
    console.error('Parámetros que causaron el error:', { agencyId, funnelId, funnel });
    throw error; // Re-lanzamos el error para que pueda ser manejado por el componente
  }
}


export const upsertPipeline = async (
  pipeline: Prisma.PipelineUncheckedCreateWithoutLaneInput
) => {
  const response = await db.pipeline.upsert({
    where: { id: pipeline.id || v4() },
    update: pipeline,
    create: pipeline,
  })

  return response
}

export const deletePipeline = async (pipelineId: string) => {
  const response = await db.pipeline.delete({
    where: {
      id: pipelineId
    }
  })
  return response
}

export const updateLanesOrder = async (lanes: Lane[]) => {
  try {
    const updateTrans = lanes.map((lane) =>
      db.lane.update({
        where: {
          id: lane.id,
        },
        data: {
          order: lane.order,
        },
      })
    )

    await db.$transaction(updateTrans)
    console.log('🟢 Done reordered 🟢')
  } catch (error) {
    console.log(error, 'ERROR UPDATE LANES ORDER')
  }
}

export const updateTicketsOrder = async (tickets: Ticket[]) => {
  try {
    const updateTrans = tickets.map((ticket) =>
      db.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          order: ticket.order,
          laneId: ticket.laneId,
        },
      })
    )

    await db.$transaction(updateTrans)
    console.log('🟢 Done reordered 🟢')
  } catch (error) {
    console.log(error, '🔴 ERROR UPDATE TICKET ORDER')
  }
}

export const upsertLane = async (lane: Prisma.LaneUncheckedCreateInput) => {
  let order: number

  if (!lane.order) {
    const lanes = await db.lane.findMany({
      where: {
        pipelineId: lane.pipelineId,
      },
    })

    order = lanes.length
  } else {
    order = lane.order
  }

  const response = await db.lane.upsert({
    where: { id: lane.id || v4() },
    update: lane,
    create: { ...lane, order },
  })

  return response
}

export const deleteLane = async (laneId: string) => {
  const resposne = await db.lane.delete({ where: { id: laneId } })
  return resposne
}
export const deleteTicket = async (ticketId: string) => {
  const resposne = await db.ticket.delete({ where: { id: ticketId } })
  return resposne
}

export const getTicketsWithTags = async (pipelineId: string) => {
  const response = await db.ticket.findMany({
    where: {
      Lane: {
        pipelineId,
      },
    },
    include: { Tags: true, Assigned: true, Customer: true },
  })
  return response
}

export const _getTicketsWithAllRelations = async (laneId: string) => {
  const response = await db.ticket.findMany({
    where: { laneId: laneId },
    include: {
      Assigned: true,
      Customer: true,
      Lane: true,
      Tags: true,
    },
  })
  return response
}

export const getSubAccountTeamMembers = async (subaccountId: string) => {
  const subaccountUsersWithAccess = await db.user.findMany({
    where: {
      Agency: {
        SubAccount: {
          some: {
            id: subaccountId,
          },
        },
      },
      role: 'SUBACCOUNT_USER',
      Permissions: {
        some: {
          subAccountId: subaccountId,
          access: true,
        },
      },
    },
  })
  return subaccountUsersWithAccess
}

export const searchContacts = async (searchTerms: string) => {
  const response = await db.contact.findMany({
    where: {
      name: {
        contains: searchTerms,
      },
    },
  })
  return response
}

export const upsertTicket = async (
  ticket: Prisma.TicketUncheckedCreateInput,
  tags: Tag[]
) => {
  let order: number
  if (!ticket.order) {
    const tickets = await db.ticket.findMany({
      where: { laneId: ticket.laneId },
    })
    order = tickets.length
  } else {
    order = ticket.order
  }

  const response = await db.ticket.upsert({
    where: {
      id: ticket.id || v4(),
    },
    update: { ...ticket, Tags: { set: tags } },
    create: { ...ticket, Tags: { connect: tags }, order },
    include: {
      Assigned: true,
      Customer: true,
      Tags: true,
      Lane: true,
    },
  })

  return response
}

export const upsertTag = async (
  subaccountId: string,
  tag: Prisma.TagUncheckedCreateInput
) => {
  const response = await db.tag.upsert({
    where: { id: tag.id || v4(), subAccountId: subaccountId },
    update: tag,
    create: { ...tag, subAccountId: subaccountId },
  })

  return response
}
export const deleteTag = async (tagId: string) => {
  const response = await db.tag.delete({ where: { id: tagId } })
  return response
}

export const getTagsForSubaccount = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: { id: subaccountId },
    select: { Tags: true },
  })
  return response
}

export const upsertContact = async (
  contact: Prisma.ContactUncheckedCreateInput
) => {
  const response = await db.contact.upsert({
    where: { id: contact.id || v4() },
    update: contact,
    create: contact,
  })
  return response
}
export const getFunnels = async (agencyId: string) => {
  // Buscamos directamente los funnels asociados a esta agencia
  const funnels = await db.funnel.findMany({
    where: { 
      agencyId: agencyId 
    },
    include: { FunnelPages: true },
  })

  return funnels
}

export const getFunnel = async (funnelId: string) => {
  const funnel = await db.funnel.findUnique({
    where: { id: funnelId },
    include: {
      FunnelPages: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  })
  return funnel
}
export const updateFunnelProducts = async (
  products: string,
  funnelId: string
) => {
  const data = await db.funnel.update({
    where: { id: funnelId },
    data: { liveProducts: products },
  })
  return data
}

export const upsertFunnelPage = async (
  agencyId: string,
  funnelPage: UpsertFunnelPage,
  funnelId: string
) => {
  console.log('=== INICIO upsertFunnelPage ===');
  console.log('agencyId:', agencyId);
  console.log('funnelId:', funnelId);
  console.log('funnelPage:', JSON.stringify(funnelPage, null, 2));
  
  if (!agencyId || !funnelId) {
    console.error('Error: agencyId o funnelId no proporcionados');
    return;
  }
  
  try {
    const response = await db.funnelPage.upsert({
      where: { id: funnelPage.id || '' },
      update: { ...funnelPage },
      create: {
        ...funnelPage,
        content: funnelPage.content
          ? funnelPage.content
          : JSON.stringify([
              {
                content: [],
                id: '__body',
                name: 'Body',
                styles: { backgroundColor: 'white' },
                type: '__body',
              },
            ]),
        funnelId,
      },
    });
    
    console.log('Respuesta de upsert:', response);
    revalidatePath(`/agency/${agencyId}/funnels/${funnelId}`, 'page');
    console.log('=== FIN upsertFunnelPage ===');
    return response;
  } catch (error) {
    console.error('Error en upsertFunnelPage:', error);
    throw error;
  }
}

export const deleteFunnelePage = async (funnelPageId: string) => {
  console.log('=== INICIO deleteFunnelePage ===');
  console.log('funnelPageId:', funnelPageId);
  
  // Obtenemos la página del embudo para poder obtener el funnelId
  try {
    const funnelPage = await db.funnelPage.findUnique({
      where: { id: funnelPageId },
      include: { Funnel: true }
    });
    
    console.log('funnelPage encontrado:', funnelPage);

    if (!funnelPage) {
      console.error('No se encontró la página del embudo');
      return null;
    }

    const response = await db.funnelPage.delete({ where: { id: funnelPageId } });
    console.log('Respuesta de delete:', response);

    // Si tenemos el funnel asociado, revalidamos la ruta
    if (funnelPage.Funnel?.agencyId) {
      console.log('Revalidando ruta con agencyId:', funnelPage.Funnel.agencyId);
      revalidatePath(`/agency/${funnelPage.Funnel.agencyId}/funnels/${funnelPage.funnelId}`, 'page');
    }
    
    console.log('=== FIN deleteFunnelePage ===');
    return response;
  } catch (error) {
    console.error('Error en deleteFunnelePage:', error);
    throw error;
  }
}

export const getFunnelPageDetails = async (funnelPageId: string) => {
  console.log('=== INICIO getFunnelPageDetails ===');
  console.log('funnelPageId:', funnelPageId);
  
  try {
    const response = await db.funnelPage.findUnique({
      where: {
        id: funnelPageId,
      },
    });
    
    console.log('Detalles de la página encontrados:', response);
    console.log('=== FIN getFunnelPageDetails ===');
    return response;
  } catch (error) {
    console.error('Error en getFunnelPageDetails:', error);
    throw error;
  }
}