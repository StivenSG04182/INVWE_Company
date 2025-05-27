'use client'

import React, { useState } from 'react'
import { AreaVisualEditor } from '@/components/inventory/AreaVisualEditor'
import { toast } from 'sonner'

type AreaVisualEditorWrapperProps = {
  areaId: string
  agencyId: string
  initialLayout: any
}

export const AreaVisualEditorWrapper = ({
  areaId,
  agencyId,
  initialLayout,
}: AreaVisualEditorWrapperProps) => {
  const [isLoading, setIsLoading] = useState(false)

  // Función para guardar el layout en la base de datos
  const handleSaveLayout = async (layout: any) => {
    try {
      setIsLoading(true)
      
      // Realizar la petición para actualizar el layout del área
      const response = await fetch(`/api/inventory/${agencyId}/areas/${areaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ layout }),
      })

      if (!response.ok) {
        throw new Error('Error al guardar el layout')
      }

      return await response.json()
    } catch (error) {
      console.error('Error al guardar el layout:', error)
      toast.error('Error al guardar el layout')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AreaVisualEditor
      areaId={areaId}
      agencyId={agencyId}
      initialLayout={initialLayout}
      onSave={handleSaveLayout}
    />
  )
}