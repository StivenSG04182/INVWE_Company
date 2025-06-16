'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from './contexts/CartContext'
import { UserButton, useAuth, SignUpButton } from "@clerk/nextjs"

const navigationItems = [
    { label: 'Equipo', href: '/site/equipo' },
    { label: 'Blog', href: '/site/blog' },
    { label: 'Productos', href: '/site/productos' },
    { label: 'FAQ', href: '/site/faq' },
    { label: 'Sobre Nosotros', href: '/site/sobre-nosotros' },
    { label: 'Servicios', href: '/site/servicios' },
]

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { items } = useCart()
    const { isSignedIn } = useAuth()
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-[#486283]/20">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/site" className="flex-shrink-0">
                    <Image
                        src="/logoNatulanda.png"
                        alt="Natulanda Logo"
                        width={90}
                        height={90}
                        className="object-cover rounded-full"
                    />
                </Link>

                {/* Desktop Navigation */}
                <div className="flex-1 flex justify-center">
                  <nav className="hidden lg:flex items-center space-x-8">
                      {navigationItems.map((item) => (
                          <Link
                              key={item.href}
                              href={item.href}
                              className="text-[#486283] hover:text-[#899735] transition-colors duration-200 font-medium"
                          >
                              {item.label}
                          </Link>
                      ))}
                  </nav>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-4">
                    {/* Cart */}
                    <Link href="/site/productos" className="relative">
                        <Button variant="ghost" size="sm" className="relative">
                            <ShoppingCart className="h-5 w-5" />
                            {itemCount > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-[#899735] text-white text-xs">
                                    {itemCount}
                                </Badge>
                            )}
                        </Button>
                    </Link>

                    {/* Auth Buttons en desktop */}
                    <div className="hidden md:flex items-center space-x-2">
                        {isSignedIn ? (
                            <>
                                <UserButton afterSignOutUrl="/" />
                                <Button asChild className="bg-[#899735] hover:bg-[#899735]/90 text-white">
                                    <Link href="/agency">
                                        Dashboard
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button asChild variant="ghost" className="text-[#486283]">
                                    <Link href="/agency/sign-up">
                                        Registrarse
                                    </Link>
                                </Button>
                                <Button asChild className="bg-[#899735] hover:bg-[#899735]/90 text-white">
                                    <Link href="/agency">
                                        Iniciar Sesión
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="lg:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="lg:hidden bg-white border-t border-[#486283]/20">
                    <nav className="container mx-auto px-4 py-4 space-y-2">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block py-2 text-[#486283] hover:text-[#899735] transition-colors duration-200"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-[#486283]/20 space-y-2">
                            {isSignedIn ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <UserButton afterSignOutUrl="/" />
                                        <Button asChild className="w-full ml-2 bg-[#899735] hover:bg-[#899735]/90 text-white">
                                            <Link href="/agency">
                                                Dashboard
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <SignUpButton mode="modal">
                                        <Button variant="ghost" className="w-full justify-start text-[#486283]">
                                            Registrarse
                                        </Button>
                                    </SignUpButton>
                                    <Button asChild className="w-full bg-[#899735] hover:bg-[#899735]/90 text-white">
                                        <Link href="/agency" className="w-full">
                                            Iniciar Sesión
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}