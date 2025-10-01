"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Header from "../Header";
import LoadingOverlay from "../LoadingOverlay";

interface FraseLeitura {
  id: string;
  tipo: "palavra" | "frase";
  texto: string;
  nivel?: string;
  categoria?: string;
  anoEstudo?: string;
}

export default function LeituraTreino() {
  const [frases, setFrases] = useState<FraseLeitura[]>([]);
  const [atual, setAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<"" | "palavra" | "frase">("");
  const [filtroNivel, setFiltroNivel] = useState<"" | "fácil" | "médio" | "difícil">("");

  useEffect(() => {
    const fetchFrases = async () => {
      setLoading(true);
      let query = supabase.from("fraseleitura").select("*");

      if (filtroTipo) query = query.eq("tipo", filtroTipo);
      if (filtroNivel) query = query.eq("nivel", filtroNivel);

      const { data, error } = await query.order("criado_em", { ascending: true });

      if (error) {
        console.error("Erro ao buscar frases:", error);
      } else {
        setFrases(data || []);
        setAtual(0);
      }
      setLoading(false);
    };

    fetchFrases();
  }, [filtroTipo, filtroNivel]);

  const falar = (texto: string) => {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "pt-BR";
    speechSynthesis.speak(utterance);
  };

  if (loading) return <LoadingOverlay />;

  if (frases.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Nenhuma frase/palavra encontrada
      </div>
    );

  const fraseAtual = frases[atual];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center">
      <Header />
      <h1 className="text-3xl font-bold mb-8 text-center">Treino de Leitura</h1>

      {/* Filtros */}
      <div className="flex gap-4 mb-8 justify-center">
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value as "" | "palavra" | "frase")}
          className="bg-gray-800 p-3 rounded-lg cursor-pointer"
        >
          <option value="">Todos</option>
          <option value="palavra">Palavras</option>
          <option value="frase">Frases</option>
        </select>

        <select
          value={filtroNivel}
          onChange={(e) => setFiltroNivel(e.target.value as "" | "fácil" | "médio" | "difícil")}
          className="bg-gray-800 p-3 rounded-lg cursor-pointer"
        >
          <option value="">Todos níveis</option>
          <option value="fácil">Fácil</option>
          <option value="médio">Médio</option>
          <option value="difícil">Difícil</option>
        </select>
      </div>

      {/* Frase atual */}
      <div className="bg-gray-800 p-10 rounded-3xl shadow-lg text-center max-w-4xl w-full mb-8">
        <p className="text-3xl md:text-4xl mb-8">{fraseAtual.texto}</p>

        <button
          onClick={() => falar(fraseAtual.texto)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-4 rounded-2xl cursor-pointer transition text-xl"
        >
          🔊 Ouvir pronúncia
        </button>
      </div>

      {/* Navegação */}
      <div className="flex gap-6 justify-center">
        <button
          disabled={atual === 0}
          onClick={() => setAtual((prev) => prev - 1)}
          className="bg-gray-700 px-8 py-4 rounded-2xl disabled:opacity-50 cursor-pointer hover:bg-gray-600 transition text-lg"
        >
          ⬅️ Anterior
        </button>
        <button
          disabled={atual === frases.length - 1}
          onClick={() => setAtual((prev) => prev + 1)}
          className="bg-gray-700 px-8 py-4 rounded-2xl disabled:opacity-50 cursor-pointer hover:bg-gray-600 transition text-lg"
        >
          Próxima ➡️
        </button>
      </div>
    </div>
  );
}
