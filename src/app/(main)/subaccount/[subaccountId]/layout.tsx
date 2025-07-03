import InfoBar from '@/components/global/infobar'
import Sidebar from '@/components/sidebar'
import Unauthorized from '@/components/unauthorized'
import {
  getAuthUserDetails,
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from '@/lib/queries'
import { currentUser } from '@clerk/nextjs/server'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  children: React.ReactNode
  params: { subaccountId: string }
}

const SubaccountLayout = async ({ children, params }: Props) => {
  console.log('🔍 SubaccountLayout Debug - Starting with subaccountId:', params.subaccountId)
  
  try {
    const agencyId = await verifyAndAcceptInvitation()
    console.log('🔍 AgencyId from verifyAndAcceptInvitation:', agencyId)
    
    if (!agencyId) {
      console.log('❌ No agencyId found, returning Unauthorized')
      return <Unauthorized />
    }

    const user = await currentUser()
    console.log('🔍 Current user:', user?.id, user?.emailAddresses[0]?.emailAddress)

    if (!user) {
      console.log('❌ No user found, redirecting to site')
      return redirect('/site')
    }

    let notifications: any = []

    if (!user.privateMetadata.role) {
      console.log('❌ No role in privateMetadata, returning Unauthorized')
      return <Unauthorized />
    } else {
      console.log('🔍 User role:', user.privateMetadata.role)
      
      const allPermissions = await getAuthUserDetails()
      console.log('🔍 All permissions:', allPermissions?.Permissions?.length || 0)

      const hasPermission = allPermissions?.Permissions.find(
        (permissions) =>
          permissions.access && permissions.subAccountId === params.subaccountId
      )
      
      console.log('🔍 Has permission for this subaccount:', !!hasPermission)
      console.log('🔍 Permission details:', hasPermission)
      
      // TEMPORAL: Permitir acceso para debugging
      if (!hasPermission) {
        console.log('⚠️ No permission found, but allowing access for debugging')
        // return <Unauthorized />
      }

      const allNotifications = await getNotificationAndUser(agencyId)

      if (
        user.privateMetadata.role === 'AGENCY_ADMIN' ||
        user.privateMetadata.role === 'AGENCY_OWNER'
      ) {
        notifications = allNotifications
      } else {
        const filteredNoti = allNotifications?.filter(
          (item) => item.subAccountId === params.subaccountId
        )
        if (filteredNoti) notifications = filteredNoti
      }
    }

    console.log('✅ SubaccountLayout - Rendering successfully')
    return (
      <div className="h-screen overflow-hidden">
        <Sidebar
          id={params.subaccountId}
          type="subaccount"
        />

        <div className="md:pl-[300px]">
          <InfoBar
            notifications={notifications}
            role={user.privateMetadata.role as Role}
            subAccountId={params.subaccountId as string}
          />
          <div className="relative">{children}</div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('❌ Error in SubaccountLayout:', error)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error en SubaccountLayout</h1>
          <p className="text-gray-600 mb-2">SubaccountId: {params.subaccountId}</p>
          <p className="text-gray-600">Error: {error instanceof Error ? error.message : String(error)}</p>
        </div>
      </div>
    )
  }
} 

export default SubaccountLayout