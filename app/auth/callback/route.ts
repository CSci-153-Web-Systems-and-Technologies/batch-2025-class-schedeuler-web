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
          getAll() {
            return cookieStore.getAll()
          },
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
      console.error('Auth Code Exchange Error:', error.message)
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
    }

    if (user) {
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, account_type')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        return NextResponse.redirect(new URL('/select-account-type', request.url))
      } else {
        const role = existingProfile.account_type;
        
        if (user.user_metadata?.account_type !== role) {
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

            if (serviceRoleKey) {
                try {
                    const adminSupabase = createServerClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        serviceRoleKey,
                        { 
                            cookies: { 
                                getAll: () => cookieStore.getAll(), 
                                setAll: () => {} 
                            } 
                        }
                    );
                    
                    const { error: adminError } = await adminSupabase.auth.admin.updateUserById(user.id, {
                        user_metadata: { 
                            ...user.user_metadata,
                            account_type: role
                        }
                    });
                    
                    if (adminError) {
                        console.error("Admin metadata update failed:", adminError.message);
                    }
                } catch (err) {
                    console.error("Admin client creation failed:", err);
                }
            } else {
                console.warn("Missing SUPABASE_SERVICE_ROLE_KEY. Skipping metadata sync.");
            }
        }
        
        const dest = role === 'instructor' 
          ? '/instructor/dashboard' 
          : '/student/dashboard';
          
        return NextResponse.redirect(new URL(`${dest}?toast=login`, request.url))
      }
    }
  }

  return NextResponse.redirect(new URL('/login?error=no_code', request.url))
}