"use client";

import { createClient } from "@/actions/client";
import { useState } from "react";
import { User, Mail, Phone, MapPin, Hash, Building2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

// ── Defined OUTSIDE NewClientForm so it's never re-created on each render ──
const InputField = ({ icon: Icon, placeholder, type = "text", value, onChange }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
      <Icon className="w-4 h-4" />
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full bg-white border border-slate-200 p-4 pl-12 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
    />
  </div>
);

const NewClientForm = ({ onCreated }) => {
  const { t } = useLanguage();
  const [nom, setNom]           = useState("");
  const [email, setEmail]       = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse]   = useState("");
  const [kvknr, setKvknr]       = useState("");
  const [btwnr, setBtwnr]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit() {
    if (!nom) {
      toast.error(t("clients.name_required"));
      return;
    }
    setLoading(true);
    try {
      const res = await createClient({ nom, email, telephone, adresse, kvknr, btwnr });
      if (res.status === 201) {
        onCreated(res.data.id);
        toast.success(t("common.success"));
      } else {
        toast.error(t("common.error") + ": " + res.error);
      }
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputField icon={User}      placeholder={t("common.name")} value={nom}       onChange={(e) => setNom(e.target.value)} />
        <InputField icon={Mail}      placeholder={t("common.email")} type="email" value={email}     onChange={(e) => setEmail(e.target.value)} />
        <InputField icon={Phone}     placeholder={t("common.phone")} value={telephone} onChange={(e) => setTelephone(e.target.value)} />
        <InputField icon={MapPin}    placeholder={t("common.address")} value={adresse}   onChange={(e) => setAdresse(e.target.value)} />
        <InputField icon={Hash}      placeholder="KVK Nummer"    value={kvknr}     onChange={(e) => setKvknr(e.target.value)} />
        <InputField icon={Building2} placeholder="BTW Nummer"    value={btwnr}     onChange={(e) => setBtwnr(e.target.value)} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-fit bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
        {loading ? t("common.saving") : t("clients.add_button")}
      </button>
    </div>
  );
};

export default NewClientForm;