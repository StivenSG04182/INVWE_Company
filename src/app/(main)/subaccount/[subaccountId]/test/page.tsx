import React from 'react'
import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'

type Props = {
  params: { subaccountId: string }
}

const TestPage = async ({ params }: Props) => {
  console.log('🧪 TestPage - Starting with subaccountId:', params.subaccountId)
  
  try {
    // Test 1: Verificar si el usuario está autenticado
    const user = await currentUser()
    console.log('🧪 User authenticated:', !!user, user?.emailAddresses[0]?.emailAddress)
    
    // Test 2: Verificar si la base de datos está funcionando
    const subaccount = await db.subAccount.findUnique({
      where: { id: params.subaccountId },
      select: { id: true, name: true, agencyId: true }
    })
    console.log('🧪 Subaccount found:', !!subaccount, subaccount?.name)
    
    // Test 3: Verificar si hay productos
    const products = await db.product.findMany({
      where: { subAccountId: params.subaccountId },
      select: { id: true, name: true }
    })
    console.log('🧪 Products count:', products.length)
    
    // Test 4: Verificar si hay movimientos
    const movements = await db.movement.findMany({
      where: { subAccountId: params.subaccountId },
      select: { id: true, type: true }
    })
    console.log('🧪 Movements count:', movements.length)
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">🧪 Página de Prueba - Subaccount</h1>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Información del Usuario:</h2>
            <p><strong>Autenticado:</strong> {user ? 'Sí' : 'No'}</p>
            <p><strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress || 'N/A'}</p>
            <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Información de la Subcuenta:</h2>
            <p><strong>ID:</strong> {params.subaccountId}</p>
            <p><strong>Encontrada:</strong> {subaccount ? 'Sí' : 'No'}</p>
            <p><strong>Nombre:</strong> {subaccount?.name || 'N/A'}</p>
            <p><strong>Agency ID:</strong> {subaccount?.agencyId || 'N/A'}</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Datos de la Base de Datos:</h2>
            <p><strong>Productos:</strong> {products.length}</p>
            <p><strong>Movimientos:</strong> {movements.length}</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Variables de Entorno:</h2>
            <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
            <p><strong>DATABASE_URL:</strong> {process.env.DATABASE_URL ? 'Configurada' : 'No configurada'}</p>
            <p><strong>NEXT_PUBLIC_DOMAIN:</strong> {process.env.NEXT_PUBLIC_DOMAIN || 'No configurada'}</p>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('❌ Error en TestPage:', error)
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-6">❌ Error en Página de Prueba</h1>
        <div className="p-4 border border-red-300 rounded-lg bg-red-50">
          <p><strong>Error:</strong> {error instanceof Error ? error.message : String(error)}</p>
          <p><strong>SubaccountId:</strong> {params.subaccountId}</p>
        </div>
      </div>
    )
  }
}

export default TestPage 