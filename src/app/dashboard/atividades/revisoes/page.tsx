"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useAuth } from "@/app/hooks/useAuth";
import Header from "@/app/components/Header";

export default function RevisoesPage() {
  const { user } = useAuth();
  const [revisoes, setRevisoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchRevisoes = async () => {
      const { data, error } = await supabase
        .from("revisoes_prova")
        .select("*")
        .eq("aluno_id", user.id)
        .order("criada_em", { ascending: false });

      if (error) console.error("Erro ao buscar revisões:", error);
      else setRevisoes(data || []);
      setLoading(false);
    };

    fetchRevisoes();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        Carregando revisões...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Revisões de Provas</h1>

        {revisoes.length === 0 ? (
          <p className="text-center text-gray-400">Nenhuma revisão disponível.</p>
        ) : (
          revisoes.map((rev: any) => (
            <div key={rev.id} className="bg-gray-800 p-6 rounded-xl mb-6">
              <h2 className="text-2xl font-semibold mb-2">{rev.titulo}</h2>
              <p className="text-gray-400 mb-2">{rev.materia}</p>
              <p className="text-sm text-gray-500 mb-4">
                Criada em: {new Date(rev.criada_em).toLocaleString()} | Status:{" "}
                <span className={rev.status === "ativa" ? "text-green-400" : "text-gray-400"}>
                  {rev.status}
                </span>
              </p>

              {/* Lista de perguntas e respostas */}
              {rev.perguntas && rev.perguntas.length > 0 ? (
                rev.perguntas.map((q: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-gray-700 p-4 rounded mb-3 border-l-4 border-blue-500"
                  >
                    <p className="font-semibold mb-1">
                      Pergunta {idx + 1}: {q.pergunta}
                    </p>
                    <p className="text-green-300 mb-1">
                      Resposta: {q.resposta || "Sem resposta"}
                    </p>
                    {q.observacoes && (
                      <p className="text-yellow-400 text-sm">Observações: {q.observacoes}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Nenhuma pergunta registrada.</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
