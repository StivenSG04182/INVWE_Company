// import { FunnelsForSubAccount } from '@/lib/types';
import { Contact, Lane, Notification, Prisma, Role, Tag, Ticket, User } from "@prisma/client";
import { _getTicketsWithAllRelations, getAuthUserDetails, getFunnels, getMedia, getPipelineDetails, getTicketsWithTags, getUserPermissions } from "./queries";
import { db } from "./db";
import { z } from "zod";
import type Stripe from "stripe";

export type NotificationWithUser =
  | ({
      User: {
        id: string
        name: string
        avatarUrl: string
        email: string
        createdAt: Date
        updatedAt: Date
        role: Role
        agencyId: string | null
      }
      SubAccount?: {
        id: string
        name: string
      } | null
      isRead: boolean
      isDeleted: boolean
      readAt?: Date | null
      deletedAt?: Date | null
    } & Notification)[]
  | undefined


  const __getUsersWithAgencySubAccountPermissionsSidebarOptions = async (
    agencyId: string
  ) => {
    return await db.user.findFirst({
      where: { Agency: { id: agencyId } },
      include: {
        Agency: { include: { SubAccount: true } },
        Permissions: { include: { SubAccount: true } },
      },
    })
  }

  export type UserWithPermissionsAndSubAccounts = Prisma.PromiseReturnType<
  typeof getUserPermissions
>

export type AuthUserWithAgencySigebarOptionsSubAccounts =
  Prisma.PromiseReturnType<typeof getAuthUserDetails>


export type UsersWithAgencySubAccountPermissionsSidebarOptions =
Prisma.PromiseReturnType<
  typeof __getUsersWithAgencySubAccountPermissionsSidebarOptions
>

export type GetMediaFiles = Prisma.PromiseReturnType<typeof getMedia>

export type createMediaType = Prisma.MediaCreateInput & {
  agencyId?: string
  subAccountId?: string
}

export type TicketAndTags = Ticket & {
  Tags: Tag[];
  Assigned : User | null;
  Customer : Contact | null;
} 

export type LaneDetail = Lane & {
  Tickets : TicketAndTags[]
}

export const CreatePipelineFormSchema = z.object({
  name : z.string().min(1)
})

export const CreateFunnelFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  subDomainName: z.string().optional(),
  favicon: z.string().optional(),
})

export type PipelineDetailsWithLanesCardsTagsTickets = Prisma.PromiseReturnType<
typeof getPipelineDetails>

export const LaneFormSchema = z.object({
  name : z.string().min(1)
})

export type TicketWithTags = Prisma.PromiseReturnType<typeof getTicketsWithTags>

export type TicketDetails = Prisma.PromiseReturnType<typeof _getTicketsWithAllRelations>

const currencyNumberRegex = /^\d+(\.\d{1,2})?$/

export const TicketFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  value: z.string().refine((value) => currencyNumberRegex.test(value), {
    message: 'Value must be a valid price.',
  }),
})

export const ContactUserFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email(),
})


export type FunnelsForSubAccount = Prisma.PromiseReturnType<typeof getFunnels>[0]

export type UpsertFunnelPage = Prisma.FunnelPageCreateWithoutFunnelInput

export type Address = {
  city: string
  country: string
  line1: string
  postal_code: string
  state: string
}

export type ShippingInfo = {
  address: Address
  name: string
}

export type StripeCustomerType = {
  email: string
  name: string
  shipping: ShippingInfo
  address: Address
}

export type PricesList = Stripe.ApiList<Stripe.Price>

export const FunnelPageSchema = z.object({
  name: z.string().trim().min(1, { message: 'El nombre de la página es obligatorio.' }),
  pathName: z.string().optional(),
})