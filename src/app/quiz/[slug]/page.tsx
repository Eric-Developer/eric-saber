"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { QuizHeader } from "@/app/components/quiz/QuizHeader";
import { QuizQuestion } from "@/app/components/quiz/QuizQuestion";
import { QuizResult } from "@/app/components/quiz/QuizResult";
import Header from "@/app/components/Header";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

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

function normalize(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function shuffleAlternativas(pergunta: Pergunta) {
  const alt = [...pergunta.alternativas];
  const correta = pergunta.correta;

  const indices = alt.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const shuffled = indices.map((i) => alt[i]);
  const novaCorreta = indices.indexOf(correta);
  return { alternativas: shuffled, correta: novaCorreta };
}

export default function QuizPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const normalizedSlug = normalize(slug);
  const { user } = useAuth();
  const router = useRouter();

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(true);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [temaAtual, setTemaAtual] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [resultadoSalvo, setResultadoSalvo] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 🔹 Verifica autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/login");
        return;
      }
      setUserId(data.user.id);
      setIsAuthLoading(false);
    };
    checkAuth();
  }, [router]);

  // 🔹 Busca quiz e perguntas
  useEffect(() => {
    if (isAuthLoading) return;

    const fetchQuiz = async () => {
      setQuizLoading(true);

      const { data: quizzes } = await supabase.from("Quiz").select("*");
      const quizData = quizzes?.find((q: Quiz) =>
        q.tags?.some((tag) => normalize(tag).includes(normalizedSlug))
      );

      if (!quizData) {
        setQuiz(null);
        setPerguntas([]);
        setQuizLoading(false);
        return;
      }

      setQuiz(quizData);

      const { data: perguntasData } = await supabase
        .from("Pergunta")
        .select("*")
        .eq("quiz_id", quizData.id);

      if (perguntasData) {
        const perguntasEmbaralhadas = (perguntasData as Pergunta[])
          .sort(() => Math.random() - 0.5)
          .slice(0, 10)
          .map((p) => {
            const { alternativas, correta } = shuffleAlternativas(p);
            return { ...p, alternativas, correta };
          });

        setPerguntas(perguntasEmbaralhadas);
      } else {
        setPerguntas([]);
      }

      setPerguntaAtual(0);
      setAcertos(0);
      setErros(0);
      setSelected(null);
      setShowFeedback(false);
      setTemaAtual(slug);
      setShowResult(false);
      setResultadoSalvo(false);
      setQuizLoading(false);
    };

    fetchQuiz();
  }, [slug, normalizedSlug, isAuthLoading]);

  const handleSelect = (idx: number) => {
    if (selected !== null || !perguntas[perguntaAtual]) return;
    setSelected(idx);
    setShowFeedback(true);

    if (idx === perguntas[perguntaAtual].correta) setAcertos((p) => p + 1);
    else setErros((p) => p + 1);
  };

  const handleNext = () => {
    setSelected(null);
    setShowFeedback(false);
    setPerguntaAtual((p) => p + 1);
  };

  const handleRestart = () => {
    const novasPerguntas = perguntas
      .sort(() => Math.random() - 0.5)
      .map((p) => {
        const { alternativas, correta } = shuffleAlternativas(p);
        return { ...p, alternativas, correta };
      });
    setPerguntas(novasPerguntas);
    setPerguntaAtual(0);
    setSelected(null);
    setShowFeedback(false);
    setAcertos(0);
    setErros(0);
    setShowResult(false);
    setResultadoSalvo(false);
  };

  const handleFinish = async () => {
    if (!quiz || resultadoSalvo) return;

    const pontuacao = Math.round((acertos / perguntas.length) * 100);

    try {
      if (userId) {
        const username = user?.username;
        const { error } = await supabase.from("QuizResultado").insert([
          {
            user_id: userId,
            quiz_id: quiz.id,
            acertos,
            erros,
            pontuacao,
            username,
          },
        ]);

        if (error) console.error("Erro ao salvar resultado:", error);
        else setResultadoSalvo(true);
      } else {
        console.error("Nenhum userId encontrado!");
      }
    } catch (err) {
      console.error("Erro inesperado ao finalizar quiz:", err);
    }

    setShowResult(true);
  };

  // 🔹 Loading global
  if (isAuthLoading || quizLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        Carregando quiz...
      </div>
    );
  }

  // 🔹 Nenhum quiz ou pergunta encontrada
  if (!quiz || perguntas.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 text-white">
        <Header />
        <div className="flex flex-1 items-center justify-center text-center">
          Nenhuma pergunta encontrada para <strong>{slug}</strong>
        </div>
      </div>
    );
  }

  // 🔹 Quiz completo
  if (showResult) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 text-white">
        <Header />
        <QuizResult
          quiz={quiz}
          temaAtual={temaAtual}
          acertos={acertos}
          erros={erros}
          total={perguntas.length}
          onRestart={handleRestart}
          userId={userId!}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      <div className="flex-1 w-full md:max-w-4xl mx-auto bg-white md:rounded-2xl md:shadow-2xl overflow-hidden flex flex-col mt-20">
        <QuizHeader perguntaAtual={perguntaAtual} total={perguntas.length} tema={quiz.tema || "Quiz"} />
        <QuizQuestion
          pergunta={perguntas[perguntaAtual]}
          perguntaAtual={perguntaAtual}
          selected={selected}
          showFeedback={showFeedback}
          onSelect={handleSelect}
          onNext={handleNext}
          isLast={perguntaAtual === perguntas.length - 1}
          onFinish={handleFinish}
        />
      </div>
    </div>
  );
}
