"use client";

import ExistingClientNoteForm from "@/components/global/ExistingClientNoteForm";
import NewClientForm from "@/components/global/NewClientForm";
import { useState } from "react";
// import { ExistingClientNoteForm } from "@/components/global/ExistingClientNoteForm"
// import { NewClientForm } from "@/components/global/NewClientForm"


// export const metadata = {
//   title: "Notes",
//   description: "Manage your notes here",
// };  

export default function NotesPage() {
  const [mode, setMode] = useState(null);
  const [clientId, setClientId] = useState(null);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {!mode && (
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setMode("existing")}>
            Existing Client
          </button>

          <button onClick={() => setMode("new")}>
            New Client
          </button>
        </div>
      )}

      {mode === "existing" && <ExistingClientNoteForm />}

      {mode === "new" && !clientId && (
        <NewClientForm onCreated={setClientId} />
      )}

      {mode === "new" && clientId && (
        <ExistingClientNoteForm />
      )}
    </div>
  );
}