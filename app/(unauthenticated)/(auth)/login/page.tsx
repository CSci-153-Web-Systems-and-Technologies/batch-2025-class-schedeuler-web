'use client'
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { Label } from "@/app/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/app/components/ui/Checkbox";
import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/app/context/ToastContext'
import { login, signInWithGoogle } from '../actions'
import { Eye, EyeOff } from 'lucide-react'

const LoginPage = () => { 
  const router = useRouter()
  const { showToast } = useToast()
  const [state, dispatch] = useActionState(login, null)
  
  const [rememberMe, setRememberMe] = useState(false)
  const [savedEmail, setSavedEmail] = useState('')
  const [savedPassword, setSavedPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [googleError, setGoogleError] = useState('')
  
  useEffect(() => {
    if (state?.error) {
      showToast("Login Failed", state.error, "error");
    }
    if (state?.success && state?.redirectUrl) {
      router.push(`${state.redirectUrl}?toast=login`);
    }
  }, [state, router, showToast]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRememberMe = localStorage.getItem('rememberMe') === 'true'
      const savedEmail = localStorage.getItem('savedEmail') || ''
      const savedPassword = localStorage.getItem('savedPassword') || ''
      
      setRememberMe(savedRememberMe)
      setSavedEmail(savedEmail)
      setSavedPassword(savedPassword)

      const urlParams = new URLSearchParams(window.location.search)
      const error = urlParams.get('error')
      if (error === 'not_registered') {
        setGoogleError('Please register with Google first')
        showToast("Error", "Please register with Google first", "error")
      } else if (error === 'auth_failed') {
        setGoogleError('Authentication failed. Please try again.')
        showToast("Error", "Authentication failed", "error")
      }
    }
  }, [showToast])
  
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked)
    if (!checked) {
      localStorage.removeItem('savedEmail')
      localStorage.removeItem('savedPassword')
      localStorage.removeItem('rememberMe')
      setSavedEmail('')
      setSavedPassword('')
    } else {
      localStorage.setItem('rememberMe', 'true')
    }
  }
  
  const handleFormSubmit = (formData: FormData) => {
    if (rememberMe) {
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      
      localStorage.setItem('savedEmail', email)
      localStorage.setItem('savedPassword', password)
      localStorage.setItem('rememberMe', 'true')
    }
    
    return dispatch(formData)
  }

  const handleGoogleLogin = async () => {
    try {
      setGoogleError('')
      await signInWithGoogle()
    } catch (error) {
      console.error('Google login error:', error)
      showToast("Error", "Failed to sign in with Google", "error")
    }
  }

  return (
    <div className="w-full flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden bg-white">
      <section className="hidden md:flex md:flex-1">
        <Card className="w-full h-full rounded-l-2xl shadow-none border-none overflow-hidden relative">
          <div className="absolute inset-0" style={{ background: "linear-gradient(-139deg, #345AD3 0%, #4169E1 35%, #5B91F5 65%, #9FC3FF 100%)" }} />
          <div className="absolute -bottom-9 left-0 right-0 bg-cover bg-bottom bg-no-repeat md:h-[40%] lg:h-[70%]" style={{ backgroundImage: "url('/auth-bg1.png')" }} />
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

      <section className="flex-1">
        <Card className="w-full h-full rounded-none md:rounded-r-2xl md:rounded-l-none shadow-none border-0 lg:px-14 px-10">
          <CardHeader className="flex flex-col items-center gap-2 text-center pt-8">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription>Enter your email below to login to your account</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={handleFormSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="m@example.com" required defaultValue={savedEmail} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} required defaultValue={savedPassword} className="pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <Checkbox id="remember-me" name="remember-me" checked={rememberMe} onCheckedChange={handleRememberMeChange} />
                    <Label htmlFor="remember-me" className="text-sm">Remember me</Label>
                  </div>
                  <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
                </div>
                
                {googleError && (
                  <div className="text-red-500 text-sm">{googleError}</div>
                )}
              </div>
              
              <CardFooter className="flex flex-col gap-4 pb-8 px-0 mt-3">
                <Button type="submit" className="w-full">Login</Button>
                <div className="flex items-center w-full">
                  <div className="flex-grow h-px bg-gray-300"></div>
                  <span className="px-3 text-gray-500 text-sm">or</span>
                  <div className="flex-grow h-px bg-gray-300"></div>
                </div>
                <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin}>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Don't have an account? </span>
                  <Link href="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
                </div>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default LoginPage;