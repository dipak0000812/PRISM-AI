"use client";

import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col items-center justify-center relative font-sans antialiased">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-radial-gradient(circle at top, #0a0a0a, #000000) -z-10" />

      <main className="w-full max-w-[400px] px-6 relative z-10 flex flex-col items-center">
         {children}
      </main>
    </div>
  );
}
