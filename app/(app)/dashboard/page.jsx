"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default async function Dashboard() {
  const router = useRouter();

  const actions = [
    {
      title: "Take a note",
      description: "Quickly jot down your thoughts and ideas.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-500"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
      color: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      hoverColor: "hover:bg-blue-100 dark:hover:bg-blue-900/30",
      action: () => router.push("/dashboard/notes"),
    },
    {
      title: "Generate Facture",
      description: "Create a professional invoice for your clients.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-500"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      color: "bg-emerald-50 dark:bg-emerald-900/20",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      hoverColor: "hover:bg-emerald-100 dark:hover:bg-emerald-900/30",
      action: () => router.push("/dashboard/invoices"),
    },
    {
      title: "Generate Recu",
      description: "Issue a receipt for payments received.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-purple-500"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <path d="M7 15h.01" />
          <path d="M11 15h.01" />
        </svg>
      ),
      color: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      hoverColor: "hover:bg-purple-100 dark:hover:bg-purple-900/30",
      action: () => router.push("/dashboard/receipts"),
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Welcome back! What would you like to do today?
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`flex flex-col items-start p-8 rounded-2xl border-2 transition-all duration-200 text-left group ${action.color} ${action.borderColor} ${action.hoverColor} hover:scale-[1.02] cursor-pointer`}
            >
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 shadow-sm mb-6 group-hover:scale-110 transition-transform duration-200">
                {action.icon}
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                {action.title}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
