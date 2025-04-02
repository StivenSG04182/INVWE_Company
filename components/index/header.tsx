"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, CuboidIcon as Cube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/index/theme-toggle"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return

        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [mounted])

    if (!mounted) return null

    return (
        <header
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-md border-b" : ""
                }`}
        >
            <nav className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo - Left */}
                    <Link href="/" className="flex items-center space-x-2">
                        <Cube className="h-8 w-8 text-primary" />
                        <span className="text-xl font-bold">INVWE</span>
                    </Link>

                    {/* Navigation Links - Center */}
                    <div className="hidden md:flex flex-1 justify-center">
                        <div className="flex items-center space-x-6 text-sm">
                            {/* <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                                About
                            </Link>
                            
                            <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                                Blog
                            </Link>
                            
                            <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                                Contact
                            </Link>
                            
                            <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                                Faq
                            </Link>
                            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                                Pricing
                            </Link> */}
                        </div>
                    </div>

                    {/* Actions - Right */}
                    <div className="hidden md:flex items-center space-x-4">
                        <ThemeToggle />
                        <SignedIn>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "h-8 w-8"
                                    } 
                                }}
                            />
                            <Button 
                                onClick={async () => {
                                    try {
                                        const response = await fetch('/api/control_login/companies');
                                        if (!response.ok) throw new Error('Error en la respuesta del servidor');
                                        const data = await response.json();
                                        
                                        if (data.isValid) {
                                            if (data.data?.role === 'admin') {
                                                window.location.href = '/admin/dashboard_admin';
                                            } else if (data.data?.role === 'inventory' && data.data?.company?.name) {
                                                window.location.href = `/inventory/${encodeURIComponent(data.data.company.name)}/dashboard`;
                                            } else {
                                                window.location.href = '/';
                                            }
                                        } else {
                                            window.location.href = '/Select_inventory';
                                        }
                                    } catch (error) {
                                        console.error('Error al verificar compañías:', error);
                                    }
                                }}
                            >
                                Get Started
                            </Button>
                        </SignedIn>
                        <SignedOut>
                            <Button 
                                onClick={() => (window.location.href = '/sign-in')}
                                className="gap-2 bg-black hover:bg-gray-700"
                            >
                                Iniciar Sesión
                            </Button>
                        </SignedOut>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <ThemeToggle />
                        <button
                            className="ml-4 text-foreground p-2 hover:bg-accent rounded-md"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ?
                                <X className="h-6 w-6" /> :
                                <Menu className="h-6 w-6" />
                            }
                        </button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden pt-4 pb-3">
                        <div className="flex flex-col space-y-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border">
                            {/* <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                                About
                            </Link>
                            <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                                Blog
                            </Link>
                            <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                                Contact
                            </Link>
                            <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                                Faq
                            </Link>
                            <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                                Features
                            </Link>
                            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                                Pricing
                            </Link>
                            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                                Privacy
                            </Link>
                            <Button variant="ghost" className="justify-start">
                                Sign In
                            </Button> */}
                            <Link href="/Select_inventory">
                                <Button className="w-full">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    )
}

