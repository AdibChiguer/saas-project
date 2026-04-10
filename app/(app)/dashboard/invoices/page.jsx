"use client";

import { generateDevisFromWeek, updateDevisStatus, getAllDevis } from "@/actions/billing";
import { exportDevisToExcel } from "@/lib/docs";
import { useEffect, useState, useCallback } from "react";

export default function DevisPage() {
  const [semaineRef, setSemaineRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [devisList, setDevisList] = useState([]);

  const fetchDevis = useCallback(async (week) => {
    const res = await getAllDevis(week);
    if (res.status === 200) setDevisList(res.data);
  }, []);

  // Get current week ref and fetch devis
  useEffect(() => {
    const d = new Date();
    const year = d.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    const initialWeek = `${year}-W${String(weekNum).padStart(2, '0')}`;
    setSemaineRef(initialWeek);
    fetchDevis(initialWeek);
  }, [fetchDevis]);

  async function handleGenerate() {
    setLoading(true);
    const res = await generateDevisFromWeek(semaineRef);
    if (res.status === 201) {
      alert(`${res.data.length} devis générés !`);
      fetchDevis(semaineRef);
    } else {
      alert("Erreur: " + res.error);
    }
    setLoading(false);
  }

  async function handleStatusChange(id, status) {
    const res = await updateDevisStatus(id, status);
    if (res.status === 200) {
      alert("Statut mis à jour !");
      fetchDevis(semaineRef);
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Devis</h1>
          <p className="text-zinc-500">Générez et gérez vos devis par semaine</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
          <input 
            type="text" 
            placeholder="Ex: 2025-W03" 
            value={semaineRef}
            onChange={(e) => setSemaineRef(e.target.value)}
            className="border p-2 rounded w-32 text-center font-mono"
          />
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? "Génération..." : "Générer les devis"}
          </button>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Numéro</th>
              <th className="p-4 font-semibold">Client</th>
              <th className="p-4 font-semibold">Semaine</th>
              <th className="p-4 font-semibold">Total HT</th>
              <th className="p-4 font-semibold">Statut</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {devisList.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-zinc-400">Aucun devis généré pour le moment</td>
              </tr>
            ) : (
              devisList.map((devis) => (
                <tr key={devis.id} className="border-b hover:bg-zinc-50 transition-colors">
                  <td className="p-4 font-mono font-bold">{devis.numero}</td>
                  <td className="p-4">{devis.client.nom}</td>
                  <td className="p-4">{devis.semaineRef}</td>
                  <td className="p-4 font-semibold">{devis.totalHt.toLocaleString()} €</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      devis.statut === 'accepte' ? 'bg-emerald-100 text-emerald-700' :
                      devis.statut === 'refuse' ? 'bg-red-100 text-red-700' :
                      devis.statut === 'envoye' ? 'bg-blue-100 text-blue-700' :
                      'bg-zinc-100 text-zinc-700'
                    }`}>
                      {devis.statut}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button 
                      onClick={() => exportDevisToExcel(devis)}
                      className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded hover:bg-emerald-100"
                    >
                      Excel
                    </button>
                    <button 
                      onClick={() => handleStatusChange(devis.id, 'envoye')}
                      className="text-xs bg-zinc-900 text-white px-3 py-1 rounded hover:bg-zinc-800"
                    >
                      Envoyer
                    </button>
                    <button 
                      onClick={() => handleStatusChange(devis.id, 'accepte')}
                      className="text-xs bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
                    >
                      Accepter
                    </button>
                    <button 
                      onClick={() => handleStatusChange(devis.id, 'refuse')}
                      className="text-xs border border-red-200 text-red-600 px-3 py-1 rounded hover:bg-red-50"
                    >
                      Refuser
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
