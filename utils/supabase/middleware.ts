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
  const pathname = request.nextUrl.pathname;

  const publicRoutes = [
    '/login',
    '/signup',
    '/error', 
    '/landing',
    '/auth/callback',
    '/select-account-type',
    '/'
  ]

  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  

  if (user) {
      let userRole = user.user_metadata.account_type as ('student' | 'instructor' | undefined); 
      
      const isSelectAccountPage = pathname.startsWith('/select-account-type');
      
      if (!userRole) {
          const { data: profile } = await supabase
              .from('profiles')
              .select('account_type')
              .eq('id', user.id)
              .single();
              
          const dbRole = profile?.account_type as ('student' | 'instructor' | undefined);

          if (!dbRole) {
              if (!isSelectAccountPage) {
                  const url = request.nextUrl.clone();
                  url.pathname = '/select-account-type';
                  return NextResponse.redirect(url);
              }
              return supabaseResponse;
          }
          userRole = dbRole;
      }
      
      if (userRole) {
          const actualRole = userRole;
          const correctDashboard = `/${actualRole}/dashboard`;
          const requestedPrefix = pathname.split('/')[1];
          
          if (actualRole === 'instructor' && pathname.startsWith('/student/')) {
              const url = request.nextUrl.clone();
              url.pathname = '/error'; 
              return NextResponse.redirect(url);
          }
          
          if (actualRole === 'student' && pathname.startsWith('/instructor/')) {
              const url = request.nextUrl.clone();
              url.pathname = '/error'; 
              return NextResponse.redirect(url);
          }

          if (isPublicRoute && !pathname.startsWith('/landing') && !pathname.startsWith('/auth/callback') && !pathname.startsWith('/error')) {
              const url = request.nextUrl.clone();
              url.pathname = correctDashboard;
              return NextResponse.redirect(url);
          }
      }
  }

  if (!user && pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/landing'
    return NextResponse.redirect(url)
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}