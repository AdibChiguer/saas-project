"use client";

import { useRouter } from "next/navigation";
import WorkLogForm from "@/components/global/ExistingClientNoteForm";
import { ArrowLeft, Clock } from "lucide-react";

export default function WorkLogsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
        
        {/* HEADER & NAVIGATION */}
        <header className="space-y-4">
          <button 
            onClick={() => router.push("/dashboard")}
            className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors w-fit"
          >
            <div className="p-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            Retour au tableau de bord
          </button>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              Saisie de travail
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base font-medium">
              Enregistrez vos heures d'intervention et les détails de votre journée.
            </p>
          </div>
        </header>

        {/* FORM CONTAINER */}
        <main className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-8">
          <WorkLogForm />
        </main>
        
      </div>
    </div>
  );
}