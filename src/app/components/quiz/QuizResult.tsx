"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

interface Quiz {
  id: number;
  titulo: string;
  tema: string;
  materia: string;
  anoestudo: string;
  tags: string[];
}

interface QuizResultado {
  id: number;
  quiz_id: number;
  user_id: string;
  acertos: number;
  erros: number;
  pontuacao: number;
  created_at: string;
}

export function QuizResult({
  quiz,
  temaAtual,
  acertos,
  erros,
  total,
  onRestart,
  userId,
}: {
  quiz: Quiz;
  temaAtual: string;
  acertos: number;
  erros: number;
  total: number;
  onRestart: () => void;
  userId: string;
}) {
  const [resultadoBanco, setResultadoBanco] = useState<QuizResultado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResultado = async () => {
      if (!quiz || !userId) return;

      const { data, error } = await supabase
        .from("QuizResultado")
        .select("*")
        .eq("quiz_id", quiz.id)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Erro ao buscar resultado:", error);
      } else if (data && data.length > 0) {
        setResultadoBanco(data[0]);
      }
      setLoading(false);
    };

    fetchResultado();
  }, [quiz, userId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-white">
        Carregando resultado...
      </div>
    );
  }

  const resultado = resultadoBanco || {
    acertos,
    erros,
    pontuacao: Math.round((acertos / total) * 100),
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-gray-900">
      <h1 className="text-3xl font-extrabold mb-4">{quiz.titulo}</h1>
      <p className="text-lg text-gray-700 mb-6">
        Tema: <span className="font-semibold">{temaAtual}</span>
      </p>

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-4">
        <div className="flex justify-between">
          <span className="font-semibold">Acertos:</span>
          <span>{resultado.acertos}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Erros:</span>
          <span>{resultado.erros}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Total de Questões:</span>
          <span>{total}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-green-700">
          <span>Pontuação:</span>
          <span>{resultado.pontuacao}%</span>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="mt-8 px-6 py-3 bg-gray-800 text-white rounded-full shadow hover:bg-gray-700 transition"
      >
        Refazer Quiz
      </button>
    </div>
  );
}
