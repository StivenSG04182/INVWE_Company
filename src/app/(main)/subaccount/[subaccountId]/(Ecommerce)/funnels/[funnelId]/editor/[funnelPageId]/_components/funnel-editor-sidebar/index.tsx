'use client'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useEditor } from '@/providers/editor/editor-provider'
import clsx from 'clsx'
import React from 'react'
import TabList from './tabs'
import SettingsTab from './tabs/settings-tab'
import MediaBucketTab from './tabs/media-bucket-tabs'
import ComponentsTab from './tabs/components-tab'

type Props = {
  agencyId: string
}

const FunnelEditorSidebar = ({agencyId}: Props) => {
  const { state, dispatch } = useEditor()
  return (
    <Sheet
      open={true}
      modal={false}
    >
      <Tabs
      className="w-full "
      defaultValue="Settings"
      >
        <SheetContent
          showX={false}
          side="right"
          className={clsx(
            'mt-[97px] w-16 z-[80] shadow-none  p-0 focus:border-none transition-all overflow-hidden',
            { hidden: state.editor.previewMode }
          )}
        >
          <TabList />
        </SheetContent>
          <SheetContent
          showX={false}
          side="right"
          className={clsx(
            'mt-[97px] w-80 z-[40] shadow-none p-0 mr-16 bg-background h-full transition-all overflow-hidden ',
            { hidden: state.editor.previewMode }
          )}
          >
            <div className="grid gap-4 h-full pb-36">
              <TabsContent value='Settings'>
              <SheetHeader className="text-left p-6">
                <SheetTitle>Estilos</SheetTitle>
                <SheetDescription>
                  ¡Muestra tu creatividad! Puedes personalizar cada componente como
                  desees.
                </SheetDescription>
              </SheetHeader>
              <SettingsTab />
              </TabsContent>
              <TabsContent
              value='Media'>
                <MediaBucketTab agencyId={agencyId}></MediaBucketTab>
              </TabsContent>
              <TabsContent value="Components">
              <SheetHeader className="text-left p-6 ">
                <SheetTitle>Componentes</SheetTitle>
                <SheetDescription>
                  Puedes arrastrar y soltar componentes en el lienzo
                </SheetDescription>
              </SheetHeader>
              <ComponentsTab />
            </TabsContent>
            </div>
          </SheetContent>
      </Tabs>
    </Sheet>
  )
}

export default FunnelEditorSidebar