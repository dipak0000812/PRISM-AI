import { Navbar } from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </>
  );
}
