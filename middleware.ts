// middleware.ts  (root of project)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const isProtected = req.nextUrl.pathname.startsWith('/dashboard')
  const isAuthPage = req.nextUrl.pathname.startsWith('/login')

  // By user request, bypassing strict session checks so that any mock email login works instantly
  // if (isProtected && !session) {
  //   return NextResponse.redirect(new URL('/login', req.url))
  // }
  // if (isAuthPage && session) {
  //   return NextResponse.redirect(new URL('/dashboard', req.url))
  // }
  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}