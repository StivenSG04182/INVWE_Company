import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { EditorBtns } from '@/lib/constants'
import React from 'react'
import TextPlaceholder from "./text-placeholder"
import ContainerPlaceholder from "./container-placeholder"
import VideoPlaceholder from "./video-placeholder"
import TwoColumnsPlaceholder from "./two-columns-placeholder"
import LinkPlaceholder from "./link-placeholder"
import ImagePlaceholder from "./image-placeholder"
import ButtonPlaceholder from "./button-placeholder"
import FormPlaceholder from "./form-placeholder"
import CardPlaceholder from "./card-placeholder"
import AccordionPlaceholder from "./accordion-placeholder"
import TabsPlaceholder from "./tabs-placeholder"

import NavbarPlaceholder from "./navbar-placeholder"
import FooterPlaceholder from "./footer-placeholder"
import HeroPlaceholder from "./hero-placeholder"
import TestimonialPlaceholder from "./testimonial-placeholder"
import PricingPlaceholder from "./pricing-placeholder"
import FeaturePlaceholder from "./feature-placeholder"


type Props = {}

const ComponentsTab = (props: Props) => {
    const elements: {
        Component: React.ReactNode
        label: string
        id: EditorBtns
        group: 'layout' | 'elements'
    }[] = [
            {
                Component: <TextPlaceholder />,
                label: 'Text',
                id: 'text',
                group: 'elements'
            },
            {
                Component: <ContainerPlaceholder />,
                label: 'Container',
                id: 'container',
                group: 'elements'
            },
            {
                Component: <VideoPlaceholder />,
                label: 'Video',
                id: 'video',
                group: 'elements'
            },
            {
                Component: <TwoColumnsPlaceholder />,
                label: '2 Columns',
                id: '2Col',
                group: 'layout',
            },
            {
                Component: <LinkPlaceholder />,
                label: 'Link',
                id: 'link',
                group: 'elements',
            },
            {
                Component: <ImagePlaceholder />,
                label: 'Image',
                id: 'image',
                group: 'elements',
            },
            {
                Component: <ButtonPlaceholder />,
                label: 'Button',
                id: 'button',
                group: 'elements',
            },
            {
                Component: <FormPlaceholder />,
                label: 'Form',
                id: 'form',
                group: 'elements',
            },
            {
                Component: <CardPlaceholder />,
                label: 'Card',
                id: 'card',
                group: 'elements',
            },
            {
                Component: <AccordionPlaceholder />,
                label: 'Accordion',
                id: 'accordion',
                group: 'elements',
            },
            {
                Component: <TabsPlaceholder />,
                label: 'Tabs',
                id: 'tabs',
                group: 'elements',
            },
            {
                Component: <NavbarPlaceholder />,
                label: 'Navbar',
                id: 'navbar',
                group: 'layout',
            },
            {
                Component: <FooterPlaceholder />,
                label: 'Footer',
                id: 'footer',
                group: 'layout',
            },
            {
                Component: <HeroPlaceholder />,
                label: 'Hero',
                id: 'hero',
                group: 'layout',
            },
            {
                Component: <TestimonialPlaceholder />,
                label: 'Testimonial',
                id: 'testimonial',
                group: 'elements',
            },
            {
                Component: <PricingPlaceholder />,
                label: 'Pricing',
                id: 'pricing',
                group: 'elements',
            },
            {
                Component: <FeaturePlaceholder />,
                label: 'Feature',
                id: 'feature',
                group: 'elements',
            },
        ]

    const handleDragStart = (e: React.DragEvent, id: EditorBtns) => {
        e.dataTransfer.setData('componentType', id)
    }

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
                <AccordionTrigger className="!no-underline">Layout</AccordionTrigger>
                <AccordionContent className="flex flex-wrap gap-2 ">
                    {elements
                        .filter((element) => element.group === 'layout')
                        .map((element) => (
                            <div
                                key={element.id}
                                className="flex-col items-center justify-center flex cursor-move"
                                draggable
                                onDragStart={(e) => handleDragStart(e, element.id)}
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
                <AccordionTrigger className="!no-underline">Elements</AccordionTrigger>
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