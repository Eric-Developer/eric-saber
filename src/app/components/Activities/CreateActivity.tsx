"use client";
import React, { useState } from "react";
import { Activity, UserData } from "@/app/types/types";
import { supabase } from "@/app/lib/supabaseClient";

interface Props {
  user: UserData;
  userClasses: any[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
}

export function CreateActivity({ user, userClasses, setActivities }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("atividade");
  const [subject, setSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const handleSendActivity = async () => {
    if (!title || !description) return alert("Preencha todos os campos!");
    let classId = selectedClass;
    if (user.type === "student") classId = userClasses[0];
    if (!classId) return alert("Selecione uma turma.");

    const { error } = await supabase.from("activities").insert([
      {
        creator_id: user.id,
        class_id: classId,
        title,
        description,
        type,
        subject,
        status: "pendente",
      },
    ]);

    if (error) {
      console.error("Erro ao criar atividade:", error);
      alert("Erro ao criar atividade!");
    } else {
      const newActivity: Activity = {
        id: crypto.randomUUID(),
        creator_id: user.auth_id,
        class_id: classId,
        title,
        description,
        type,
        subject,
      };
      setActivities((prev) => [newActivity, ...prev]);
      setTitle("");
      setDescription("");
      setSubject("");
      setType("atividade");
      setSelectedClass(null);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg mb-10">
      <h2 className="text-2xl font-semibold mb-4 text-blue-300">✏️ Criar Nova Atividade</h2>
      <select value={selectedClass || ""} onChange={(e) => setSelectedClass(e.target.value)} className="w-full mb-3 p-3 rounded-lg bg-gray-800 border border-gray-700">
        <option value="">Selecione uma turma</option>
        {userClasses.map((c: any) => (<option key={c.id} value={c.id}>{c.nome || c.id}</option>))}
      </select>
      <input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mb-3 p-3 rounded-lg bg-gray-800 border border-gray-700" />
      <input placeholder="Matéria" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full mb-3 p-3 rounded-lg bg-gray-800 border border-gray-700" />
      <textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full mb-3 p-3 rounded-lg bg-gray-800 border border-gray-700" />
      <button onClick={handleSendActivity} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all">Enviar Atividade</button>
    </div>
  );
}
