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
  titulo: string;
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
  const [sendingQuiz, setSendingQuiz] = useState(false);

  const router = useRouter();

  // 🔹 Verifica se o usuário está logado
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        setAuthLoading(false);
      }
    };
    checkUser();
  }, [router]);

  // 🔹 Carrega detalhes da turma
  useEffect(() => {
    const fetchTurma = async () => {
      const { data, error } = await supabase
        .from("Class")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Erro ao buscar turma:", error);
      } else {
        setTurma(data as Turma);
      }
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

      const alunosMap: Aluno[] = (userData as any[]).map((u) => ({
        id: u.id,
        username: u.username,
        class_id: turma.id,
      }));

      setAlunos(alunosMap);
      setLoadingAlunos(false);
    };

    fetchAlunos();
  }, [turma]);

  // 🔹 Carrega quizzes disponíveis
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoadingQuizzes(true);
      const { data, error } = await supabase.from("Quiz").select("*");
      if (error) {
        console.error("Erro ao buscar quizzes:", error);
      } else {
        setQuizzes(data as Quiz[]);
      }
      setLoadingQuizzes(false);
    };
    fetchQuizzes();
  }, []);

  // 🔹 Adicionar quiz à turma (ClassQuizzes)
  const handleAddQuiz = async () => {
    if (!selectedQuizId || !turma) {
      alert("Selecione um quiz!");
      return;
    }

    const { error, data } = await supabase.from("ClassQuizzes").insert({
      class_id: turma.id,
      quiz_id: selectedQuizId,
    }).select();

    if (error) {
      console.error("Erro ao adicionar quiz:", error);
      alert("Erro ao adicionar quiz!");
    } else {
      alert("Quiz adicionado à turma com sucesso!");
      setSelectedQuizId("");
      // Atualiza lista local para mostrar imediatamente
      setQuizzes((prev) => [...prev, quizzes.find(q => q.id === selectedQuizId)!]);
    }
  };

  // 🔹 Enviar quiz para todos os alunos (cria registros na QuizAttempts)
  const handleSendQuizToAll = async (quizId: string) => {
    if (!quizId || !turma || alunos.length === 0) {
      alert("Selecione um quiz ou verifique se há alunos na turma.");
      return;
    }

    setSendingQuiz(true);
    try {
      const inserts = alunos.map(a => ({
        student_id: a.id,
        class_id: turma.id,
        quiz_id: quizId,
        assigned_at: new Date().toISOString(),
        status: "pending",
      }));

      const { error } = await supabase.from("quizattempts").insert(inserts);
      if (error) throw error;

      alert("Quiz enviado para todos os alunos da turma!");
    } catch (err) {
      console.error("Erro ao enviar quiz:", err);
      alert("Erro ao enviar quiz!");
    } finally {
      setSendingQuiz(false);
    }
  };

  const handleAddAluno = () => {
    router.push(`/dashboard/turmas/turma/${params.id}/`);
  };

  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Verificando usuário...
      </div>
    );

  if (!turma)
    return <p className="text-white text-center mt-20">Turma não encontrada.</p>;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20">
        {/* Detalhes da turma */}
        <div className="w-full max-w-4xl bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">{turma.nome}</h1>
          <p className="text-gray-300 mb-1">Matéria: {turma.materia}</p>
          <p className="text-gray-300 mb-1">Ano: {turma.ano}</p>
          <p className="text-gray-300 mb-4">Total de alunos: {alunos.length}</p>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => router.push(`/turma/${turma.id}/editar`)}
              className="px-6 py-3 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition"
            >
              Editar Turma
            </button>

            <button
              onClick={handleAddAluno}
              className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold transition"
            >
              Adicionar Aluno
            </button>
          </div>
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
                        if (error) {
                          alert("Erro ao remover aluno");
                        } else {
                          setAlunos(alunos.filter((a) => a.id !== aluno.id));
                        }
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
        {quiz.titulo}
      </option>
    ))}
  </select>

  <button className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold w-full md:w-auto">
    Adicionar Quiz
  </button>

  <button
    onClick={() => handleSendQuizToAll(selectedQuizId)}
    disabled={sendingQuiz}
    className={`px-6 py-3 rounded-full font-semibold text-white shadow-lg transition w-full md:w-auto ${
      sendingQuiz ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
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
