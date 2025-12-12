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
    <nav className="fixed left-3 md:left-8 top-1/2 -translate-y-1/2 z-50">
      <div className="relative backdrop-blur-xl bg-gradient-to-br from-blue-400/60 via-blue-500/55 to-blue-600/60 rounded-2xl shadow-2xl p-2 md:p-3 space-y-2 border border-blue-300/40 overflow-hidden">
        {/* Effet de reflet vitré */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
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
                  w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center
                  transition-all duration-300 relative overflow-hidden
                  ${
                    active
                      ? 'bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-xl scale-110 ring-2 ring-blue-400/50'
                      : 'text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm hover:scale-105'
                  }
                `}
                aria-label={item.label}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                )}
                <Icon className={`w-5 h-5 md:w-6 md:h-6 relative z-10 ${active ? 'drop-shadow-lg' : ''}`} />
              </button>
              
              {/* Tooltip moderne - Masqué sur mobile, visible sur desktop */}
              <div className="hidden md:block absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-x-2 group-hover:translate-x-0">
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-blue-400/60 via-blue-500/55 to-blue-600/60 rounded-xl text-white text-sm font-semibold px-4 py-2.5 shadow-2xl whitespace-nowrap border border-blue-300/40 overflow-hidden">
                  {/* Effet de reflet vitré */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                  <span className="relative z-10">{item.label}</span>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-blue-400/60"></div>
                </div>
              </div>
            </div>
          )
        })}
        </div>
      </div>
    </nav>
  )
}

