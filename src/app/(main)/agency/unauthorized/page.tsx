import Unauthorized from '@/components/unauthorized'
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'

type Props = {}

const page = async (props: Props) => {
  const user = await currentUser();

  return <Unauthorized/>
}

export default page