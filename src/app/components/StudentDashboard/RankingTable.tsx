"use client";
import React from "react";
import { AlunoProgresso } from "@/app/types/types";

interface RankingTableProps {
  ranking: AlunoProgresso[];
  currentUser: string;
}

export default function RankingTable({ ranking, currentUser }: RankingTableProps) {
  const calcularStats = (
    quizzes: { acertos: number; erros: number; data: string }[]
  ) => {
    const acertos = quizzes.reduce((sum, q) => sum + q.acertos, 0);
    const erros = quizzes.reduce((sum, q) => sum + q.erros, 0);
    const perc =
      acertos + erros > 0 ? Math.round((acertos / (acertos + erros)) * 100) : 0;

    const hoje = new Date();
    const quizzesMensais = quizzes.filter(q => {
      const d = new Date(q.data);
      return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
    });

    return { perc, totalQuizzes: quizzes.length, quizzesMensais: quizzesMensais.length, quizzesMensaisArray: quizzesMensais };
  };

  const geralRanking = ranking
    .filter(a => a.quizzesFeitos && a.quizzesFeitos.length > 0)
    .sort((a, b) => calcularStats(b.quizzesFeitos).perc - calcularStats(a.quizzesFeitos).perc);

  const mensalRanking = ranking
    .filter(a => a.quizzesFeitos && calcularStats(a.quizzesFeitos).quizzesMensais > 0)
    .sort((a, b) => calcularStats(b.quizzesFeitos).perc - calcularStats(a.quizzesFeitos).perc);

  const medalhas = ["🥇", "🥈", "🥉"];

  const renderRanking = (rankingData: typeof ranking, title: string, mensal: boolean = false) => (
    <section className="w-full max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-4xl font-extrabold text-center text-white mb-8 tracking-wide">
        {mensal ? "📅 Ranking Mensal" : "🏆 Ranking Geral"}
      </h2>

      <div className="flex flex-col gap-4">
        {rankingData.map((a, idx) => {
          const { perc, totalQuizzes, quizzesMensais } = calcularStats(a.quizzesFeitos);
          const isCurrentUser = a.username === currentUser;
          const medalha = idx < 3 ? medalhas[idx] : "";

          return (
            <div
              key={a.username}
              className={`flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl 
                shadow-lg transition-all transform hover:scale-[1.02] ${
                  isCurrentUser ? "border-2 border-yellow-400 bg-gray-900" : "bg-gray-800"
                }`}
            >
              {/* Posição e medalha */}
              <div className="flex items-center gap-2 mb-2 sm:mb-0 text-white">
                {medalha && <span className="text-3xl">{medalha}</span>}
                <span className="font-semibold text-lg">{idx + 1}</span>
              </div>

              {/* Nome do aluno */}
              <div className="flex items-center gap-2 mb-2 sm:mb-0 text-white truncate max-w-[180px]">
                {isCurrentUser && <span className="text-blue-400 animate-bounce">👤</span>}
                <span className="font-medium">{a.username}</span>
              </div>

              {/* Percentual médio */}
              <div className="flex flex-col items-center mb-2 sm:mb-0 w-32">
                <span className="text-sm font-semibold text-gray-300 mb-1">Percentual</span>
                <span className="text-lg font-bold text-white mb-1">{perc}%</span>
                <div className="bg-gray-700 w-full h-4 rounded-full overflow-hidden">
                  <div
                    className="h-4 rounded-full bg-gradient-to-r from-green-400 to-blue-500 transition-all"
                    style={{ width: `${perc}%` }}
                  ></div>
                </div>
              </div>

              {/* Total de quizzes */}
              <div className="flex flex-col items-center mb-2 sm:mb-0 w-32">
                <span className="text-sm font-semibold text-gray-300 mb-1">
                  Quizzes {mensal ? "Mensais" : "Totais"}
                </span>
                <span className="text-lg font-bold text-white">
                  {mensal ? quizzesMensais : totalQuizzes}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <>
      {renderRanking(geralRanking, "🏆 Ranking Geral")}
      {renderRanking(mensalRanking, "📅 Ranking Mensal", true)}
    </>
  );
}
