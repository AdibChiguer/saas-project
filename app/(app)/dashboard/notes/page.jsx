"use client";

import WorkLogForm from "@/components/global/ExistingClientNoteForm";

export default function WorkLogsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Saisie de travail</h1>
        <p className="text-zinc-500">Enregistrez vos heures de travail quotidiennes</p>
      </header>

      <WorkLogForm />
    </div>
  );
}