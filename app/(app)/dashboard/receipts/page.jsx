"use client";

import { useEffect, useState } from "react";
import { getAllFactures, getFactureById } from "@/actions/billing";
import { exportFactureToPDF } from "@/lib/docs";

export default function FacturesPage() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await getAllFactures();
      if (res.status === 200) setFactures(res.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  async function handleDownload(id) {
    const res = await getFactureById(id);
    if (res.status === 200) {
      exportFactureToPDF(res.data);
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Gestion des Factures</h1>
          <p className="text-zinc-500">Consultez et suivez vos factures générées</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center">
          <p className="text-zinc-400 text-sm font-bold uppercase mb-2">Total HT</p>
          <p className="text-2xl font-black text-zinc-900">{factures.reduce((s, f) => s + f.totalHt, 0).toLocaleString()} €</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center border-l-4 border-l-emerald-500">
          <p className="text-zinc-400 text-sm font-bold uppercase mb-2">Payées</p>
          <p className="text-2xl font-black text-emerald-600">{factures.filter(f => f.statut === 'payee').length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center border-l-4 border-l-amber-500">
          <p className="text-zinc-400 text-sm font-bold uppercase mb-2">En attente</p>
          <p className="text-2xl font-black text-amber-600">{factures.filter(f => f.statut === 'generee' || f.statut === 'envoyee').length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center border-l-4 border-l-red-500">
          <p className="text-zinc-400 text-sm font-bold uppercase mb-2">En retard</p>
          <p className="text-2xl font-black text-red-600">{factures.filter(f => f.statut === 'en_retard').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Numéro</th>
              <th className="p-4 font-semibold">Client</th>
              <th className="p-4 font-semibold">Émission</th>
              <th className="p-4 font-semibold">Échéance</th>
              <th className="p-4 font-semibold">Total TTC</th>
              <th className="p-4 font-semibold">Statut</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-zinc-400">Chargement...</td></tr>
            ) : factures.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-zinc-400">Aucune facture générée pour le moment</td></tr>
            ) : (
              factures.map((f) => (
                <tr key={f.id} className="border-b hover:bg-zinc-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-zinc-900">{f.numero}</td>
                  <td className="p-4 text-zinc-600">{f.client.nom}</td>
                  <td className="p-4 text-zinc-600">{new Date(f.dateEmission).toLocaleDateString('fr-FR')}</td>
                  <td className="p-4 text-zinc-600">{new Date(f.dateEcheance).toLocaleDateString('fr-FR')}</td>
                  <td className="p-4 font-bold text-zinc-900">{f.totalTtc.toLocaleString()} €</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      f.statut === 'payee' ? 'bg-emerald-100 text-emerald-700' :
                      f.statut === 'en_retard' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {f.statut}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleDownload(f.id)}
                      className="text-emerald-600 hover:text-emerald-700 p-2 rounded-full hover:bg-emerald-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
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
