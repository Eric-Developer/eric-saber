"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dataJson from "@/app/data/questions.json";
import mateamtica from "@/app/data/matematica.json";
import Link from "next/link";

interface Pergunta {
  id: string;
  texto: string;
  alternativas: string[];
  correta: number;
  tags: string[];
}

interface Quiz {
  id: number;
  titulo: string;
  tema: string;
  materia: string;
  anoEstudo: string;
  tags: string[];
  perguntas: Pergunta[];
}

// Normaliza strings (remover acentos e maiúsculas)
function normalize(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Checa se a string A contém B (similaridade)
function similarity(a: string, b: string) {
  return normalize(a).includes(normalize(b));
}

export default function HomePage() {
  const [pesquisa, setPesquisa] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerateQuiz = () => {
    if (!pesquisa) return;

    setLoading(true);

    const slug = normalize(pesquisa);

    // Une os dois JSONs em um array só
    const quizzes: Quiz[] = [...(dataJson as Quiz[]), ...(mateamtica as Quiz[])];

    // Procura o quiz que contenha alguma tag semelhante à pesquisa
    const quizEncontrado = quizzes.find((q) =>
      q.tags.some((tag) => similarity(tag, slug))
    );

    if (quizEncontrado) {
      // Procura a tag dentro do quiz que combine com a pesquisa
      const tagParaUrl = quizEncontrado.tags.find((tag) =>
        similarity(tag, slug)
      ) || quizEncontrado.tags[0]; // fallback para primeira tag

      setTimeout(() => {
        router.push(`/quiz/${normalize(tagParaUrl)}`);
      }, 500); // delay para mostrar "Gerando quiz..."
    } else {
      setLoading(false);
      alert("Nenhum quiz encontrado para essa tag!");
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
          Pesquise por uma tag e clique em Gerar Quiz para testar seus conhecimentos.
        </p>

        <input
          type="text"
          placeholder="Digite a tag (ex: substantivo, gramatica, portugues, matematica, medidas)"
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
