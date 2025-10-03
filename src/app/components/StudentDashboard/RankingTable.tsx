import React from "react";
import { AlunoProgresso } from "@/app/types/types";

interface RankingTableProps {
  ranking: AlunoProgresso[];
  currentUser: string;
}

export default function RankingTable({ ranking, currentUser }: RankingTableProps) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const calcularStats = (quizzes: typeof ranking[0]["quizzesFeitos"]) => {
    const acertos = quizzes.reduce((sum, q) => sum + q.acertos, 0);
    const erros = quizzes.reduce((sum, q) => sum + q.erros, 0);
    const perc = acertos + erros > 0 ? Math.round((acertos / (acertos + erros)) * 100) : 0;
    return { acertos, erros, perc, totalQuizzes: quizzes.length };
  };

  const filterWithQuizzes = (alunos: AlunoProgresso[], mensal = false) =>
    alunos
      .map((a) => {
        const quizzes = mensal
          ? a.quizzesFeitos.filter((q) => {
              const data = new Date(q.data);
              return data.getMonth() === currentMonth && data.getFullYear() === currentYear;
            })
          : a.quizzesFeitos;
        return { ...a, quizzes };
      })
      .filter((a) => a.quizzes.length > 0);

  const geralRanking = filterWithQuizzes(ranking).sort((a, b) => calcularStats(b.quizzes).perc - calcularStats(a.quizzes).perc);
  const mensalRanking = filterWithQuizzes(ranking, true).sort((a, b) => calcularStats(b.quizzes).perc - calcularStats(a.quizzes).perc);

  const renderRanking = (rank: typeof ranking, title: string) => {
    if (rank.length === 0) return null; // Se não houver ninguém, não mostra nada

    return (
      <section className="mb-6 w-full max-w-4xl overflow-x-auto">
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
        <table className="w-full text-left text-white min-w-[500px] sm:min-w-full">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="py-2 px-2">#</th>
              <th className="py-2 px-2">Aluno</th>
              <th className="py-2 px-2">Percentual Médio</th>
              <th className="py-2 px-2">Quizzes Feitos</th>
            </tr>
          </thead>
          <tbody>
            {rank.map((a, idx) => {
              const { perc, totalQuizzes } = calcularStats(a.quizzesFeitos);

              return (
                <tr
                  key={a.username}
                  className={a.username === currentUser ? "bg-gray-700" : ""}
                >
                  <td className="py-2 px-2">{idx + 1}</td>
                  <td className="py-2 px-2 truncate max-w-[150px]">{a.username}</td>
                  <td className="py-2 px-2">{perc}%</td>
                  <td className="py-2 px-2">{totalQuizzes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    );
  };

  return (
    <>
      {renderRanking(geralRanking, "Ranking Geral")}
      {renderRanking(mensalRanking, "Ranking Mensal")}
    </>
  );
}
