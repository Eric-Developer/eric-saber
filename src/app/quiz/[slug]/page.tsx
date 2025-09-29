"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface QuizProgresso {
  titulo: string;
  materia: string;
  acertos: number;
  erros: number;
  ultimaPontuacao: number; // %
}

interface AlunoProgresso {
  username: string;
  quizzesFeitos: QuizProgresso[];
}

export default function AlunoDashboard() {
  const [aluno, setAluno] = useState({ username: "Aluno Exemplo" });
  const [progresso, setProgresso] = useState<AlunoProgresso | null>(null);
  const [ranking, setRanking] = useState<AlunoProgresso[]>([]);

  useEffect(() => {
    // Dados simulados do aluno
    const progressoSimulado: AlunoProgresso = {
      username: aluno.username,
      quizzesFeitos: [
        { titulo: "Matemática Básica", materia: "Matemática", acertos: 8, erros: 2, ultimaPontuacao: 80 },
        { titulo: "Português Avançado", materia: "Português", acertos: 6, erros: 4, ultimaPontuacao: 60 },
        { titulo: "Ciências Naturais", materia: "Ciências", acertos: 7, erros: 3, ultimaPontuacao: 70 },
      ],
    };
    setProgresso(progressoSimulado);

    // Ranking simulado
    const rankingSimulado: AlunoProgresso[] = [
      progressoSimulado,
      { username: "Aluno 2", quizzesFeitos: [{ titulo: "", materia: "", acertos: 15, erros: 5, ultimaPontuacao: 75 }] },
      { username: "Aluno 3", quizzesFeitos: [{ titulo: "", materia: "", acertos: 12, erros: 3, ultimaPontuacao: 80 }] },
      { username: "Aluno 4", quizzesFeitos: [{ titulo: "", materia: "", acertos: 10, erros: 5, ultimaPontuacao: 66 }] },
      { username: "Aluno 5", quizzesFeitos: [{ titulo: "", materia: "", acertos: 9, erros: 6, ultimaPontuacao: 60 }] },
    ];
    setRanking(rankingSimulado);
  }, [aluno.username]);

  if (!progresso) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  const totalQuizzesFeitos = progresso.quizzesFeitos.length;
  const totalAcertos = progresso.quizzesFeitos.reduce((sum, q) => sum + q.acertos, 0);
  const totalErros = progresso.quizzesFeitos.reduce((sum, q) => sum + q.erros, 0);

  const materiasMap: { [materia: string]: { acertos: number; erros: number } } = {};
  progresso.quizzesFeitos.forEach((q) => {
    if (!materiasMap[q.materia]) materiasMap[q.materia] = { acertos: 0, erros: 0 };
    materiasMap[q.materia].acertos += q.acertos;
    materiasMap[q.materia].erros += q.erros;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
            {aluno.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{aluno.username}</h1>
            <p className="text-gray-600">Dashboard do aluno</p>
          </div>
        </div>
        <Link
          href="/quiz"
          className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
        >
          Ir para pesquisa de quizzes
        </Link>
      </header>

      {/* Estatísticas gerais */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow text-center">
          <h2 className="text-gray-500">Total de Quizzes</h2>
          <p className="text-2xl font-bold">{totalQuizzesFeitos}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow text-center">
          <h2 className="text-gray-500">Total de Acertos</h2>
          <p className="text-2xl font-bold">{totalAcertos}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow text-center">
          <h2 className="text-gray-500">Total de Erros</h2>
          <p className="text-2xl font-bold">{totalErros}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow text-center">
          <h2 className="text-gray-500">Percentual Médio</h2>
          <p className="text-2xl font-bold">
            {totalQuizzesFeitos > 0 ? Math.round((totalAcertos / (totalAcertos + totalErros)) * 100) : 0}%
          </p>
        </div>
      </section>

      {/* Pontuação por matéria */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-4">Pontuação por Matéria</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(materiasMap).map(([materia, stats]) => {
            const total = stats.acertos + stats.erros;
            const perc = total > 0 ? Math.round((stats.acertos / total) * 100) : 0;
            return (
              <div key={materia} className="bg-white p-4 rounded-2xl shadow">
                <h3 className="font-semibold mb-2">{materia}</h3>
                <div className="text-sm text-gray-500 mb-2">
                  Acertos: {stats.acertos} | Erros: {stats.erros}
                </div>
                <div className="w-full bg-gray-200 h-3 rounded-full">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${perc}%` }} />
                </div>
                <p className="text-sm mt-1">{perc}% de acerto</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ranking */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-4">Ranking dos Alunos</h2>
        <div className="bg-white p-4 rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
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
                  <tr key={a.username} className={a.username === aluno.username ? "bg-blue-50" : ""}>
                    <td className="py-2 px-2">{idx + 1}</td>
                    <td className="py-2 px-2">{a.username}</td>
                    <td className="py-2 px-2">{acertosTotais}</td>
                    <td className="py-2 px-2">{errosTotais}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Últimas pontuações */}
      <section>
        <h2 className="text-xl font-bold mb-4">Últimas Pontuações</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progresso.quizzesFeitos.map((q, idx) => {
            const total = q.acertos + q.erros;
            const perc = total > 0 ? Math.round((q.acertos / total) * 100) : 0;
            return (
              <div key={idx} className="bg-white p-4 rounded-2xl shadow">
                <h3 className="font-semibold mb-2">{q.titulo}</h3>
                <div className="text-sm text-gray-500 mb-2">
                  Acertos: {q.acertos} | Erros: {q.erros} | Última pontuação: {q.ultimaPontuacao}%
                </div>
                <div className="w-full bg-gray-200 h-3 rounded-full">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: `${perc}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
