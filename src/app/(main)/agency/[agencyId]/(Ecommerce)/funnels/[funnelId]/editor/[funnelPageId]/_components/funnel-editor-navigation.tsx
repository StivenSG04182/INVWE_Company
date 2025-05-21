'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { saveActivityLogsNotification, upsertFunnelPage } from '@/lib/queries'
import { DeviceTypes, useEditor } from '@/providers/editor/editor-provider'
import { FunnelPage } from '@prisma/client'
import clsx from 'clsx'
import { ArrowLeftCircle, EyeIcon, Laptop, Redo2, Smartphone, Tablet, Undo2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { FocusEventHandler, useEffect } from 'react'
import { toast } from 'sonner'

type Props = {
    funnelId: string
    funnelPageDetails: FunnelPage
    agencyId: string
}

const FunnelEditorNavigation = ({
    funnelId,
    funnelPageDetails,
    agencyId,
  }: Props) => {
      const router = useRouter()
      const { state, dispatch } = useEditor()
      useEffect(() => {
        dispatch({
          type: 'SET_FUNNELPAGE_ID',
          payload: { funnelPageId: funnelPageDetails.id },
        })
      }, [funnelPageDetails])

      const handleOnBlurTitleChange: FocusEventHandler<HTMLInputElement> = async (
        event
      ) => {
        if (event.target.value === funnelPageDetails.name) return
        if (event.target.value) {
          await upsertFunnelPage(
            agencyId,
            {
              id: funnelPageDetails.id,
              name: event.target.value,
              order: funnelPageDetails.order,
            },
            funnelId
          )
    
          toast('Éxito', {
            description: 'Título de página de comercio electrónico guardado',
          })
          router.refresh()
        } else {
          toast('¡Ups!', {
            description: '¡Necesitas tener un título!',
          })
          event.target.value = funnelPageDetails.name
        }
      }
      const handlePreviewClick = () => {
        dispatch({ type: 'TOGGLE_PREVIEW_MODE' })
        dispatch({ type: 'TOGGLE_LIVE_MODE' })
      }
      const handleUndo = () => {
        dispatch({ type: 'UNDO' })
      }
    
      const handleRedo = () => {
        dispatch({ type: 'REDO' })
      }

      const handleOnSave = async () => {
        const content = JSON.stringify(state.editor.elements)
        try {
          const response = await upsertFunnelPage(
            agencyId,
            {
              ...funnelPageDetails,
              content,
            },
            funnelId
          )
          await saveActivityLogsNotification({
            agencyId: undefined,
            description: `Página de comercio electrónico actualizada | ${response?.name}`,
            agencyId: agencyId,
          })
          toast('Éxito', {
            description: 'Editor guardado',
          })
        } catch (error) {
          toast('¡Ups!', {
            description: 'No se pudo guardar el editor',
          })
        }
      }

  return (
    <TooltipProvider>
        <nav
        className={clsx(
            'border-b-[1px] flex items-center justify-between p-6 gap-2 transition-all',
            { '!h-0 !p-0 !overflow-hidden': state.editor.previewMode }
          )}
        >
            <aside className="flex items-center gap-4 max-w-[260px] w-[300px]">
            <Link href={`/agency/${agencyId}/funnels/${funnelId}`}>
            <ArrowLeftCircle />
          </Link>
            <div className="flex flex-col w-full ">
            <Input
              defaultValue={funnelPageDetails.name}
              className="border-none h-5 m-0 p-0 text-lg"
              onBlur={handleOnBlurTitleChange}
            />
            <span className="text-sm text-muted-foreground">
              Ruta: /{funnelPageDetails.pathName}
            </span>
          </div>
            </aside>
            <aside>
                <Tabs 
                defaultValue="Desktop"
                className="w-fit "
                value={state.editor.device}
                onValueChange={(value) => {
                  dispatch({
                    type: 'CHANGE_DEVICE',
                    payload: { device: value as DeviceTypes },
                  })
                }}
                >
                <TabsList className="grid w-full grid-cols-3 bg-transparent h-fit">
                    <Tooltip>
                        <TooltipTrigger>
                        <TabsTrigger
                            value="Desktop"
                            className="data-[state=active]:bg-muted w-10 h-10 p-0"
                        >
                            <Laptop />
                        </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>Escritorio</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger>
                        <TabsTrigger
                            value="Tablet"
                            className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                        >
                            <Tablet />
                        </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>Tableta</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger>
                        <TabsTrigger
                            value="Mobile"
                            className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                        >
                            <Smartphone />
                        </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>Móvil</p>
                        </TooltipContent>
                    </Tooltip>
                 </TabsList>
                </Tabs>
            </aside>
            <aside className="flex items-center gap-2">
            <Button
                variant={'ghost'}
                size={'icon'}
                className="hover:bg-slate-800"
                onClick={handlePreviewClick}
            >
                <EyeIcon />
            </Button>
            <Button
            disabled={!(state.history.currentIndex > 0)}
            onClick={handleUndo}
            variant={'ghost'}
            size={'icon'}
            className="hover:bg-slate-800"
          >
            <Undo2 />
          </Button>
          <Button
            disabled={
              !(state.history.currentIndex < state.history.history.length - 1)
            }
            onClick={handleRedo}
            variant={'ghost'}
            size={'icon'}
            className="hover:bg-slate-800 mr-4"
          >
            <Redo2 />
          </Button>
          <div className="flex flex-col item-center mr-4">
            <div className="flex flex-row items-center gap-4">
              Borrador
              <Switch
                disabled
                defaultChecked={true}
              />
              Publicar
            </div>
            <span className="text-muted-foreground text-sm">
              Última actualización {funnelPageDetails.updatedAt.toLocaleDateString()}
            </span>
          </div>
          <Button onClick={handleOnSave}>Guardar</Button>
            </aside>
        </nav>
    </TooltipProvider>
  )
}

export default FunnelEditorNavigation