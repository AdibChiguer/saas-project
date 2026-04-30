"use client";

import { getAllClients, updateClient, deleteClient } from "@/actions/client";
import { useEffect, useState } from "react";
import NewClientForm from "@/components/global/NewClientForm";
import { 
  User, Mail, Phone, MapPin, Hash, Building2, 
  Search, Edit2, Trash2, X, Loader2, Save, Users, Plus
} from "lucide-react";
import { toast } from "sonner";

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
      className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
    />
  </div>
);

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingClient, setEditingClient] = useState(null);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await getAllClients();
      if (res.status === 200) {
        setClients(res.data);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des clients");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingClient.nom) {
      toast.error("Le nom est obligatoire");
      return;
    }
    setSaving(true);
    try {
      const res = await updateClient(editingClient.id, editingClient);
      if (res.status === 200) {
        toast.success("Client mis à jour");
        setEditingClient(null);
        fetchClients();
      } else {
        toast.error("Erreur: " + res.error);
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      try {
        const res = await deleteClient(id);
        if (res.status === 200) {
          toast.success("Client supprimé");
          fetchClients();
        }
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const filteredClients = clients.filter(client => 
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Gestion des Clients
          </h1>
          <p className="text-slate-500 font-medium mt-1">Consultez et modifiez les informations de vos clients.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 p-4 pl-12 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 shadow-sm"
            />
          </div>

          <button
            onClick={() => setIsAddingClient(true)}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Ajouter un Client
          </button>
        </div>
      </div>

      {/* Clients List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-bold">Chargement des clients...</p>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button 
                  onClick={() => setEditingClient(client)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(client.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30">
                  {client.nom.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg leading-tight">{client.nom}</h3>
                  <p className="text-slate-400 text-sm font-bold truncate max-w-[150px]">{client.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600 font-medium">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">{client.telephone || "N/A"}</span>
                </div>
                <div className="flex items-start gap-3 text-slate-600 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                  <span className="text-sm line-clamp-1">{client.adresse || "N/A"}</span>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">KVK</p>
                    <p className="text-sm font-bold text-slate-700">{client.kvknr || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">BTW</p>
                    <p className="text-sm font-bold text-slate-700">{client.btwnr || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl py-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Aucun client trouvé</h3>
          <p className="text-slate-500 font-medium mt-2">Essayez une autre recherche ou créez un nouveau client.</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingClient(null)} />
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Modifier le Client</h2>
                <p className="text-slate-500 font-bold text-sm">Mise à jour des informations de {editingClient.nom}</p>
              </div>
              <button 
                onClick={() => setEditingClient(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-4">Nom</label>
                  <InputField icon={User} placeholder="Nom du client" value={editingClient.nom} onChange={(e) => setEditingClient({...editingClient, nom: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-4">Email</label>
                  <InputField icon={Mail} placeholder="Email" type="email" value={editingClient.email} onChange={(e) => setEditingClient({...editingClient, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-4">Téléphone</label>
                  <InputField icon={Phone} placeholder="Téléphone" value={editingClient.telephone} onChange={(e) => setEditingClient({...editingClient, telephone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-4">Adresse</label>
                  <InputField icon={MapPin} placeholder="Adresse" value={editingClient.adresse} onChange={(e) => setEditingClient({...editingClient, adresse: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-4">KVK Nummer</label>
                  <InputField icon={Hash} placeholder="KVK Nummer" value={editingClient.kvknr} onChange={(e) => setEditingClient({...editingClient, kvknr: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-4">BTW Nummer</label>
                  <InputField icon={Building2} placeholder="BTW Nummer" value={editingClient.btwnr} onChange={(e) => setEditingClient({...editingClient, btwnr: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {saving ? "Enregistrement..." : "Sauvegarder"}
                </button>
                <button
                  onClick={() => setEditingClient(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 p-4 rounded-2xl font-black transition-all active:scale-95"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddingClient(false)} />
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Nouveau Client</h2>
                <p className="text-slate-500 font-bold text-sm">Ajoutez un nouveau client à votre base de données.</p>
              </div>
              <button 
                onClick={() => setIsAddingClient(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8">
              <NewClientForm onCreated={() => {
                setIsAddingClient(false);
                fetchClients();
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
