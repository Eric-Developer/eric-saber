"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import Header from "@/app/components/Header";

interface Pergunta {
  id: number;
  quiz_id: string;
  texto: string;
  alternativas: string[];
  correta: number;
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  status: string;
}

interface Quiz {
  id: string;
  titulo: string;
  tags: string[];
}

export default function StudentQuizPage() {
  const { attemptId, id: studentId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);

  // 🔹 Verifica se o attempt existe e pertence ao aluno
  useEffect(() => {
    const fetchAttempt = async () => {
      const { data, error } = await supabase
        .from("quizattempts")
        .select("*")
        .eq("id", attemptId)
        .eq("student_id", studentId)
        .single();

      if (error || !data) {
        alert("Quiz não encontrado ou você não tem permissão.");
        router.push("/dashboard");
        return;
      }

      setAttempt(data as QuizAttempt);
    };

    fetchAttempt();
  }, [attemptId, studentId, router]);

  // 🔹 Busca quiz e perguntas
  useEffect(() => {
    if (!attempt) return;

    const fetchQuiz = async () => {
      const { data: quizData, error: quizError } = await supabase
        .from("Quiz")
        .select("*")
        .eq("id", attempt.quiz_id)
        .single();

      if (quizError || !quizData) {
        alert("Quiz não encontrado.");
        router.push("/dashboard");
        return;
      }

      setQuiz(quizData as Quiz);

      const { data: perguntasData } = await supabase
        .from("Pergunta")
        .select("*")
        .eq("quiz_id", quizData.id);

      setPerguntas(perguntasData as Pergunta[]);
      setLoading(false);
    };

    fetchQuiz();
  }, [attempt, router]);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;

    setSelected(idx);
    if (idx === perguntas[currentQuestion].correta) setAcertos((p) => p + 1);
    else setErros((p) => p + 1);
  };

  const handleNext = async () => {
    setSelected(null);

    if (currentQuestion + 1 >= perguntas.length) {
      setShowResult(true);

      if (attempt && attempt.status !== "completed") {
        const { error } = await supabase
          .from("quizattempts")
          .update({ status: "completed" })
          .eq("id", attempt.id);

        if (error) console.error("Erro ao marcar quiz como completo:", error);
        else setAttempt({ ...attempt, status: "completed" });
      }
    } else {
      setCurrentQuestion((q) => q + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        Carregando quiz...
      </div>
    );
  }

  if (!quiz || perguntas.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 text-white">
        <Header />
        <div className="flex flex-1 items-center justify-center text-center">
          Quiz não encontrado ou sem perguntas.
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 text-white items-center pt-20">
        <Header />
        <h1 className="text-3xl font-bold mb-4">{quiz.titulo}</h1>
        <p className="text-lg">Acertos: {acertos}</p>
        <p className="text-lg">Erros: {erros}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  const pergunta = perguntas[currentQuestion];

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white items-center justify-center pt-20 px-4">
  <Header />

  <div className="bg-gray-800 rounded-xl p-6 shadow-lg max-w-2xl w-full mx-auto">
    <h2 className="text-2xl font-bold mb-4 text-center">{quiz.titulo}</h2>
    <p className="mb-4 text-center">
      Pergunta {currentQuestion + 1} de {perguntas.length}
    </p>
    <p className="mb-6 text-center">{pergunta.texto}</p>

    <div className="flex flex-col gap-3 w-full">
      {pergunta.alternativas.map((alt, idx) => (
        <button
          key={idx}
          onClick={() => handleSelect(idx)}
          className={`px-4 py-2 rounded-lg w-full ${
            selected === null
              ? "bg-gray-700 hover:bg-gray-600"
              : idx === pergunta.correta
              ? "bg-green-500"
              : idx === selected
              ? "bg-red-500"
              : "bg-gray-700"
          } text-white font-semibold`}
        >
          {alt}
        </button>
      ))}
    </div>

    {selected !== null && (
      <button
        onClick={handleNext}
        className="mt-4 px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold w-full"
      >
        {currentQuestion + 1 === perguntas.length
          ? "Finalizar Quiz"
          : "Próxima"}
      </button>
    )}
  </div>
</div>

  );
}
