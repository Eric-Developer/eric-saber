"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import Header from "@/app/components/Header";

interface Turma {
  id: string;
  nome: string;
  materia: string;
  ano: string;
}

interface Aluno {
  id: string;
  username: string;
  class_id: string;
}

interface Quiz {
  id: string;
  materia: string;
  totalPerguntas?: number; // total de perguntas dessa matéria
}

interface Pergunta {
  id: string;
  quiz_id: string;
}

interface Props {
  params: { id: string };
}

export default function TurmaDetalhe({ params }: Props) {
  const [turma, setTurma] = useState<Turma | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [loadingAlunos, setLoadingAlunos] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [numQuestionsToSend, setNumQuestionsToSend] = useState<number>(0);
  const [sendingQuiz, setSendingQuiz] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/login");
      else setAuthLoading(false);
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    const fetchTurma = async () => {
      const { data, error } = await supabase
        .from("Class")
        .select("*")
        .eq("id", params.id)
        .single();
      if (error) console.error("Erro ao buscar turma:", error);
      else setTurma(data as Turma);
    };
    fetchTurma();
  }, [params.id]);

  // 🔹 Carrega alunos da turma
  useEffect(() => {
    const fetchAlunos = async () => {
      if (!turma) return;
      setLoadingAlunos(true);

      const { data: classStudents, error: csError } = await supabase
        .from("ClassStudents")
        .select("student_id")
        .eq("class_id", turma.id);

      if (csError) {
        console.error("Erro ao buscar alunos da turma:", csError);
        setLoadingAlunos(false);
        return;
      }

      if (!classStudents || classStudents.length === 0) {
        setAlunos([]);
        setLoadingAlunos(false);
        return;
      }

      const studentIds = classStudents.map((c: any) => c.student_id);
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("id, username")
        .in("id", studentIds);

      if (userError) {
        console.error("Erro ao buscar usuários:", userError);
        setLoadingAlunos(false);
        return;
      }

      setAlunos(
        (userData as any[]).map((u) => ({
          id: u.id,
          username: u.username,
          class_id: turma.id,
        }))
      );
      setLoadingAlunos(false);
    };
    fetchAlunos();
  }, [turma]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoadingQuizzes(true);
      const { data: quizzesData, error } = await supabase
        .from("Quiz")
        .select("id, materia");

      if (error || !quizzesData) {
        console.error("Erro ao buscar quizzes:", error);
        setLoadingQuizzes(false);
        return;
      }

      const quizzesWithCount: Quiz[] = [];

      for (const q of quizzesData) {
        const { count } = await supabase
          .from("Pergunta")
          .select("*", { count: "exact", head: true })
          .eq("quiz_id", q.id);

        quizzesWithCount.push({ ...q, totalPerguntas: count || 0 });
      }

      setQuizzes(quizzesWithCount);
      setLoadingQuizzes(false);
    };
    fetchQuizzes();
  }, []);

  // 🔹 Adicionar quiz à turma
  const handleAddQuiz = async () => {
    if (!selectedQuizId || !turma) {
      alert("Selecione um quiz!");
      return;
    }

    const { error } = await supabase.from("ClassQuizzes").insert({
      class_id: turma.id,
      quiz_id: selectedQuizId,
    });

    if (error) {
      console.error("Erro ao adicionar quiz:", error);
      alert("Erro ao adicionar quiz!");
    } else {
      alert("Quiz adicionado à turma com sucesso!");
    }
  };

  // 🔹 Função para embaralhar array
  const shuffleArray = (array: any[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  // 🔹 Enviar quiz para todos os alunos
  const handleSendQuizToAll = async () => {
    if (!selectedQuizId || !turma || alunos.length === 0) {
      alert("Selecione um quiz ou verifique se há alunos na turma.");
      return;
    }

    setSendingQuiz(true);

    try {
      // Buscar todas as perguntas do quiz
      const { data: perguntasData, error: perguntasError } = await supabase
        .from("Pergunta")
        .select("*")
        .eq("quiz_id", selectedQuizId);

      if (perguntasError || !perguntasData)
        throw perguntasError || new Error("Erro ao buscar perguntas");

      // Embaralhar perguntas e limitar
      const perguntasParaEnviar = shuffleArray(perguntasData).slice(
        0,
        numQuestionsToSend > 0 ? numQuestionsToSend : perguntasData.length
      );

      // Para cada aluno, criar QuizAttempt e QuizAttemptQuestions
      for (const aluno of alunos) {
        // 1️⃣ Criar tentativa
        const { data: attemptData, error: attemptError } = await supabase
          .from("quizattempts")
          .insert({
            student_id: aluno.id,
            class_id: turma.id,
            quiz_id: selectedQuizId,
            assigned_at: new Date().toISOString(),
            status: "pending",
          })
          .select("id")
          .single();

        if (attemptError) throw attemptError;

        const attemptId = attemptData.id;

        // 2️⃣ Criar perguntas vinculadas à tentativa
        const questionInserts = perguntasParaEnviar.map((p) => ({
          quiz_attempt_id: attemptId,
          pergunta_id: p.id,
          status: "pending",
        }));

        // ✅ Inserir perguntas
        const { error: questionsError } = await supabase
          .from("quizattemptquestions")
          .insert(questionInserts);

        if (questionsError) throw questionsError;
      }

      alert(
        `Quiz enviado com ${perguntasParaEnviar.length} perguntas aleatórias para cada aluno!`
      );
    } catch (err) {
      console.error("Erro ao enviar quiz:", err);
      alert("Erro ao enviar quiz!");
    } finally {
      setSendingQuiz(false);
    }
  };

  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Verificando usuário...
      </div>
    );

  if (!turma)
    return <p className="text-white text-center mt-20">Turma não encontrada.</p>;

   const handleAddAluno = () => {
    router.push(`/dashboard/turmas/turma/${params.id}/`);
  };
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20">
        {/* Detalhes da turma */}
        <div className="w-full max-w-4xl bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">{turma.nome}</h1>
          <p className="text-gray-300 mb-1">Ano: {turma.ano}</p>
          <p className="text-gray-300 mb-4">Total de alunos: {alunos.length}</p>
        </div>

        {/* Lista de alunos */}
        <div className="w-full max-w-4xl mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Alunos</h2>
          {loadingAlunos ? (
            <p className="text-white">Carregando alunos...</p>
          ) : alunos.length === 0 ? (
            <p className="text-white">Nenhum aluno cadastrado nesta turma.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alunos.map((aluno) => (
                <div
                  key={aluno.id}
                  className="bg-gray-800 rounded-xl p-4 shadow-lg hover:bg-gray-700 transition flex flex-col"
                >
                  <p className="text-white font-semibold">{aluno.username}</p>
                  <button
                    onClick={async () => {
                      if (confirm(`Deseja remover ${aluno.username}?`)) {
                        const { error } = await supabase
                          .from("ClassStudents")
                          .delete()
                          .eq("student_id", aluno.id)
                          .eq("class_id", turma.id);
                        if (error) alert("Erro ao remover aluno");
                        else setAlunos(alunos.filter((a) => a.id !== aluno.id));
                      }
                    }}
                    className="mt-2 px-3 py-1 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Adicionar Quiz */}
        <div className="w-full max-w-4xl bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Adicionar Quiz à Turma</h2>

          {loadingQuizzes ? (
            <p className="text-white">Carregando quizzes...</p>
          ) : (
            <div className="flex flex-col md:flex-row gap-4 items-center w-full">
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 w-full md:w-auto"
              >
                <option value="">Selecione um quiz</option>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.materia} ({quiz.totalPerguntas})
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={1}
                placeholder="Quantas perguntas enviar?"
                value={numQuestionsToSend || ""}
                onChange={(e) => setNumQuestionsToSend(Number(e.target.value))}
                className="px-4 py-3 rounded-lg bg-gray-700 text-white w-full md:w-40"
              />

            <button
              onClick={handleAddAluno}
              className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold transition"
            >
              Adicionar Aluno       
            </button>

              <button
                onClick={handleSendQuizToAll}
                disabled={sendingQuiz}
                className={`px-6 py-3 rounded-full font-semibold text-white shadow-lg transition w-full md:w-auto ${
                  sendingQuiz
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {sendingQuiz ? "Enviando..." : "Enviar Quiz para Todos"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
