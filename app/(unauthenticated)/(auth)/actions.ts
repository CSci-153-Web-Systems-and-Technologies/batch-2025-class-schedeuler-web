// app/(unauthenticated)/(auth)/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation' 
import { createClient } from '@/utils/supabase/server'

type AuthResponse = {
  success?: boolean;
  error?: string;
  redirectUrl?: string;
} | null;

export async function login(prevState: any, formData: FormData): Promise<AuthResponse> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  if (authData.user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      return { error: 'Error fetching user profile' }
    }

    if (profile?.account_type && authData.user.user_metadata?.account_type !== profile.account_type) {
        const adminSupabase = await createClient() 
        await adminSupabase.auth.admin.updateUserById(authData.user.id, {
            user_metadata: { 
                ...authData.user.user_metadata,
                account_type: profile.account_type
            }
        });
    }

    const url = profile?.account_type === 'instructor' 
      ? '/instructor/dashboard' 
      : '/student/dashboard';
      
    revalidatePath(url, 'layout')
    
    return { success: true, redirectUrl: url }
  }

  return { error: 'Unknown error occurred' }
}

export async function signup(prevState: any, formData: FormData): Promise<AuthResponse> {
  const supabase = await createClient()

  const accountType = formData.get('acc-type') as string;

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        name: formData.get('name') as string,
        account_type: accountType, 
      }
    }
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          account_type: accountType,
        }
      ])

    if (profileError) {
      return { error: 'Error creating user profile' }
    }

    const url = accountType === 'instructor' 
      ? '/instructor/dashboard' 
      : '/student/dashboard';

    revalidatePath(url, 'layout')
    return { success: true, redirectUrl: url }
  }

  return { error: 'Unknown error occurred' }
}

export async function logout(): Promise<AuthResponse> {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Logout error:', error)
    return { error: error.message }
  }
  
  revalidatePath('/', 'layout')
  return { success: true, redirectUrl: '/landing' }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data?.url) {
    redirect(data.url)
  }

  return { error: 'Unknown error occurred' }
}

export async function signUpWithGoogle() {
  return signInWithGoogle()
}