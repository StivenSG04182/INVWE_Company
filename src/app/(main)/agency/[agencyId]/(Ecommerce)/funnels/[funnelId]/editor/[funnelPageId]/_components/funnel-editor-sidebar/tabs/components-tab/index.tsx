import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from '@/components/ui/accordion'
  import { EditorBtns } from '@/lib/constants'
  import React from 'react'
import TextPlaceholder from '../placeholders/text-placeholder'
import ContainerPlaceholder from '../placeholders/container-placeholder'
import VideoPlaceholder from '../placeholders/video-placeholder'
import TwoColumnsPlaceholder from '../placeholders/two-columns-placeholder'
import LinkPlaceholder from '../placeholders/link-placeholder'

  
  type Props = {}
  
  const ComponentsTab = (props: Props) => {
    const elements: {
      Component: React.ReactNode
      label: string
      id: EditorBtns
      group: 'layout' | 'elements'
    }[] = [
        {
            Component:<TextPlaceholder/>,
            label:'Texto',
            id:'text',
            group:'elements'
        },
        {
            Component:<ContainerPlaceholder/>,
            label:'Contenedor',
            id:'container',
            group:'elements'
        },
        {
            Component:<VideoPlaceholder/>,
            label:'Video',
            id:'video',
            group:'elements'
        },
        {
        Component: <TwoColumnsPlaceholder />,
        label: '2 Columnas',
        id: '2Col',
        group: 'layout',
        },
        {
        Component: <LinkPlaceholder />,
        label: 'Enlace',
        id: 'link',
        group: 'elements',
        },
    ]
  
    return (
      <Accordion
        type="multiple"
        className="w-full"
        defaultValue={['Layout', 'Elements']}
      >
        <AccordionItem
          value="Layout"
          className="px-6 py-0 border-y-[1px]"
        >
          <AccordionTrigger className="!no-underline">Diseño</AccordionTrigger>
          <AccordionContent className="flex flex-wrap gap-2 ">
            {elements
              .filter((element) => element.group === 'layout')
              .map((element) => (
                <div
                  key={element.id}
                  className="flex-col items-center justify-center flex"
                >
                  {element.Component}
                  <span className="text-muted-foreground">{element.label}</span>
                </div>
              ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="Elements"
          className="px-6 py-0 "
        >
          <AccordionTrigger className="!no-underline">Elementos</AccordionTrigger>
          <AccordionContent className="flex flex-wrap gap-2 ">
            {elements
              .filter((element) => element.group === 'elements')
              .map((element) => (
                <div
                  key={element.id}
                  className="flex-col items-center justify-center flex"
                >
                  {element.Component}
                  <span className="text-muted-foreground">{element.label}</span>
                </div>
              ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }
  
  export default ComponentsTab