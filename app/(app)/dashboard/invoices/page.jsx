"use client";

import { generateDevisFromWeek, updateDevisStatus, getAllDevis } from "@/actions/billing";
import { getAllClients } from "@/actions/client";
import { getOrCreateUser } from "@/actions/user";
import { exportDevisToExcel } from "@/lib/docs";
import { generateDevisPDF } from "@/actions/devis_facture"; 
import { useEffect, useState, useCallback } from "react";
import { 
  Calendar, 
  Users, 
  Search, 
  FileSpreadsheet, 
  CheckCircle2, 
  Send, 
  XCircle,
  FileDown,
} from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DevisPage() {
  const [semaineRef, setSemaineRef] = useState("");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [devisList, setDevisList] = useState([]);
  // Track which devis is currently being downloaded (by id)
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  const changeWeek = (offset) => {
    if (!semaineRef) return;
    const [year, weekStr] = semaineRef.split("-W");
    let y = parseInt(year);
    let w = parseInt(weekStr);
    w += offset;
    if (w > 52) { w = 1; y += 1; }
    else if (w < 1) { w = 52; y -= 1; }
    setSemaineRef(`${y}-W${String(w).padStart(2, "0")}`);
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

  // 1. Init current week
  useEffect(() => {
    const d = new Date();
    const year = d.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    setSemaineRef(`${year}-W${String(weekNum).padStart(2, "0")}`);
    fetchClients();
  }, [fetchClients]);

  // 2. Auto-generate + fetch when week changes
  useEffect(() => {
    if (!semaineRef) return;
    const autoGenerate = async () => {
      await generateDevisFromWeek(semaineRef);
      fetchDevis();
    };
    autoGenerate();
  }, [semaineRef, fetchDevis]);

  // 3. Re-fetch when client filter changes
  useEffect(() => {
    fetchDevis();
  }, [clientId, fetchDevis]);

  async function handleStatusChange(id, status) {
    const res = await updateDevisStatus(id, status);
    if (res.status === 200) fetchDevis();
  }

  // ── PDF download ────────────────────────────────────────────────
  async function handleDownloadPDF(devis) {
    setDownloadingId(devis.id);
    setDownloadError(null);

    const { data, filename, error } = await generateDevisPDF({
      devisNumero: devis.numero,
    });

    if (error) {
      setDownloadError(`${devis.numero} : ${error}`);
      setDownloadingId(null);
      return;
    }

    // base64 → Blob → auto-download
    const bytes  = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
    const blob   = new Blob([bytes], { type: "application/pdf" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a");
    a.href       = url;
    a.download   = filename;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadingId(null);
  }

  async function handleDownloadExcel(devis) {
    const userRes = await getOrCreateUser();
    if (userRes.status === 200) {
      exportDevisToExcel(devis, userRes.user);
    } else {
      exportDevisToExcel(devis);
    }
  }

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-10">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Gestion des Devis
          </h1>
          <p className="text-sm md:text-base text-zinc-500 font-medium">
            Génération automatique et centralisée par client.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between sm:justify-start gap-1 px-3 border-b sm:border-b-0 sm:border-r border-zinc-100 dark:border-zinc-800 pb-2 sm:pb-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => changeWeek(-1)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
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
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 sm:py-0">
            <Users className="w-4 h-4 text-emerald-500" />
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="bg-transparent border-none p-2 text-sm font-bold focus:ring-0 outline-none w-full sm:min-w-[150px]"
            >
              <option value="">Tous les clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Download error banner */}
      {downloadError && (
        <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-xl">
          <span>{downloadError}</span>
          <button
            onClick={() => setDownloadError(null)}
            className="ml-4 text-red-400 hover:text-red-600 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px] lg:min-w-full">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
                <th className="p-4 md:p-6 text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-400">Numéro</th>
                <th className="p-4 md:p-6 text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-400">Client</th>
                <th className="p-4 md:p-6 text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-400 text-center">Semaine</th>
                <th className="p-4 md:p-6 text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Total HT</th>
                <th className="p-4 md:p-6 text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-400 text-center">Statut</th>
                <th className="p-4 md:p-6 text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {loading && devisList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 md:p-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-zinc-400">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="font-bold text-sm">Chargement des devis...</p>
                    </div>
                  </td>
                </tr>
              ) : devisList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 md:p-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-zinc-300">
                      <Search className="w-10 h-10 md:w-12 md:h-12" />
                      <p className="text-lg md:text-xl font-bold">Aucun devis trouvé</p>
                      <p className="text-xs md:text-sm font-medium">Enregistrez du travail pour voir les devis apparaître ici.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                devisList.map((devis) => {
                  const isDownloading = downloadingId === devis.id;
                  return (
                    <tr key={devis.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                      <td className="p-4 md:p-6 font-mono font-black text-sm md:text-base text-zinc-900 dark:text-zinc-100">
                        {devis.numero}
                      </td>
                      <td className="p-4 md:p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 text-[10px] md:text-xs shrink-0">
                            {devis.client.nom.charAt(0)}
                          </div>
                          <span className="font-bold text-sm md:text-base text-zinc-700 dark:text-zinc-300 truncate max-w-[120px] md:max-w-none">
                            {devis.client.nom}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 md:p-6 text-center">
                        <span className="px-2 md:px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[10px] md:text-xs font-black text-zinc-500">
                          {devis.semaineRef}
                        </span>
                      </td>
                      <td className="p-4 md:p-6 text-right font-black text-sm md:text-base text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        {devis.total.toLocaleString("fr-FR")} €
                      </td>
                      <td className="p-4 md:p-6 text-center">
                        <span className={`inline-flex items-center gap-1 px-1.5 md:gap-1.5 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${
                          devis.statut === "accepte"  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                          devis.statut === "refuse"   ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          devis.statut === "envoye"   ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                          "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}>
                          {devis.statut === "accepte" && <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                          {devis.statut === "envoye"  && <Send className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                          {devis.statut === "refuse"  && <XCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                          {devis.statut}
                        </span>
                      </td>
                      <td className="p-4 md:p-6">
                        <div className="flex items-center justify-end gap-1.5 md:gap-2">

                          {/* Excel export — unchanged */}
                          <button
                            onClick={() => handleDownloadExcel(devis)}
                            title="Exporter en Excel"
                            className="p-1.5 md:p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg md:rounded-xl transition-all"
                          >
                            <FileSpreadsheet className="w-4 h-4 md:w-5 md:h-5" />
                          </button>

                          {/* PDF download — new */}
                          <button
                            onClick={() => handleDownloadPDF(devis)}
                            disabled={isDownloading}
                            title="Télécharger PDF"
                            className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg md:rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isDownloading ? (
                              <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FileDown className="w-4 h-4 md:w-5 md:h-5" />
                            )}
                          </button>

                          <div className="hidden sm:block h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5 md:mx-1" />

                          <button
                            onClick={() => handleStatusChange(devis.id, "envoye")}
                            className="px-2 md:px-3 py-1 md:py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] md:text-xs font-black rounded-lg hover:scale-105 transition-transform"
                          >
                            Envoyer
                          </button>
                          <button
                            onClick={() => handleStatusChange(devis.id, "accepte")}
                            className="px-2 md:px-3 py-1 md:py-1.5 bg-emerald-600 text-white text-[10px] md:text-xs font-black rounded-lg hover:scale-105 transition-transform"
                          >
                            Accepter
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}