"use client";
import React, { useState, useEffect } from "react";
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
  const [aluno] = useState({ username: "EricSaber" });
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
    ];
    setRanking(rankingSimulado);
  }, [aluno.username]);

  if (!progresso) return <div className="min-h-screen flex items-center justify-center text-white">Carregando...</div>;

  const totalQuizzes = progresso.quizzesFeitos.length;
  const totalAcertos = progresso.quizzesFeitos.reduce((sum, q) => sum + q.acertos, 0);
  const totalErros = progresso.quizzesFeitos.reduce((sum, q) => sum + q.erros, 0);

  const materiasMap: { [materia: string]: { acertos: number; erros: number } } = {};
  progresso.quizzesFeitos.forEach((q) => {
    if (!materiasMap[q.materia]) materiasMap[q.materia] = { acertos: 0, erros: 0 };
    materiasMap[q.materia].acertos += q.acertos;
    materiasMap[q.materia].erros += q.erros;
  });

  return (
    <div className="min-h-screen bg-gray-900 p-6 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between bg-gray-800 text-white px-6 py-4 rounded-2xl shadow-2xl mb-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center font-bold text-xl">
            {aluno.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{aluno.username}</h1>
            <p className="text-gray-300 text-sm">Dashboard do aluno</p>
          </div>
        </div>
        <Link
          href="/"
          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-full font-semibold"
        >
          Pesquisa de Quizzes
        </Link>
      </header>

      {/* Estatísticas gerais */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 w-full max-w-4xl">
        <div className="bg-white p-4 rounded-2xl shadow text-center hover:scale-105 transform transition">
          <h2 className="text-gray-500">Total de Quizzes</h2>
          <p className="text-2xl font-bold">{totalQuizzes}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow text-center hover:scale-105 transform transition">
          <h2 className="text-green-600 font-semibold">Total de Acertos</h2>
          <p className="text-2xl font-bold text-green-600">{totalAcertos}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow text-center hover:scale-105 transform transition">
          <h2 className="text-red-600 font-semibold">Total de Erros</h2>
          <p className="text-2xl font-bold text-red-600">{totalErros}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow text-center hover:scale-105 transform transition">
          <h2 className="text-gray-500">Percentual Médio</h2>
          <p className={`text-2xl font-bold ${totalAcertos / (totalAcertos + totalErros) > 0.7 ? "text-green-600" : "text-red-600"}`}>
            {totalQuizzes > 0 ? Math.round((totalAcertos / (totalAcertos + totalErros)) * 100) : 0}%
          </p>
        </div>
      </section>

      {/* Pontuação por matéria */}
      <section className="mb-6 w-full max-w-4xl">
        <h2 className="text-xl font-bold text-white mb-4">Pontuação por Matéria</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(materiasMap).map(([materia, stats]) => {
            const total = stats.acertos + stats.erros;
            const percAcertos = total > 0 ? Math.round((stats.acertos / total) * 100) : 0;
            const percErros = total > 0 ? Math.round((stats.erros / total) * 100) : 0;
            return (
              <div key={materia} className="bg-white p-4 rounded-2xl shadow hover:scale-105 transform transition">
                <h3 className="font-semibold mb-2">{materia}</h3>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-green-600 font-semibold">Acertos: {stats.acertos}</span>
                  <span className="text-red-600 font-semibold">Erros: {stats.erros}</span>
                </div>
                <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                  <div className="h-4 bg-green-500 transition-all" style={{ width: `${percAcertos}%` }} />
                  <div className="h-4 bg-red-500 transition-all absolute" style={{ width: `${percErros}%` }} />
                </div>
                <p className="text-sm mt-1">{percAcertos}% de acerto</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ranking */}
      <section className="mb-6 w-full max-w-4xl">
        <h2 className="text-xl font-bold text-white mb-4">Ranking dos Alunos</h2>
        <div className="bg-white p-4 rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2">Aluno</th>
                <th className="py-2 px-2 text-green-600">Acertos Totais</th>
                <th className="py-2 px-2 text-red-600">Erros Totais</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((a, idx) => {
                const acertosTotais = a.quizzesFeitos.reduce((sum, q) => sum + q.acertos, 0);
                const errosTotais = a.quizzesFeitos.reduce((sum, q) => sum + q.erros, 0);
                return (
                  <tr key={a.username} className={a.username === aluno.username ? "bg-gray-100 font-semibold" : ""}>
                    <td className="py-2 px-2">{idx + 1}</td>
                    <td className="py-2 px-2">{a.username}</td>
                    <td className="py-2 px-2 text-green-600">{acertosTotais}</td>
                    <td className="py-2 px-2 text-red-600">{errosTotais}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
