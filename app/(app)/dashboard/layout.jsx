// app/dashboard/layout.jsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/global/Sidebar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={cn(
        "flex-1 transition-all duration-300 min-w-0",
        isCollapsed ? "lg:ml-0" : "lg:ml-0" 
      )}>
        {children}
      </main>
    </div>
  );
}