// "use client";

// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import React, { useEffect, useState, useCallback } from "react";
// import { getDashboardStats } from "@/actions/note";
// import {
//   Calendar,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   LayoutGrid,
//   Plus,
//   TrendingUp,
//   MapPin,
//   Building2,
//   FileText,
//   ArrowRight,
//   Wallet,
// } from "lucide-react";

// export default function Dashboard() {
//   const router = useRouter();
//   const [stats, setStats] = useState({ weekly: [], monthly: [] });
//   const [loading, setLoading] = useState(true);
//   const { data: session, status } = useSession();

//   // Edit/delete state
//   const [editingId, setEditingId] = useState(null);
//   const [editForm, setEditForm] = useState({
//     notes: "",
//     lieu: "",
//     prixUnitaire: "",
//   });
//   const [savingId, setSavingId] = useState(null);
//   const [deletingId, setDeletingId] = useState(null);
//   // ---------

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/login");
//     }
//   }, [status, router]);

//   // Show nothing while checking auth
//   if (status === "loading" || !session) {
//     return (
//       <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
//         <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   const [currentDate, setCurrentDate] = useState(new Date());

//   const getWeekRef = useCallback((date) => {
//     const d = new Date(date);
//     const year = d.getFullYear();
//     const firstDayOfYear = new Date(year, 0, 1);
//     const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
//     const weekNum = Math.ceil(
//       (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7,
//     );
//     return `${year}-W${String(weekNum).padStart(2, "0")}`;
//   }, []);

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     const weekRef = getWeekRef(currentDate);
//     // Assurez-vous que la fonction mockée/réelle gère bien les dates
//     const res = await getDashboardStats(weekRef, currentDate.toISOString());
//     if (res.status === 200) {
//       setStats(res.data);
//     }
//     setLoading(false);
//   }, [currentDate, getWeekRef]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const changeWeek = (offset) => {
//     const newDate = new Date(currentDate);
//     newDate.setDate(newDate.getDate() + offset * 7);
//     setCurrentDate(newDate);
//   };

//   const changeMonth = (offset) => {
//     const newDate = new Date(currentDate);
//     newDate.setMonth(newDate.getMonth() + offset);
//     setCurrentDate(newDate);
//   };

//   // ── Edit handlers ──────────────────────────────────────────────────────────
//   const startEdit = (log) => {
//     setEditingId(log.id);
//     setEditForm({
//       notes: log.notes || "",
//       lieu: log.lieu || "",
//       prixUnitaire: log.prixUnitaire || "",
//     });
//   };

//   const cancelEdit = () => {
//     setEditingId(null);
//   };

//   const saveEdit = async (id) => {
//     setSavingId(id);
//     const res = await updateWorkLog(id, {
//       notes: editForm.notes || null,
//       lieu: editForm.lieu || null,
//       prixUnitaire: editForm.prixUnitaire
//         ? parseFloat(editForm.prixUnitaire)
//         : undefined,
//     });
//     if (res.status === 200) {
//       // Update local state without refetching
//       setStats((prev) => ({
//         ...prev,
//         weekly: prev.weekly.map((l) =>
//           l.id === id ? { ...l, ...res.data } : l,
//         ),
//         monthly: prev.monthly.map((l) =>
//           l.id === id ? { ...l, ...res.data } : l,
//         ),
//       }));
//       setEditingId(null);
//     }
//     setSavingId(null);
//   };

//   const handleDelete = async (id) => {
//     setDeletingId(id);
//     const res = await deleteWorkLog(id);
//     if (res.status === 200) {
//       setStats((prev) => ({
//         ...prev,
//         weekly: prev.weekly.filter((l) => l.id !== id),
//         monthly: prev.monthly.filter((l) => l.id !== id),
//       }));
//     }
//     setDeletingId(null);
//   };
//   // ========

//   const totalWeeklyHours = stats.weekly.reduce(
//     (acc, log) => acc + log.heuresTotal,
//     0,
//   );
//   const totalMonthlyHours = stats.monthly.reduce(
//     (acc, log) => acc + log.heuresTotal,
//     0,
//   );
//   const totalWeeklyAmount = stats.weekly.reduce(
//     (acc, log) => acc + log.montant,
//     0,
//   );

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-blue-500/30">
//       <div className="max-w-7xl mx-auto space-y-8">
//         {/* HEADER & PRIMARY ACTION */}
//         <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200 dark:border-slate-800">
//           <div>
//             <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
//               Vue d'ensemble
//             </h1>
//             <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
//               Suivi de votre activité et de vos revenus.
//             </p>
//           </div>

