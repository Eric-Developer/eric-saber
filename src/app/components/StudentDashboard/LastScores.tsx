interface QuizProgresso {
  titulo: string;
  materia: string;
  acertos: number;
  erros: number;
  ultimaPontuacao: number;
}

interface LastScoresProps {
  quizzesFeitos: QuizProgresso[];
}

export default function LastScores({ quizzesFeitos }: LastScoresProps) {
  return (
    <section className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {quizzesFeitos.map((q, idx) => {
        const total = q.acertos + q.erros;
        const perc = total > 0 ? Math.round((q.acertos / total) * 100) : 0;
        return (
          <div key={idx} className="bg-gray-800 p-4 rounded-2xl shadow">
            <h3 className="font-semibold text-white mb-2 truncate">{q.titulo}</h3>
            <div className="text-gray-300 mb-2 text-sm">
              Acertos: {q.acertos} | Erros: {q.erros} | Última pontuação: {q.ultimaPontuacao}%
            </div>
            <div className="w-full bg-gray-700 h-3 rounded-full">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: `${perc}%` }} />
            </div>
          </div>
        );
      })}
    </section>
  );
}
