'use client'

import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Settings, Palette, Type, LayoutGrid, SlidersHorizontal, Bell, Shield, Smartphone } from 'lucide-react'

const settingsNavItems = [
  { icon: Settings, label: 'General', href: '/settings' },
  { icon: Palette, label: 'Apariencia', href: '/settings/appearance' },
  { icon: Type, label: 'Tipografía', href: '/settings/typography' },
  { icon: LayoutGrid, label: 'Diseño', href: '/settings/layout' },
  { icon: SlidersHorizontal, label: 'Sidebar', href: '/settings/sidebar' },
  { icon: Bell, label: 'Notificaciones', href: '/settings/notifications' },
  { icon: Shield, label: 'Seguridad', href: '/settings/security' },
  { icon: Smartphone, label: 'App Móvil', href: '/settings/mobile' },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const pathname = usePathname()
  const agencyId = params.agencyId as string

  return (
    <div className="container mx-auto py-4 md:py-6 lg:py-8">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="space-y-1">
            {settingsNavItems.map((item) => {
              const href = `/agency/${agencyId}${item.href}`
              const isActive = pathname === href
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary hover:bg-primary/20'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>
        <main className="flex-1 min-h-[calc(100vh-10rem)]">
          <div className="h-full p-4 md:p-6 lg:p-8 bg-card rounded-lg border shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 