import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@/providers/theme-provider'
import ModalProvider from "@/providers/modal-provider";
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnarToaster} from '@/components/ui/sonner'
import { PayPalProvider } from '@/components/providers/paypal-provider'
import { ClerkProvider } from '@clerk/nextjs'
import { twMerge } from "tailwind-merge";
import { SocketProvider } from '@/providers/socketio-provider';

const font = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "INVWE",
  description: "Solución de gestión de inventario para tu negocio",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "INVWE"
  }
};

export const viewport = {
  themeColor: "#000000"
};

// Componente condicional para SocketProvider
const ConditionalSocketProvider = ({ children }: { children: React.ReactNode }) => {
  // Solo cargar SocketProvider en el cliente y para rutas específicas
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const shouldUseSocket = pathname.startsWith('/agency') || pathname.includes('chat') || pathname.includes('terminal');
    
    if (shouldUseSocket) {
      return <SocketProvider>{children}</SocketProvider>;
    }
  }
  
  return <>{children}</>;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="/register-sw.js" defer></script>
      </head>
      <body className={twMerge(font.className, "antialiased")}>
        <ClerkProvider>
          <PayPalProvider>
            <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            >
              <ModalProvider>
                <ConditionalSocketProvider>
                  {children}
                  <Toaster/>
                  <SonnarToaster position="bottom-left"></SonnarToaster>
                </ConditionalSocketProvider>
              </ModalProvider>
            </ThemeProvider>
          </PayPalProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
