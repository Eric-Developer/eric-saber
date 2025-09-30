import React from "react";
import { AlunoProgresso } from "@/app/types/types";

interface RankingTableProps {
  ranking: AlunoProgresso[];
  currentUser: string;
}

export default function RankingTable({ ranking, currentUser }: RankingTableProps) {
  const sortedRanking = [...ranking].sort((a, b) => {
    const acertosA = a.quizzesFeitos.reduce((sum, q) => sum + q.acertos, 0);
    const errosA = a.quizzesFeitos.reduce((sum, q) => sum + q.erros, 0);
    const percA = acertosA + errosA > 0 ? acertosA / (acertosA + errosA) : 0;

    const acertosB = b.quizzesFeitos.reduce((sum, q) => sum + q.acertos, 0);
    const errosB = b.quizzesFeitos.reduce((sum, q) => sum + q.erros, 0);
    const percB = acertosB + errosB > 0 ? acertosB / (acertosB + errosB) : 0;

    return percB - percA; 
  });

  return (
    <section className="mb-6 w-full max-w-4xl overflow-x-auto">
      <h2 className="text-xl font-bold text-white mb-4">Ranking dos Alunos</h2>
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
          {sortedRanking.map((a, idx) => {
            const acertos = a.quizzesFeitos.reduce((sum, q) => sum + q.acertos, 0);
            const erros = a.quizzesFeitos.reduce((sum, q) => sum + q.erros, 0);
            const perc = acertos + erros > 0 ? Math.round((acertos / (acertos + erros)) * 100) : 0;

            return (
              <tr
                key={a.username}
                className={a.username === currentUser ? "bg-gray-700" : ""}
              >
                <td className="py-2 px-2">{idx + 1}</td>
                <td className="py-2 px-2 truncate max-w-[150px]">{a.username}</td>
                <td className="py-2 px-2">{perc}%</td>
                <td className="py-2 px-2">{a.quizzesFeitos.length}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
