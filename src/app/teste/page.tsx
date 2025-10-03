"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Header from "../components/Header";
import LoadingOverlay from "../components/LoadingOverlay";

// professor components
import DashboardStats from "../components/TeacherDashboard/DashboardStats";
import SubjectPerformance from "../components/TeacherDashboard/SubjectPerformance";
import RankingTable from "../components/TeacherDashboard/RankingTable";
import LatestQuizzes from "../components/TeacherDashboard/LatestQuizzes";
import TeacherActions from "../components/TeacherDashboard/TeacherActions";
import CreateClassModal from "../components/TeacherDashboard/CreateClassModal";
import SendActivityModal from "../components/TeacherDashboard/SendActivityModal";

interface Quiz {
  id: number;
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

interface QuizProgress {
  title: string;
  subject: string;
  correct: number;
  wrong: number;
  lastScore: number;
}

interface StudentProgress {
  username: string;
  email?: string;
  quizzesTaken: QuizProgress[];
}

export default function ProfessorDashboard() {
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<StudentProgress[]>([]);
  const [subjectStats, setSubjectStats] = useState<
    Record<string, { correct: number; wrong: number }>
  >({});
  const [latestQuizzes, setLatestQuizzes] = useState<QuizResult[]>([]);
  const [students, setStudents] = useState<StudentProgress[]>([]);

  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showSendActivityModal, setShowSendActivityModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: results, error } = await supabase
          .from("QuizResultado")
          .select("*, Quiz(id, titulo, materia)");

        if (error) throw error;

        // Build ranking
        const rankingMap: Record<string, QuizProgress[]> = {};
        results?.forEach((r: any) => {
          const uname = r.username || `ID:${r.quiz_id}`;
          if (!rankingMap[uname]) rankingMap[uname] = [];
          rankingMap[uname].push({
            title: r.Quiz?.titulo || "",
            subject: r.Quiz?.materia || "",
            correct: r.acertos,
            wrong: r.erros,
            lastScore: r.pontuacao,
          });
        });

        const rankingArray: StudentProgress[] = Object.entries(rankingMap).map(
          ([username, quizzesTaken]) => ({
            username,
            quizzesTaken,
          })
        );

        setRanking(rankingArray);

        // Build subject stats
        const subjectMap: Record<string, { correct: number; wrong: number }> = {};
        results?.forEach((r: any) => {
          const subj = r.Quiz?.materia || "No subject";
          if (!subjectMap[subj]) subjectMap[subj] = { correct: 0, wrong: 0 };
          subjectMap[subj].correct += r.acertos;
          subjectMap[subj].wrong += r.erros;
        });
        setSubjectStats(subjectMap);

        // Latest quizzes
        const latest = results
          ?.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 10);
        setLatestQuizzes(latest || []);

        setStudents(rankingArray);
      } catch (err) {
        console.error("Error loading professor dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <LoadingOverlay />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 flex flex-col items-center">
      <Header />

      {/* Main stats */}
      <DashboardStats
        students={students}
        ranking={ranking}
        latestQuizzes={latestQuizzes}
      />

      {/* Performance by subject */}
      <SubjectPerformance subjectStats={subjectStats} />

      {/* Ranking */}
      <RankingTable ranking={ranking} />

      {/* Latest quizzes */}
      <LatestQuizzes latestQuizzes={latestQuizzes} />

      {/* Teacher actions */}
      <TeacherActions
        onCreateClass={() => setShowCreateClassModal(true)}
        onSendActivity={() => setShowSendActivityModal(true)}
      />

      {/* Modals */}
      {showCreateClassModal && (
        <CreateClassModal onClose={() => setShowCreateClassModal(false)} />
      )}
      {showSendActivityModal && (
        <SendActivityModal onClose={() => setShowSendActivityModal(false)} />
      )}
    </div>
  );
}
