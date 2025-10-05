"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/hooks/useAuth";

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
  const { attemptId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [pontuacao, setPontuacao] = useState(0); // ✅ Estado de pontuação

  // 🔹 Busca attempt
  useEffect(() => {
    if (!user?.id) return;

    const fetchAttempt = async () => {
      const { data, error } = await supabase
        .from("quizattempts")
        .select("*")
        .eq("id", attemptId)
        .eq("student_id", user.id)
        .single();

      if (error || !data) {
        alert("Quiz não encontrado ou você não tem permissão.");
        router.push("/dashboard");
        return;
      }
      setAttempt(data as QuizAttempt);
    };

    fetchAttempt();
  }, [attemptId, user, router]);

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
    if (currentQuestion + 1 >= perguntas.length) {
      await handleFinish();
    } else {
      setCurrentQuestion((q) => q + 1);
      setSelected(null);
    }
  };

  const handleFinish = async () => {
    if (!quiz || !user?.id) return;

    const calcPontuacao = Math.round((acertos / perguntas.length) * 100);
    setPontuacao(calcPontuacao);

    try {
      const { error } = await supabase.from("QuizResultado").insert([{
        quiz_id: attempt?.quiz_id,
        user_id: user.auth_id,
        username: user.username,
        acertos,
        erros,
        pontuacao: calcPontuacao,
        created_at: new Date().toISOString()
      }]);

      if (error) console.error("Erro ao salvar resultado:", error);
      else console.log("Resultado salvo com sucesso!");

      // Atualiza status do attempt
      if (attempt && attempt.status !== "completed") {
        const { error: attemptError } = await supabase
          .from("quizattempts")
          .update({ status: "completed" })
          .eq("id", attempt.id);

        if (attemptError) console.error("Erro ao marcar quiz como completo:", attemptError);
        else setAttempt({ ...attempt, status: "completed" });
      }

    } catch (err) {
      console.error("Erro inesperado ao finalizar quiz:", err);
    }

    setShowResult(true);
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

  // 🔹 Tela de resultados
  if (showResult) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white px-4">
        <Header />
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold mb-6">{quiz.titulo}</h1>
          <p className="text-lg mb-2">
            Acertos: <span className="font-semibold text-green-400">{acertos}</span>
          </p>
          <p className="text-lg mb-2">
            Erros: <span className="font-semibold text-red-400">{erros}</span>
          </p>
          <p className="text-lg mb-6">
            Pontuação: <span className="font-semibold text-blue-400">{pontuacao}%</span>
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold w-full"
          >
            Voltar ao Dashboard
          </button>
        </div>
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
            {currentQuestion + 1 === perguntas.length ? "Finalizar Quiz" : "Próxima"}
          </button>
        )}
      </div>
    </div>
  );
}
