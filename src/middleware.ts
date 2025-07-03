import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
const isPublicRoute = createRouteMatcher(['/site', '/api/uploadthing', '/agency(.*)', '/site(.*)', '/agency'])

export default clerkMiddleware((auth, req) => {
  const url = req.nextUrl
  const pathname = url.pathname
  
  console.log('🔍 Middleware - Processing:', pathname)
  
  if (isPublicRoute(req)) {
    console.log('🔍 Middleware - Public route, allowing access')
    return NextResponse.next()
  }

  //rewrite for domains
  const searchParams = url.searchParams.toString()
  let hostname = req.headers

  const pathWithSearchParams = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ''
  }`

  //if subdomain exists
  const customSubDomain = hostname
    .get('host')
    ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
    .filter(Boolean)[0]

  if (customSubDomain) {
    console.log('🔍 Middleware - Custom subdomain detected:', customSubDomain)
    
    // Si la ruta es de subaccount, no hacer rewrite para evitar conflictos
    if (pathname.startsWith('/subaccount')) {
      console.log('🔍 Middleware - Subaccount route detected, skipping subdomain rewrite')
      return NextResponse.next()
    }
    
    return NextResponse.rewrite(
      new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
    )
  }

  if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
    console.log('🔍 Middleware - Redirecting sign-in/sign-up to agency')
    return NextResponse.redirect(new URL(`/agency/sign-in`, req.url))
  }

  if (
    url.pathname === '/site' ||
    (url.pathname === '/site' && url.host === process.env.NEXT_PUBLIC_DOMAIN)
  ) {
    console.log('🔍 Middleware - Rewriting site route')
    return NextResponse.rewrite(new URL('/site', req.url))
  }

  if (
    url.pathname.startsWith('/agency') ||
    url.pathname.startsWith('/subaccount')
  ) {
    console.log('🔍 Middleware - Agency/Subaccount route, allowing access')
    return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url))
  }
  
  console.log('🔍 Middleware - Default case, allowing access')
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/site', '/(api|trpc)(.*)'],
}