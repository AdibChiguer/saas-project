"use client";

import NewClientForm from "@/components/global/NewClientForm";
import WorkLogForm from "@/components/global/ExistingClientNoteForm";
import { useState } from "react";

export default function WorkLogsPage() {
  const [mode, setMode] = useState(null);
  const [clientId, setClientId] = useState(null);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Saisie de travail</h1>
        <p className="text-zinc-500">Enregistrez vos heures de travail quotidiennes</p>
      </header>

      {!mode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => setMode("existing")}
            className="p-8 border-2 border-dashed border-zinc-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-xl font-semibold text-zinc-600 hover:text-blue-600"
          >
            Client Existant
          </button>

          <button 
            onClick={() => setMode("new")}
            className="p-8 border-2 border-dashed border-zinc-300 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-xl font-semibold text-zinc-600 hover:text-emerald-600"
          >
            Nouveau Client
          </button>
        </div>
      )}

      {mode === "existing" && (
        <div>
          <button 
            onClick={() => setMode(null)}
            className="mb-4 text-sm text-blue-600 hover:underline"
          >
            &larr; Retour
          </button>
          <WorkLogForm />
        </div>
      )}

      {mode === "new" && !clientId && (
        <div>
          <button 
            onClick={() => setMode(null)}
            className="mb-4 text-sm text-blue-600 hover:underline"
          >
            &larr; Retour
          </button>
          <NewClientForm onCreated={(id) => setClientId(id)} />
        </div>
      )}

      {mode === "new" && clientId && (
        <div>
          <button 
            onClick={() => {setMode(null); setClientId(null);}}
            className="mb-4 text-sm text-blue-600 hover:underline"
          >
            &larr; Retour au menu
          </button>
          <WorkLogForm initialClientId={clientId} />
        </div>
      )}
    </div>
  );
}