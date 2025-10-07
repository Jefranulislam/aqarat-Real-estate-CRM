import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Check for authentication token in cookies
  const token = request.cookies.get('auth_token')?.value
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')

  // Redirect to login if accessing dashboard without token
  if (isDashboard && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect to dashboard if accessing auth pages with token
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
