"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/utils/useAuth";
import { apiClient } from "@/app/utils/api";
import { TOKENS } from "@/app/theme";
import DashboardLayout from "@/app/components/DashboardLayout";
import { Card, Table, Row, Cell, EmptyState } from "@/app/components/UI";

export default function RetailAnalystDashboard() {
  const { user, loading } = useAuth("retail_analyst");
  const [stores, setStores] = useState([]);

  useEffect(() => {
    if (!user) return;
    apiClient().get("/stores").then((res) => setStores(res.data));
  }, [user]);

  if (loading) return null;

  return (
    <DashboardLayout title="Retail Analytics" subtitle="Attention heatmaps and behavior insights" role={user?.role}>
      <div
        style={{
          background: TOKENS.surface,
          border: `1px dashed ${TOKENS.border}`,
          borderRadius: "12px",
          padding: "28px",
          marginBottom: "24px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "12px",
          color: TOKENS.muted,
        }}
      >
        ATTENTION_HEATMAPS — awaiting tracking data from detection engine (Milestone 2)
      </div>

      <Card title="Stores under analysis">
        {stores.length === 0 ? (
          <EmptyState message="No stores available yet." />
        ) : (
          <Table headers={["Store", "Location"]}>
            {stores.map((s) => (
              <Row key={s.id}>
                <Cell>{s.name}</Cell>
                <Cell>{s.location || "—"}</Cell>
              </Row>
            ))}
          </Table>
        )}
      </Card>
    </DashboardLayout>
  );
}