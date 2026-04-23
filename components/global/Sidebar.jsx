"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Receipt, 
  Settings,
  LogOut,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Clients", href: "/dashboard/clients" },
  { icon: FileText, label: "Devis", href: "/dashboard/invoices" },
  { icon: Receipt, label: "Factures", href: "/dashboard/receipts" },
  { icon: Settings, label: "Paramètres", href: "/dashboard/settings" },
];

export function Sidebar({ isCollapsed, setIsCollapsed }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-2xl active:scale-95 transition-all"
      >
        <Menu className="w-6 h-6" />
      </button>

      <aside className={cn(
        "bg-[#020617] text-slate-400 flex flex-col h-screen sticky top-0 border-r border-slate-800 transition-all duration-300 z-40",
        isCollapsed ? "w-20" : "w-64",
        "fixed lg:sticky -translate-x-full lg:translate-x-0",
        !isCollapsed && "translate-x-0"
      )}>
        {/* Logo Section - Clickable to toggle */}
        <div className={cn(
          "p-6 flex items-center gap-3 overflow-hidden transition-all",
          isCollapsed ? "justify-center px-0" : "justify-start"
        )}>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer group/logo"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 group-hover/logo:scale-110 transition-transform">
              <div className="w-4 h-4 bg-white rounded-full opacity-20" />
            </div>
            {!isCollapsed && (
              <span className="text-white font-bold text-lg tracking-tight truncate">EGW-INSTALLTEC</span>
            )}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-blue-600/10 text-white font-medium shadow-[inset_0_0_0_1px_rgba(37,99,235,0.2)]" 
                    : "hover:bg-slate-800/50 hover:text-slate-200",
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? item.label : ""}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors shrink-0",
                  isActive ? "text-blue-500" : "text-slate-500 group-hover:text-slate-300"
                )} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={cn(
              "flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 text-slate-500 group",
              isCollapsed && "justify-center px-0"
            )}
            title={isCollapsed ? "Déconnexion" : ""}
          >
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform shrink-0" />
            {!isCollapsed && <span className="font-medium truncate">Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
