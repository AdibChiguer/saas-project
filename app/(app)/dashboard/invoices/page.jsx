"use client";

import { generateDevisFromWeek, updateDevisStatus, getAllDevis } from "@/actions/billing";
import { getAllClients } from "@/actions/client";
import { exportDevisToExcel } from "@/lib/docs";
import { useEffect, useState, useCallback } from "react";
import { 
  Calendar, 
  Users, 
  Search, 
  FileSpreadsheet, 
  CheckCircle2, 
  Send, 
  XCircle,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function DevisPage() {
  const [semaineRef, setSemaineRef] = useState("");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [devisList, setDevisList] = useState([]);

  const changeWeek = (offset) => {
    if (!semaineRef) return;
    const [year, weekStr] = semaineRef.split("-W");
    let y = parseInt(year);
    let w = parseInt(weekStr);
    
    w += offset;
    
    if (w > 52) {
      w = 1;
      y += 1;
    } else if (w < 1) {
      w = 52;
      y -= 1;
    }
    
    setSemaineRef(`${y}-W${String(w).padStart(2, '0')}`);
  };

  const fetchDevis = useCallback(async () => {
    setLoading(true);
    const res = await getAllDevis({ semaineRef, clientId });
    if (res.status === 200) setDevisList(res.data);
    setLoading(false);
  }, [semaineRef, clientId]);

  const fetchClients = useCallback(async () => {
    const res = await getAllClients();
    if (res.status === 200) setClients(res.data);
  }, []);

  // 1. Initialiser la semaine actuelle
  useEffect(() => {
    const d = new Date();
    const year = d.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    const initialWeek = `${year}-W${String(weekNum).padStart(2, '0')}`;
    setSemaineRef(initialWeek);
    fetchClients();
  }, [fetchClients]);

  // 2. Génération automatique des devis quand la semaine change
  useEffect(() => {
    if (!semaineRef) return;

    const autoGenerate = async () => {
      await generateDevisFromWeek(semaineRef);
      fetchDevis();
    };

    autoGenerate();
  }, [semaineRef, fetchDevis]);

  // 3. Re-fetch quand les filtres changent
  useEffect(() => {
    fetchDevis();
  }, [clientId, fetchDevis]);

  async function handleStatusChange(id, status) {
    const res = await updateDevisStatus(id, status);
    if (res.status === 200) {
      fetchDevis();
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Gestion des Devis
          </h1>
          <p className="text-zinc-500 font-medium">
            Génération automatique et centralisée par client.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1 px-3 border-r border-zinc-100 dark:border-zinc-800">
            <button 
              onClick={() => changeWeek(-1)}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <Calendar className="w-4 h-4 text-blue-500" />
            <input 
              type="text" 
              placeholder="2025-W03" 
              value={semaineRef}
              onChange={(e) => setSemaineRef(e.target.value)}
              className="bg-transparent border-none p-2 w-24 text-sm font-bold focus:ring-0 outline-none text-center"
            />
            <button 
              onClick={() => changeWeek(1)}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 px-3">
            <Users className="w-4 h-4 text-emerald-500" />
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="bg-transparent border-none p-2 text-sm font-bold focus:ring-0 outline-none min-w-[150px]"
            >
              <option value="">Tous les clients</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
                <th className="p-6 text-xs font-black uppercase tracking-widest text-zinc-400">Numéro</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-zinc-400">Client</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-zinc-400 text-center">Semaine</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Total HT</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-zinc-400 text-center">Statut</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {loading && devisList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-zinc-400">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="font-bold">Chargement des devis...</p>
                    </div>
                  </td>
                </tr>
              ) : devisList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-zinc-300">
                      <Search className="w-12 h-12" />
                      <p className="text-xl font-bold">Aucun devis trouvé</p>
                      <p className="text-sm font-medium">Enregistrez du travail pour voir les devis apparaître ici.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                devisList.map((devis) => (
                  <tr key={devis.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <td className="p-6 font-mono font-black text-zinc-900 dark:text-zinc-100">{devis.numero}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 text-xs">
                          {devis.client.nom.charAt(0)}
                        </div>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">{devis.client.nom}</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-black text-zinc-500">
                        {devis.semaineRef}
                      </span>
                    </td>
                    <td className="p-6 text-right font-black text-zinc-900 dark:text-zinc-100">
                      {devis.totalHt.toLocaleString('fr-FR')} €
                    </td>
                    <td className="p-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        devis.statut === 'accepte' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        devis.statut === 'refuse' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        devis.statut === 'envoye' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {devis.statut === 'accepte' && <CheckCircle2 className="w-3 h-3" />}
                        {devis.statut === 'envoye' && <Send className="w-3 h-3" />}
                        {devis.statut === 'refuse' && <XCircle className="w-3 h-3" />}
                        {devis.statut}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-end gap-2 transition-all">
                        <button 
                          onClick={() => exportDevisToExcel(devis)}
                          title="Exporter en Excel"
                          className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                        >
                          <FileSpreadsheet className="w-5 h-5" />
                        </button>
                        
                        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

                        <button 
                          onClick={() => handleStatusChange(devis.id, 'envoye')}
                          className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-black rounded-lg hover:scale-105 transition-transform"
                        >
                          Envoyer
                        </button>
                        <button 
                          onClick={() => handleStatusChange(devis.id, 'accepte')}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-black rounded-lg hover:scale-105 transition-transform"
                        >
                          Accepter
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
