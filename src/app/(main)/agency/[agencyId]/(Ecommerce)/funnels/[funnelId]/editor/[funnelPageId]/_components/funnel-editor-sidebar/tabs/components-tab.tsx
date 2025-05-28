"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { EditorBtns } from "@/lib/constants"
import type React from "react"
import { useState } from "react"
import TextPlaceholder from "./placeholders/text-placeholder"
import ContainerPlaceholder from "./placeholders/container-placeholder"
import VideoPlaceholder from "./placeholders/video-placeholder"
import TwoColumnsPlaceholder from "./placeholders/two-columns-placeholder"
import LinkPlaceholder from "./placeholders/link-placeholder"
import ImagePlaceholder from "./placeholders/image-placeholder"
import ButtonPlaceholder from "./placeholders/button-placeholder"
import FormPlaceholder from "./placeholders/form-placeholder"
import CardPlaceholder from "./placeholders/card-placeholder"
import AccordionPlaceholder from "./placeholders/accordion-placeholder"
import TabsPlaceholder from "./placeholders/tabs-placeholder"
import CarouselPlaceholder from "./placeholders/carousel-placeholder"
import NavbarPlaceholder from "./placeholders/navbar-placeholder"
import FooterPlaceholder from "./placeholders/footer-placeholder"
import HeroPlaceholder from "./placeholders/hero-placeholder"
import TestimonialPlaceholder from "./placeholders/testimonial-placeholder"
import PricingPlaceholder from "./placeholders/pricing-placeholder"
import FeaturePlaceholder from "./placeholders/feature-placeholder"
import { Search } from "lucide-react"

const ComponentsTab = () => {
    const [searchTerm, setSearchTerm] = useState("")

    const elements: {
        Component: React.FC
        label: string
        id: EditorBtns
        group: "layout" | "elements" | "forms" | "media" | "navigation" | "sections"
        keywords: string[]
    }[] = [
            // Layout Components
            {
                Component: ContainerPlaceholder,
                label: "Contenedor",
                id: "container",
                group: "layout",
                keywords: ["contenedor", "div", "caja", "wrapper"],
            },
            {
                Component: TwoColumnsPlaceholder,
                label: "2 Columnas",
                id: "2Col",
                group: "layout",
                keywords: ["columnas", "grid", "layout", "dos"],
            },
            {
                Component: CardPlaceholder,
                label: "Tarjeta",
                id: "card",
                group: "layout",
                keywords: ["tarjeta", "card", "contenedor", "caja"],
            },
            {
                Component: AccordionPlaceholder,
                label: "Acordeón",
                id: "accordion",
                group: "layout",
                keywords: ["acordeón", "collapse", "expandir", "faq"],
            },
            {
                Component: TabsPlaceholder,
                label: "Pestañas",
                id: "tabs",
                group: "layout",
                keywords: ["pestañas", "tabs", "navegación", "contenido"],
            },

            // Elements
            {
                Component: TextPlaceholder,
                label: "Texto",
                id: "text",
                group: "elements",
                keywords: ["texto", "párrafo", "título", "heading"],
            },
            {
                Component: LinkPlaceholder,
                label: "Enlace",
                id: "link",
                group: "elements",
                keywords: ["enlace", "link", "url", "hipervínculo"],
            },
            {
                Component: ButtonPlaceholder,
                label: "Botón",
                id: "button",
                group: "elements",
                keywords: ["botón", "button", "cta", "acción"],
            },

            // Media
            {
                Component: ImagePlaceholder,
                label: "Imagen",
                id: "image",
                group: "media",
                keywords: ["imagen", "foto", "picture", "img"],
            },
            {
                Component: VideoPlaceholder,
                label: "Video",
                id: "video",
                group: "media",
                keywords: ["video", "youtube", "multimedia"],
            },
            {
                Component: CarouselPlaceholder,
                label: "Carrusel",
                id: "carousel",
                group: "media",
                keywords: ["carrusel", "slider", "galería", "imágenes"],
            },

            // Forms
            {
                Component: FormPlaceholder,
                label: "Formulario",
                id: "form",
                group: "forms",
                keywords: ["formulario", "form", "contacto", "input"],
            },

            // Navigation
            {
                Component: NavbarPlaceholder,
                label: "Navbar",
                id: "navbar",
                group: "navigation",
                keywords: ["navbar", "navegación", "menú", "header"],
            },
            {
                Component: FooterPlaceholder,
                label: "Footer",
                id: "footer",
                group: "navigation",
                keywords: ["footer", "pie", "página", "enlaces"],
            },

            // Sections
            {
                Component: HeroPlaceholder,
                label: "Hero Section",
                id: "hero",
                group: "sections",
                keywords: ["hero", "banner", "principal", "portada"],
            },
            {
                Component: TestimonialPlaceholder,
                label: "Testimonios",
                id: "testimonial",
                group: "sections",
                keywords: ["testimonios", "reseñas", "opiniones", "clientes"],
            },
            {
                Component: PricingPlaceholder,
                label: "Precios",
                id: "pricing",
                group: "sections",
                keywords: ["precios", "planes", "pricing", "suscripción"],
            },
            {
                Component: FeaturePlaceholder,
                label: "Características",
                id: "features",
                group: "sections",
                keywords: ["características", "features", "beneficios", "ventajas"],
            },
        ]

    const filteredElements = elements.filter(
        (element) =>
            element.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            element.keywords.some((keyword) => keyword.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    const groupedElements = {
        layout: filteredElements.filter((el) => el.group === "layout"),
        elements: filteredElements.filter((el) => el.group === "elements"),
        media: filteredElements.filter((el) => el.group === "media"),
        forms: filteredElements.filter((el) => el.group === "forms"),
        navigation: filteredElements.filter((el) => el.group === "navigation"),
        sections: filteredElements.filter((el) => el.group === "sections"),
    }

    const renderGroup = (groupName: string, groupElements: typeof elements, defaultOpen = true) => {
        if (groupElements.length === 0) return null

        return (
            <AccordionItem value={groupName} className="px-6 py-0 border-b">
                <AccordionTrigger className="!no-underline hover:no-underline">
                    <span className="font-medium">{groupName}</span>
                </AccordionTrigger>
                <AccordionContent className="grid grid-cols-2 gap-3 pb-4">
                    {groupElements.map((element) => (
                        <div
                            key={element.id}
                            className="flex flex-col items-center justify-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                        >
                            <div className="transform group-hover:scale-105 transition-transform">{element.Component}</div>
                            <span className="text-xs text-muted-foreground text-center">{element.label}</span>
                        </div>
                    ))}
                </AccordionContent>
            </AccordionItem>
        )
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold mb-2">Componentes</h3>
                <p className="text-sm text-muted-foreground mb-4">Arrastra y suelta componentes en el lienzo</p>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar componentes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <Accordion
                    type="multiple"
                    className="w-full"
                    defaultValue={["Diseño", "Elementos", "Multimedia", "Formularios", "Navegación", "Secciones"]}
                >
                    {renderGroup("Diseño", groupedElements.layout)}
                    {renderGroup("Elementos", groupedElements.elements)}
                    {renderGroup("Multimedia", groupedElements.media)}
                    {renderGroup("Formularios", groupedElements.forms)}
                    {renderGroup("Navegación", groupedElements.navigation)}
                    {renderGroup("Secciones", groupedElements.sections)}
                </Accordion>
            </ScrollArea>
        </div>
    )
}

export default ComponentsTab
