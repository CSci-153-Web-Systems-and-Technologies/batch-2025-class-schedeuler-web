'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Checkbox } from "@/components/ui/Checkbox"
import { createClient } from '@/utils/supabase/client'
import { useToast } from "@/app/context/ToastContext"
import TermsModal from '@/app/(unauthenticated)/(auth)/signup/components/TermsModal'

export default function SelectAccountType() {
  const [selectedType, setSelectedType] = useState<'student' | 'instructor' | null>(null)
  
  // Default to true, but we will control this via useEffect based on origin
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const { showToast } = useToast()

  // [NEW] Check if user already accepted terms in Signup page via Google
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const acceptedInSignup = localStorage.getItem('terms_accepted_flow');
        
        if (acceptedInSignup === 'true') {
            // Came from Signup -> Auto-accept and hide modal
            setTermsAccepted(true);
            setIsTermsModalOpen(false);
            // Clean up the flag
            localStorage.removeItem('terms_accepted_flow');
        } else {
            // Came from Login (or direct) -> Show modal
            setIsTermsModalOpen(true);
            setTermsAccepted(false);
        }
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const handleTermsAccept = () => {
    setTermsAccepted(true);
    setIsTermsModalOpen(false);
    setError('');
  };

  const handleCompleteRegistration = async () => {
    if (!termsAccepted) {
      setError('You must accept the Terms and Conditions to continue.')
      showToast("Required", "Please accept the Terms and Conditions", "error")
      // Re-open the modal if they try to click continue without accepting
      setIsTermsModalOpen(true) 
      return
    }

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
                <h3 className="font-semibold text-gray-900">Student</h3>
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
                <h3 className="font-semibold text-gray-900">Instructor</h3>
                <p className="text-sm text-gray-600">I want to teach and manage classes</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-start pt-2">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked) => {
                setTermsAccepted(checked as boolean)
                if(checked) setError('')
              }}
              className="mt-1"
            />
            <div className="flex flex-col gap-1">
              <div className="text-sm text-gray-600">
                I agree to the{' '}
                <button 
                  type="button" 
                  onClick={() => setIsTermsModalOpen(true)}
                  className="text-blue-600 hover:underline font-medium focus:outline-none"
                >
                  Terms and Conditions
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md border border-red-100">{error}</div>
          )}

          <Button
            onClick={handleCompleteRegistration}
            disabled={!selectedType || !termsAccepted || loading}
            className="w-full"
          >
            {loading ? 'Completing Registration...' : 'Complete Registration'}
          </Button>
        </CardContent>
      </Card>

      <TermsModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
        onAccept={handleTermsAccept}
      />
    </div>
  )
}