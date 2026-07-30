"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export function useAuth(requiredRole = null) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // check expiry
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (requiredRole && decoded.role !== requiredRole) {
        router.push("/unauthorized");
        return;
      }

      setUser(decoded);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading };
}