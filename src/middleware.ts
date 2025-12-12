// TEMPORAIRE - Middleware Clerk désactivé pour test
// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// const isProtectedRoute = createRouteMatcher([
//   '/',
//   '/api/send-expense'
// ])

// export default clerkMiddleware(async (auth, req) => {
//   if (isProtectedRoute(req)) {
//     await auth.protect()
//   }
// })

import { NextResponse, NextRequest } from 'next/server'

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Protection des routes admin
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminSession = req.cookies.get('admin_session')?.value
    
    if (!adminSession) {
      // Rediriger vers la page de login admin
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }
  
  // Injection du téléphone dans les headers pour isolation des données
  const userPhone = req.cookies.get('user_phone')?.value || ''
  const requestHeaders = new Headers(req.headers)
  if (userPhone) {
    requestHeaders.set('x-user-phone', userPhone)
  }
  
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}