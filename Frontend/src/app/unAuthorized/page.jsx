"use client";
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <h1 className="text-xl font-semibold">Access Denied</h1>
      <p className="text-gray-500">You don't have permission to view this page.</p>
      <button
        onClick={() => router.push("/login")}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Back to Login
      </button>
    </div>
  );
}