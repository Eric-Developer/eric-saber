"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useAuth } from "@/app/hooks/useAuth";
import Header from "../Header";
import LoadingOverlay from "../LoadingOverlay";
import UserCard from "./UserCard";
import StatsSection from "./StatsSection";
import SubjectsProgress from "./SubjectsProgress";
import RankingTable from "./RankingTable";
import LastScores from "./LastScores";
import { QuizProgresso, AlunoProgresso } from "@/app/types/types";

export default function AlunoDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [progresso, setProgresso] = useState<AlunoProgresso | null>(null);
  const [ranking, setRanking] = useState<AlunoProgresso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.username) return;

        // 🔹 Resultados do usuário atual
        const { data: resultados, error } = await supabase
          .from("QuizResultado")
          .select(`
            quiz_id,
            acertos,
            erros,
            pontuacao,
            created_at,
            Quiz(id, titulo, tema, materia)
          `)
          .eq("username", user.username);

        if (error) throw error;

  const quizzesFeitos: QuizProgresso[] = resultados?.map(r => {
  const quizObj = Array.isArray(r.Quiz) ? r.Quiz[0] : r.Quiz; 
  return {
    titulo: quizObj?.titulo || "Sem Título",
    tema: quizObj?.tema || "Sem Tema",
    materia: quizObj?.materia || "Sem Matéria",
    acertos: r.acertos,
    erros: r.erros,
    ultimaPontuacao: r.pontuacao,
    data: r.created_at || new Date().toISOString(),
  };
}) || [];


        setProgresso({ username: user.username, quizzesFeitos });

        const { data: todosResultados, error: errRanking } = await supabase
          .from("QuizResultado")
          .select(`
            quiz_id,
            acertos,
            erros,
            pontuacao,
            user_id,
            created_at,
            username,
            Quiz(id, titulo, tema, materia)
          `);
        if (errRanking) throw errRanking;

        const todosResultadosMapeados = todosResultados?.map(r => ({
          ...r,
          Quiz: Array.isArray(r.Quiz) ? r.Quiz[0] : r.Quiz, 
        })) || [];

        const rankingMap: Record<string, QuizProgresso[]> = {};
        todosResultadosMapeados.forEach(r => {
          const uname = r.username?.trim() || `Usuário ${r.user_id}`;
          if (!rankingMap[uname]) rankingMap[uname] = [];
          rankingMap[uname].push({
            titulo: r.Quiz ? r.Quiz.titulo : "Sem Título",
            tema: r.Quiz ? r.Quiz.tema : "Sem Tema",
            materia: r.Quiz ? r.Quiz.materia : "Sem Matéria",
            acertos: r.acertos,
            erros: r.erros,
            ultimaPontuacao: r.pontuacao,
            data: r.created_at || new Date().toISOString(),
          });
        });

        const rankingArray: AlunoProgresso[] = Object.entries(rankingMap).map(
          ([username, quizzesFeitos]) => ({ username, quizzesFeitos })
        );

        setRanking(rankingArray);

      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetchData();
  }, [user, authLoading]);

  if (authLoading || loading) return <LoadingOverlayFull />;
  if (!progresso) return <NoProgressFound />;

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 flex flex-col items-center">
      <Header />
      <UserCard user={user} />
      <StatsSection quizzesFeitos={progresso.quizzesFeitos} />
      <SubjectsProgress quizzesFeitos={progresso.quizzesFeitos} />
      <LastScores quizzesFeitos={progresso.quizzesFeitos} />
        <RankingTable ranking={ranking} currentUser={user?.username || ""} />
        
    </div>
  );
}

function LoadingOverlayFull() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <LoadingOverlay />
    </div>
  );
}

function NoProgressFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Nenhum progresso encontrado
    </div>
  );
}
