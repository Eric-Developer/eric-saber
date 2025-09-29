"use client";
import React from "react";

export function QuizHeader({ perguntaAtual, total }: { perguntaAtual: number; total: number }) {
  return (
    <header className="w-full flex items-center justify-between bg-gray-800 text-white px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">ES</div>
        <div className="font-semibold text-lg">EricSaber</div>
      </div>
      <div className="text-sm">
        Pergunta {perguntaAtual + 1} de {total}
      </div>
    </header>
  );
}
