// app/(unauthenticated)/(auth)/signup/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useActionState } from 'react'
import { useRouter } from 'next/navigation' // Import router
import { useToast } from '@/app/context/ToastContext' // Import Toast
import { signup, signUpWithGoogle } from '../actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/app/components/ui/Select";

const SignupPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [state, dispatch] = useActionState(signup, null); // Rename 'errorMessage' to 'state'

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formError, setFormError] = useState('');
  const [email, setEmail] = useState('');
  const [googleError, setGoogleError] = useState('');

  // [FIX] Watch for Server Action Success/Error
  useEffect(() => {
    if (state?.error) {
      showToast("Signup Failed", state.error, "error");
    }
    if (state?.success && state?.redirectUrl) {
      // Pass the 'signup' flag to the dashboard
      router.push(`${state.redirectUrl}?toast=signup`);
    }
  }, [state, router, showToast]);

  const handleSubmit = (formData: FormData) => {
    if (!termsAccepted) {
      setFormError('You must accept the Terms and Conditions')
      showToast("Error", "Please accept the Terms and Conditions", "error")
      return
    }

    const userEmail = formData.get('email') as string
    
    if (isGoogleEmail(userEmail)) {
      setFormError('Please use "Register with Google" for Gmail addresses.')
      showToast("Suggestion", "Use Google Login for Gmail addresses", "info")
      return
    }
    
    setFormError('')
    dispatch(formData)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (formError && formError.includes('Gmail')) {
      setFormError('')
    }
  }

  const handleGoogleSignUp = async () => {
    if (!termsAccepted) {
      setFormError('You must accept the Terms and Conditions')
      showToast("Error", "Please accept the Terms and Conditions", "error")
      return
    }
    setFormError('')
    setGoogleError('')
    try {
      await signUpWithGoogle()
    } catch (error) {
      console.error('Google signup error:', error)
      showToast("Error", "Google signup failed", "error")
    }
  }

  const isGoogleEmail = (email: string) => {
    return email.includes('@gmail.com') || email.includes('@googlemail.com')
  }

  return (
    <div className="w-full flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden bg-white">
      {/* Left Section - Unchanged */}
      <section className="hidden md:flex md:flex-1">
        <Card className="w-full h-full rounded-l-2xl shadow-none border-none overflow-hidden relative">
          <div className="absolute inset-0" style={{ background: "linear-gradient(-139deg, #345AD3 0%, #4169E1 35%, #5B91F5 65%, #9FC3FF 100%)" }} />
          <div className="absolute -bottom-9 left-0 right-0 bg-cover bg-bottom bg-no-repeat md:h-[40%] lg:h-[60%]" style={{ backgroundImage: "url('/auth-bg1.png')" }} />
          <CardContent className="relative z-10 flex flex-col items-center text-white text-center h-full p-8 pt-12">
            <div className="max-w-xs mt-4 flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <img src="/icons/schedule.png" alt="Schedule Icon" className="w-10 h-10 object-contain" />
                <h1 className="text-4xl lg:text-5xl font-bold" style={{ background: "linear-gradient(96deg, #FFFFFF 0%, #B3CCFF 60%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  SchedEuler
                </h1>
              </div>
              <p className="text-lg" style={{ color: "#EAF1FF" }}>Plan with Ease, No Conflicts Please!</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Right Section */}
      <section className="flex-1">
        <Card className="w-full h-full rounded-none md:rounded-r-2xl md:rounded-l-none shadow-none border-0 lg:px-14 px-8 sm:px-10">
          <CardHeader className="flex flex-col items-center gap-1.5 text-center">
            <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
            <CardDescription>Join now to schedule with ease!</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form action={handleSubmit}>
              <div className="flex flex-col gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" type="text" placeholder="Enter your full name" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="m@example.com" required value={email} onChange={handleEmailChange} />
                  {isGoogleEmail(email) && (
                    <div className="text-amber-600 text-xs mt-1">💡 Gmail detected - we recommend using Google Sign Up below</div>
                  )}
                </div>
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="grid gap-2 flex-1">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" placeholder="Create a password" required />
                  </div>
                  <div className="grid gap-2 flex-1">
                    <Label htmlFor="confirm-pass">Confirm Password</Label>
                    <Input id="confirm-pass" name="confirm-password" type="password" placeholder="Confirm your password" required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="acc-type">Account Type</Label>
                  <Select name="acc-type" required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Account Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Account Type</SelectLabel>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 items-start">
                  <Checkbox 
                    id="terms" 
                    name="terms" 
                    checked={termsAccepted}
                    onCheckedChange={(checked) => {
                      setTermsAccepted(checked as boolean)
                      setFormError('')
                      setGoogleError('')
                    }}
                    className="mt-1"
                  />
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      I agree to the <a href="#" className="text-primary hover:underline">Terms and Conditions</a>
                    </Label>
                    {formError && <div className="text-red-500 text-xs">{formError}</div>}
                  </div>
                </div>
                
                {googleError && <div className="text-red-500 text-sm mt-2">{googleError}</div>}
              </div>
              
              <CardFooter className="flex flex-col gap-3 pb-6 px-0 mt-3">
                <Button type="submit" className="w-full" disabled={!termsAccepted}>Register with Email</Button>
                <div className="flex items-center w-full">
                  <div className="flex-grow h-px bg-gray-300"></div>
                  <span className="px-3 text-gray-500 text-sm">or</span>
                  <div className="flex-grow h-px bg-gray-300"></div>
                </div>
                <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignUp} disabled={!termsAccepted}>
                  {/* SVG Icon */}
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Register with Google
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <Link href="/login" className="text-primary hover:underline font-medium">Login</Link>
                </div>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default SignupPage;