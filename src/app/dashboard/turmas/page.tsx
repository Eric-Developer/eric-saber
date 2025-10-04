"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import Header from "@/app/components/Header";

interface Turma {
  id: number;
  nome: string;
  materia: string;
  ano: string;
  alunos: number;
}

export default function Turmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // 🔹 Verifica se o usuário está logado
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        setAuthLoading(false);
      }
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    const fetchTurmas = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("Class").select("*");
      if (error) {
        console.error("Erro ao buscar turmas:", error);
      } else {
        setTurmas(data as Turma[]);
      }
      setLoading(false);
    };
    fetchTurmas();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Verificando usuário...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-start px-4 pt-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-4">
          Turmas
        </h1>
        <p className="text-gray-300 text-center max-w-lg mb-6">
          Visualize todas as turmas cadastradas e clique para ver os detalhes.
        </p>

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <p className="text-white col-span-full text-center">Carregando turmas...</p>
          ) : turmas.length === 0 ? (
            <p className="text-white col-span-full text-center">Nenhuma turma cadastrada.</p>
          ) : (
            turmas.map((turma) => (
              <div
                key={turma.id}
                className="bg-gray-800 rounded-xl p-6 shadow-lg hover:bg-gray-700 cursor-pointer transition"
                onClick={() => router.push(`/dashboard/turmas/${turma.id}`)}
              >
                <h2 className="text-2xl font-bold text-white mb-2">{turma.nome}</h2>
                <p className="text-gray-300 mb-1">Ano: {turma.ano}</p>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => router.push("/turma/novo")}
          className="mt-8 px-8 py-4 rounded-full text-xl font-semibold shadow-lg bg-green-500 hover:bg-green-600 text-white transition"
        >
          Adicionar Turma
        </button>
      </main>
    </div>
  );
}
