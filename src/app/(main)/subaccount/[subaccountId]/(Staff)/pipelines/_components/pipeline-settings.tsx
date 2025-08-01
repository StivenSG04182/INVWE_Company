'use client'
import React from 'react'
import PipelineInfobar from './pipeline-infobar'
import { Pipeline } from '@prisma/client'
import CreatePipelineForm from '@/components/forms/create-pipeline-form'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deletePipeline } from '@/lib/queries'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

const PipelineSettings = ({
  pipelineId,
  subaccountId,
  pipelines,
}: {
  pipelineId: string
  subaccountId: string
  pipelines: Pipeline[]
}) => {
  const router = useRouter()
  return (
    <AlertDialog>
      <div>
        <div className="flex items-center justify-between mb-4">
          <AlertDialogTrigger asChild>
            <Button variant={'destructive'}>Eliminar objetivo</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente el objetivo y sus datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="items-center">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    await deletePipeline(pipelineId)
                    //Challenge: Activity log
                    toast({
                      title: 'Eliminado',
                      description: 'El objetivo ha sido eliminado',
                    })
                    router.replace(`/subaccount/${subaccountId}/pipelines`)
                  } catch (error) {
                    toast({
                      variant: 'destructive',
                      title: '¡Ups!',
                      description: 'No se pudo eliminar el objetivo',
                    })
                  }
                }}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </div>

        <CreatePipelineForm
          subAccountId={subaccountId}
          defaultData={pipelines.find((p) => p.id === pipelineId)}
        />
      </div>
    </AlertDialog>
  )
}

export default PipelineSettings