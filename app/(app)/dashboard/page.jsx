"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { getDashboardStats } from "@/actions/note";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  LayoutGrid, 
  ListTodo, 
  TrendingUp,
  MapPin,
  Building2,
  FileText
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ weekly: [], monthly: [] });
  const [loading, setLoading] = useState(true);
  
  // State for navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getWeekRef = useCallback((date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const weekRef = getWeekRef(currentDate);
    const res = await getDashboardStats(weekRef, currentDate);
    if (res.status === 200) {
      setStats(res.data);
    }
    setLoading(false);
  }, [currentDate, getWeekRef]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const changeWeek = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (offset * 7));
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

  const actions = [
    {
      title: "Saisie travail",
      description: "Enregistrer vos heures du jour.",
      icon: <ListTodo className="w-8 h-8 text-blue-500" />,
      color: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      hoverColor: "hover:bg-blue-100 dark:hover:bg-blue-900/30",
      action: () => router.push("/dashboard/notes"),
    },
    {
      title: "Gérer Devis",
      description: "Générer vos devis de la semaine.",
      icon: <FileText className="w-8 h-8 text-emerald-500" />,
      color: "bg-emerald-50 dark:bg-emerald-900/20",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      hoverColor: "hover:bg-emerald-100 dark:hover:bg-emerald-900/30",
      action: () => router.push("/dashboard/invoices"),
    },
    {
      title: "Gérer Factures",
      description: "Suivre vos paiements clients.",
      icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
      color: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      hoverColor: "hover:bg-purple-100 dark:hover:bg-purple-900/30",
      action: () => router.push("/dashboard/receipts"),
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Dashboard
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Bienvenue ! Voici un aperçu de votre activité.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <button 
              onClick={() => changeWeek(-1)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 py-1 text-sm font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              {getWeekRef(currentDate)}
            </div>
            <button 
              onClick={() => changeWeek(1)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`flex items-center p-6 rounded-2xl border-2 transition-all duration-200 text-left group ${action.color} ${action.borderColor} ${action.hoverColor} hover:shadow-lg hover:-translate-y-1`}
            >
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 shadow-sm mr-6 group-hover:scale-110 transition-transform duration-200">
                {action.icon}
              </div>
              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                  {action.title}
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  {action.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-500" />
                Résumé de la semaine
              </h3>
              <div className="text-sm font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {totalWeeklyHours}h travaillées
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                <div className="h-40 bg-white dark:bg-zinc-900 rounded-2xl animate-pulse border border-zinc-200 dark:border-zinc-800" />
              ) : stats.weekly.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
                  Aucun travail enregistré cette semaine.
                </div>
              ) : (
                stats.weekly.map((log) => (
                  <div key={log.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-zinc-500">
                        {new Date(log.jour).toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-zinc-400" />
                          <p className="font-bold text-zinc-900 dark:text-zinc-50">{log.client.nom}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {log.heureDebut} - {log.heureFin} ({log.heuresTotal}h)
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {log.lieu || "Remote"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-zinc-900 dark:text-zinc-50">{log.montant.toLocaleString()} €</p>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{log.modeTarif}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Monthly Stats & Calendar */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black flex items-center gap-2">
                <LayoutGrid className="w-6 h-6 text-purple-500" />
                Vue Mensuelle
              </h3>
              <div className="flex items-center gap-1">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold capitalize">
                  {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
              <div className="space-y-1">
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Heures totales (mois)</p>
                <p className="text-5xl font-black text-white">{totalMonthlyHours}h</p>
              </div>
              
              <div className="h-px bg-zinc-800 w-full" />
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Prochain Devis</p>
                    <p className="text-xl font-bold">{totalWeeklyAmount.toLocaleString()} €</p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Semaine</p>
                    <p className="text-zinc-500 text-xs">{getWeekRef(currentDate)}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => router.push("/dashboard/invoices")}
                  className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                  Générer maintenant
                </button>
              </div>
            </div>

            {/* Monthly mini list */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                <span className="text-sm font-bold">Activités du mois</span>
                <span className="text-xs text-zinc-500 font-medium">{stats.monthly.length} jours enregistrés</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {stats.monthly.length === 0 ? (
                  <p className="p-8 text-center text-sm text-zinc-400">Aucune donnée.</p>
                ) : (
                  stats.monthly.map((log) => (
                    <div key={log.id} className="p-4 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between last:border-0">
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{log.client.nom}</p>
                        <p className="text-xs text-zinc-400">{new Date(log.jour).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <span className="text-sm font-black text-blue-600">+{log.heuresTotal}h</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
