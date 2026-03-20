"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("prism_auth");
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      setIsAuth(true);
    }
  }, [router]);

  if (isAuth === null) {
      return <div className="min-h-screen bg-black" />; // Prevent flash
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </>
  );
}
