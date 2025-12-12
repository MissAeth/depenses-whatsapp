'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  HomeIcon, 
  DevicePhoneMobileIcon, 
  WifiIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { 
  HomeIcon as HomeIconSolid, 
  DevicePhoneMobileIcon as DevicePhoneMobileIconSolid, 
  WifiIcon as WifiIconSolid,
  UserCircleIcon as UserCircleIconSolid
} from '@heroicons/react/24/solid'
import { isAuthenticated, logout as logoutUser } from '@/lib/auth'

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  iconSolid: React.ComponentType<{ className?: string }>
  action?: () => void
}

export default function NavigationMenu() {
  const pathname = usePathname()
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    // Vérifier l'état d'authentification au montage et lors des changements
    setAuthenticated(isAuthenticated())
    
    // Écouter les changements de localStorage
    const handleStorageChange = () => {
      setAuthenticated(isAuthenticated())
    }
    
    window.addEventListener('storage', handleStorageChange)
    // Vérifier périodiquement (pour les changements dans le même onglet)
    const interval = setInterval(() => {
      setAuthenticated(isAuthenticated())
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const isActive = (path: string) => {
    if (path === '/depenses') {
      return pathname === '/depenses'
    }
    return pathname.startsWith(path)
  }

  const handleLogout = () => {
    logoutUser()
    setAuthenticated(false)
    router.push('/')
    router.refresh()
  }

  // Construire les items de navigation selon l'état d'authentification
  const baseNavItems: NavItem[] = [
    {
      path: '/depenses',
      label: 'Dépenses',
      icon: HomeIcon,
      iconSolid: HomeIconSolid
    },
    {
      path: '/whatsapp',
      label: 'WhatsApp',
      icon: DevicePhoneMobileIcon,
      iconSolid: DevicePhoneMobileIconSolid
    },
    {
      path: '/offline',
      label: 'Hors ligne',
      icon: WifiIcon,
      iconSolid: WifiIconSolid
    }
  ]

  const authNavItem: NavItem = authenticated
    ? {
        path: '/',
        label: 'Déconnexion',
        icon: ArrowRightOnRectangleIcon,
        iconSolid: UserCircleIconSolid,
        action: handleLogout
      }
    : {
        path: '/',
        label: 'Connexion',
        icon: UserCircleIcon,
        iconSolid: UserCircleIconSolid
      }

  const navItems = [...baseNavItems, authNavItem]

  return (
    <nav className="fixed left-2 md:left-6 top-1/2 -translate-y-1/2 z-50">
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-1.5 md:p-3 space-y-1.5 md:space-y-2">
        {navItems.map((item) => {
          const active = isActive(item.path)
          const Icon = active ? item.iconSolid : item.icon
          
          return (
            <div key={item.path} className="relative group">
              <button
                onClick={() => {
                  if (item.action) {
                    item.action()
                  } else {
                    router.push(item.path)
                  }
                }}
                className={`
                  w-10 h-10 md:w-14 md:h-14 rounded-lg flex items-center justify-center
                  transition-colors
                  ${
                    active
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }
                `}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              
              {/* Tooltip - Masqué sur mobile, visible sur desktop */}
              <div className="hidden md:block absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-zinc-900 text-white text-sm font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900"></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </nav>
  )
}

