"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getDashboardStats, updateWorkLog, deleteWorkLog } from "@/actions/workLog";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  TrendingUp,
  MapPin,
  FileText,
  ArrowRight,
  Wallet,
  Pencil,
  Trash2,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({ weekly: [], monthly: [] });
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const getWeekRef = useCallback((date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
    const weekNum = Math.ceil(
      (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7,
    );
    return `${year}-W${String(weekNum).padStart(2, "0")}`;
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const weekRef = getWeekRef(currentDate);
    const res = await getDashboardStats(weekRef, currentDate.toISOString());
    if (res.status === 200) {
      setStats(res.data);
    }
    setLoading(false);
  }, [currentDate, getWeekRef]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, fetchData]);

  const changeWeek = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset * 7);
    setCurrentDate(newDate);
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const totalWeeklyHours = stats.weekly.reduce((acc, log) => acc + log.heuresTotal, 0);
  const totalMonthlyHours = stats.monthly.reduce((acc, log) => acc + log.heuresTotal, 0);
  const totalWeeklyAmount = stats.weekly.reduce((acc, log) => acc + log.montant, 0);

  const handleDelete = async (id) => {
    if (confirm("Voulez-vous vraiment supprimer cette saisie ?")) {
      const res = await deleteWorkLog(id);
      if (res.status === 200) {
        fetchData();
      }
    }
  };

  if (status === "loading") return null;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Vue d'ensemble</h1>
          <p className="text-sm md:text-base text-slate-500">Suivi de votre activité et de vos revenus.</p>
        </div>
        <button 
          onClick={() => router.push("/dashboard/work-log")}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Saisir du temps
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Weekly Hours Card */}
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm relative group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-200 rounded-full opacity-50" />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold text-slate-400">
              <button onClick={() => changeWeek(-1)} className="hover:text-slate-900 transition-colors">‹</button>
              <span>{getWeekRef(currentDate)}</span>
              <button onClick={() => changeWeek(1)} className="hover:text-slate-900 transition-colors">›</button>
            </div>
          </div>
          <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider">Heures (Semaine)</p>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 mt-1">{totalWeeklyHours.toFixed(1)}h</h2>
        </div>

        {/* Monthly Hours Card */}
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm relative group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-emerald-200 rounded-full opacity-50" />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold text-slate-400">
              <button onClick={() => changeMonth(-1)} className="hover:text-slate-900 transition-colors">‹</button>
              <span className="capitalize">{currentDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</span>
              <button onClick={() => changeMonth(1)} className="hover:text-slate-900 transition-colors">›</button>
            </div>
          </div>
          <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider">Heures (Mois)</p>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 mt-1">{totalMonthlyHours.toFixed(1)}h</h2>
        </div>

        {/* Amount to Invoice Card */}
        <div className="bg-[#020617] p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl relative overflow-hidden group sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-600/20 transition-all duration-500" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-500 rounded-full opacity-50" />
            </div>
          </div>
          <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider relative z-10">À facturer (Semaine)</p>
          <h2 className="text-2xl md:text-4xl font-black text-white mt-1 relative z-10">{totalWeeklyAmount.toLocaleString()} €</h2>
          <button 
            onClick={() => router.push("/dashboard/invoices")}
            className="mt-4 md:mt-6 w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all relative z-10"
          >
            Générer les devis <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Left Column: Weekly Detail */}
        <div className="lg:col-span-8 space-y-4 md:space-y-6">
          <h3 className="text-lg md:text-xl font-bold text-slate-900">Détail de la semaine</h3>
          
          <div className="space-y-4">
            {stats.weekly.length === 0 ? (
              <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 p-8 md:p-12 text-center">
                <p className="text-sm md:text-base text-slate-400 font-medium">Aucune activité enregistrée cette semaine.</p>
              </div>
            ) : (
              stats.weekly.map((log) => {
                const start = new Date(log.startAt);
                const end = new Date(log.endAt);
                return (
                  <div key={log.id} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-xl md:rounded-2xl flex flex-col items-center justify-center border border-slate-100 shrink-0">
                        <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase">{start.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                        <span className="text-lg md:text-xl font-black text-slate-900">{start.getDate()}</span>
                      </div>
                      
                      <div className="flex-1 sm:hidden">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 truncate">{log.client.nom}</h4>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded-full shrink-0">
                            {log.modeTarif}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 mt-1">{log.montant.toLocaleString()} €</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full sm:w-auto min-w-0">
                      <div className="hidden sm:flex items-center gap-3">
                        <h4 className="font-bold text-lg text-slate-900 truncate">{log.client.nom}</h4>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full shrink-0">
                          {log.modeTarif}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 sm:mt-2 text-xs md:text-sm font-medium text-slate-400">
                        <span className="flex items-center gap-1.5 shrink-0">
                          <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          {start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} — {end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                          <span className="truncate">{log.lieu || "Remote"}</span>
                        </span>
                      </div>
                      {log.notes && (
                        <div className="mt-2 md:mt-3 bg-slate-50 px-3 py-1.5 rounded-lg w-full">
                          <p className="text-[10px] md:text-xs text-slate-400 font-medium italic truncate block">
                            "{log.notes}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="hidden sm:block text-right shrink-0 ml-auto">
                      <p className="text-xl md:text-2xl font-black text-slate-900">{(log.montant || 0).toLocaleString()} €</p>
                      <p className="text-[10px] md:text-xs font-bold text-blue-500 mt-1">{log.heuresTotal}h — {log.prixUnitaire}€/{log.modeTarif === 'horaire' ? 'h' : 'forfait'}</p>
                    </div>

                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
                      <button 
                        onClick={() => router.push(`/dashboard/work-log?edit=${log.id}`)}
                        className="flex-1 sm:flex-none p-2 bg-slate-50 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-500 transition-all flex justify-center"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(log.id)}
                        className="flex-1 sm:flex-none p-2 bg-slate-50 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all flex justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Mini Actions & Monthly List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => router.push("/dashboard/invoices")}
              className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-50 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:bg-blue-50 transition-colors">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-blue-500" />
              </div>
              <span className="text-[10px] md:text-sm font-bold text-slate-900">Gérer Devis</span>
            </button>
            <button 
              onClick={() => router.push("/dashboard/receipts")}
              className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-50 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:bg-emerald-50 transition-colors">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-emerald-500" />
              </div>
              <span className="text-[10px] md:text-sm font-bold text-slate-900">Gérer Factures</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[400px] md:h-[500px]">
            <div className="p-4 md:p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm md:text-base">Activité du mois</h3>
              <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">{stats.monthly.length} jours</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
              {stats.monthly.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-slate-300 text-xs md:text-sm font-medium">Aucune activité ce mois-ci.</p>
                </div>
              ) : (
                stats.monthly.map((log) => (
                  <div key={log.id} className="p-3 md:p-4 hover:bg-slate-50 rounded-xl md:rounded-2xl transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-bold text-slate-900 truncate">{log.client.nom}</p>
                        <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase">
                          {new Date(log.startAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs md:text-sm font-black text-slate-900 bg-slate-50 px-2 md:px-3 py-1 rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100 shrink-0">
                      {log.heuresTotal}h
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
