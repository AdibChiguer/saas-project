"use client";

import { getAllClients } from "@/actions/client";
import { createWorkLog } from "@/actions/note";
import { useEffect, useState } from "react";

const WorkLogForm = ({ initialClientId }) => {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState(initialClientId || "");
  const [jour, setJour] = useState(new Date().toISOString().split('T')[0]);
  const [heureDebut, setHeureDebut] = useState("08:00");
  const [heureFin, setHeureFin] = useState("17:00");
  const [lieu, setLieu] = useState("");
  const [modeTarif, setModeTarif] = useState("horaire");
  const [prixUnitaire, setPrixUnitaire] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchClients() {
      const res = await getAllClients();
      if (res.status === 200) setClients(res.data);
    }
    fetchClients();
  }, []);

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
        alert("Note de travail enregistrée !");
        // Reset or redirect
      } else {
        alert("Erreur: " + res.error);
      }
    } catch (error) {
      alert("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold border-b pb-2">Saisie Journalière</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">Choisir un client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              value={jour}
              onChange={(e) => setJour(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Lieu</label>
            <input
              placeholder="Chantier, Bureau, Remote..."
              value={lieu}
              onChange={(e) => setLieu(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Heure Début</label>
            <input
              type="time"
              value={heureDebut}
              onChange={(e) => setHeureDebut(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Heure Fin</label>
            <input
              type="time"
              value={heureFin}
              onChange={(e) => setHeureFin(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Mode Tarif</label>
            <select
              value={modeTarif}
              onChange={(e) => setModeTarif(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="horaire">Horaire</option>
              <option value="forfait">Forfait</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Prix Unitaire (€)</label>
            <input
              type="number"
              value={prixUnitaire}
              onChange={(e) => setPrixUnitaire(Number(e.target.value))}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Notes / Observations</label>
          <textarea
            placeholder="Détails du travail effectué..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border p-2 rounded w-full h-24"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50 transition-all shadow-md"
      >
        {loading ? "Enregistrement..." : "Enregistrer la journée"}
      </button>
    </div>
  );
}

export default WorkLogForm