import Unauthorized from '@/components/unauthorized'
import { getNotificationAndUser, verifyAndAcceptInvitation } from '@/lib/queries'
import { currentUser } from '@clerk/nextjs/server'
import Sidebar from '@/components/sidebar'
import { redirect } from 'next/navigation'
import React from 'react'
import BlurPage from '@/components/global/blur-page'
import InfoBar from '@/components/global/infobar'

type Props = {
    children : React.ReactNode
    params : {agencyId : string}
}

const layout = async ({children, params}: Props) => {
  const agencyId = await verifyAndAcceptInvitation()
  const user = await currentUser()

  if(!user){
    return redirect('/site')
  }
  
  if(!agencyId){
    return redirect('/agency')
  }

  // Log para debugging (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('Agency Layout Debug:', {
      userId: user.id,
      userEmail: user.emailAddresses[0]?.emailAddress,
      privateMetadata: user.privateMetadata,
      agencyId: agencyId,
      paramsAgencyId: params.agencyId,
      role: user.privateMetadata.role,
      isAgencyOwner: user.privateMetadata.role === 'AGENCY_OWNER',
      isAgencyAdmin: user.privateMetadata.role === 'AGENCY_ADMIN'
    })
  }

  // Verificar permisos con mejor manejo de errores
  const userRole = user.privateMetadata.role
  const hasAgencyAccess = userRole === 'AGENCY_OWNER' || userRole === 'AGENCY_ADMIN'
  
  if (!hasAgencyAccess) {
    console.error('Access denied for user:', {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      role: userRole,
      agencyId: params.agencyId
    })
    return <Unauthorized/>
  }

    let allNoti: any = []
    const notifications = await getNotificationAndUser(agencyId)
    if (notifications) allNoti = notifications

    return (
    <div className="h-screen overflow-hidden">
        <Sidebar
        id={params.agencyId}
        type="agency"
        />
        <div className='md:pl-[300px]'>
          <InfoBar 
          notifications={allNoti}
          role={allNoti.User?.role}
          agencyId={params.agencyId}
          />
          <div className='relative'>
          <BlurPage>
          {children}
          </BlurPage>
          </div>
        </div>
    </div>
    )
}

export default layout