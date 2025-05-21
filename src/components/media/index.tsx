import { GetMediaFiles } from '@/lib/types'
import React from 'react'
import MediaUploadButton from './upload-buttons'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import MediaCard from './media-card'
import { FolderSearch } from 'lucide-react'

type Props = {
    data: GetMediaFiles,
    subaccountId: string,
    agencyId?: string
}

const MediaComponent = ({data, subaccountId, agencyId}: Props) => {
  // Logs detallados para depurar los datos recibidos
  console.log('MediaComponent renderizado con:', { 
    dataExists: !!data,
    mediaLength: data?.Media?.length || 0,
    subaccountId,
    agencyId
  });
  
  // Verificamos si tenemos datos válidos
  const hasMedia = data?.Media && Array.isArray(data.Media) && data.Media.length > 0;
  
  // Si hay datos, mostramos información detallada para depuración
  if (hasMedia) {
    console.log('Archivos multimedia encontrados:', data.Media.length);
    console.log('Primer archivo multimedia:', {
      id: data.Media[0].id,
      name: data.Media[0].name,
      link: data.Media[0].link,
      subAccountId: data.Media[0].subAccountId,
      agencyId: data.Media[0].agencyId
    });
  } else {
    console.log('No se encontraron archivos multimedia');
  }
  
  return (
    <div className='flex flex-col gap-4 h-full w-full'>
        <div className='flex justify-between items-center'>
            <h1 className='text-4xl'>Archivos Multimedia</h1>
            <MediaUploadButton subaccountId={subaccountId} agencyId={agencyId}/>
        </div>
        <Command className='bg-transparent'>
          <CommandInput placeholder='Buscar por nombre de archivo'/>
          <CommandList className='pb-40 max-h-full'>
            <CommandGroup heading='Archivos Multimedia'>
                <div className='flex flex-wrap gap-4 pt-4'>
                  {hasMedia ? (
                    data.Media.map((file) => {
                      console.log('Renderizando archivo:', file.name);
                      return (
                        <CommandItem 
                          key={file.id} 
                          className='p-0 max-w-[300px] w-full rounded-lg !bg-transparent !font-medium !text-white'
                        >
                          <MediaCard file={file}/>
                        </CommandItem>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center w-full flex-col">
                      <FolderSearch
                        size={200}
                        className="dark:text-muted text-slate-300"
                      />
                      <p className="text-muted-foreground">
                        ¡Vacío! No hay archivos que mostrar.
                      </p>
                    </div>
                  )}
                </div>
              </CommandGroup>
          </CommandList>
        </Command>
    </div>
  )
}

export default MediaComponent