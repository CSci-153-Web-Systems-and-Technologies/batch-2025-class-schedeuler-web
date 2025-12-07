// app/select-account-type/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { createClient } from '@/utils/supabase/client'
import { useToast } from "@/app/context/ToastContext"

export default function SelectAccountType() {
  const [selectedType, setSelectedType] = useState<'student' | 'instructor' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const { showToast } = useToast() 

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const handleCompleteRegistration = async () => {
    if (!selectedType) {
      setError('Please select an account type')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('User not found. Please try signing in again.')
        setLoading(false)
        return
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
            email: user.email,
            account_type: selectedType,
          }
        ])

      if (profileError) {
        console.error('Profile creation error:', profileError)
        setError('Error creating profile. Please try again.')
        showToast("Error", "Failed to create profile", "error")
        setLoading(false)
        return
      }

      if (selectedType === 'instructor') {
        router.push('/instructor/dashboard?toast=signup')
      } else {
        router.push('/student/dashboard?toast=signup')
      }

    } catch (err) {
      console.error('Registration error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Registration</CardTitle>
          <CardDescription>
            Please select your account type to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedType === 'student' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedType('student')}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selectedType === 'student' ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
              }`}>
                {selectedType === 'student' && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold">Student</h3>
                <p className="text-sm text-gray-600">I want to schedule classes and learn</p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedType === 'instructor' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedType('instructor')}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selectedType === 'instructor' ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
              }`}>
                {selectedType === 'instructor' && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold">Instructor</h3>
                <p className="text-sm text-gray-600">I want to teach and manage classes</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <Button
            onClick={handleCompleteRegistration}
            disabled={!selectedType || loading}
            className="w-full"
          >
            {loading ? 'Completing Registration...' : 'Complete Registration'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}