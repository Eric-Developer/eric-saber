import React from "react";

interface QuizProgress {
  title: string;
  subject: string;
  correct: number;
  wrong: number;
  lastScore: number;
}

interface StudentProgress {
  username: string;
  quizzesTaken: QuizProgress[];
}

interface Props {
  ranking: StudentProgress[];
}

export default function RankingTable({ ranking }: Props) {
  return (
    <section className="mb-6 w-full max-w-6xl overflow-x-auto">
      <h2 className="text-xl font-bold text-white mb-4">Class Ranking</h2>
      <table className="w-full text-left text-white min-w-[500px] sm:min-w-full">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="py-2 px-2">#</th>
            <th className="py-2 px-2">Student</th>
            <th className="py-2 px-2">Quizzes Taken</th>
            <th className="py-2 px-2">Average Accuracy</th>
            <th className="py-2 px-2">Last Score</th>
          </tr>
        </thead>
        <tbody>
          {ranking
            .sort((a, b) => {
              const percA =
                a.quizzesTaken.reduce((s, q) => s + q.correct, 0) /
                a.quizzesTaken.reduce((s, q) => s + q.correct + q.wrong, 1);
              const percB =
                b.quizzesTaken.reduce((s, q) => s + q.correct, 0) /
                b.quizzesTaken.reduce((s, q) => s + q.correct + q.wrong, 1);
              return percB - percA;
            })
            .map((student, idx) => {
              const totalCorrect = student.quizzesTaken.reduce((s, q) => s + q.correct, 0);
              const totalWrong = student.quizzesTaken.reduce((s, q) => s + q.wrong, 0);
              const last = student.quizzesTaken[student.quizzesTaken.length - 1]?.lastScore || 0;
              const percentage =
                totalCorrect + totalWrong > 0
                  ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
                  : 0;

              return (
                <tr
                  key={student.username}
                  className={idx === 0 ? "bg-green-600" : ""}
                >
                  <td className="py-2 px-2">{idx + 1}</td>
                  <td className="py-2 px-2 truncate max-w-[150px]">
                    {student.username}
                  </td>
                  <td className="py-2 px-2">{student.quizzesTaken.length}</td>
                  <td className="py-2 px-2">{percentage}%</td>
                  <td className="py-2 px-2">{last}%</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </section>
  );
}
