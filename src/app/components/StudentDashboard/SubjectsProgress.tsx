interface QuizProgresso {
  titulo: string;
  tema: string; 
  acertos: number;
  erros: number;
  ultimaPontuacao: number;
}

interface TemaPontuacao {
  tema: string;
  acertos: number;
  erros: number;
  total: number;
  perc: number;
}

interface SubjectsProgressProps {
  quizzesFeitos: QuizProgresso[];
}

// Função para agregar quizzes por tema
function agruparPorTema(quizzesFeitos: QuizProgresso[]): TemaPontuacao[] {
  const temasMap: Record<string, { acertos: number; erros: number }> = {};

  quizzesFeitos.forEach(q => {
    if (!temasMap[q.tema]) temasMap[q.tema] = { acertos: 0, erros: 0 };
    temasMap[q.tema].acertos += q.acertos;
    temasMap[q.tema].erros += q.erros;
  });

  return Object.entries(temasMap).map(([tema, stats]) => {
    const total = stats.acertos + stats.erros;
    return {
      tema,
      acertos: stats.acertos,
      erros: stats.erros,
      total,
      perc: total > 0 ? Math.round((stats.acertos / total) * 100) : 0,
    };
  });
}

export default function SubjectsProgress({ quizzesFeitos }: SubjectsProgressProps) {
  const pontuacaoPorTema = agruparPorTema(quizzesFeitos);

  return (
    <section className="mb-6 w-full max-w-4xl">
      <h2 className="text-xl font-bold text-white mb-4">Pontuação por Tema</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pontuacaoPorTema.map(({ tema, acertos, erros, perc }) => (
          <div key={tema} className="bg-gray-800 p-4 rounded-2xl shadow">
            <h3 className="font-semibold text-white mb-2 truncate">{tema}</h3>
            <div className="text-gray-300 mb-2 text-sm">
              Acertos: {acertos} | Erros: {erros}
            </div>
            <div className="w-full bg-gray-700 h-3 rounded-full">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: `${perc}%` }} />
            </div>
            <p className="text-gray-400 text-sm mt-1">{perc}% de acerto</p>
          </div>
        ))}
      </div>
    </section>
  );
}
