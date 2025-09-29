"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";

interface Quiz {
  id: number;
  titulo: string;
  materia: string;
}

interface QuizResultado {
  quiz_id: number;
  acertos: number;
  erros: number;
  pontuacao: number;
  Quiz: Quiz;
}

interface QuizResultadoComUser extends QuizResultado {
  User: { username: string };
}

interface QuizProgresso {
  titulo: string;
  materia: string;
  acertos: number;
  erros: number;
  ultimaPontuacao: number;
}

interface AlunoProgresso {
  username: string;
  quizzesFeitos: QuizProgresso[];
}

export default function AlunoDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [progresso, setProgresso] = useState<AlunoProgresso | null>(null);
  const [ranking, setRanking] = useState<AlunoProgresso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.email) return;

        // Resultados do usuário logado
        const { data: resultados, error: errResultados } = await supabase
          .from("QuizResultado")
          .select(`
            quiz_id,
            acertos,
            erros,
            pontuacao,
            Quiz(id, titulo, materia)
          `)
          .eq("user_id", user.id) as { data: QuizResultado[] | null; error: Error };

        if (errResultados) throw errResultados;

        const quizzesFeitos: QuizProgresso[] = resultados?.map((r) => ({
          titulo: r.Quiz.titulo,
          materia: r.Quiz.materia,
          acertos: r.acertos,
          erros: r.erros,
          ultimaPontuacao: r.pontuacao,
        })) || [];

        setProgresso({ username: user.email, quizzesFeitos });

        // Ranking geral (todos os usuários)
        const { data: todosResultados, error: errRanking } = await supabase
          .from("QuizResultado")
          .select(`
            user_id,
            acertos,
            erros,
            pontuacao,
            Quiz(titulo, materia),
            User(username)
          `) as { data: QuizResultadoComUser[] | null; error: Error };

        if (errRanking) throw errRanking;

        const rankingMap: Record<string, QuizProgresso[]> = {};
        todosResultados?.forEach((r) => {
          const uname = r.User.username;
          if (!rankingMap[uname]) rankingMap[uname] = [];
          rankingMap[uname].push({
            titulo: r.Quiz?.titulo || "",
            materia: r.Quiz?.materia || "",
            acertos: r.acertos,
            erros: r.erros,
            ultimaPontuacao: r.pontuacao,
          });
        });

        const rankingArray: AlunoProgresso[] = Object.entries(rankingMap).map(
          ([username, quizzesFeitos]) => ({ username, quizzesFeitos })
        );

        setRanking(rankingArray);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetchData();
  }, [user, authLoading]);

  if (authLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Carregando...
      </div>
    );

  if (!progresso)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Nenhum progresso encontrado
      </div>
    );

  const totalQuizzesFeitos = progresso.quizzesFeitos.length;
  const totalAcertos = progresso.quizzesFeitos.reduce((sum, q) => sum + q.acertos, 0);
  const totalErros = progresso.quizzesFeitos.reduce((sum, q) => sum + q.erros, 0);

  const materiasMap: Record<string, { acertos: number; erros: number }> = {};
  progresso.quizzesFeitos.forEach((q) => {
    if (!materiasMap[q.materia]) materiasMap[q.materia] = { acertos: 0, erros: 0 };
    materiasMap[q.materia].acertos += q.acertos;
    materiasMap[q.materia].erros += q.erros;
  });

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 flex flex-col items-center">
      {/* Cabeçalho */}
      <header className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between bg-gray-800 text-white px-4 sm:px-6 py-4 rounded-2xl shadow-2xl mb-6 sm:mb-12 gap-4 sm:gap-0">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-xl">
            {user?.email.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold truncate">{user?.username}</h1>
            <p className="text-gray-400 text-sm sm:text-base">Dashboard do aluno</p>
          </div>
        </div>
        <Link
          href="/quiz"
          className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 w-full sm:w-auto text-center"
        >
          Pesquisar Quizzes
        </Link>
      </header>

      {/* Estatísticas gerais */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 w-full max-w-4xl">
        <div className="bg-gray-800 p-4 rounded-2xl shadow text-center">
          <h2 className="text-gray-300 text-sm sm:text-base">Total de Quizzes</h2>
          <p className="text-2xl font-bold text-white">{totalQuizzesFeitos}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-2xl shadow text-center">
          <h2 className="text-gray-300 text-sm sm:text-base">Total de Acertos</h2>
          <p className="text-2xl font-bold text-white">{totalAcertos}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-2xl shadow text-center">
          <h2 className="text-gray-300 text-sm sm:text-base">Total de Erros</h2>
          <p className="text-2xl font-bold text-white">{totalErros}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-2xl shadow text-center">
          <h2 className="text-gray-300 text-sm sm:text-base">Percentual Médio</h2>
          <p className="text-2xl font-bold text-white">
            {totalQuizzesFeitos > 0
              ? Math.round((totalAcertos / (totalAcertos + totalErros)) * 100)
              : 0}%
          </p>
        </div>
      </section>

      {/* Pontuação por matéria */}
      <section className="mb-6 w-full max-w-4xl">
        <h2 className="text-xl font-bold text-white mb-4">Pontuação por Matéria</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(materiasMap).map(([materia, stats]) => {
            const total = stats.acertos + stats.erros;
            const perc = total > 0 ? Math.round((stats.acertos / total) * 100) : 0;
            return (
              <div key={materia} className="bg-gray-800 p-4 rounded-2xl shadow">
                <h3 className="font-semibold text-white mb-2 truncate">{materia}</h3>
                <div className="text-gray-300 mb-2 text-sm">
                  Acertos: {stats.acertos} | Erros: {stats.erros}
                </div>
                <div className="w-full bg-gray-700 h-3 rounded-full">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: `${perc}%` }} />
                </div>
                <p className="text-gray-400 text-sm mt-1">{perc}% de acerto</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ranking */}
      <section className="mb-6 w-full max-w-4xl overflow-x-auto">
        <h2 className="text-xl font-bold text-white mb-4">Ranking dos Alunos</h2>
        <table className="w-full text-left text-white min-w-[500px] sm:min-w-full">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="py-2 px-2">#</th>
              <th className="py-2 px-2">Aluno</th>
              <th className="py-2 px-2">Acertos Totais</th>
              <th className="py-2 px-2">Erros Totais</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((a, idx) => {
              const acertosTotais = a.quizzesFeitos.reduce((sum, q) => sum + q.acertos, 0);
              const errosTotais = a.quizzesFeitos.reduce((sum, q) => sum + q.erros, 0);
              return (
                <tr key={a.username} className={a.username === user?.email ? "bg-gray-700" : ""}>
                  <td className="py-2 px-2">{idx + 1}</td>
                  <td className="py-2 px-2 truncate max-w-[150px]">{a.username}</td>
                  <td className="py-2 px-2">{acertosTotais}</td>
                  <td className="py-2 px-2">{errosTotais}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Últimas pontuações */}
      <section className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {progresso.quizzesFeitos.map((q, idx) => {
          const total = q.acertos + q.erros;
          const perc = total > 0 ? Math.round((q.acertos / total) * 100) : 0;
          return (
            <div key={idx} className="bg-gray-800 p-4 rounded-2xl shadow">
              <h3 className="font-semibold text-white mb-2 truncate">{q.titulo}</h3>
              <div className="text-gray-300 mb-2 text-sm">
                Acertos: {q.acertos} | Erros: {q.erros} | Última pontuação: {q.ultimaPontuacao}%
              </div>
              <div className="w-full bg-gray-700 h-3 rounded-full">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: `${perc}%` }} />
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
