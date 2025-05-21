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
  console.log("=== Starting Subaccount Layout Authorization ===");
  console.log("Subaccount ID:", params.subaccountId);

  const agencyId = await verifyAndAcceptInvitation()
  console.log("Agency ID from verification:", agencyId);
  
  if (!agencyId) {
    console.log("No agency ID found, showing unauthorized");
    return <Unauthorized />
  }

  const user = await currentUser()
  console.log("Current user in subaccount:", {
    id: user?.id,
    email: user?.emailAddresses[0]?.emailAddress,
    role: user?.privateMetadata?.role
  });

  if (!user) {
    console.log("No user found, redirecting to home");
    return redirect('/')
  }

  let notifications: any = []

  if (!user.privateMetadata.role) {
    console.log("User has no role metadata, showing unauthorized");
    return <Unauthorized />
  } else {
    console.log("Checking user permissions");
    const allPermissions = await getAuthUserDetails()
    console.log("User permissions:", {
      hasPermissions: allPermissions?.Permissions?.length > 0,
      permissionsCount: allPermissions?.Permissions?.length
    });

    const hasPermission = allPermissions?.Permissions.find(
      (permissions) =>
        permissions.access && permissions.subAccountId === params.subaccountId
    )
    
    console.log("Permission check for subaccount:", {
      hasPermission: !!hasPermission,
      subaccountId: params.subaccountId
    });

    if (!hasPermission) {
      console.log("No permission found for subaccount, showing unauthorized");
      return <Unauthorized />
    }

    const allNotifications = await getNotificationAndUser(agencyId)
    console.log("Notifications check:", {
      totalNotifications: allNotifications?.length,
      userRole: user.privateMetadata.role
    });

    if (
      user.privateMetadata.role === 'AGENCY_ADMIN' ||
      user.privateMetadata.role === 'AGENCY_OWNER'
    ) {
      console.log("User is agency admin/owner, showing all notifications");
      notifications = allNotifications
    } else {
      console.log("Filtering notifications for subaccount");
      const filteredNoti = allNotifications?.filter(
        (item) => item.subAccountId === params.subaccountId
      )
      if (filteredNoti) notifications = filteredNoti
      console.log("Filtered notifications count:", filteredNoti?.length);
    }
  }

  console.log("=== Authorization successful, rendering layout ===");
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
} 

export default SubaccountLayout