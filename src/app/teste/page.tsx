"use client";
import React from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { supabase } from "@/app/lib/supabaseClient";

export default function Dashboard() {
  const { user, loading } = useAuth();

  const checkUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error(error);
      alert("Erro ao verificar sessão");
      return;
    }

    if (session?.user) {
      console.log("Usuário logado:", session.user);
      alert("Usuário logado: " + session.user.email);
    } else {
      console.log("Nenhum usuário logado");
      alert("Nenhum usuário logado");
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      {user ? (
        <div>
          <p>Logado como: {user.username}</p>
          <p>Email: {user.email}</p>
          <p>Tipo: {user.type}</p>
        </div>
      ) : (
        <div>Não logado</div>
      )}
      <button
        onClick={checkUser}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
      >
        Verificar usuário logado
      </button>
    </div>
  );
}
