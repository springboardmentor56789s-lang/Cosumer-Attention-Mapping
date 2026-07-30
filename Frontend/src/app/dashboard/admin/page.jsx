"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/utils/useAuth";
import { apiClient } from "@/app/utils/api";
import DashboardLayout from "@/app/components/DashboardLayout";
import { StatCard, Card, Table, Row, Cell, Badge, EmptyState } from "@/app/components/UI";

export default function AdminDashboard() {
  const { user, loading } = useAuth("admin");
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    if (!user) return;
    const api = apiClient();
    api.get("/users").then((res) => setUsers(res.data));
    api.get("/stores").then((res) => setStores(res.data));
    api.get("/cameras").then((res) => setCameras(res.data));
  }, [user]);

  if (loading) return null;

  const activeCameras = cameras.filter((c) => c.status === "active").length;

  return (
    <DashboardLayout title="System Overview" subtitle="Platform-wide users, stores, and camera infrastructure" role={user?.role}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        <StatCard label="Total Users" value={users.length} />
        <StatCard label="Total Stores" value={stores.length} />
        <StatCard label="Cameras Online" value={`${activeCameras}/${cameras.length}`} accent />
        <StatCard label="Roles" value={4} />
      </div>

      <Card title="Users">
        {users.length === 0 ? (
          <EmptyState message="No users registered yet." />
        ) : (
          <Table headers={["Name", "Email", "Role ID"]}>
            {users.map((u) => (
              <Row key={u.id}>
                <Cell>{u.name}</Cell>
                <Cell>{u.email}</Cell>
                <Cell>{u.role_id}</Cell>
              </Row>
            ))}
          </Table>
        )}
      </Card>

      <Card title="Cameras">
        {cameras.length === 0 ? (
          <EmptyState message="No cameras registered yet." />
        ) : (
          <Table headers={["Code", "IP Address", "Status"]}>
            {cameras.map((c) => (
              <Row key={c.id}>
                <Cell>{c.camera_code}</Cell>
                <Cell>{c.ip_address || "—"}</Cell>
                <Cell><Badge status={c.status} /></Cell>
              </Row>
            ))}
          </Table>
        )}
      </Card>
    </DashboardLayout>
  );
}