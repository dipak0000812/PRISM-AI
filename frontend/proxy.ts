import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req: any) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const protectedPaths = ['/dashboard', '/mr', '/graph', '/settings']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))
  const isLoginPage = pathname === '/login'

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/mr/:path*',
    '/graph/:path*', 
    '/settings/:path*',
    '/login',
  ],
}
