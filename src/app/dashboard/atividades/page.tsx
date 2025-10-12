"use client";
import React, { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import { Activity, UserData, Resposta } from "@/app/types/types";
import { CreateActivity } from "@/app/components/Activities/CreateActivity";
import { ActivityList } from "@/app/components/Activities/ActivityList";
import { ActivityModal } from "@/app/components/Activities/ActivityModal";
import { useAuth } from "@/app/hooks/useAuth";
import { supabase } from "@/app/lib/supabaseClient";

export default function ActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [responses, setResponses] = useState<Resposta[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [users, setUsers] = useState<Record<string, UserData>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userClasses, setUserClasses] = useState<any[]>([]);

  // Buscar turmas do usuário
  useEffect(() => {
    if (!user?.id) return;
    const fetchClasses = async () => {
      if (user.type === "student") {
        const { data } = await supabase
          .from("ClassStudents")
          .select("class_id")
          .eq("student_id", user.id);
        setUserClasses(data?.map((c: any) => c.class_id) || []);
      } else if (user.type === "teacher") {
        const { data } = await supabase
          .from("Class")
          .select("id, nome")
          .eq("professor_id", user.auth_id);
        setUserClasses(data || []);
      }
    };
    fetchClasses();
  }, [user]);

  // Buscar atividades das turmas do usuário
  useEffect(() => {
    if (!user?.id || userClasses.length === 0) return;
    const fetchActivities = async () => {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .in("class_id", userClasses.map((c: any) => c.id || c))
        .order("created_at", { ascending: false });

      // filtra atividades únicas por título e turma
      const unique = data?.filter(
        (v, i, arr) => arr.findIndex((x) => x.class_id === v.class_id && x.title === v.title) === i
      );
      setActivities(unique || []);
      setLoading(false);
    };
    fetchActivities();
  }, [user, userClasses]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
      Carregando atividades...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <div className="max-w-5xl mx-auto p-6 pt-24">
        <h1 className="text-4xl font-bold mb-10 text-center text-blue-400">📘 Atividades</h1>

        {/* Criar atividade apenas para professores */}
        {user?.type === "teacher" && (
          <CreateActivity user={user} userClasses={userClasses} setActivities={setActivities} />
        )}

        {/* Lista de atividades */}
        <ActivityList
          activities={activities}
          setSelectedActivity={setSelectedActivity}
          setModalOpen={setModalOpen}
          setResponses={setResponses}
          setUsers={setUsers}
        />

        {/* Modal da atividade */}
        {modalOpen && selectedActivity && (
          <ActivityModal
            activity={selectedActivity}
            setModalOpen={setModalOpen}
            responses={responses}
            setResponses={setResponses}
            users={users}
            setUsers={setUsers}
            user={user} // ✅ importante para enviar respostas
          />
        )}
      </div>
    </div>
  );
}
