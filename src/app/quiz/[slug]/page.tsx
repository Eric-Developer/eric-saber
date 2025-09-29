"use client";
import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

interface Pergunta {
  id: number;
  quiz_id: number;
  texto: string;
  alternativas: string[];
  correta: number;
  tags?: string[];
}

interface Quiz {
  id: number;
  titulo: string;
  tema: string;
  materia: string;
  anoestudo: string;
  tags: string[];
}

// Normaliza strings: remove acentos, deixa minúsculo e tira espaços extras
function normalize(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

const EXPIRATION_TIME = 20 * 60 * 1000; // 20 minutos

export default function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params); // unwrap da Promise
  const normalizedSlug = normalize(slug);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [temaAtual, setTemaAtual] = useState<string>("");

  // Busca quiz e perguntas no Supabase
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // 🔹 Busca todos os quizzes
        const { data: quizzes, error: quizError } = await supabase
          .from("Quiz")
          .select("*");

        if (quizError || !quizzes) {
          console.error("Erro ao buscar quizzes:", quizError);
          return;
        }

        // 🔹 Filtra quiz pelo slug normalizado
        const quizData = quizzes.find((q: Quiz) =>
          q.tags?.some((tag) => normalize(tag).includes(normalizedSlug))
        );

        if (!quizData) {
          console.log("Nenhum quiz encontrado para", slug);
          return;
        }

        setQuiz(quizData);

        // 🔹 Busca perguntas relacionadas ao quiz
        const { data: perguntasData, error: perguntasError } = await supabase
          .from("Pergunta")
          .select("*")
          .eq("quiz_id", quizData.id);

        if (perguntasError) {
          console.error("Erro ao buscar perguntas:", perguntasError);
          return;
        }

        if (perguntasData) {
          // 🔹 Checa progresso salvo no localStorage
          const storedRaw = localStorage.getItem(`quiz-${slug}`);
          let initialState = {
            perguntas: (perguntasData as Pergunta[]).sort(() => Math.random() - 0.5).slice(0, 10),
            perguntaAtual: 0,
            acertos: 0,
            erros: 0,
            selected: null,
            showFeedback: false,
            temaAtual: slug,
            timestamp: Date.now(),
          };

          if (storedRaw) {
            const stored = JSON.parse(storedRaw);
            const expired = Date.now() - stored.timestamp > EXPIRATION_TIME;
            if (!expired && stored.perguntas?.length) {
              initialState = stored;
            }
          }

          setPerguntas(initialState.perguntas);
          setPerguntaAtual(initialState.perguntaAtual);
          setAcertos(initialState.acertos);
          setErros(initialState.erros);
          setSelected(initialState.selected);
          setShowFeedback(initialState.showFeedback);
          setTemaAtual(initialState.temaAtual || slug);
        }
      } catch (err) {
        console.error("Erro inesperado ao buscar quiz:", err);
      }
    };

    fetchQuiz();
  }, [slug, normalizedSlug]);

  // Salva progresso no localStorage
  useEffect(() => {
    if (!quiz || perguntas.length === 0) return;
    localStorage.setItem(
      `quiz-${slug}`,
      JSON.stringify({
        perguntas,
        perguntaAtual,
        acertos,
        erros,
        selected,
        showFeedback,
        temaAtual,
        timestamp: Date.now(),
      })
    );
  }, [slug, perguntas, perguntaAtual, acertos, erros, selected, showFeedback, temaAtual, quiz]);

  const handleSelect = (idx: number) => {
    if (selected !== null || !perguntas[perguntaAtual]) return;

    setSelected(idx);
    setShowFeedback(true);

    const isCorrect = idx === perguntas[perguntaAtual].correta;
    if (isCorrect) setAcertos((prev) => prev + 1);
    else setErros((prev) => prev + 1);
  };

  const handleNext = () => {
    setSelected(null);
    setShowFeedback(false);
    setPerguntaAtual((prev) => prev + 1);
  };

  const currentQuestion = perguntas[perguntaAtual];
  const isCorrect = selected === currentQuestion?.correta;
  const isLastQuestion = perguntaAtual === perguntas.length - 1;

  if (!quiz || perguntas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-800">
        <div>Nenhuma pergunta encontrada para &quot;{slug}&quot;</div>
      </div>
    );
  }

  if (isLastQuestion && selected !== null && showFeedback) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
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

        <h1 className="text-4xl font-bold mb-6">{quiz.titulo.toUpperCase()} - Resultado</h1>
        <p className="text-xl mb-2">Assunto: {temaAtual}</p>
        <p className="text-2xl mb-2">Acertos: {acertos}</p>
        <p className="text-2xl mb-2">Erros: {erros}</p>
        <p className="text-2xl mb-6">
          Pontuação: {acertos} / {perguntas.length}
        </p>
        <button
          className="px-6 py-3 bg-green-500 rounded-full hover:bg-green-600"
          onClick={() => {
            localStorage.removeItem(`quiz-${slug}`);
            setPerguntas(perguntas.sort(() => Math.random() - 0.5).slice(0, 10));
            setPerguntaAtual(0);
            setSelected(null);
            setShowFeedback(false);
            setAcertos(0);
            setErros(0);
          }}
        >
          Reiniciar Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col md:items-center md:justify-center p-0">
      <div className="flex-1 w-full md:w-full md:max-w-4xl bg-white md:rounded-2xl md:shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <header className="w-full flex items-center justify-between bg-gray-800 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">ES</div>
            <div className="font-semibold text-lg">EricSaber</div>
          </div>
          <div className="text-sm">
            Pergunta {perguntaAtual + 1} de {perguntas.length}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col justify-center items-center px-6 py-6 md:py-12 overflow-auto">
          <h1 className="text-2xl md:text-4xl font-extrabold text-center text-gray-800 mb-6">
            {perguntaAtual + 1}. {currentQuestion?.texto}
          </h1>

          <div className="space-y-4 w-full max-w-3xl">
            {currentQuestion?.alternativas.map((alt, idx) => {
              const selectedClass =
                selected === idx
                  ? "ring-2 ring-offset-2 ring-gray-400"
                  : "hover:ring-2 hover:ring-offset-2 hover:ring-gray-200";
              const feedbackClass = showFeedback
                ? idx === currentQuestion.correta
                  ? "bg-green-50 border-green-400"
                  : selected === idx
                  ? "bg-red-50 border-red-300"
                  : "bg-white"
                : "bg-white";

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
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

          {!isLastQuestion && showFeedback && (
            <div className="max-w-3xl mx-auto mt-8 flex gap-4 items-center justify-center">
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gray-800 text-white rounded-full shadow disabled:opacity-50"
              >
                Próxima Pergunta
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
