"use client";
import React, { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

interface Props {
  onClose: () => void;
  professorId: string;
}

export default function CreateClassModal({ onClose, professorId }: Props) {
  const [className, setClassName] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!className.trim() || !year.trim()) {
      setErrorMsg("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.from("Class").insert([
        {
          nome: className,
          ano: Number(year),
          professor_id: professorId,
        },
      ]);

      setLoading(false);

      if (error) {
        console.error("Erro ao criar turma:", error);
        setErrorMsg(
          `Erro ao criar turma: ${error.message}${error.details ? ` - Detalhes: ${error.details}` : ""}`
        );
      } else {
        alert("Turma criada com sucesso!");
        setClassName("");
        setYear("");
        onClose(); // só fecha se sucesso
      }
    } catch (err) {
      setLoading(false);
      console.error("Erro inesperado:", err);
      setErrorMsg("Ocorreu um erro inesperado ao criar a turma.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md text-white">
        <h3 className="text-lg font-bold mb-4">Criar Turma</h3>

        {errorMsg && (
          <div className="text-red-500 mb-2">
            {errorMsg}
          </div>
        )}

        <input
          type="text"
          placeholder="Nome da Turma"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
        />

        <input
          type="number"
          placeholder="Ano"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className={`${
            loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          } p-2 rounded w-full`}
        >
          {loading ? "Criando..." : "Criar Turma"}
        </button>

        <button
          onClick={onClose}
          disabled={loading}
          className="mt-2 p-2 w-full rounded bg-gray-600 hover:bg-gray-700"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