//           <div className="flex flex-wrap items-center gap-3">
//             <button
//               onClick={() => router.push("/dashboard/notes")}
//               className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm shadow-blue-600/20 active:scale-95"
//             >
//               <Plus className="w-5 h-5" />
//               Saisir du temps
//             </button>
//           </div>
//         </header>

//         {/* TOP KPIs (BENTO GRID) */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
//           {/* KPI 1: Heures Hebdo */}
//           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
//             <div className="flex items-start justify-between">
//               <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
//                 <Clock className="w-5 h-5" />
//               </div>
//               <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
//                 <button
//                   onClick={() => changeWeek(-1)}
//                   className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
//                 >
//                   <ChevronLeft className="w-3 h-3" />
//                 </button>
//                 <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
//                   {getWeekRef(currentDate)}
//                 </span>
//                 <button
//                   onClick={() => changeWeek(1)}
//                   className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
//                 >
//                   <ChevronRight className="w-3 h-3" />
//                 </button>
//               </div>
//             </div>
//             <div className="mt-4">
//               <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
//                 Heures (Semaine)
//               </p>
//               <h2 className="text-3xl font-black text-slate-900 dark:text-white">
//                 {totalWeeklyHours}
//                 <span className="text-xl text-slate-400 font-bold">h</span>
//               </h2>
//             </div>
//           </div>

//           {/* KPI 2: Heures Mensuelles */}
//           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
//             <div className="flex items-start justify-between">
//               <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
//                 <LayoutGrid className="w-5 h-5" />
//               </div>
//               <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
//                 <button
//                   onClick={() => changeMonth(-1)}
//                   className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
//                 >
//                   <ChevronLeft className="w-3 h-3" />
//                 </button>
//                 <span className="text-xs font-bold capitalize text-slate-600 dark:text-slate-300">
//                   {currentDate.toLocaleDateString("fr-FR", {
//                     month: "short",
//                     year: "numeric",
//                   })}
//                 </span>
//                 <button
//                   onClick={() => changeMonth(1)}
//                   className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
//                 >
//                   <ChevronRight className="w-3 h-3" />
//                 </button>
//               </div>
//             </div>
//             <div className="mt-4">
//               <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
//                 Heures (Mois)
//               </p>
//               <h2 className="text-3xl font-black text-slate-900 dark:text-white">
//                 {totalMonthlyHours}
//                 <span className="text-xl text-slate-400 font-bold">h</span>
//               </h2>
//             </div>
//           </div>

//           {/* KPI 3: Prochain Devis / Revenu */}
//           <div className="bg-slate-900 dark:bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between relative overflow-hidden">
//             {/* Décoration subtile */}
//             <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full"></div>

//             <div className="flex items-start justify-between relative z-10">
//               <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
//                 <Wallet className="w-5 h-5" />
//               </div>
//             </div>
//             <div className="mt-4 relative z-10">
//               <p className="text-sm font-semibold text-slate-400 mb-1">
//                 À facturer (Semaine)
//               </p>
//               <h2 className="text-3xl font-black text-white">
//                 {totalWeeklyAmount.toLocaleString()}{" "}
//                 <span className="text-xl text-slate-400 font-bold">€</span>
//               </h2>
//               <button
//                 onClick={() => router.push("/dashboard/invoices")}
//                 className="mt-4 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-bold transition-colors"
//               >
//                 Générer les devis <ArrowRight className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* MAIN LAYOUT */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
//           {/* LEFT: Journal de la semaine (Prend plus de place) */}
//           <div className="lg:col-span-2 space-y-4">
//             <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
//               Détail de la semaine
//             </h3>

