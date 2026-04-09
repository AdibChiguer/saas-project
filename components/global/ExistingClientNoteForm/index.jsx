"use client";

import { useEffect, useState } from "react";

const ExistingClientNoteForm = () => {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");

  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [weekNumber, setWeekNumber] = useState(1);

  const [items, setItems] = useState([
    {
      code: "",
      description: "",
      unit: "",
      unitPrice: 0,
      totalUnits: 0,
      totalUnitPrice: 0,
      totalPrice: 0,
    },
  ]);

  // fetch clients on mount
  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then(setClients);
  }, []);

  function updateItem(index, field, value) {
    const updated = [...items];
    updated[index][field] = value;

    // auto compute
    updated[index].totalUnitPrice =
      updated[index].unitPrice * updated[index].totalUnits;

    updated[index].totalPrice = updated[index].totalUnitPrice;

    setItems(updated);
  }

  function addItem() {
    setItems([
      ...items,
      {
        code: "",
        description: "",
        unit: "",
        unitPrice: 0,
        totalUnits: 0,
        totalUnitPrice: 0,
        totalPrice: 0,
      },
    ]);
  }

  async function handleSubmit() {
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        description,
        date,
        weekNumber,
        items,
      }),
    });
  }

  return (
    <div className="space-y-6">
      {/* CLIENT */}
      <select
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
        className="border p-2 w-full"
      >
        <option value="">Select client</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* NOTE FIELDS */}
      <input
        placeholder="Description"
        className="border p-2 w-full"
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="date"
        className="border p-2 w-full"
        onChange={(e) => setDate(e.target.value)}
      />

      <input
        type="number"
        placeholder="Week number"
        className="border p-2 w-full"
        onChange={(e) => setWeekNumber(Number(e.target.value))}
      />

      {/* ITEMS */}
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-7 gap-2 border p-2">
            <input
              placeholder="Code"
              onChange={(e) => updateItem(i, "code", e.target.value)}
            />
            <input
              placeholder="Desc"
              onChange={(e) =>
                updateItem(i, "description", e.target.value)
              }
            />
            <input
              placeholder="Unit"
              onChange={(e) => updateItem(i, "unit", e.target.value)}
            />
            <input
              type="number"
              placeholder="Unit Price"
              onChange={(e) =>
                updateItem(i, "unitPrice", Number(e.target.value))
              }
            />
            <input
              type="number"
              placeholder="Qty"
              onChange={(e) =>
                updateItem(i, "totalUnits", Number(e.target.value))
              }
            />
            <input
              disabled
              value={item.totalUnitPrice}
            />
            <input
              disabled
              value={item.totalPrice}
            />
          </div>
        ))}
      </div>

      <button onClick={addItem} className="border px-4 py-2">
        Add Item
      </button>

      <button onClick={handleSubmit} className="bg-black text-white px-4 py-2">
        Create Note
      </button>
    </div>
  );
}

export default ExistingClientNoteForm