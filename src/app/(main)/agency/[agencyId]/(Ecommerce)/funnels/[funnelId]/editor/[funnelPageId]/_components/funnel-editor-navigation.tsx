"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { saveActivityLogsNotification, upsertFunnelPage } from "@/lib/queries"
import { type DeviceTypes, useEditor } from "@/providers/editor/editor-provider"
import type { FunnelPage } from "@prisma/client"
import clsx from "clsx"
import { ArrowLeftCircle, EyeIcon, Laptop, Redo2, Smartphone, Tablet, Undo2, Save, Clock, Rocket } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { type FocusEventHandler, useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  funnelId: string
  funnelPageDetails: FunnelPage
  agencyId: string
}

const FunnelEditorNavigation = ({ funnelId, funnelPageDetails, agencyId }: Props) => {
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentUrl, setDeploymentUrl] = useState<string>()
  const [showDeployDialog, setShowDeployDialog] = useState(false)
  const router = useRouter()
  const { state, dispatch } = useEditor()

  useEffect(() => {
    dispatch({
      type: "SET_FUNNELPAGE_ID",
      payload: { funnelPageId: funnelPageDetails.id },
    })
  }, [funnelPageDetails])

  const handleOnBlurTitleChange: FocusEventHandler<HTMLInputElement> = async (event) => {
    if (event.target.value === funnelPageDetails.name) return
    if (event.target.value) {
      await upsertFunnelPage(
        agencyId,
        {
          id: funnelPageDetails.id,
          name: event.target.value,
          order: funnelPageDetails.order,
        },
        funnelId,
      )

      toast.success("Título guardado correctamente")
      router.refresh()
    } else {
      toast.error("El título no puede estar vacío")
      event.target.value = funnelPageDetails.name
    }
  }

  const handlePreviewClick = () => {
    dispatch({ type: "TOGGLE_PREVIEW_MODE" })
    dispatch({ type: "TOGGLE_LIVE_MODE" })
  }

  const handleUndo = () => {
    dispatch({ type: "UNDO" })
  }

  const handleRedo = () => {
    dispatch({ type: "REDO" })
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
        funnelId,
      )
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Página actualizada | ${response?.name}`,
        agencyId: agencyId,
      })
      toast.success("Editor guardado correctamente")
    } catch (error) {
      toast.error("Error al guardar el editor")
    }
  }

  const handleDeploy = async () => {
    setIsDeploying(true)
    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId,
          funnelId,
          token: "your-vercel-token" // This should come from your auth system
        })
      })

      const data = await response.json()

      if (data.success) {
        setDeploymentUrl(data.url)
        setShowDeployDialog(true)
        toast.success("Deployment successful!")
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to deploy")
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <>
      <TooltipProvider>
        <nav
          className={clsx(
            "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-all duration-300",
            { "!h-0 !p-0 !overflow-hidden opacity-0": state.editor.previewMode },
          )}
        >
          <div className="flex items-center justify-between p-4 gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-4 min-w-0 flex-1 max-w-md">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/agency/${agencyId}/funnels/${funnelId}`}>
                      <ArrowLeftCircle className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Volver al funnel</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex flex-col min-w-0 flex-1">
                <Input
                  defaultValue={funnelPageDetails.name}
                  className="border-none h-8 p-0 text-base font-medium bg-transparent focus-visible:ring-0"
                  onBlur={handleOnBlurTitleChange}
                  placeholder="Nombre de la página"
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>/{funnelPageDetails.pathName}</span>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {funnelPageDetails.updatedAt.toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Center Section - Device Selector */}
            <div className="flex items-center gap-2">
              <Tabs
                defaultValue="Desktop"
                className="w-fit"
                value={state.editor.device}
                onValueChange={(value) => {
                  dispatch({
                    type: "CHANGE_DEVICE",
                    payload: { device: value as DeviceTypes },
                  })
                }}
              >
                <TabsList className="grid grid-cols-3 bg-muted/50 h-9">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="Desktop" className="data-[state=active]:bg-background w-9 h-7 p-0">
                        <Laptop className="h-4 w-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Escritorio</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="Tablet" className="w-9 h-7 p-0 data-[state=active]:bg-background">
                        <Tablet className="h-4 w-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Tableta</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="Mobile" className="w-9 h-7 p-0 data-[state=active]:bg-background">
                        <Smartphone className="h-4 w-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Móvil</TooltipContent>
                  </Tooltip>
                </TabsList>
              </Tabs>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleUndo}
                      disabled={!(state.history.currentIndex > 0)}
                      className="h-9 w-9"
                    >
                      <Undo2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Deshacer</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRedo}
                      disabled={!(state.history.currentIndex < state.history.history.length - 1)}
                      className="h-9 w-9"
                    >
                      <Redo2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rehacer</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handlePreviewClick} className="h-9 w-9">
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Vista previa</TooltipContent>
              </Tooltip>

              <div className="flex items-center gap-3 px-3 py-1 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Borrador</span>
                <Switch disabled defaultChecked={true} />
                <span className="text-sm text-muted-foreground">Publicar</span>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDeploy}
                    disabled={isDeploying}
                    className="h-9 w-9"
                  >
                    <Rocket className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Deploy</TooltipContent>
              </Tooltip>

              <Button onClick={handleOnSave} className="gap-2">
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            </div>
          </div>
        </nav>
      </TooltipProvider>

      <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deployment Successful!</DialogTitle>
            <DialogDescription>
              Your funnel has been deployed and is now live at:
              <a
                href={deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline block mt-2"
              >
                {deploymentUrl}
              </a>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FunnelEditorNavigation