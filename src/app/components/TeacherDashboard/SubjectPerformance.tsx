import React from "react";

interface SubjectStats {
  [subject: string]: {
    correct: number;
    wrong: number;
  };
}

interface Props {
  subjectStats: SubjectStats;
}

export default function SubjectPerformance({ subjectStats }: Props) {
  return (
    <section className="mb-6 w-full max-w-6xl">
      <h2 className="text-xl font-bold text-white mb-4">Performance by Subject</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(subjectStats).map(([subject, stats]) => {
          const total = stats.correct + stats.wrong;
          const percentage = total > 0 ? Math.round((stats.correct / total) * 100) : 0;

          return (
            <div key={subject} className="bg-gray-800 p-4 rounded-2xl shadow">
              <h3 className="font-semibold text-white mb-2 truncate">{subject}</h3>
              <div className="text-gray-300 mb-2 text-sm">
                Correct: {stats.correct} | Wrong: {stats.wrong}
              </div>
              <div className="w-full bg-gray-700 h-3 rounded-full">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm mt-1">{percentage}% average accuracy</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
