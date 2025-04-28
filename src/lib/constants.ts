import BarChart from "@/components/icons/bar_chart";
import Calendar from "@/components/icons/calendar";
import CheckCircle from "@/components/icons/check_circled";
import Chip from "@/components/icons/chip";
import ClipboardIcon from "@/components/icons/clipboardIcon";
import Compass from "@/components/icons/compass";
import Database from "@/components/icons/database";
import Flag from "@/components/icons/flag";
import Headphone from "@/components/icons/headphone";
import Home from "@/components/icons/home";
import Info from "@/components/icons/info";
import LinkIcon from "@/components/icons/link";
import Lock from "@/components/icons/lock";
import Message from "@/components/icons/messages";
import Notification from "@/components/icons/notification";
import Payment from "@/components/icons/payment";
import Person from "@/components/icons/person";
import Pipelines from "@/components/icons/pipelines";
import InvweCategory from "@/components/icons/invwe-category";
import Power from "@/components/icons/power";
import Receipt from "@/components/icons/receipt";
import Send from "@/components/icons/send";
import Settings from "@/components/icons/settings";
import Shield from "@/components/icons/shield";
import Star from "@/components/icons/star";
import Tune from "@/components/icons/tune";
import Video from "@/components/icons/video_recorder";
import Wallet from "@/components/icons/wallet";
import Warning from "@/components/icons/warning";

export const pricingCards = [
  {
    title: "Starter",
    description: "Perfecto para probar nuestra plataforma",
    price: "Gratis",
    duration: "",
    highlight: "Características principales",
    features: ["3 Subcuentas", "2 Miembros del equipo", "Pipelines ilimitados"],
    priceId: "P-0",
  },
  {
    title: "Profesional",
    description: "Para agencias en crecimiento",
    price: "$49",
    duration: "mes",
    highlight: "Todo lo de Starter, más",
    features: ["10 Subcuentas", "5 Miembros del equipo", "Soporte prioritario", "Análisis avanzados"],
    priceId: "P-1",
  },
  {
    title: "Empresarial",
    description: "Para agencias establecidas",
    price: "$99",
    duration: "mes",
    highlight: "Todo lo de Profesional, más",
    features: ["Subcuentas ilimitadas", "Miembros del equipo ilimitados", "Soporte 24/7", "API personalizada"],
    priceId: "P-2",
  },
  {
    title: "Personalizado",
    description: "Para necesidades específicas",
    price: "Contactar",
    duration: "",
    highlight: "Solución a medida",
    features: ["Plan personalizado", "Funcionalidades a medida", "Soporte dedicado", "Integraciones personalizadas"],
    priceId: "P-3",
  },
];


export const addOnProducts = [
  { title: 'Soporte Prioritario', id: 'prod_Pgm8ga4R9MN8sL' },
]

export const icons = [
  {
    value: "chart",
    label: "Gráfico de Barras",
    path: BarChart,
  },
  {
    value: "headphone",
    label: "Auriculares",
    path: Headphone,
  },
  {
    value: "send",
    label: "Enviar",
    path: Send,
  },
  {
    value: "pipelines",
    label: "Embudos",
    path: Pipelines,
  },
  {
    value: "calendar",
    label: "Calendario",
    path: Calendar,
  },
  {
    value: "settings",
    label: "Configuración",
    path: Settings,
  },
  {
    value: "check",
    label: "Verificado",
    path: CheckCircle,
  },
  {
    value: "chip",
    label: "Chip",
    path: Chip,
  },
  {
    value: "compass",
    label: "Brújula",
    path: Compass,
  },
  {
    value: "database",
    label: "Base de Datos",
    path: Database,
  },
  {
    value: "flag",
    label: "Bandera",
    path: Flag,
  },
  {
    value: "home",
    label: "Inicio",
    path: Home,
  },
  {
    value: "info",
    label: "Información",
    path: Info,
  },
  {
    value: "link",
    label: "Enlace",
    path: LinkIcon,
  },
  {
    value: "lock",
    label: "Candado",
    path: Lock,
  },
  {
    value: "messages",
    label: "Mensajes",
    path: Message,
  },
  {
    value: "notification",
    label: "Notificación",
    path: Notification,
  },
  {
    value: "payment",
    label: "Pago",
    path: Payment,
  },
  {
    value: "power",
    label: "Energía",
    path: Power,
  },
  {
    value: "receipt",
    label: "Recibo",
    path: Receipt,
  },
  {
    value: "shield",
    label: "Escudo",
    path: Shield,
  },
  {
    value: "star",
    label: "Estrella",
    path: Star,
  },
  {
    value: "tune",
    label: "Ajustar",
    path: Tune,
  },
  {
    value: "videorecorder",
    label: "Grabadora de Video",
    path: Video,
  },
  {
    value: "wallet",
    label: "Billetera",
    path: Wallet,
  },
  {
    value: "warning",
    label: "Advertencia",
    path: Warning,
  },
  {
    value: "person",
    label: "Persona",
    path: Person,
  },
  {
    value: "category",
    label: "Categoría",
    path: InvweCategory,
  },
  {
    value: "clipboardIcon",
    label: "Portapapeles",
    path: ClipboardIcon,
  },
];

export type EditorBtns =
  | 'text'
  | 'container'
  | 'section'
  | 'contactForm'
  | 'paymentForm'
  | 'link'
  | '2Col'
  | 'video'
  | '__body'
  | 'image'
  | null
  | '3Col'

  export const defaultStyles: React.CSSProperties = {
    backgroundPosition: 'center',
    objectFit: 'cover',
    backgroundRepeat: 'no-repeat',
    textAlign: 'left',
    opacity: '100%',
  }