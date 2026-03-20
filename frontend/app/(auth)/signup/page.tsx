"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Github, Mail, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("prism_auth");
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSignup = () => {
    localStorage.setItem("prism_auth", "true");
    localStorage.setItem("token", "dummy_token");
    localStorage.setItem("user", JSON.stringify({ name: "John Doe" }));
    router.push("/dashboard");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center w-full"
    >
      {/* Small Logo - No background, no glow */}
      <Link href="/" className="mb-6 opacity-80 hover:opacity-100 transition-opacity">
         <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
      </Link>

      <h1 className="text-xl font-medium text-white/90 mb-6 tracking-tight">
         Create your workspace
      </h1>

      <div className="flex flex-col gap-3 w-full items-center">
         {/* Primary Google Signup - Flat color */}
         <button 
           onClick={handleSignup}
           className="w-[280px] bg-[#5b5bd6] hover:bg-[#6c6ce0] text-white text-sm font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2"
         >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
               <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
               <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity={0.6}/>
               <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" opacity={0.6}/>
               <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity={0.6}/>
            </svg>
            Continue with Google
         </button>

         {/* Secondary: GitHub */}
         <button 
           onClick={handleSignup}
           className="w-[280px] bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2"
         >
            <Github className="w-4 h-4" />
            Continue with GitHub
         </button>

         {/* Secondary: Email */}
         <button 
           onClick={handleSignup}
           className="w-[280px] bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2"
         >
            <Mail className="w-4 h-4" />
            Continue with Email
         </button>
      </div>

      <div className="mt-8 text-center space-y-4 max-w-[280px]">
         <p className="text-xs text-white/40 font-medium tracking-tight">
            Already have an account? 
            <Link href="/login" className="text-white/80 ml-1 hover:text-white transition-colors">Log in</Link>
         </p>
         
         <p className="text-[10px] text-white/20 font-medium leading-relaxed tracking-tight px-4">
            By signing up, you agree to our <br/>
            <span className="text-white/30 hover:text-white/50 cursor-pointer underline transition-colors">Terms of service</span> and 
            <span className="text-white/30 hover:text-white/50 cursor-pointer underline transition-colors ml-1">Privacy Policy</span>
         </p>
      </div>
    </motion.div>
  );
}
