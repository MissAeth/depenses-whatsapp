// TEMPORAIRE - Proxy Clerk désactivé pour test
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

// Proxy temporaire vide
export default function proxy() {
  // Pass through all requests without authentication
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

