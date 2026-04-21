"use client";

import { createClient } from "@/actions/client";
import { useState } from "react";

const NewClientForm = ({ onCreated }) => {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [kvknr, setKvknr] = useState("");
  const [btwnr, setBtwnr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await createClient({
        nom,
        email,
        telephone,
        adresse,
        kvknr,
        btwnr,
      });

      if (res.status === 201) {
        onCreated(res.data.id);
        alert("Client créé avec succès");
      } else {
        alert("Erreur: " + res.error);
      }
    } catch (error) {
      alert("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          placeholder="Nom du client"
          onChange={(e) => setNom(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          placeholder="Email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          placeholder="Téléphone"
          onChange={(e) => setTelephone(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          placeholder="Adresse"
          onChange={(e) => setAdresse(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          placeholder="KVK Nummer"
          onChange={(e) => setKvknr(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          placeholder="BTW Nummer"
          onChange={(e) => setBtwnr(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50 transition-colors"
      >
        {loading ? "Création..." : "Créer le Client"}
      </button>
    </div>
  );
};

export default NewClientForm;