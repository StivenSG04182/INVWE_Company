'use client'
import { Media } from '@prisma/client'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from '@/components/ui/alert-dialog'
import { Copy, Eye, MoreHorizontal, Trash, ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react'
import Image from 'next/image'
import { deleteMedia, saveActivityLogsNotification } from '@/lib/queries'
import { toast } from '../ui/use-toast'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type Props = { file: Media }

const MediaCard = ({ file }: Props) => {
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const router = useRouter()

  return (
    <>
      {/* Diálogo para visualizar la imagen */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[900px] p-0 bg-transparent border-none relative">
          <div className="relative w-full h-[80vh]" style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease' }}>
            <Image
              src={file.link}
              alt={file.name}
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2 bg-black/50 p-2 rounded-lg">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
              className="text-white hover:bg-black/30"
            >
              <ZoomOut size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setZoomLevel(1)}
              className="text-white hover:bg-black/30"
            >
              {zoomLevel.toFixed(1)}x
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.1))}
              className="text-white hover:bg-black/30"
            >
              <ZoomIn size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                if (isFullScreen) {
                  document.exitFullscreen();
                  setIsFullScreen(false);
                } else {
                  document.documentElement.requestFullscreen();
                  setIsFullScreen(true);
                }
              }}
              className="text-white hover:bg-black/30"
            >
              {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tarjeta de archivo con menú desplegable y diálogo de confirmación */}
      <AlertDialog>
        <DropdownMenu>
          <article className="border w-full rounded-lg bg-slate-900">
            <div className="relative w-full h-40">
              <Image
                src={file.link}
                alt="preview image"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <p className="opacity-0 h-0 w-0">{file.name}</p>
            <div className="p-4 relative">
              <p className="text-muted-foreground">
                {file.createdAt.toDateString()}
              </p>
              <p>{file.name}</p>
              <div className="absolute top-4 right-4 p-[1px] cursor-pointer ">
                <DropdownMenuTrigger>
                  <MoreHorizontal />
                </DropdownMenuTrigger>
              </div>
            </div>

            <DropdownMenuContent>
              <DropdownMenuLabel>Menú</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex gap-2"
                onClick={() => setShowPreview(true)}
              >
                <Eye size={15} /> Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(file.link)
                  toast({ title: 'Copied To Clipboard' })
                }}
              >
                <Copy size={15} /> Copiar enlace de imagen
              </DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="flex gap-2">
                  <Trash size={15} /> Eliminar archivo
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </article>
        </DropdownMenu>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-left">
            ¿Está completamente seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
            ¿Está seguro de que desea eliminar este archivo? Todas las subcuentas que utilicen este archivo
            dejarán de tener acceso a él.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center">
            <AlertDialogCancel className="mb-2">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              className="bg-destructive hover:bg-destructive"
              onClick={async () => {
                setLoading(true)
                const response = await deleteMedia(file.id)
                // Obtener el ID de la agencia desde la respuesta
                const agencyId = response.Subaccount?.agencyId
                await saveActivityLogsNotification({
                  agencyId: agencyId, // Usar el ID de la agencia si está disponible
                  description: `Borrado de un archivo multimedia | ${response?.name}`,
                  subaccountId: response.subAccountId,
                })
                toast({
                  title: 'Archivo eliminado',
                  description: 'Se ha eliminado correctamente el archivo',
                })
                setLoading(false)
                router.refresh()
              }}
            >
              Borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default MediaCard