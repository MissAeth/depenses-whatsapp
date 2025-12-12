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
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  const handleLogout = () => {
    logoutUser()
    setAuthenticated(false)
    router.push('/sign-in')
    router.refresh()
  }

  // Construire les items de navigation selon l'état d'authentification
  const baseNavItems: NavItem[] = [
    {
      path: '/',
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
        path: '/sign-in',
        label: 'Déconnexion',
        icon: ArrowRightOnRectangleIcon,
        iconSolid: UserCircleIconSolid,
        action: handleLogout
      }
    : {
        path: '/sign-in',
        label: 'Connexion',
        icon: UserCircleIcon,
        iconSolid: UserCircleIconSolid
      }

  const navItems = [...baseNavItems, authNavItem]

  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50">
      <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 rounded-2xl shadow-2xl border border-slate-700/50 p-3 space-y-2 ring-1 ring-white/10">
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
                  w-14 h-14 rounded-xl flex items-center justify-center
                  transition-all duration-300
                  ${
                    active
                      ? 'bg-gradient-to-br from-amber-400/80 to-yellow-400/80 text-white shadow-lg scale-105 border border-amber-300/30 ring-1 ring-amber-200/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60 hover:scale-105'
                  }
                `}
                aria-label={item.label}
              >
                <Icon className="w-6 h-6" />
              </button>
              
              {/* Tooltip */}
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="backdrop-blur-xl bg-slate-800/90 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-xl border border-slate-700/50 whitespace-nowrap">
                  {item.label}
                  <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-800/90"></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </nav>
  )
}

