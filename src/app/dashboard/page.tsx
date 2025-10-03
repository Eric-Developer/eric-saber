"use client";
import React from "react";
import { useAuth } from "@/app/hooks/useAuth";
import AlunoDashboard from "../components/StudentDashboard/AlunoDashboard";
import ProfessorDashboard from "../teste/page";
import LoadingOverlay from "../components/LoadingOverlay";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  if (authLoading) return <LoadingOverlay />; // aguardando auth

  if (!user) {
    router.push("/login"); // redireciona se não logado
    return null;
  }

  // Renderiza dashboard baseado no role/tipo do usuário
  if (user.type === "student") {
    return <AlunoDashboard />;
  } else if (user.type === "teacher") {
    return <ProfessorDashboard />;
  } else {
    return <div>Usuário sem dashboard definido</div>;
  }
}
