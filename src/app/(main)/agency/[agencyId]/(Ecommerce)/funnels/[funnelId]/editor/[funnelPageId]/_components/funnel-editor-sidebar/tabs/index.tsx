import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Plus,
  Layers3,
  Database,
  Layout,
  Sparkles,
  Palette,
  History,
  Code,
  Puzzle,
  FileImage,
  Sliders,
  Package,
  Zap,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

const TabList = () => {
  const tabs = [
    { value: "Components", icon: Plus, label: "Componentes" },
    { value: "Settings", icon: Settings, label: "Propiedades" },
    { value: "Layers", icon: Layers3, label: "Capas" },
    { value: "Themes", icon: Palette, label: "Temas" },
    { value: "Media", icon: Database, label: "Medios" },
    { value: "Templates", icon: Layout, label: "Plantillas" },
    { value: "Animations", icon: Sparkles, label: "Animaciones" },
    { value: "System", icon: Package, label: "Sistema" },
    { value: "Features", icon: Zap, label: "Funcionalidades" },
    { value: "History", icon: History, label: "Historial" },
    { value: "Assets", icon: FileImage, label: "Assets" },
    { value: "Code", icon: Code, label: "Código" },
    { value: "Extensions", icon: Puzzle, label: "Extensiones" },
    { value: "Advanced", icon: Sliders, label: "Avanzado" },
  ]

  return (
      <TooltipProvider>
        <TabsList className="flex items-center flex-col justify-evenly w-full bg-transparent h-fit gap-4 ">
          {tabs.map((tab) => (
            <Tooltip key={tab.value}>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value={tab.value}
                  className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                >
                  <tab.icon className="h-5 w-5" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{tab.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TabsList>
      </TooltipProvider>
  )
}

export default TabList
