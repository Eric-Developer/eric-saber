interface QuizProgresso {
  titulo: string;
  materia: string;
  acertos: number;
  erros: number;
  ultimaPontuacao: number;
}

interface SubjectsProgressProps {
  quizzesFeitos: QuizProgresso[];
}

export default function SubjectsProgress({ quizzesFeitos }: SubjectsProgressProps) {
  const materiasMap: Record<string, { acertos: number; erros: number }> = {};

  quizzesFeitos.forEach((q: QuizProgresso) => {
    if (!materiasMap[q.materia]) materiasMap[q.materia] = { acertos: 0, erros: 0 };
    materiasMap[q.materia].acertos += q.acertos;
    materiasMap[q.materia].erros += q.erros;
  });

  return (
    <section className="mb-6 w-full max-w-4xl">
      <h2 className="text-xl font-bold text-white mb-4">Pontuação por Matéria</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(materiasMap).map(([materia, stats]) => {
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
              <p className="text-gray-400 text-sm mt-1">{perc}% de acerto</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
