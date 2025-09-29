"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

interface Quiz {
  id: number;
  titulo: string;
  tema: string;
  materia: string;
  anoestudo: string;
  tags: string[];
}

// Normaliza strings: remove acentos, espaços extras e deixa minúsculo
function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Checa se a string A contém B (normalizado)
function similarity(a: string, b: string) {
  return normalize(a).includes(normalize(b));
}

export default function HomePage() {
  const [pesquisa, setPesquisa] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerateQuiz = async () => {
    if (!pesquisa) return;
    setLoading(true);

    const slug = normalize(pesquisa);

    try {
      // 🔹 Busca todos os quizzes no banco
      const { data: quizzes, error } = await supabase.from("Quiz").select("*");

      if (error || !quizzes) {
        console.error("Erro ao buscar quizzes:", error);
        alert("Erro ao carregar quizzes!");
        setLoading(false);
        return;
      }

      // 🔹 Procura o quiz que contenha alguma tag semelhante à pesquisa
      const quizEncontrado = quizzes.find((q: Quiz) =>
        q.tags?.some((tag: string) => normalize(tag).includes(slug))
      );

      if (!quizEncontrado) {
        alert("Nenhum quiz encontrado para essa tag!");
        setLoading(false);
        return;
      }

      // 🔹 Encontra a tag exata para a URL
      const tagOriginal =
        quizEncontrado.tags.find((tag: string) => normalize(tag).includes(slug)) ||
        quizEncontrado.tags[0];

      const tagParaUrl = normalize(tagOriginal);

      // 🔹 Redireciona após pequeno delay
      setTimeout(() => {
        router.push(`/quiz/${tagParaUrl}`);
      }, 500);
    } catch (err) {
      console.error("Erro inesperado:", err);
      alert("Ocorreu um erro ao gerar o quiz.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between bg-gray-800 text-white px-6 py-4 rounded-2xl shadow-2xl mb-12">
        <Link href="/">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
              ES
            </div>
            <div className="font-semibold text-lg">EricSaber</div>
          </div>
        </Link>
      </header>

      {/* Main */}
      <main className="flex flex-col items-center gap-6 w-full max-w-md">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center">
          Bem-vindo ao Quiz!
        </h1>
        <p className="text-gray-300 text-center max-w-lg mb-6">
          Pesquise por uma tag e clique em Gerar Quiz para testar seus
          conhecimentos.
        </p>

        <input
          type="text"
          placeholder="Digite a tag (ex: substantivo, gramática, português, matemática, medidas)"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          onClick={handleGenerateQuiz}
          disabled={loading}
          className={`mt-4 px-8 py-4 rounded-full text-xl font-semibold shadow-lg transition ${
            loading
              ? "bg-gray-500 text-gray-200 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {loading ? "Gerando quiz..." : "Gerar Quiz"}
        </button>
      </main>
    </div>
  );
}
