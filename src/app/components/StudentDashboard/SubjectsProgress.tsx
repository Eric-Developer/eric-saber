interface QuizProgresso {
  titulo: string;
  materia: string; 
  acertos: number;
  erros: number;
  ultimaPontuacao: number;
}

interface MateriaPontuacao {
  materia: string;
  acertos: number;
  erros: number;
  total: number;
  perc: number;
}

interface SubjectsProgressProps {
  quizzesFeitos: QuizProgresso[];
}

// Função para remover acentos
function removerAcentos(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Função para gerar chave consistente para o mapa
function chaveMateria(materia: string) {
  return removerAcentos(materia.replace(/\s+/g, ' ').trim().toLowerCase());
}

// Função para exibir o nome da matéria formatado
function normalizarMateria(materia: string) {
  const cleaned = materia.replace(/\s+/g, ' ').trim().toLowerCase();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// Função para agregar quizzes por matéria
function agruparPorMateria(quizzesFeitos: QuizProgresso[]): MateriaPontuacao[] {
  const materiasMap: Record<string, { acertos: number; erros: number }> = {};

  quizzesFeitos.forEach(q => {
    const key = chaveMateria(q.materia); // chave consistente sem acentos e espaços extras
    if (!materiasMap[key]) materiasMap[key] = { acertos: 0, erros: 0 };
    materiasMap[key].acertos += q.acertos;
    materiasMap[key].erros += q.erros;
  });

  // Converte para array e ordena pelo total de quizzes (descendente)
  return Object.entries(materiasMap)
    .map(([key, stats]) => {
      const total = stats.acertos + stats.erros;
      return {
        materia: normalizarMateria(key),
        acertos: stats.acertos,
        erros: stats.erros,
        total,
        perc: total > 0 ? Math.round((stats.acertos / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total); // maior total primeiro
}

export default function SubjectsProgress({ quizzesFeitos }: SubjectsProgressProps) {
  const pontuacaoPorMateria = agruparPorMateria(quizzesFeitos);

  if (!pontuacaoPorMateria || pontuacaoPorMateria.length === 0) return null;

  return (
    <section className="mb-6 w-full max-w-4xl">
      <h2 className="text-xl font-bold text-white mb-4">Pontuação por Matéria</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pontuacaoPorMateria.map(({ materia, acertos, erros, perc, total }) => (
          <div
            key={materia}
            className="bg-gray-800 p-4 rounded-2xl shadow hover:scale-105 transition-transform duration-200"
          >
            <h3 className="font-semibold text-white mb-2 truncate">
              {materia} ({total})
            </h3>
            <div className="text-gray-300 mb-2 text-sm">
              Acertos: {acertos} | Erros: {erros}
            </div>
            <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${perc}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm mt-1">{perc}% de acerto</p>
          </div>
        ))}
      </div>
    </section>
  );
}
