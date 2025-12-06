'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(prevState: any, formData: FormData) {
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

    if (profile?.account_type === 'instructor') {
      revalidatePath('/instructor/dashboard', 'layout')
      redirect('/instructor/dashboard')
    } else {
      revalidatePath('/student/dashboard', 'layout')
      redirect('/student/dashboard')
    }
  }

  return { error: 'Unknown error occurred' }
}

export async function signup(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        name: formData.get('name') as string,
        account_type: formData.get('acc-type') as string,
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
          account_type: formData.get('acc-type') as string,
        }
      ])

    if (profileError) {
      return { error: 'Error creating user profile' }
    }

    const accountType = formData.get('acc-type') as string
    
    if (accountType === 'instructor') {
      revalidatePath('/instructor/dashboard', 'layout')
      redirect('/instructor/dashboard')
    } else {
      revalidatePath('/student/dashboard', 'layout')
      redirect('/student/dashboard')
    }
  }

  return { error: 'Unknown error occurred' }
}

export async function logout() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Logout error:', error)
  }
  
  revalidatePath('/', 'layout')
  redirect('/landing')
}

// In your actions.ts
export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getBaseUrl()}/auth/callback`,
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

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  return 'http://localhost:3000'
}