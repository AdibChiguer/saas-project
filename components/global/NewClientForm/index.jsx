"use client";

import Image from "next/image";
import { useState } from "react";

const NewClientForm = ({ onCreated }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [logoBase64, setLogoBase64] = useState(null);
  const [preview, setPreview] = useState(null);

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoBase64(reader.result); // data:image/png;base64,...
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, logoUrl: logoBase64 }),
    });

    const data = await res.json();
    onCreated(data.id);
    alert("Client created successfully");
  }

  return (
    <div className="space-y-4">
      <input
        placeholder="Client name"
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full"
      />

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full"
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium">Client Logo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="border p-2 w-full"
        />
        {preview && (
          <img
            src={preview}
            alt="Logo preview"
            className="h-20 w-20 object-contain border rounded"
          />
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-black text-white px-4 py-2"
      >
        Create Client
      </button>
    </div>
  );
}

export default NewClientForm