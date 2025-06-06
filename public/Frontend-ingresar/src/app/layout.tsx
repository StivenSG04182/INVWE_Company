import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { twMerge } from "tailwind-merge";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InventarioSaaS - Sistema de Inventario y Facturación",
  description: "Sistema modular de gestión de inventario con control de facturación electrónica para múltiples tiendas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={twMerge(inter.className, "bg-black text-white antialiased")}>
        {children}
      </body>
    </html>
  );
}
