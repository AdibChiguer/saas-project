"use client";

import { getAllClients } from "@/actions/client";
import { createWorkLog } from "@/actions/workLog";
import { useEffect, useState, useCallback } from "react";
import NewClientForm from "@/components/global/NewClientForm";
import TimePicker24h from "@/components/global/TimePicker24h";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const WorkLogForm = ({ initialClientId }) => {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState(initialClientId || "");
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  
  const now = new Date();
  const defaultStartAt = new Date(now.getTime());
  defaultStartAt.setSeconds(0, 0);
  const defaultEndAt = new Date(defaultStartAt.getTime() + 60 * 60 * 1000);
  
  const toLocalInputValue = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [startAt, setStartAt] = useState(toLocalInputValue(defaultStartAt));
  const [endAt, setEndAt] = useState(toLocalInputValue(defaultEndAt));

  // Helpers pour séparer date et heure
  const splitDateTime = (dt) => {
    const [date, time] = dt.split("T");
    return { date, time };
  };

  const updateDate = (currentDt, newDate, setter) => {
    const { time } = splitDateTime(currentDt);
    setter(`${newDate}T${time}`);
  };

  const updateTime = (currentDt, newTime, setter) => {
    const { date } = splitDateTime(currentDt);
    setter(`${date}T${newTime}`);
  };

  // Forcer le format 24h via une propriété personnalisée si nécessaire, 
  // bien que l'input datetime-local dépende normalement de la locale du navigateur.
  // En changeant lang="fr" dans le layout, le navigateur devrait déjà passer en 24h.
  
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

  function getWeekRef(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
  }

  const computeDurationHours = () => {
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    const diff = (end - start) / (1000 * 60 * 60);
    return diff > 0 ? Math.round(diff * 100) / 100 : 0;
  };

  async function handleSubmit() {
    if (!clientId) {
      toast.error("Veuillez choisir un client");
      return;
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      toast.error("Veuillez renseigner une date/heure valide");
      return;
    }

    if (endDate <= startDate) {
      toast.error("La date/heure de fin doit être après le début");
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        clientId,
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        lieu,
        modeTarif,
        prixUnitaire,
        notes,
        semaineRef: getWeekRef(startDate)
      };

      const res = await createWorkLog(payload);
      if (res.status === 201) {
        toast.success("Note de travail enregistrée avec succès !");
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
    <div className="space-y-8 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-50 pb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Saisie Journalière</h2>
        <button 
          onClick={() => setShowNewClientForm(!showNewClientForm)}
          className={cn(
            "px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm",
            showNewClientForm 
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
              : "bg-blue-50 text-blue-600 hover:bg-blue-100 shadow-blue-500/10"
          )}
        >
          {showNewClientForm ? "Annuler" : "+ Nouveau Client"}
        </button>
      </div>
      
      {showNewClientForm && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 animate-in fade-in zoom-in-95 duration-200">
          <NewClientForm onCreated={onClientCreated} />
        </div>
      )}

      {!showNewClientForm && (
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="border border-slate-200 p-4 rounded-2xl w-full bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer font-medium text-slate-900"
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
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Section Début */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1">
                    <span className="text-lg">📅</span>
                    Début de l'intervention
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="date"
                      value={splitDateTime(startAt).date}
                      onChange={(e) => updateDate(startAt, e.target.value, setStartAt)}
                      className="border border-slate-200 p-4 rounded-2xl w-full focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-slate-50/50 hover:bg-white transition-all cursor-pointer text-sm font-bold text-slate-900"
                    />
                    <div className="shrink-0">
                      <TimePicker24h 
                        value={splitDateTime(startAt).time} 
                        onChange={(t) => updateTime(startAt, t, setStartAt)} 
                      />
                    </div>
                  </div>
                </div>

                {/* Section Fin */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1">
                    <span className="text-lg">📅</span>
                    Fin de l'intervention
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="date"
                      value={splitDateTime(endAt).date}
                      onChange={(e) => updateDate(endAt, e.target.value, setEndAt)}
                      className="border border-slate-200 p-4 rounded-2xl w-full focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-slate-50/50 hover:bg-white transition-all cursor-pointer text-sm font-bold text-slate-900"
                    />
                    <div className="shrink-0">
                      <TimePicker24h 
                        value={splitDateTime(endAt).time} 
                        onChange={(t) => updateTime(endAt, t, setEndAt)} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Durée totale</label>
                  <div className="relative">
                    <input
                      value={`${computeDurationHours()} h`}
                      disabled
                      className="border border-slate-100 p-4 rounded-2xl w-full bg-slate-50 text-slate-900 font-black text-lg outline-none shadow-inner"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Clock className="w-5 h-5 text-slate-300" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Lieu</label>
                  <input
                    placeholder="Chantier, Bureau, Remote..."
                    value={lieu}
                    onChange={(e) => setLieu(e.target.value)}
                    className="border border-slate-200 p-4 rounded-2xl w-full bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Mode Tarif</label>
                  <select
                    value={modeTarif}
                    onChange={(e) => setModeTarif(e.target.value)}
                    className="border border-slate-200 p-4 rounded-2xl w-full bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer font-bold text-slate-900"
                  >
                    <option value="horaire">Horaire</option>
                    <option value="forfait">Forfait</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Prix Unitaire (€)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={prixUnitaire}
                      onChange={(e) => setPrixUnitaire(Number(e.target.value))}
                      className="border border-slate-200 p-4 rounded-2xl w-full bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-black text-lg text-slate-900"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">€</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Notes / Observations</label>
                <textarea
                  placeholder="Détails du travail effectué..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border border-slate-200 p-5 rounded-[2rem] w-full h-32 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#020617] hover:bg-slate-900 text-white px-8 py-5 rounded-[1.5rem] font-black text-lg disabled:opacity-50 transition-all shadow-xl shadow-slate-950/20 active:scale-[0.98] mt-4"
              >
                {loading ? "Enregistrement..." : "Enregistrer la journée"}
              </button>
            </div>
          )}

          {!clientId && (
            <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Users className="w-8 h-8 text-slate-200" />
              </div>
              <p className="font-bold text-slate-400">Veuillez sélectionner un client pour continuer</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkLogForm
