"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [pesquisa, setPesquisa] = useState("");
  const router = useRouter();

  const handleGenerateQuiz = () => {
    if (!pesquisa) return; // não deixa ir se estiver vazio
    // Redireciona para a página do quiz usando a tag digitada
    router.push(`/quiz/${pesquisa.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      {/* Top bar */}
      <header className="w-full max-w-4xl flex items-center justify-between bg-gray-800 text-white px-6 py-4 rounded-2xl shadow-2xl mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
            ES
          </div>
          <div className="font-semibold text-lg">EricSaber</div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-col items-center gap-6 w-full max-w-md">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center">
          Bem-vindo ao Quiz!
        </h1>
        <p className="text-gray-300 text-center max-w-lg mb-6">
          Pesquise por uma tag e clique em Gerar Quiz para testar seus conhecimentos.
        </p>

        {/* Barra de pesquisa */}
        <input
          type="text"
          placeholder="Digite a tag (ex: substantivo, gramatica, portugues)"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* Botão Gerar Quiz */}
        <button
          onClick={handleGenerateQuiz}
          className="mt-4 px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-xl font-semibold rounded-full shadow-lg transition"
        >
          Gerar Quiz
        </button>
      </main>
    </div>
  );
}