//             <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
//               {loading ? (
//                 <div className="h-64 animate-pulse bg-slate-50 dark:bg-slate-800" />
//               ) : stats.weekly.length === 0 ? (
//                 <div className="p-12 text-center text-slate-400 flex flex-col items-center">
//                   <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
//                     <Clock className="w-6 h-6 text-slate-300" />
//                   </div>
//                   <p className="font-medium">
//                     Aucune heure enregistrée cette semaine.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="divide-y divide-slate-100 dark:divide-slate-800">
//                   {stats.weekly.map((log) => {
//                     const start = new Date(log.startAt);
//                     const end = new Date(log.endAt);

//                     return (
//                       <div
//                         key={log.id}
//                         className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
//                       >
//                         <div className="flex items-start gap-4">
//                           <div className="w-12 h-12 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700">
//                             <span className="text-xs font-bold text-slate-400 uppercase">
//                               {start.toLocaleDateString("fr-FR", {
//                                 weekday: "short",
//                               })}
//                             </span>
//                             <span className="text-sm font-black text-slate-700 dark:text-slate-200">
//                               {start.getDate()}
//                             </span>
//                           </div>

//                           <div>
//                             <div className="flex items-center gap-2">
//                               <h4 className="font-bold text-slate-900 dark:text-white text-base">
//                                 {log.client.nom}
//                               </h4>
//                               <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
//                                 {log.modeTarif}
//                               </span>
//                             </div>

//                             <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
//                               <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-md">
//                                 <Clock className="w-3.5 h-3.5 text-blue-500" />
//                                 {start.toLocaleTimeString("fr-FR", {
//                                   hour: "2-digit",
//                                   minute: "2-digit",
//                                 })}{" "}
//                                 -{" "}
//                                 {end.toLocaleTimeString("fr-FR", {
//                                   hour: "2-digit",
//                                   minute: "2-digit",
//                                 })}
//                               </span>
//                               <span className="flex items-center gap-1">
//                                 <MapPin className="w-3.5 h-3.5" />
//                                 {log.lieu || "Remote"}
//                               </span>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 mt-2 sm:mt-0">
//                           <p className="font-black text-lg text-slate-900 dark:text-white">
//                             {log.montant.toLocaleString()} €
//                           </p>
//                           <p className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md mt-1">
//                             {log.heuresTotal}h travaillées
//                           </p>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* RIGHT SIDE: Quick Links & Monthly Log */}
//           <div className="space-y-6">
//             {/* Quick Actions (Bento Mini) */}
//             <div className="grid grid-cols-2 gap-3">
//               <button
//                 onClick={() => router.push("/dashboard/invoices")}
//                 className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 hover:shadow-md transition-all text-left group"
//               >
//                 <FileText className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-3 transition-colors" />
//                 <h4 className="font-bold text-slate-900 dark:text-white text-sm">
//                   Gérer Devis
//                 </h4>
//               </button>

//               <button
//                 onClick={() => router.push("/dashboard/receipts")}
//                 className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 hover:shadow-md transition-all text-left group"
//               >
//                 <TrendingUp className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-3 transition-colors" />
//                 <h4 className="font-bold text-slate-900 dark:text-white text-sm">
//                   Gérer Factures
//                 </h4>
//               </button>
//             </div>

//             {/* Monthly Activity List */}
//             <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[400px]">
//               <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
//                 <h3 className="font-bold text-slate-900 dark:text-white">
//                   Activité du mois
//                 </h3>
//                 <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-full">
//                   {stats.monthly.length} jours
//                 </span>
//               </div>

//               <div className="overflow-y-auto flex-1 p-2">
//                 {stats.monthly.length === 0 ? (
//                   <div className="h-full flex items-center justify-center text-sm text-slate-400">
//                     Aucune donnée ce mois-ci.
//                   </div>
//                 ) : (
//                   stats.monthly.map((log) => {
//                     const start = new Date(log.startAt);
//                     return (
//                       <div
//                         key={log.id}
//                         className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-between mb-1"
//                       >
//                         <div className="flex items-center gap-3">
//                           <div className="w-2 h-2 rounded-full bg-blue-500"></div>
//                           <div>
//                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
//                               {log.client.nom}
//                             </p>
//                             <p className="text-xs text-slate-500 font-medium">
//                               {start.toLocaleDateString("fr-FR", {
//                                 day: "numeric",
//                                 month: "short",
//                               })}
//                             </p>
//                           </div>
//                         </div>
//                         <span className="text-sm font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
//                           {log.heuresTotal}h
//                         </span>
//                       </div>
//                     );
//                   })
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { getDashboardStats, updateWorkLog, deleteWorkLog } from "@/actions/workLog";
import {
  ChevronLeft, ChevronRight, Clock, LayoutGrid, Plus,
  TrendingUp, MapPin, FileText, ArrowRight, Wallet,
  Pencil, Trash2, Check, X, AlertTriangle,
} from "lucide-react";

