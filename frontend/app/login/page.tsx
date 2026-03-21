'use client'

import { signIn, useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { status } = useSession()
  const router = useRouter()
  
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  const handleOAuthSignIn = async (provider: string) => {
    setLoadingProvider(provider)
    setRedirecting(true)
    await signIn(provider, { callbackUrl: '/dashboard' })
  }

  const handleCredentialsSubmit = async () => {
    setError('')
    
    // Validation
    if (!email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoadingProvider('credentials')
    setRedirecting(true)
    
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false
    })

    if (res?.error) {
      setError('Invalid credentials.')
      setLoadingProvider(null)
      setRedirecting(false)
    } else {
      router.push('/dashboard')
    }
  }

  const isAnyLoading = loadingProvider !== null || redirecting
  const canSubmitCredentials = email.length > 0 && password.length > 0 && (mode === 'signin' || (name.length > 0 && confirmPassword.length > 0))

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5b8af5] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08080a] relative overflow-hidden px-4 py-12">
      {/* Subtle radial gradient */}
      <div 
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(91,138,245,0.06) 0%, transparent 70%)"
        }}
      />

      {/* Redirecting Overlay */}
      {redirecting && (
        <div className="fixed inset-0 bg-[#08080a]/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#5b8af5] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#a1a1aa]">
              {loadingProvider === 'credentials' ? "Authenticating..." : `Redirecting to ${loadingProvider}...`}
            </p>
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[400px] bg-[#111113] border border-[#27272a] rounded-[16px] p-8 md:p-[40px] relative z-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#5b8af5] text-xl font-bold">◈</span>
            <span className="text-white text-[20px] font-semibold tracking-[-0.02em]">PRISM</span>
          </div>
          <p className="text-[14px] text-[#71717a] text-center">
             Risk intelligence for every merge request
          </p>
        </div>

        <div className="text-center mb-4">
          <span className="text-[12px] text-[#52525b] uppercase tracking-[0.06em] font-medium">
            Continue with
          </span>
        </div>

        {/* OAuth Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            disabled={isAnyLoading}
            onClick={() => handleOAuthSignIn('google')}
            className="w-full h-[44px] bg-[#18181b] border border-[#27272a] rounded-[8px] flex items-center gap-3 px-4 text-[14px] font-medium text-[#f0f0f2] hover:bg-[#27272a] hover:border-[#3f3f46] transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            disabled={isAnyLoading}
            onClick={() => handleOAuthSignIn('github')}
            className="w-full h-[44px] bg-[#18181b] border border-[#27272a] rounded-[8px] flex items-center gap-3 px-4 text-[14px] font-medium text-[#f0f0f2] hover:bg-[#27272a] hover:border-[#3f3f46] transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white" className="shrink-0">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            disabled={isAnyLoading}
            onClick={() => handleOAuthSignIn('gitlab')}
            className="w-full h-[44px] bg-[#18181b] border border-[#27272a] rounded-[8px] flex items-center gap-3 px-4 text-[14px] font-medium text-[#f0f0f2] hover:bg-[#27272a] hover:border-[#3f3f46] transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
              <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" fill="#e24329"/>
            </svg>
            Continue with GitLab
          </motion.button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6 mt-8">
          <div className="flex-1 h-px bg-[#27272a]" />
          <span className="text-[12px] text-[#52525b] uppercase tracking-wider font-medium">or email</span>
          <div className="flex-1 h-px bg-[#27272a]" />
        </div>

        {/* Email / Password Form */}
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-[44px] bg-[#18181b] border border-[#27272a] rounded-[8px] px-4 text-[14px] text-[#f0f0f2] placeholder-[#52525b] focus:outline-none focus:border-[#5b8af5] focus:ring-1 focus:ring-[#5b8af5] transition-all duration-150"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-[44px] bg-[#18181b] border border-[#27272a] rounded-[8px] px-4 text-[14px] text-[#f0f0f2] placeholder-[#52525b] focus:outline-none focus:border-[#5b8af5] focus:ring-1 focus:ring-[#5b8af5] transition-all duration-150"
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-[44px] bg-[#18181b] border border-[#27272a] rounded-[8px] px-4 text-[14px] text-[#f0f0f2] placeholder-[#52525b] focus:outline-none focus:border-[#5b8af5] focus:ring-1 focus:ring-[#5b8af5] transition-all duration-150"
          />

          <AnimatePresence mode="popLayout">
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-[44px] bg-[#18181b] border border-[#27272a] rounded-[8px] px-4 text-[14px] text-[#f0f0f2] placeholder-[#52525b] focus:outline-none focus:border-[#5b8af5] focus:ring-1 focus:ring-[#5b8af5] transition-all duration-150"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <p className="text-[13px] text-red-400 font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleCredentialsSubmit}
            disabled={isAnyLoading || !canSubmitCredentials}
            className="w-full h-[44px] mt-2 bg-[#5b8af5] hover:bg-[#4a7ae4] disabled:opacity-50 disabled:cursor-not-allowed rounded-[8px] text-[14px] font-medium text-white transition-all duration-150 active:scale-[0.98]"
          >
            {loadingProvider === 'credentials' ? 'Verifying...' : (mode === 'signin' ? 'Continue with Email' : 'Create Account')}
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="mt-8 text-center text-[13px] text-[#71717a]">
          {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError('')
            }}
            className="text-white font-medium hover:text-[#5b8af5] transition-colors"
          >
            {mode === 'signin' ? "Sign up" : "Sign in"}
          </button>
        </div>

        <div className="w-full h-px bg-[#27272a] my-6" />

        <p className="text-[12px] text-[#52525b] text-center">
          By continuing, you agree to PRISM's Terms of Service
        </p>
      </motion.div>
    </div>
  )
}
