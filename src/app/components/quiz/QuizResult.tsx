"use client";
import React from "react";
import Link from "next/link";

interface Quiz {
  id: number;
  titulo: string;
}

interface QuizResultProps {
  quiz: Quiz;
  temaAtual: string;
  acertos: number;
  erros: number;
  total: number;
  onRestart: () => void;
  userId: number; // apenas para referência, não é usado aqui
}

export function QuizResult({
  quiz,
  temaAtual,
  acertos,
  erros,
  total,
  onRestart,
}: QuizResultProps) {
  const pontuacao = Math.round((acertos / total) * 100);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <header className="w-full max-w-4xl flex items-center justify-between bg-gray-800 text-white px-6 py-4 rounded-2xl shadow-2xl mb-12">
        <Link href="/">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">ES</div>
            <div className="font-semibold text-lg">EricSaber</div>
          </div>
        </Link>
      </header>

      <h1 className="text-4xl font-bold mb-6">{quiz.titulo.toUpperCase()} - Resultado</h1>
      <p className="text-xl mb-2">Assunto: {temaAtual}</p>
      <p className="text-2xl mb-2">Acertos: {acertos}</p>
      <p className="text-2xl mb-2">Erros: {erros}</p>
      <p className="text-2xl mb-6">Pontuação: {pontuacao}%</p>

      <button
        className="px-6 py-3 bg-green-500 rounded-full hover:bg-green-600"
        onClick={onRestart}
      >
        Reiniciar Quiz
      </button>
    </div>
  );
}
