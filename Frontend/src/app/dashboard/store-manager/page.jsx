"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/utils/useAuth";
import { apiClient } from "@/app/utils/api";
import { TOKENS } from "@/app/theme";
import DashboardLayout from "@/app/components/DashboardLayout";
import { StatCard, Card, Table, Row, Cell, Badge, EmptyState } from "@/app/components/UI";

export default function StoreManagerDashboard() {
  const { user, loading } = useAuth("store_manager");
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [shelves, setShelves] = useState([]);
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    if (!user) return;
    apiClient().get("/stores").then((res) => setStores(res.data));
  }, [user]);

  const handleSelectStore = async (storeId) => {
    setSelectedStore(storeId);
    if (!storeId) return;
    const api = apiClient();
    const [shelfRes, camRes] = await Promise.all([
      api.get(`/shelves?store_id=${storeId}`),
      api.get(`/cameras?store_id=${storeId}`),
    ]);
    setShelves(shelfRes.data);
    setCameras(camRes.data);
  };

  if (loading) return null;

  return (
    <DashboardLayout title="Store Overview" subtitle="Shelf layout and camera coverage per store" role={user?.role}>
      <div style={{ marginBottom: "24px" }}>
        <select
          value={selectedStore}
          onChange={(e) => handleSelectStore(e.target.value)}
          style={{
            background: TOKENS.surface,
            border: `1px solid ${TOKENS.border}`,
            color: TOKENS.text,
            borderRadius: "8px",
            padding: "10px 14px",
            fontSize: "14px",
            minWidth: "260px",
          }}
        >
          <option value="">Select a store…</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {!selectedStore ? (
        <Card><EmptyState message="Choose a store above to view its shelves and cameras." /></Card>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "24px" }}>
            <StatCard label="Shelves" value={shelves.length} />
            <StatCard label="Cameras" value={cameras.length} accent />
          </div>

          <Card title="Shelves">
            {shelves.length === 0 ? (
              <EmptyState message="No shelves recorded for this store." />
            ) : (
              <Table headers={["Shelf Code"]}>
                {shelves.map((s) => (
                  <Row key={s.id}><Cell>{s.shelf_code}</Cell></Row>
                ))}
              </Table>
            )}
          </Card>

          <Card title="Cameras">
            {cameras.length === 0 ? (
              <EmptyState message="No cameras assigned to this store." />
            ) : (
              <Table headers={["Code", "Status"]}>
                {cameras.map((c) => (
                  <Row key={c.id}>
                    <Cell>{c.camera_code}</Cell>
                    <Cell><Badge status={c.status} /></Cell>
                  </Row>
                ))}
              </Table>
            )}
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}