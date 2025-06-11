import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Poiret_One, Rubik, Playfair_Display } from 'next/font/google'
import './globals_site.css'
import { Header } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'
import { CartProvider } from '@/components/site/contexts/CartContext'
import { Toaster } from '@/components/ui/toaster'

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-plus-jakarta'
})

const poiretOne = Poiret_One({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-poiret'
})

const rubik = Rubik({ 
  subsets: ['latin'],
  variable: '--font-rubik'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair'
})

export const metadata: Metadata = {
  title: 'Natulanda - Para Sentirse Bien',
  description: 'Productos naturales para una alimentación consciente y saludable',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${plusJakarta.variable} ${poiretOne.variable} ${rubik.variable} ${playfair.variable} antialiased`}>
        <CartProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  )
}