// ── Delete confirmation dialog ─────────────────────────────────────────────
function DeleteDialog({ onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 w-full max-w-sm">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Supprimer ce log ?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Cette action est irréversible. Le log de travail sera définitivement supprimé.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isDeleting
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Trash2 className="w-4 h-4" />
              }
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function toDatetimeLocal(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  // Format: YYYY-MM-DDTHH:mm
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [stats, setStats]             = useState({ weekly: [], monthly: [] });
  const [loading, setLoading]         = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm]   = useState({});
  const [savingId, setSavingId]   = useState(null);
  const [formError, setFormError] = useState("");

  // Delete state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId]           = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getWeekRef = useCallback((date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-W${String(weekNum).padStart(2, "0")}`;
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const weekRef = getWeekRef(currentDate);
    const res = await getDashboardStats(weekRef, currentDate.toISOString());
    if (res.status === 200) setStats(res.data);
    setLoading(false);
  }, [currentDate, getWeekRef]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const changeWeek = (offset) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset * 7);
    setCurrentDate(d);
  };
  const changeMonth = (offset) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + offset);
    setCurrentDate(d);
  };

  // ── Edit handlers ────────────────────────────────────────────────────────
  const startEdit = (log) => {
    setFormError("");
    setEditingId(log.id);
    setEditForm({
      startAt:      toDatetimeLocal(log.startAt),
      endAt:        toDatetimeLocal(log.endAt),
      lieu:         log.lieu         || "",
      modeTarif:    log.modeTarif    || "horaire",
      prixUnitaire: log.prixUnitaire || "",
      notes:        log.notes        || "",
      semaineRef:   log.semaineRef   || "",
    });
  };

  const cancelEdit = () => { setEditingId(null); setFormError(""); };

  const saveEdit = async (id) => {
    setFormError("");

    // Validate
    if (!editForm.startAt || !editForm.endAt) {
      setFormError("Les dates de début et de fin sont requises.");
      return;
    }
    if (new Date(editForm.endAt) <= new Date(editForm.startAt)) {
      setFormError("La date de fin doit être après la date de début.");
      return;
    }
    if (!editForm.prixUnitaire || isNaN(parseFloat(editForm.prixUnitaire))) {
      setFormError("Le prix unitaire doit être un nombre valide.");
      return;
    }

    setSavingId(id);
    const res = await updateWorkLog(id, {
      startAt:      editForm.startAt,
      endAt:        editForm.endAt,
      lieu:         editForm.lieu         || null,
      modeTarif:    editForm.modeTarif,
      prixUnitaire: editForm.prixUnitaire,
      notes:        editForm.notes        || null,
      semaineRef:   editForm.semaineRef,
    });

    if (res.status === 200) {
      setStats((prev) => ({
        ...prev,
        weekly:  prev.weekly.map((l)  => l.id === id ? { ...l, ...res.data } : l),
        monthly: prev.monthly.map((l) => l.id === id ? { ...l, ...res.data } : l),
      }));
      setEditingId(null);
    } else {
      setFormError("Une erreur est survenue. Veuillez réessayer.");
    }
    setSavingId(null);
  };

  // ── Delete handlers ──────────────────────────────────────────────────────
  const confirmDelete = async () => {
    setDeletingId(confirmDeleteId);
    const res = await deleteWorkLog(confirmDeleteId);
    if (res.status === 200) {
      setStats((prev) => ({
        ...prev,
        weekly:  prev.weekly.filter((l)  => l.id !== confirmDeleteId),
        monthly: prev.monthly.filter((l) => l.id !== confirmDeleteId),
      }));
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  // ── Totals ───────────────────────────────────────────────────────────────
  const totalWeeklyHours  = stats.weekly.reduce((acc, l) => acc + l.heuresTotal, 0);
  const totalMonthlyHours = stats.monthly.reduce((acc, l) => acc + l.heuresTotal, 0);
  const totalWeeklyAmount = stats.weekly.reduce((acc, l) => acc + l.montant, 0);

  return (
    <>
      {/* Delete confirmation dialog */}
      {confirmDeleteId && (
        <DeleteDialog
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
          isDeleting={!!deletingId}
        />
      )}

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-blue-500/30">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* HEADER */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Vue d'ensemble</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Suivi de votre activité et de vos revenus.</p>
            </div>
            <button
              onClick={() => router.push("/dashboard/work-log")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm shadow-blue-600/20 active:scale-95"
            >
              <Plus className="w-5 h-5" /> Saisir du temps
            </button>
          </header>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"><Clock className="w-5 h-5" /></div>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                  <button onClick={() => changeWeek(-1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded"><ChevronLeft className="w-3 h-3" /></button>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{getWeekRef(currentDate)}</span>
                  <button onClick={() => changeWeek(1)}  className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded"><ChevronRight className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Heures (Semaine)</p>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">{totalWeeklyHours}<span className="text-xl text-slate-400 font-bold">h</span></h2>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg"><LayoutGrid className="w-5 h-5" /></div>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                  <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded"><ChevronLeft className="w-3 h-3" /></button>
                  <span className="text-xs font-bold capitalize text-slate-600 dark:text-slate-300">
                    {currentDate.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                  </span>
                  <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded"><ChevronRight className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Heures (Mois)</p>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">{totalMonthlyHours}<span className="text-xl text-slate-400 font-bold">h</span></h2>
              </div>
            </div>

            <div className="bg-slate-900 dark:bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full" />
              <div className="flex items-start justify-between relative z-10">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Wallet className="w-5 h-5" /></div>
              </div>
              <div className="mt-4 relative z-10">
                <p className="text-sm font-semibold text-slate-400 mb-1">À facturer (Semaine)</p>
                <h2 className="text-3xl font-black text-white">{totalWeeklyAmount.toLocaleString()} <span className="text-xl text-slate-400 font-bold">€</span></h2>
                <button
                  onClick={() => router.push("/dashboard/invoices")}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  Générer les devis <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* MAIN LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* Weekly detail */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Détail de la semaine</h3>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                {loading ? (
                  <div className="h-64 animate-pulse bg-slate-50 dark:bg-slate-800" />
                ) : stats.weekly.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                      <Clock className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="font-medium">Aucune heure enregistrée cette semaine.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats.weekly.map((log) => {
                      const start      = new Date(log.startAt);
                      const end        = new Date(log.endAt);
                      const isEditing  = editingId === log.id;
                      const isSaving   = savingId  === log.id;

                      return (
                        <div key={log.id} className="p-4 sm:p-5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">

                          {/* ── Normal view ── */}
                          {!isEditing && (
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex items-start gap-4">
                                {/* Date badge */}
                                <div className="w-12 h-12 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700">
                                  <span className="text-xs font-bold text-slate-400 uppercase">{start.toLocaleDateString("fr-FR", { weekday: "short" })}</span>
                                  <span className="text-sm font-black text-slate-700 dark:text-slate-200">{start.getDate()}</span>
                                </div>

                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-base">{log.client.nom}</h4>
                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                                      {log.modeTarif}
                                    </span>
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                                      {log.semaineRef}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-md">
                                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                                      {start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} —{" "}
                                      {end.toLocaleTimeString("fr-FR",   { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5" /> {log.lieu || "Remote"}
                                    </span>
                                  </div>
                                  {log.notes && (
                                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 max-w-sm">
                                      {log.notes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-start gap-3 self-end sm:self-auto">
                                <div className="text-right">
                                  <p className="font-black text-lg text-slate-900 dark:text-white">{log.montant.toLocaleString()} €</p>
                                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md mt-1 whitespace-nowrap">
                                    {log.heuresTotal}h — {log.prixUnitaire}€/{log.modeTarif === "horaire" ? "h" : "forfait"}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-1.5 pt-0.5">
                                  <button
                                    onClick={() => startEdit(log)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    title="Modifier"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(log.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ── Edit form ── */}
                          {isEditing && (
                            <div className="space-y-4">
                              {/* Client + week ref header */}
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-slate-900 dark:text-white">{log.client.nom}</h4>
                                <span className="text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md">
                                  Modification
                                </span>
                              </div>

                              {/* Row 1: start / end */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Début</label>
                                  <input
                                    type="datetime-local"
                                    value={editForm.startAt}
                                    onChange={(e) => setEditForm((f) => ({ ...f, startAt: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Fin</label>
                                  <input
                                    type="datetime-local"
                                    value={editForm.endAt}
                                    onChange={(e) => setEditForm((f) => ({ ...f, endAt: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                  />
                                </div>
                              </div>

                              {/* Row 2: lieu / semaineRef */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Lieu</label>
                                  <input
                                    type="text"
                                    value={editForm.lieu}
                                    onChange={(e) => setEditForm((f) => ({ ...f, lieu: e.target.value }))}
                                    placeholder="Ex: Paris, Remote..."
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Semaine de référence</label>
                                  <input
                                    type="text"
                                    value={editForm.semaineRef}
                                    onChange={(e) => setEditForm((f) => ({ ...f, semaineRef: e.target.value }))}
                                    placeholder="Ex: 2025-W03"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                  />
                                </div>
                              </div>

                              {/* Row 3: modeTarif / prixUnitaire */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Mode de tarif</label>
                                  <select
                                    value={editForm.modeTarif}
                                    onChange={(e) => setEditForm((f) => ({ ...f, modeTarif: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                  >
                                    <option value="horaire">Horaire</option>
                                    <option value="forfait">Forfait</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                    Prix unitaire (€/{editForm.modeTarif === "horaire" ? "h" : "forfait"})
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editForm.prixUnitaire}
                                    onChange={(e) => setEditForm((f) => ({ ...f, prixUnitaire: e.target.value }))}
                                    placeholder="Ex: 75"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                  />
                                </div>
                              </div>

                              {/* Row 4: notes */}
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Notes</label>
                                <textarea
                                  value={editForm.notes}
                                  onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                                  placeholder="Ajouter une note..."
                                  rows={2}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                                />
                              </div>

                              {/* Computed preview */}
                              {editForm.startAt && editForm.endAt && editForm.prixUnitaire && (
                                <div className="flex items-center gap-4 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-300">
                                  {(() => {
                                    const h = (new Date(editForm.endAt) - new Date(editForm.startAt)) / 3600000;
                                    const p = parseFloat(editForm.prixUnitaire) || 0;
                                    const m = editForm.modeTarif === "horaire" ? h * p : p;
                                    return (
                                      <>
                                        <span>Durée : {h.toFixed(2)}h</span>
                                        <span>·</span>
                                        <span>Montant calculé : {m.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
                                      </>
                                    );
                                  })()}
                                </div>
                              )}

                              {/* Error */}
                              {formError && (
                                <p className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                                  {formError}
                                </p>
                              )}

                              {/* Actions */}
                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  onClick={cancelEdit}
                                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                  <X className="w-4 h-4" /> Annuler
                                </button>
                                <button
                                  onClick={() => saveEdit(log.id)}
                                  disabled={isSaving}
                                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50"
                                >
                                  {isSaving
                                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <Check className="w-4 h-4" />
                                  }
                                  Sauvegarder
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => router.push("/dashboard/invoices")}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 hover:shadow-md transition-all text-left group"
                >
                  <FileText className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-3 transition-colors" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Gérer Devis</h4>
                </button>
                <button
                  onClick={() => router.push("/dashboard/receipts")}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 hover:shadow-md transition-all text-left group"
                >
                  <TrendingUp className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-3 transition-colors" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Gérer Factures</h4>
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[400px]">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white">Activité du mois</h3>
                  <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-full">
                    {stats.monthly.length} jours
                  </span>
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                  {stats.monthly.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400">Aucune donnée ce mois-ci.</div>
                  ) : (
                    stats.monthly.map((log) => {
                      const start = new Date(log.startAt);
                      return (
                        <div key={log.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-between mb-1">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{log.client.nom}</p>
                              <p className="text-xs text-slate-500 font-medium">{start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            {log.heuresTotal}h
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}