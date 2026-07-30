"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/utils/useAuth";
import { apiClient } from "@/app/utils/api";
import DashboardLayout from "@/app/components/DashboardLayout";

export default function MarketingManagerDashboard() {
  const { user, loading } = useAuth("marketing_manager");
  const [stores, setStores] = useState([]);

  useEffect(() => {
    if (!user) return;
    apiClient().get("/stores").then((res) => setStores(res.data));
  }, [user]);

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <DashboardLayout title="Marketing Overview" role={user?.role}>
      <p className="text-gray-500 mb-6">
        Campaign effectiveness and promotional performance will appear here once available.
      </p>
      <h2 className="font-semibold mb-3">Stores</h2>
      <ul className="space-y-2">
        {stores.map((s) => <li key={s.id} className="bg-white border p-3 rounded">{s.name}</li>)}
      </ul>
    </DashboardLayout>
  );
}