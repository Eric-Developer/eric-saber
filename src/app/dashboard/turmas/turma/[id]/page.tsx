"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

interface Props {
  params: { id: string }; 
}

interface Student {
  id: string;
  username: string;
  email: string;
}

export default function AdicionarAluno({ params }: Props) {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from("User") 
        .select("id, username, email");

      if (error) {
        console.error("Erro ao buscar alunos:", error);
      } else {
        setStudents(data as Student[]);
      }
    };
    fetchStudents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert("Selecione um aluno!");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("ClassStudents").insert({
        class_id: params.id,
        student_id: selectedStudentId,
      });

      if (error) throw error;

      alert("Aluno adicionado à turma com sucesso!");
      router.push(`/dashboard/turmas/${params.id}`);
    } catch (err) {
      console.error("Erro ao adicionar aluno:", err);
      alert("Erro ao adicionar aluno!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-start px-4 pt-20">
      <h1 className="text-4xl font-bold text-white mb-6 text-center">
        Adicionar Aluno à Turma
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-gray-800 rounded-xl p-6 shadow-lg flex flex-col gap-4"
      >
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Selecione um aluno</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.username} ({s.email})
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-3 rounded-full font-semibold text-white shadow-lg transition ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? "Associando..." : "Adicionar Aluno"}
        </button>
      </form>
    </div>
  );
}
