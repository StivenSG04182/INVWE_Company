import Link from 'next/link'
import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

type Props = {}

const Unauthorized = (props: Props) => {
  const router = useRouter()

  return (
    <div className="p-4 text-center h-screen w-screen flex justify-center items-center flex-col">
      <h1 className="text-3xl md:text-6xl">¡Acceso no autorizado!</h1>
      <p className="text-muted-foreground text-center">
        No tienes permiso para acceder a esta página. Por favor, contacta al administrador
        si crees que esto es un error.
      </p>
      <Button onClick={() => router.push("/")}>Volver al inicio</Button>
    </div>
  )
}

export default Unauthorized