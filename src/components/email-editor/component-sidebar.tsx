"use client"

import type React from "react"
import { useDrag } from "react-dnd"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Type,
  ImageIcon,
  MousePointer,
  Columns,
  Rows,
  Link,
  Video,
  Minus,
  Sparkles,
  Layout,
  Navigation,
  Volume2,
  ShoppingCart,
  FileText,
  Share2,
  Play,
  Grid3X3,
  AlignLeft,
  Square,
  Circle,
  Star,
  Heart,
} from "lucide-react"

interface ComponentCategory {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  components: ComponentItem[]
}

interface ComponentItem {
  type: string
  icon: React.ReactNode
  label: string
  description: string
  badge?: string
}

interface DraggableComponentProps extends ComponentItem {
  categoryColor: string
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  type,
  icon,
  label,
  description,
  badge,
  categoryColor,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "EMAIL_COMPONENT",
    item: { componentType: type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`group relative flex items-start gap-3 p-3 rounded-lg cursor-move border border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 ${
        isDragging ? "opacity-50 scale-95" : ""
      }`}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-white transition-colors"
        style={{ backgroundColor: categoryColor }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-foreground">{label}</span>
          {badge && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      </div>
      <div className="absolute inset-0 rounded-lg border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  )
}

const componentCategories: ComponentCategory[] = [
  {
    id: "basic",
    name: "Basic",
    icon: <Square size={16} />,
    color: "#3B82F6",
    components: [
      {
        type: "header",
        icon: <Type size={14} />,
        label: "Heading",
        description: "Add titles and headings to your email",
      },
      {
        type: "text",
        icon: <AlignLeft size={14} />,
        label: "Text",
        description: "Add paragraphs and body text content",
      },
      {
        type: "image",
        icon: <ImageIcon size={14} />,
        label: "Image",
        description: "Insert images and graphics",
      },
      {
        type: "button",
        icon: <MousePointer size={14} />,
        label: "Button",
        description: "Add clickable call-to-action buttons",
      },
      {
        type: "divider",
        icon: <Minus size={14} />,
        label: "Divider",
        description: "Add horizontal separator lines",
      },
      {
        type: "spacer",
        icon: <Rows size={14} />,
        label: "Spacer",
        description: "Add vertical spacing between elements",
      },
    ],
  },
  {
    id: "layout",
    name: "Layout",
    icon: <Layout size={16} />,
    color: "#10B981",
    components: [
      {
        type: "section",
        icon: <Square size={14} />,
        label: "Section",
        description: "Container for grouping elements",
      },
      {
        type: "column1",
        icon: <Columns size={14} />,
        label: "1 Column",
        description: "Single column layout container",
      },
      {
        type: "column2",
        icon: <Grid3X3 size={14} />,
        label: "2 Columns",
        description: "Two column layout container",
      },
      {
        type: "column3",
        icon: <Grid3X3 size={14} />,
        label: "3 Columns",
        description: "Three column layout container",
      },
      {
        type: "grid",
        icon: <Grid3X3 size={14} />,
        label: "Grid",
        description: "Flexible grid layout system",
        badge: "Pro",
      },
    ],
  },
  {
    id: "navigation",
    name: "Navigation",
    icon: <Navigation size={16} />,
    color: "#8B5CF6",
    components: [
      {
        type: "navbar",
        icon: <Navigation size={14} />,
        label: "Navigation Bar",
        description: "Header navigation menu",
        badge: "New",
      },
      {
        type: "breadcrumb",
        icon: <Link size={14} />,
        label: "Breadcrumb",
        description: "Navigation breadcrumb trail",
      },
      {
        type: "menu",
        icon: <Rows size={14} />,
        label: "Menu",
        description: "Vertical navigation menu",
      },
    ],
  },
  {
    id: "elements",
    name: "Elements",
    icon: <Sparkles size={16} />,
    color: "#F59E0B",
    components: [
      {
        type: "icon",
        icon: <Star size={14} />,
        label: "Icon",
        description: "Add icons and symbols",
      },
      {
        type: "badge",
        icon: <Circle size={14} />,
        label: "Badge",
        description: "Small status indicators",
      },
      {
        type: "card",
        icon: <Square size={14} />,
        label: "Card",
        description: "Content cards with borders",
      },
      {
        type: "quote",
        icon: <Type size={14} />,
        label: "Quote",
        description: "Blockquotes and testimonials",
      },
      {
        type: "list",
        icon: <AlignLeft size={14} />,
        label: "List",
        description: "Bulleted and numbered lists",
      },
    ],
  },
  {
    id: "media",
    name: "Media",
    icon: <Play size={16} />,
    color: "#EF4444",
    components: [
      {
        type: "video",
        icon: <Video size={14} />,
        label: "Video",
        description: "Embed video content",
      },
      {
        type: "audio",
        icon: <Volume2 size={14} />,
        label: "Audio",
        description: "Audio players and controls",
      },
      {
        type: "gallery",
        icon: <ImageIcon size={14} />,
        label: "Gallery",
        description: "Image galleries and carousels",
        badge: "Pro",
      },
    ],
  },
  {
    id: "ecommerce",
    name: "Ecommerce",
    icon: <ShoppingCart size={16} />,
    color: "#06B6D4",
    components: [
      {
        type: "product",
        icon: <ShoppingCart size={14} />,
        label: "Product",
        description: "Product showcase blocks",
      },
      {
        type: "price",
        icon: <Type size={14} />,
        label: "Price",
        description: "Pricing display components",
      },
      {
        type: "cart",
        icon: <ShoppingCart size={14} />,
        label: "Cart",
        description: "Shopping cart elements",
        badge: "Pro",
      },
    ],
  },
  {
    id: "forms",
    name: "Forms",
    icon: <FileText size={16} />,
    color: "#84CC16",
    components: [
      {
        type: "input",
        icon: <Square size={14} />,
        label: "Input",
        description: "Text input fields",
      },
      {
        type: "textarea",
        icon: <Square size={14} />,
        label: "Textarea",
        description: "Multi-line text areas",
      },
      {
        type: "select",
        icon: <Square size={14} />,
        label: "Select",
        description: "Dropdown selection menus",
      },
      {
        type: "checkbox",
        icon: <Square size={14} />,
        label: "Checkbox",
        description: "Checkbox input controls",
      },
    ],
  },
  {
    id: "social",
    name: "Social",
    icon: <Share2 size={16} />,
    color: "#EC4899",
    components: [
      {
        type: "social_links",
        icon: <Share2 size={14} />,
        label: "Social Links",
        description: "Social media link buttons",
      },
      {
        type: "share",
        icon: <Share2 size={14} />,
        label: "Share Button",
        description: "Content sharing buttons",
      },
      {
        type: "follow",
        icon: <Heart size={14} />,
        label: "Follow Button",
        description: "Social media follow buttons",
      },
    ],
  },
]

export const ComponentSidebar: React.FC = () => {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-1">
        {componentCategories.map((category) => (
          <div key={category.id} className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <div
                className="w-5 h-5 rounded flex items-center justify-center text-white"
                style={{ backgroundColor: category.color }}
              >
                {category.icon}
              </div>
              <h3 className="font-semibold text-sm text-foreground">{category.name}</h3>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-2">
              {category.components.map((component) => (
                <DraggableComponent key={component.type} {...component} categoryColor={category.color} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

export default ComponentSidebar
