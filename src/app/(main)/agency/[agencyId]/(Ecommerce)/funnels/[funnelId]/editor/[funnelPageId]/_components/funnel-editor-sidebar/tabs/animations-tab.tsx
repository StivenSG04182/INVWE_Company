"use client"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEditor } from "@/providers/editor/editor-provider"
import {
    Play,
    RotateCcw,
    Zap,
    MousePointer,
    Eye,
    ArrowRight,
    ArrowUp,
    RotateCw,
    Scale,
    Move,
    Sparkles,
    Wind,
    Waves,
    Snowflake,
    Heart,
    Star,
} from "lucide-react"

const AnimationsTab = () => {
    const { state, dispatch } = useEditor()
    const [selectedAnimation, setSelectedAnimation] = useState("")
    const [duration, setDuration] = useState([1])
    const [delay, setDelay] = useState([0])
    const [iterations, setIterations] = useState([1])
    const [direction, setDirection] = useState("normal")
    const [fillMode, setFillMode] = useState("none")
    const [timingFunction, setTimingFunction] = useState("ease")

    const animations = [
        // Entrance Animations
        {
            id: "fadeIn",
            name: "Fade In",
            icon: Eye,
            description: "Aparece gradualmente",
            category: "entrance",
            keyframes: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `,
        },
        {
            id: "slideInLeft",
            name: "Slide In Left",
            icon: ArrowRight,
            description: "Desliza desde la izquierda",
            category: "entrance",
            keyframes: `
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `,
        },
        {
            id: "slideInRight",
            name: "Slide In Right",
            icon: ArrowRight,
            description: "Desliza desde la derecha",
            category: "entrance",
            keyframes: `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `,
        },
        {
            id: "slideInUp",
            name: "Slide In Up",
            icon: ArrowUp,
            description: "Desliza desde abajo",
            category: "entrance",
            keyframes: `
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `,
        },
        {
            id: "slideInDown",
            name: "Slide In Down",
            icon: ArrowUp,
            description: "Desliza desde arriba",
            category: "entrance",
            keyframes: `
        @keyframes slideInDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `,
        },
        {
            id: "zoomIn",
            name: "Zoom In",
            icon: Scale,
            description: "Aumenta de tamaño",
            category: "entrance",
            keyframes: `
        @keyframes zoomIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `,
        },
        {
            id: "zoomOut",
            name: "Zoom Out",
            icon: Scale,
            description: "Disminuye de tamaño",
            category: "entrance",
            keyframes: `
        @keyframes zoomOut {
          from { transform: scale(1.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `,
        },
        {
            id: "rotateIn",
            name: "Rotate In",
            icon: RotateCw,
            description: "Rota al aparecer",
            category: "entrance",
            keyframes: `
        @keyframes rotateIn {
          from { transform: rotate(-360deg) scale(0); opacity: 0; }
          to { transform: rotate(0deg) scale(1); opacity: 1; }
        }
      `,
        },
        {
            id: "flipInX",
            name: "Flip In X",
            icon: RotateCw,
            description: "Voltea horizontalmente",
            category: "entrance",
            keyframes: `
        @keyframes flipInX {
          from { transform: perspective(400px) rotateX(90deg); opacity: 0; }
          to { transform: perspective(400px) rotateX(0deg); opacity: 1; }
        }
      `,
        },
        {
            id: "flipInY",
            name: "Flip In Y",
            icon: RotateCw,
            description: "Voltea verticalmente",
            category: "entrance",
            keyframes: `
        @keyframes flipInY {
          from { transform: perspective(400px) rotateY(90deg); opacity: 0; }
          to { transform: perspective(400px) rotateY(0deg); opacity: 1; }
        }
      `,
        },

        // Attention Animations
        {
            id: "bounce",
            name: "Bounce",
            icon: Zap,
            description: "Efecto rebote",
            category: "attention",
            keyframes: `
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0, -30px, 0); }
          70% { transform: translate3d(0, -15px, 0); }
          90% { transform: translate3d(0, -4px, 0); }
        }
      `,
        },
        {
            id: "pulse",
            name: "Pulse",
            icon: Heart,
            description: "Pulso continuo",
            category: "attention",
            keyframes: `
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `,
        },
        {
            id: "shake",
            name: "Shake",
            icon: RotateCcw,
            description: "Movimiento de sacudida",
            category: "attention",
            keyframes: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
      `,
        },
        {
            id: "swing",
            name: "Swing",
            icon: Wind,
            description: "Balanceo suave",
            category: "attention",
            keyframes: `
        @keyframes swing {
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
          100% { transform: rotate(0deg); }
        }
      `,
        },
        {
            id: "wobble",
            name: "Wobble",
            icon: Waves,
            description: "Movimiento ondulante",
            category: "attention",
            keyframes: `
        @keyframes wobble {
          0% { transform: translateX(0%); }
          15% { transform: translateX(-25%) rotate(-5deg); }
          30% { transform: translateX(20%) rotate(3deg); }
          45% { transform: translateX(-15%) rotate(-3deg); }
          60% { transform: translateX(10%) rotate(2deg); }
          75% { transform: translateX(-5%) rotate(-1deg); }
          100% { transform: translateX(0%); }
        }
      `,
        },
        {
            id: "flash",
            name: "Flash",
            icon: Sparkles,
            description: "Destello intermitente",
            category: "attention",
            keyframes: `
        @keyframes flash {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0; }
        }
      `,
        },
        {
            id: "glow",
            name: "Glow",
            icon: Star,
            description: "Efecto de brillo",
            category: "attention",
            keyframes: `
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
          50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6); }
          100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
        }
      `,
        },

        // Exit Animations
        {
            id: "fadeOut",
            name: "Fade Out",
            icon: Eye,
            description: "Desaparece gradualmente",
            category: "exit",
            keyframes: `
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `,
        },
        {
            id: "slideOutLeft",
            name: "Slide Out Left",
            icon: ArrowRight,
            description: "Sale hacia la izquierda",
            category: "exit",
            keyframes: `
        @keyframes slideOutLeft {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-100%); opacity: 0; }
        }
      `,
        },
        {
            id: "slideOutRight",
            name: "Slide Out Right",
            icon: ArrowRight,
            description: "Sale hacia la derecha",
            category: "exit",
            keyframes: `
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `,
        },
        {
            id: "zoomOutDown",
            name: "Zoom Out Down",
            icon: Scale,
            description: "Se aleja hacia abajo",
            category: "exit",
            keyframes: `
        @keyframes zoomOutDown {
          40% { transform: scale3d(0.475, 0.475, 0.475) translate3d(0, -60px, 0); opacity: 1; }
          100% { transform: scale3d(0.1, 0.1, 0.1) translate3d(0, 2000px, 0); opacity: 0; }
        }
      `,
        },

        // Special Effects
        {
            id: "typewriter",
            name: "Typewriter",
            icon: MousePointer,
            description: "Efecto máquina de escribir",
            category: "special",
            keyframes: `
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
      `,
        },
        {
            id: "morphing",
            name: "Morphing",
            icon: Move,
            description: "Transformación suave",
            category: "special",
            keyframes: `
        @keyframes morphing {
          0% { border-radius: 0%; transform: rotate(0deg); }
          25% { border-radius: 50% 0% 50% 0%; transform: rotate(90deg); }
          50% { border-radius: 50%; transform: rotate(180deg); }
          75% { border-radius: 0% 50% 0% 50%; transform: rotate(270deg); }
          100% { border-radius: 0%; transform: rotate(360deg); }
        }
      `,
        },
        {
            id: "floating",
            name: "Floating",
            icon: Snowflake,
            description: "Flotación suave",
            category: "special",
            keyframes: `
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `,
        },
    ]

    const triggers = [
        { value: "onLoad", label: "Al cargar" },
        { value: "onScroll", label: "Al hacer scroll" },
        { value: "onHover", label: "Al pasar el mouse" },
        { value: "onClick", label: "Al hacer click" },
        { value: "onFocus", label: "Al enfocar" },
        { value: "onVisible", label: "Al ser visible" },
        { value: "onDelay", label: "Con retraso" },
    ]

    const timingFunctions = [
        { value: "ease", label: "Ease" },
        { value: "ease-in", label: "Ease In" },
        { value: "ease-out", label: "Ease Out" },
        { value: "ease-in-out", label: "Ease In Out" },
        { value: "linear", label: "Linear" },
        { value: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", label: "Bounce" },
        { value: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", label: "Smooth" },
    ]

    const fillModes = [
        { value: "none", label: "None" },
        { value: "forwards", label: "Forwards" },
        { value: "backwards", label: "Backwards" },
        { value: "both", label: "Both" },
    ]

    const directions = [
        { value: "normal", label: "Normal" },
        { value: "reverse", label: "Reverse" },
        { value: "alternate", label: "Alternate" },
        { value: "alternate-reverse", label: "Alternate Reverse" },
    ]

    const applyAnimation = (animationId: string) => {
        if (!state.editor.selectedElement.id) return

        const animation = animations.find((a) => a.id === animationId)
        if (!animation) return

        // Inject keyframes into document
        const styleElement = document.getElementById("dynamic-animations") || document.createElement("style")
        styleElement.id = "dynamic-animations"
        if (!document.getElementById("dynamic-animations")) {
            document.head.appendChild(styleElement)
        }

        if (!styleElement.textContent?.includes(animation.keyframes)) {
            styleElement.textContent += animation.keyframes
        }

        const animationValue = `${animationId} ${duration[0]}s ${timingFunction} ${delay[0]}s ${iterations[0] === -1 ? "infinite" : iterations[0]} ${direction} ${fillMode}`

        dispatch({
            type: "UPDATE_ELEMENT",
            payload: {
                elementDetails: {
                    ...state.editor.selectedElement,
                    styles: {
                        ...state.editor.selectedElement.styles,
                        animation: animationValue,
                    },
                },
            },
        })
    }

    const removeAnimation = () => {
        if (!state.editor.selectedElement.id) return

        dispatch({
            type: "UPDATE_ELEMENT",
            payload: {
                elementDetails: {
                    ...state.editor.selectedElement,
                    styles: {
                        ...state.editor.selectedElement.styles,
                        animation: "none",
                    },
                },
            },
        })
    }

    const previewAnimation = (animationId: string) => {
        const element = document.querySelector(`[data-element-id="${state.editor.selectedElement.id}"]`)
        if (element) {
            const animation = animations.find((a) => a.id === animationId)
            if (animation) {
                // Inject keyframes temporarily
                const styleElement = document.getElementById("preview-animations") || document.createElement("style")
                styleElement.id = "preview-animations"
                if (!document.getElementById("preview-animations")) {
                    document.head.appendChild(styleElement)
                }
                styleElement.textContent = animation.keyframes

                // Apply animation temporarily
                const originalAnimation = (element as HTMLElement).style.animation
                    ; (element as HTMLElement).style.animation = `${animationId} ${duration[0]}s ${timingFunction}`

                setTimeout(() => {
                    ; (element as HTMLElement).style.animation = originalAnimation
                }, duration[0] * 1000)
            }
        }
    }

    const groupedAnimations = {
        entrance: animations.filter((a) => a.category === "entrance"),
        attention: animations.filter((a) => a.category === "attention"),
        exit: animations.filter((a) => a.category === "exit"),
        special: animations.filter((a) => a.category === "special"),
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold mb-2">Animaciones Avanzadas</h3>
                <p className="text-sm text-muted-foreground mb-4">Añade movimiento y vida a tus elementos</p>

                {!state.editor.selectedElement.id ? (
                    <div className="text-center py-8">
                        <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Selecciona un elemento para añadir animaciones</p>
                    </div>
                ) : (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Elemento: {state.editor.selectedElement.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Tabs defaultValue="basic" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="basic">Básico</TabsTrigger>
                                    <TabsTrigger value="advanced">Avanzado</TabsTrigger>
                                </TabsList>

                                <TabsContent value="basic" className="space-y-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Disparador</Label>
                                        <Select defaultValue="onLoad">
                                            <SelectTrigger className="h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {triggers.map((trigger) => (
                                                    <SelectItem key={trigger.value} value={trigger.value}>
                                                        {trigger.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Duración: {duration[0]}s</Label>
                                            <Slider
                                                value={duration}
                                                onValueChange={setDuration}
                                                max={5}
                                                min={0.1}
                                                step={0.1}
                                                className="mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Retraso: {delay[0]}s</Label>
                                            <Slider value={delay} onValueChange={setDelay} max={3} min={0} step={0.1} className="mt-2" />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="advanced" className="space-y-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Función de tiempo</Label>
                                        <Select value={timingFunction} onValueChange={setTimingFunction}>
                                            <SelectTrigger className="h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timingFunctions.map((func) => (
                                                    <SelectItem key={func.value} value={func.value}>
                                                        {func.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Repeticiones</Label>
                                            <div className="flex gap-2 mt-2">
                                                <Input
                                                    type="number"
                                                    value={iterations[0] === -1 ? "∞" : iterations[0]}
                                                    onChange={(e) => {
                                                        const value = e.target.value === "∞" ? -1 : Number.parseInt(e.target.value) || 1
                                                        setIterations([value])
                                                    }}
                                                    className="h-8"
                                                    placeholder="1"
                                                />
                                                <Button size="sm" variant="outline" onClick={() => setIterations([-1])} className="h-8 px-2">
                                                    ∞
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Dirección</Label>
                                            <Select value={direction} onValueChange={setDirection}>
                                                <SelectTrigger className="h-8 mt-2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {directions.map((dir) => (
                                                        <SelectItem key={dir.value} value={dir.value}>
                                                            {dir.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs text-muted-foreground">Fill Mode</Label>
                                        <Select value={fillMode} onValueChange={setFillMode}>
                                            <SelectTrigger className="h-8 mt-2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fillModes.map((mode) => (
                                                    <SelectItem key={mode.value} value={mode.value}>
                                                        {mode.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1">
                                    <Play className="h-3 w-3 mr-1" />
                                    Preview
                                </Button>
                                <Button size="sm" variant="outline" onClick={removeAnimation}>
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Quitar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                    {Object.entries(groupedAnimations).map(([category, categoryAnimations]) => (
                        <div key={category}>
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2 capitalize">
                                {category === "entrance" && <Eye className="h-4 w-4" />}
                                {category === "attention" && <Zap className="h-4 w-4" />}
                                {category === "exit" && <ArrowRight className="h-4 w-4" />}
                                {category === "special" && <Sparkles className="h-4 w-4" />}
                                Animaciones de{" "}
                                {category === "entrance"
                                    ? "Entrada"
                                    : category === "attention"
                                        ? "Atención"
                                        : category === "exit"
                                            ? "Salida"
                                            : "Especiales"}
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                                {categoryAnimations.map((animation) => (
                                    <Card key={animation.id} className="cursor-pointer hover:bg-muted/50 transition-colors group">
                                        <CardContent className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`p-2 rounded-md ${category === "entrance"
                                                        ? "bg-blue-500/10"
                                                        : category === "attention"
                                                            ? "bg-orange-500/10"
                                                            : category === "exit"
                                                                ? "bg-red-500/10"
                                                                : "bg-purple-500/10"
                                                        }`}
                                                >
                                                    <animation.icon
                                                        className={`h-4 w-4 ${category === "entrance"
                                                            ? "text-blue-500"
                                                            : category === "attention"
                                                                ? "text-orange-500"
                                                                : category === "exit"
                                                                    ? "text-red-500"
                                                                    : "text-purple-500"
                                                            }`}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="text-sm font-medium">{animation.name}</h5>
                                                    <p className="text-xs text-muted-foreground">{animation.description}</p>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6"
                                                        onClick={() => previewAnimation(animation.id)}
                                                    >
                                                        <Play className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6"
                                                        onClick={() => applyAnimation(animation.id)}
                                                    >
                                                        <Zap className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}

export default AnimationsTab
