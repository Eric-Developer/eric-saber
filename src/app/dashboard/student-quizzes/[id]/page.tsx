"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import Header from "@/app/components/Header";

interface Quiz {
  id: string; // id do attempt
  quiz_id: string; // id do quiz
  assigned_at: string;
  due_date: string | null;
  status: string;
  quiz_name: string;
}

export default function AlunoQuizzes() {
  const params = useParams();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("quizattempts")
        .select(`
          id,
          quiz_id,
          assigned_at,
          due_date,
          status,
          Quiz!inner(titulo)
        `)
        .eq("student_id", params.id)
        .eq("status", "pending");

      if (error) {
        console.error("Erro ao buscar quizzes do aluno:", error);
      } else {
        const mappedQuizzes = (data || []).map((q: any) => ({
          id: q.id,
          quiz_id: q.quiz_id,
          assigned_at: q.assigned_at,
          due_date: q.due_date,
          status: q.status,
          quiz_name: q.Quiz.titulo,
        }));

        setQuizzes(mappedQuizzes);
      }

      setLoading(false);
    };

    fetchQuizzes();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        Carregando quizzes...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center px-4 pt-20">
      <Header />

      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Quizzes Pendentes
      </h1>

      {quizzes.length === 0 ? (
        <p className="text-gray-300 text-center text-lg">
          Nenhum quiz pendente no momento.
        </p>
      ) : (
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between w-full h-56"
            >
              <div>
                <h2 className="text-xl font-semibold text-white mb-2 text-center">
                  {quiz.quiz_name}
                </h2>
                <div className="text-gray-300 text-sm text-center space-y-1">
                  <p>
                    <span className="text-gray-400">Enviado:</span>{" "}
                    {new Date(quiz.assigned_at).toLocaleDateString()}
                  </p>
                  {quiz.due_date && (
                    <p>
                      <span className="text-gray-400">Prazo:</span>{" "}
                      {new Date(quiz.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() =>
                  router.push(
                    `/dashboard/student-quizzes/${params.id}/${quiz.id}`
                  )
                }
                className="mt-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all duration-200"
              >
                Iniciar Quiz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
