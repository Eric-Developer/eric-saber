"use client";
import React from "react";
import { Activity,UserData,Resposta } from "@/app/types/types";
import { supabase } from "@/app/lib/supabaseClient";

interface Props {
  activities: Activity[];
  setSelectedActivity: React.Dispatch<React.SetStateAction<Activity | null>>;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setResponses: React.Dispatch<React.SetStateAction<Resposta[]>>;
  setUsers: React.Dispatch<React.SetStateAction<Record<string, UserData>>>;
}

export function ActivityList({ activities, setSelectedActivity, setModalOpen, setResponses, setUsers }: Props) {
  const openModal = async (activity: Activity) => {
    setSelectedActivity(activity);
    setModalOpen(true);

    const { data: responsesData } = await supabase
      .from("respostas_atividade")
      .select("*")
      .eq("atividade_id", activity.id)
      .order("enviada_em", { ascending: true });
    setResponses(responsesData || []);

    const userIds = Array.from(new Set(responsesData?.map((r: any) => r.autor_id)));
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("User")
        .select("auth_id, username, avatar_url, type")
        .in("auth_id", userIds);
      const map: Record<string, UserData> = {};
      users?.forEach((u) => (map[u.auth_id] = u));
      setUsers(map);
    }
  };

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {activities.length === 0 ? (
        <p className="text-gray-400 text-center w-full">No activities available.</p>
      ) : (
        activities.map((a) => (
          <div key={a.id} onClick={() => openModal(a)} className="bg-gray-900 border border-gray-800 p-5 rounded-xl hover:border-blue-500 transition cursor-pointer shadow-md hover:shadow-lg">
            <h3 className="font-semibold text-lg text-white mb-1">{a.title}</h3>
            <p className="text-gray-400 text-sm">{a.subject} • {a.type}</p>
            <p className="text-gray-300 text-sm mt-2 line-clamp-3">{a.description}</p>
          </div>
        ))
      )}
    </div>
  );
}
