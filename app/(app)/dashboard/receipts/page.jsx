"use client";

import { useEffect, useState } from "react";
import { getAllFactures } from "@/actions/billing";
import { generateFacturePDF } from "@/actions/devis_facture"; 
import { FileDown } from "lucide-react";

export default function FacturesPage() {
  const [factures, setFactures]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const res = await getAllFactures();
      if (res.status === 200) setFactures(res.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  // ── PDF download ──────────────────────────────────────────────────
  async function handleDownloadPDF(facture) {
    setDownloadingId(facture.id);
    setDownloadError(null);

    const { data, filename, error } = await generateFacturePDF({
      factureId: facture.id,
    });

    if (error) {
      setDownloadError(`${facture.numero} : ${error}`);
      setDownloadingId(null);
      return;
    }

    // base64 → Blob → auto-download
    const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
    const blob  = new Blob([bytes], { type: "application/pdf" });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement("a");
    a.href      = url;
    a.download  = filename;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadingId(null);
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Gestion des Factures</h1>
          <p className="text-sm md:text-base text-zinc-500">Consultez et suivez vos factures générées</p>
        </div>
      </header>

      {/* Error banner */}
      {downloadError && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
          <span>{downloadError}</span>
          <button onClick={() => setDownloadError(null)} className="ml-4 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center">
          <p className="text-zinc-400 text-[10px] md:text-sm font-bold uppercase mb-1 md:mb-2 text-center">Total HT</p>
          <p className="text-lg md:text-2xl font-black text-zinc-900">
            {factures.reduce((s, f) => s + f.totalHt, 0).toLocaleString()} €
          </p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center border-l-4 border-l-emerald-500">
          <p className="text-zinc-400 text-[10px] md:text-sm font-bold uppercase mb-1 md:mb-2 text-center">Payées</p>
          <p className="text-lg md:text-2xl font-black text-emerald-600">
            {factures.filter((f) => f.statut === "payee").length}
          </p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center border-l-4 border-l-amber-500">
          <p className="text-zinc-400 text-[10px] md:text-sm font-bold uppercase mb-1 md:mb-2 text-center">En attente</p>
          <p className="text-lg md:text-2xl font-black text-amber-600">
            {factures.filter((f) => f.statut === "generee" || f.statut === "envoyee").length}
          </p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center border-l-4 border-l-red-500">
          <p className="text-zinc-400 text-[10px] md:text-sm font-bold uppercase mb-1 md:mb-2 text-center">En retard</p>
          <p className="text-lg md:text-2xl font-black text-red-600">
            {factures.filter((f) => f.statut === "en_retard").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-zinc-50 border-b">
              <tr>
                <th className="p-4 text-sm font-semibold">Numéro</th>
                <th className="p-4 text-sm font-semibold">Client</th>
                <th className="p-4 text-sm font-semibold">Émission</th>
                <th className="p-4 text-sm font-semibold">Échéance</th>
                <th className="p-4 text-sm font-semibold">Total TTC</th>
                <th className="p-4 text-sm font-semibold">Statut</th>
                <th className="p-4 text-sm font-semibold">PDF</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-zinc-400">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Chargement...
                    </div>
                  </td>
                </tr>
              ) : factures.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-zinc-400">
                    Aucune facture générée pour le moment
                  </td>
                </tr>
              ) : (
                factures.map((f) => {
                  const isDownloading = downloadingId === f.id;
                  return (
                    <tr key={f.id} className="border-b hover:bg-zinc-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-sm text-zinc-900">{f.numero}</td>
                      <td className="p-4 text-sm text-zinc-600 truncate max-w-[150px]">{f.client.nom}</td>
                      <td className="p-4 text-sm text-zinc-600">
                        {new Date(f.dateEmission).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="p-4 text-sm text-zinc-600">
                        {new Date(f.dateEcheance).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="p-4 font-bold text-sm text-zinc-900 whitespace-nowrap">
                        {f.totalTtc.toLocaleString()} €
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap ${
                          f.statut === "payee"      ? "bg-emerald-100 text-emerald-700" :
                          f.statut === "en_retard"  ? "bg-red-100 text-red-700" :
                                                      "bg-amber-100 text-amber-700"
                        }`}>
                          {f.statut}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDownloadPDF(f)}
                          disabled={isDownloading}
                          title="Télécharger la facture PDF"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {isDownloading ? (
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FileDown className="w-4 h-4" />
                          )}
                        </button>
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