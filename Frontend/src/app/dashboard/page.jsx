"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You must be logged in to view this page.");
      return;
    }

    axios
      .get("http://localhost:8000/stores", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStores(res.data))
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to load stores.");
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Stores</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <ul className="space-y-2">
        {stores.map((store) => (
          <li key={store.id} className="border p-3 rounded">
            <strong>{store.name}</strong> — {store.location}
          </li>
        ))}
      </ul>

      {stores.length === 0 && !error && (
        <p className="text-gray-500">No stores found.</p>
      )}
    </div>
  );
}