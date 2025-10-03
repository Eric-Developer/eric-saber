import React from "react";

interface Props {
  students: any[];
  ranking: any[];
  latestQuizzes: any[];
}

export default function DashboardStats({ students, ranking, latestQuizzes }: Props) {
  return (
    <section className="mt-17 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 w-full max-w-6xl">
      <div className="bg-gray-800 p-4 rounded-2xl shadow text-center">
        <h2 className="text-gray-300 text-sm sm:text-base">Total Students</h2>
        <p className="text-2xl font-bold text-white">{students.length}</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-2xl shadow text-center">
        <h2 className="text-gray-300 text-sm sm:text-base">Total Quizzes</h2>
        <p className="text-2xl font-bold text-white">{latestQuizzes.length}</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-2xl shadow text-center">
        <h2 className="text-gray-300 text-sm sm:text-base">Total Correct</h2>
        <p className="text-2xl font-bold text-white">
          {ranking.reduce(
            (sum, student) =>
              sum +
              student.quizzesTaken.reduce((s: number, q: any) => s + q.correct, 0),
            0
          )}
        </p>
      </div>
      <div className="bg-gray-800 p-4 rounded-2xl shadow text-center">
        <h2 className="text-gray-300 text-sm sm:text-base">Total Wrong</h2>
        <p className="text-2xl font-bold text-white">
          {ranking.reduce(
            (sum, student) =>
              sum +
              student.quizzesTaken.reduce((s: number, q: any) => s + q.wrong, 0),
            0
          )}
        </p>
      </div>
    </section>
  );
}
