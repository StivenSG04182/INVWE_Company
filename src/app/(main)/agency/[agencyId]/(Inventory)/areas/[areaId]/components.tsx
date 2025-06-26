'use client'

import React, { useState } from 'react'
import { AreaVisualEditor } from '@/components/inventory/AreaVisualEditor'
import { toast } from 'sonner'
import { updateArea } from '@/lib/queries2'

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
      
      // Usar la función de queries2.ts en lugar de la API
      const updatedArea = await updateArea(areaId, { layout })

      if (!updatedArea) {
        throw new Error('Error al guardar el layout')
      }

      toast.success('Layout guardado correctamente')
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