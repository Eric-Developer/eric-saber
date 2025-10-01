"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Header from "../components/Header";
import LoadingOverlay from "../components/LoadingOverlay";
import Link from "next/link";

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
  username: string;
  Quiz: Quiz;
  created_at: string;
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
  email?: string;
  quizzesFeitos: QuizProgresso[];
}

export default function ProfessorDashboard() {
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<AlunoProgresso[]>([]);
  const [materiaStats, setMateriaStats] = useState<Record<string, { acertos: number; erros: number }>>({});
  const [ultimosQuizzes, setUltimosQuizzes] = useState<QuizResultado[]>([]);
  const [alunos, setAlunos] = useState<AlunoProgresso[]>([]);

  const [showModalCriarTurma, setShowModalCriarTurma] = useState(false);
  const [showModalEnviarAtividade, setShowModalEnviarAtividade] = useState(false);

  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: resultados, error: errResultados } = await supabase
          .from("QuizResultado")
          .select("*, Quiz(id, titulo, materia)");

        if (errResultados) throw errResultados;

        const rankingMap: Record<string, QuizProgresso[]> = {};
        resultados?.forEach((r: QuizResultado) => {
          const uname = r.username || `ID:${r.quiz_id}`;
          if (!rankingMap[uname]) rankingMap[uname] = [];
          rankingMap[uname].push({
            titulo: r.Quiz?.titulo || "",
            materia: r.Quiz?.materia || "",
            acertos: r.acertos,
            erros: r.erros,
            ultimaPontuacao: r.pontuacao,
          });
        });

        const rankingArray: AlunoProgresso[] = Object.entries(rankingMap).map(([username, quizzesFeitos]) => ({
          username,
          quizzesFeitos,
        }));

        setRanking(rankingArray);

        const materiaMap: Record<string, { acertos: number; erros: number }> = {};
        resultados?.forEach((r: QuizResultado) => {
          const mat = r.Quiz?.materia || "Sem matéria";
          if (!materiaMap[mat]) materiaMap[mat] = { acertos: 0, erros: 0 };
          materiaMap[mat].acertos += r.acertos;
          materiaMap[mat].erros += r.erros;
        });
        setMateriaStats(materiaMap);

        const ultimos = resultados?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
        setUltimosQuizzes(ultimos || []);

        setAlunos(rankingArray);

      } catch (err) {
        console.error("Erro ao carregar dashboard do professor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <LoadingOverlay />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 flex flex-col items-center">
      <Header />

      {/* Estatísticas principais */}
      <section className="mt-17 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 w-full max-w-6xl">
        <div className="bg-gray-800 p-4 rounded-2xl shadow text-center">
          <h2 className="text-gray-300 text-sm sm:text-base">Total de Alunos</h2>
          <p className="text-2xl font-bold text-white">{alunos.length}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-2xl shadow text-center">
          <h2 className="text-gray-300 text-sm sm:text-base">Total de Quizzes</h2>
          <p className="text-2xl font-bold text-white">{ultimosQuizzes.length}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-2xl shadow text-center">
          <h2 className="text-gray-300 text-sm sm:text-base">Total de Acertos</h2>
          <p className="text-2xl font-bold text-white">
            {ranking.reduce((sum, a) => sum + a.quizzesFeitos.reduce((s, q) => s + q.acertos, 0), 0)}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-2xl shadow text-center">
          <h2 className="text-gray-300 text-sm sm:text-base">Total de Erros</h2>
          <p className="text-2xl font-bold text-white">
            {ranking.reduce((sum, a) => sum + a.quizzesFeitos.reduce((s, q) => s + q.erros, 0), 0)}
          </p>
        </div>
      </section>

      {/* Desempenho por matéria */}
      <section className="mb-6 w-full max-w-6xl">
        <h2 className="text-xl font-bold text-white mb-4">Desempenho por Matéria</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(materiaStats).map(([materia, stats]) => {
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
                <p className="text-gray-400 text-sm mt-1">{perc}% de acerto médio</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ranking Geral */}
      <section className="mb-6 w-full max-w-6xl overflow-x-auto">
        <h2 className="text-xl font-bold text-white mb-4">Ranking Geral da Turma</h2>
        <table className="w-full text-left text-white min-w-[500px] sm:min-w-full">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="py-2 px-2">#</th>
              <th className="py-2 px-2">Aluno</th>
              <th className="py-2 px-2">Quizzes Feitos</th>
              <th className="py-2 px-2">Percentual Médio</th>
              <th className="py-2 px-2">Última Pontuação</th>
            </tr>
          </thead>
          <tbody>
            {ranking
              .sort((a, b) => {
                const percA = a.quizzesFeitos.reduce((s, q) => s + q.acertos, 0) /
                              a.quizzesFeitos.reduce((s, q) => s + q.acertos + q.erros, 1);
                const percB = b.quizzesFeitos.reduce((s, q) => s + q.acertos, 0) /
                              b.quizzesFeitos.reduce((s, q) => s + q.acertos + q.erros, 1);
                return percB - percA;
              })
              .map((a, idx) => {
                const totalAcertos = a.quizzesFeitos.reduce((s, q) => s + q.acertos, 0);
                const totalErros = a.quizzesFeitos.reduce((s, q) => s + q.erros, 0);
                const ultima = a.quizzesFeitos[a.quizzesFeitos.length - 1]?.ultimaPontuacao || 0;
                const perc = totalAcertos + totalErros > 0 ? Math.round((totalAcertos / (totalAcertos + totalErros)) * 100) : 0;
                return (
                  <tr key={a.username} className={idx === 0 ? "bg-green-600" : ""}>
                    <td className="py-2 px-2">{idx + 1}</td>
                    <td className="py-2 px-2 truncate max-w-[150px]">{a.username}</td>
                    <td className="py-2 px-2">{a.quizzesFeitos.length}</td>
                    <td className="py-2 px-2">{perc}%</td>
                    <td className="py-2 px-2">{ultima}%</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </section>

      {/* Últimos quizzes */}
      <section className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {ultimosQuizzes.map((q, idx) => {
          const total = q.acertos + q.erros;
          const perc = total > 0 ? Math.round((q.acertos / total) * 100) : 0;
          return (
            <div key={idx} className="bg-gray-800 p-4 rounded-2xl shadow">
              <h3 className="font-semibold text-white mb-2 truncate">{q.Quiz?.titulo}</h3>
              <div className="text-gray-300 mb-2 text-sm">
                Aluno: {q.username} | Acertos: {q.acertos} | Erros: {q.erros} | Pontuação: {q.pontuacao}%
              </div>
              <div className="w-full bg-gray-700 h-3 rounded-full">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: `${perc}%` }} />
              </div>
            </div>
          );
        })}
      </section>

      {/* Ações do Professor */}
      <section className="mb-6 w-full max-w-6xl">
        <h2 className="text-xl font-bold text-white mb-4">Ações do Professor</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setShowModalCriarTurma(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-2xl text-center"
          >
            Criar Turma
          </button>
          <button
            onClick={() => setShowModalEnviarAtividade(true)}
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-2xl text-center"
          >
            Enviar Atividade
          </button>
          <Link
            href="/professor/gerenciar-turmas"
            className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-2xl text-center"
          >
            Gerenciar Turmas
          </Link>
          <Link
            href="/professor/relatorios"
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-2xl text-center"
          >
            Relatórios da Turma
          </Link>
          <Link
            href="/professor/rastreamento"
            className="bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-2xl text-center"
          >
            Rastrear Entregas
          </Link>
        </div>
      </section>

      {/* Modais básicos */}
      {showModalCriarTurma && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md text-white">
            <h3 className="text-lg font-bold mb-4">Criar Turma</h3>
            <input type="text" placeholder="Nome da Turma" className="w-full p-2 mb-4 rounded text-black" />
            <button
              onClick={() => setShowModalCriarTurma(false)}
              className="bg-blue-500 hover:bg-blue-600 p-2 rounded w-full"
            >
              Criar
            </button>
          </div>
        </div>
      )}

      {showModalEnviarAtividade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md text-white">
            <h3 className="text-lg font-bold mb-4">Enviar Atividade</h3>
            <select className="w-full p-2 mb-4 rounded text-black">
              <option>Selecionar Turma</option>
            </select>
            <select className="w-full p-2 mb-4 rounded text-black">
              <option>Selecionar Quiz</option>
            </select>
            <button
              onClick={() => setShowModalEnviarAtividade(false)}
              className="bg-green-500 hover:bg-green-600 p-2 rounded w-full"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
