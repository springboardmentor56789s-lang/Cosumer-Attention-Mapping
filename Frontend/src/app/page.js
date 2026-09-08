"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0B0F17", display: "flex", alignItems: "center", justifyContent: "center", color: "#8A93A6" }}>
      <p>Redirecting to Consumer Attention Mapping System...</p>
    </div>
  );
}
