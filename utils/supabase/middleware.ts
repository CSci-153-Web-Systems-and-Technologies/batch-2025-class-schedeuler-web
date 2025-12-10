// utils/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // [UPDATED] Added footer pages (about, support, privacy, terms) to public routes list
  const isPublicRoute = 
    path === '/' ||
    path.startsWith('/landing') || 
    path.startsWith('/login') || 
    path.startsWith('/signup') || 
    path.startsWith('/error') ||
    path.startsWith('/auth/callback') ||
    path.startsWith('/select-account-type') ||
    path.startsWith('/about') ||
    path.startsWith('/support') ||
    path.startsWith('/privacy') ||
    path.startsWith('/terms');

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    let userRole = user.user_metadata.account_type as 'student' | 'instructor' | undefined;

    if (!userRole) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('account_type')
            .eq('id', user.id)
            .single();
        userRole = profile?.account_type;
    }

    if (!userRole && !path.startsWith('/select-account-type')) {
        return NextResponse.redirect(new URL('/select-account-type', request.url));
    }

    if (userRole) {
        const isInstructorPath = path.startsWith('/instructor');
        const isStudentPath = path.startsWith('/student');

        if (isInstructorPath && userRole !== 'instructor') {
            return NextResponse.redirect(new URL('/error', request.url));
        }

        if (isStudentPath && userRole !== 'student') {
            return NextResponse.redirect(new URL('/error', request.url));
        }
        
        // [UPDATED] Logic to determine if we should redirect logged-in users to dashboard.
        // We allow them to stay on public pages like About, Support, Privacy, Terms, Error, and Select Account.
        // We ONLY redirect them if they try to hit Landing, Login, Signup, or Root.
        if (
            isPublicRoute && 
            !path.startsWith('/error') && 
            !path.startsWith('/select-account-type') &&
            !path.startsWith('/about') &&
            !path.startsWith('/support') &&
            !path.startsWith('/privacy') &&
            !path.startsWith('/terms')
        ) {
             const dest = userRole === 'instructor' ? '/instructor/dashboard' : '/student/dashboard';
             return NextResponse.redirect(new URL(dest, request.url));
        }
    }
  }

  return supabaseResponse
}