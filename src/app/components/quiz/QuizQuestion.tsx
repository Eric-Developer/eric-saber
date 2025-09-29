"use client";
import React from "react";

interface Pergunta {
  id: number;
  texto: string;
  alternativas: string[];
  correta: number;
}

export function QuizQuestion({
  pergunta,
  perguntaAtual,
  selected,
  showFeedback,
  onSelect,
  onNext,
  onFinish,
  isLast,
  
}: {
  pergunta: Pergunta;
  perguntaAtual: number;
  selected: number | null;
  showFeedback: boolean;
  onSelect: (idx: number) => void;
  onNext: () => void;
  onFinish: () => void;
  isLast: boolean;
}) {
  const isCorrect = selected === pergunta?.correta;

  return (
    <main className="flex-1 flex flex-col justify-center items-center px-6 py-6 md:py-12 overflow-auto">
      <h1 className="text-2xl md:text-4xl font-extrabold text-center text-gray-800 mb-6">
        {perguntaAtual + 1}. {pergunta?.texto}
      </h1>

      <div className="space-y-4 w-full max-w-3xl">
        {pergunta?.alternativas.map((alt, idx) => {
          const selectedClass =
            selected === idx
              ? "ring-2 ring-offset-2 ring-gray-400"
              : "hover:ring-2 hover:ring-offset-2 hover:ring-gray-200";
          const feedbackClass = showFeedback
            ? idx === pergunta.correta
              ? "bg-green-50 border-green-400"
              : selected === idx
              ? "bg-red-50 border-red-300"
              : "bg-white"
            : "bg-white";

          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`w-full text-left flex items-center gap-4 px-5 py-4 border rounded-full shadow-sm transition ${selectedClass} ${feedbackClass}`}
            >
              <div className="w-12 h-12 sm:w-9 sm:h-9 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-lg sm:text-base">
                {String.fromCharCode(65 + idx)}
              </div>
              <div className="flex-1 text-gray-800">{alt}</div>
            </button>
          );
        })}
      </div>

      {showFeedback && selected !== null && (
        <div className="max-w-3xl mx-auto mt-6">
          {isCorrect ? (
            <div className="rounded-md p-3 bg-green-50 border border-green-200 text-green-800">
              Resposta correta ✓
            </div>
          ) : (
            <div className="rounded-md p-3 bg-red-50 border border-red-200 text-red-800">
              Resposta incorreta ✕
            </div>
          )}
        </div>
      )}

    {showFeedback && (
  <div className="max-w-3xl mx-auto mt-8 flex gap-4 items-center justify-center">
    {!isLast ? (
      <button
        onClick={onNext}
        className="px-6 py-3 bg-gray-800 text-white rounded-full shadow disabled:opacity-50"
      >
        Próxima Pergunta
      </button>
    ) : (
      <button
        onClick={onFinish}
        className="px-6 py-3 bg-green-600 text-white rounded-full shadow hover:bg-green-700"
      >
        Finalizar Quiz
      </button>
    )}
  </div>
)}
    </main>
  );
}
