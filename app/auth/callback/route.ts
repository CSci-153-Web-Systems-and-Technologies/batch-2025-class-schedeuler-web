// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              console.error('Error setting cookies:', error)
            }
          },
        },
      }
    )
    
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
    }

    if (user) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, account_type')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        return NextResponse.redirect(new URL('/select-account-type', request.url))
      } else {
        const dest = existingProfile.account_type === 'instructor' 
          ? '/instructor/dashboard' 
          : '/student/dashboard';
        return NextResponse.redirect(new URL(`${dest}?toast=login`, request.url))
      }
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
}