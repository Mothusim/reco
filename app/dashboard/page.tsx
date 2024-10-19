"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import EmployeeDashboard from "@/components/EmployeeDashboard";
import OwnerDashboard from "@/components/OwnerDashboard";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {session.user.role === "OWNER" ? (
        <OwnerDashboard />
      ) : (
        <EmployeeDashboard />
      )}
    </div>
  );
}