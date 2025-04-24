import Unauthorized from '@/components/unauthorized'
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'

type Props = {}

const page = async (props: Props) => {
  console.log("=== Rendering Unauthorized Page ===");
  
  const user = await currentUser();
  console.log("User details in unauthorized page:", {
    id: user?.id,
    email: user?.emailAddresses[0]?.emailAddress,
    hasEmail: !!user?.emailAddresses[0]
  });

  return <Unauthorized/>
}

export default page