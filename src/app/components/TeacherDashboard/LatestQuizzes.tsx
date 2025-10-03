import React from "react";

interface Quiz {
  title: string;
  subject: string;
}

interface QuizResult {
  quiz_id: number;
  correct: number;
  wrong: number;
  score: number;
  username: string;
  Quiz: Quiz;
  created_at: string;
}

interface Props {
  latestQuizzes: QuizResult[];
}

export default function LatestQuizzes({ latestQuizzes }: Props) {
  return (
    <section className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {latestQuizzes.map((quiz, idx) => {
        const total = quiz.correct + quiz.wrong;
        const percentage = total > 0 ? Math.round((quiz.correct / total) * 100) : 0;

        return (
          <div key={idx} className="bg-gray-800 p-4 rounded-2xl shadow">
            <h3 className="font-semibold text-white mb-2 truncate">{quiz.Quiz?.title}</h3>
            <div className="text-gray-300 mb-2 text-sm">
              Student: {quiz.username} | Correct: {quiz.correct} | Wrong: {quiz.wrong} | Score: {quiz.score}%
            </div>
            <div className="w-full bg-gray-700 h-3 rounded-full">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}
