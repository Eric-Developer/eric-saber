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
      <div className="min-h-screen flex items-center justify-center text-white">
        Carregando quizzes...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center px-4 pt-20">
      <Header />

      <h1 className="text-3xl mt-4 font-bold text-white mb-6">
        Quizzes Pendentes
      </h1>

      {quizzes.length === 0 ? (
        <p className="text-white text-center">Nenhum quiz pendente.</p>
      ) : (
<div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-gray-800 rounded-xl p-4 shadow-lg hover:bg-gray-700 transition flex flex-col"
            >
              <p className="text-white font-semibold">{quiz.quiz_name}</p>
              <p className="text-gray-300 text-sm">
                Enviado: {new Date(quiz.assigned_at).toLocaleDateString()}
              </p>
              {quiz.due_date && (
                <p className="text-gray-300 text-sm">
                  Prazo: {new Date(quiz.due_date).toLocaleDateString()}
                </p>
              )}
              <button
                className="mt-2 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                onClick={() => {
                router.push(`/dashboard/student-quizzes/${params.id}/${quiz.id}`);
                }}
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
