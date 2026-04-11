"use client";

import { getAllClients } from "@/actions/client";
import { createWorkLog } from "@/actions/note";
import { useEffect, useState, useCallback } from "react";
import NewClientForm from "@/components/global/NewClientForm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const WorkLogForm = ({ initialClientId }) => {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState(initialClientId || "");
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  
  const [jour, setJour] = useState(new Date().toISOString().split('T')[0]);
  const [heureDebut, setHeureDebut] = useState("08:00");
  const [heureFin, setHeureFin] = useState("17:00");
  const [lieu, setLieu] = useState("");
  const [modeTarif, setModeTarif] = useState("horaire");
  const [prixUnitaire, setPrixUnitaire] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    const res = await getAllClients();
    if (res.status === 200) setClients(res.data);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const onClientCreated = (newId) => {
    fetchClients();
    setClientId(newId);
    setShowNewClientForm(false);
  };

  // Helper to get week reference (e.g. 2025-W03)
  function getWeekRef(dateStr) {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
  }

  async function handleSubmit() {
    if (!clientId) return alert("Veuillez choisir un client");
    
    setLoading(true);
    try {
      const payload = {
        clientId,
        jour,
        heureDebut,
        heureFin,
        lieu,
        modeTarif,
        prixUnitaire,
        notes,
        semaineRef: getWeekRef(jour)
      };

      const res = await createWorkLog(payload);
      if (res.status === 201) {
        toast.success("Note de travail enregistrée avec succès !");
        // Redirection vers le dashboard après un court délai
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        toast.error("Erreur: " + res.error);
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow max-w-2xl mx-auto border border-zinc-100">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-bold text-zinc-800">Saisie Journalière</h2>
        <button 
          onClick={() => setShowNewClientForm(!showNewClientForm)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            showNewClientForm ? 'bg-zinc-100 text-zinc-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          {showNewClientForm ? "Annuler" : "+ Nouveau Client"}
        </button>
      </div>
      
      {showNewClientForm && (
        <div className="bg-zinc-50 p-4 rounded-lg border border-dashed border-zinc-200">
          <NewClientForm onCreated={onClientCreated} />
        </div>
      )}

      {!showNewClientForm && (
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-zinc-700">Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="border border-zinc-200 p-3 rounded-lg w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="">Sélectionner un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>

          {clientId && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700">Date</label>
                  <input
                    type="date"
                    value={jour}
                    onChange={(e) => setJour(e.target.value)}
                    className="border border-zinc-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700">Lieu</label>
                  <input
                    placeholder="Chantier, Bureau, Remote..."
                    value={lieu}
                    onChange={(e) => setLieu(e.target.value)}
                    className="border border-zinc-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700">Heure Début</label>
                  <input
                    type="time"
                    value={heureDebut}
                    onChange={(e) => setHeureDebut(e.target.value)}
                    className="border border-zinc-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700">Heure Fin</label>
                  <input
                    type="time"
                    value={heureFin}
                    onChange={(e) => setHeureFin(e.target.value)}
                    className="border border-zinc-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700">Mode Tarif</label>
                  <select
                    value={modeTarif}
                    onChange={(e) => setModeTarif(e.target.value)}
                    className="border border-zinc-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="horaire">Horaire</option>
                    <option value="forfait">Forfait</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700">Prix Unitaire (€)</label>
                  <input
                    type="number"
                    value={prixUnitaire}
                    onChange={(e) => setPrixUnitaire(Number(e.target.value))}
                    className="border border-zinc-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-zinc-700">Notes / Observations</label>
                <textarea
                  placeholder="Détails du travail effectué..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border border-zinc-200 p-3 rounded-lg w-full h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-zinc-900 hover:bg-black text-white px-6 py-4 rounded-xl font-bold disabled:opacity-50 transition-all shadow-lg active:scale-95"
              >
                {loading ? "Enregistrement..." : "Enregistrer la journée"}
              </button>
            </div>
          )}

          {!clientId && (
            <div className="py-12 text-center text-zinc-400 border-2 border-dashed border-zinc-100 rounded-xl">
              Veuillez sélectionner un client pour continuer
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkLogForm