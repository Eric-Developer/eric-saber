
import { QuizProgresso } from "@/app/types/types";


interface StatsProps {
  quizzesFeitos: QuizProgresso[];
}

export default function StatsSection({ quizzesFeitos }: StatsProps) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyQuizzes = quizzesFeitos.filter((q) => {
    const quizDate = new Date(q.data);
    return quizDate.getMonth() === currentMonth && quizDate.getFullYear() === currentYear;
  });

  const calcTotals = (quizzes: QuizProgresso[]) => {
    const totalQuizzes = quizzes.length;
    const totalAcertos = quizzes.reduce((sum: number, q: QuizProgresso) => sum + q.acertos, 0);
    const totalErros = quizzes.reduce((sum: number, q: QuizProgresso) => sum + q.erros, 0);
    const percMedio =
      totalAcertos + totalErros > 0 ? Math.round((totalAcertos / (totalAcertos + totalErros)) * 100) : 0;

    return { totalQuizzes, totalAcertos, totalErros, percMedio };
  };

  const generalStats = calcTotals(quizzesFeitos);
  const monthlyStats = calcTotals(monthlyQuizzes);

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 w-full max-w-4xl">
      <StatCard title="Total de Quizzes (Geral)" value={generalStats.totalQuizzes} />
      <StatCard title="Total de Acertos (Geral)" value={generalStats.totalAcertos} />
      <StatCard title="Total de Erros (Geral)" value={generalStats.totalErros} />
      <StatCard title="Percentual Médio (Geral)" value={`${generalStats.percMedio}%`} />

      <StatCard title="Total de Quizzes (Mês)" value={monthlyStats.totalQuizzes} />
      <StatCard title="Total de Acertos (Mês)" value={monthlyStats.totalAcertos} />
      <StatCard title="Total de Erros (Mês)" value={monthlyStats.totalErros} />
      <StatCard title="Percentual Médio (Mês)" value={`${monthlyStats.percMedio}%`} />
    </section>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow text-center">
      <h2 className="text-gray-300 text-sm sm:text-base">{title}</h2>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
