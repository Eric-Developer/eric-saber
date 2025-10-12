"use client";
import React, { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import jsPDF from "jspdf";

interface Props {
  activity: any;
  setModalOpen: any;
  responses: any;
  setResponses: any;
  users: any;
  setUsers: any;
  user: any;
}

export function ActivityModal({ activity, setModalOpen, responses, setResponses, users, setUsers, user }: Props) {
  const [tab, setTab] = useState<any>("respostas");
  const [qaPairs, setQaPairs] = useState<any>([{ pergunta: "", resposta: "" }]);
  const [mensagem, setMensagem] = useState<any>("");

  const DefaultIcon = () => (
    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 text-lg font-bold">?</div>
  );

  const atualizarQAPair = (index: any, campo: any, valor: any) => {
    const novas = [...qaPairs];
    novas[index][campo] = valor;
    setQaPairs(novas);
  };

  const adicionarQAPair = () => setQaPairs([...qaPairs, { pergunta: "", resposta: "" }]);

  const enviarQAPairs = async () => {
    if (!qaPairs.length || !user) return;

    const textoFinal = qaPairs
      .map((p: any, i: any) => `Pergunta ${i + 1}: ${p.pergunta}\nResposta ${i + 1}: ${p.resposta}`)
      .join("\n\n");

    const { error } = await supabase
      .from("respostas_atividade")
      .insert([{ atividade_id: activity.id, autor_id: user.auth_id, texto: textoFinal, tipo: "qa" }]);

    if (error) {
      console.error("Erro ao enviar respostas QA:", error);
      alert("Erro ao enviar respostas!");
      return;
    }

    setResponses([...responses, { id: crypto.randomUUID(), autor_id: user.auth_id, texto: textoFinal, tipo: "qa" }]);
    setQaPairs([{ pergunta: "", resposta: "" }]);
  };

  const enviarMensagem = async () => {
    if (!mensagem || !user) return;

    const { error } = await supabase
      .from("respostas_atividade")
      .insert([{ atividade_id: activity.id, autor_id: user.auth_id, texto: mensagem, tipo: "mensagem" }]);

    if (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert("Erro ao enviar mensagem!");
      return;
    }

    setResponses([...responses, { id: crypto.randomUUID(), autor_id: user.auth_id, texto: mensagem, tipo: "mensagem" }]);
    setMensagem("");
  };

  const gerarPDFAtual = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Atividade: ${activity.title}`, 10, 20);
    doc.setFontSize(12);

    qaPairs.forEach((p: any, i: any) => {
      const y = 30 + i * 20;
      doc.text(`Pergunta ${i + 1}: ${p.pergunta}`, 10, y);
      doc.text(`Resposta ${i + 1}: ${p.resposta}`, 10, y + 8);
    });

    if (mensagem) {
      const startY = 30 + qaPairs.length * 20 + 10;
      doc.text("Mensagem:", 10, startY);
      doc.text(mensagem, 10, startY + 8);
    }

    doc.save(`Atividade-${activity.title}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center border-b border-gray-800 p-4">
          <h2 className="text-xl font-semibold text-blue-300">💬 {activity.title}</h2>
          <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white text-lg">✖</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-[70vh]">
          {responses.length === 0 ? (
            <p className="text-gray-400 text-center">Nenhuma resposta ainda.</p>
          ) : (
            responses.map((r: any) => {
              const autor = users[r.autor_id];
              const isTeacher = autor?.type === "teacher";
              const bgColor = isTeacher ? "bg-blue-600" : "bg-green-600";
              const nomeTipo = isTeacher ? "Professor" : "Aluno";
              return (
                <div key={r.id} className={`flex items-start gap-3 ${isTeacher ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="flex-shrink-0">
                    {autor?.avatar_url ? (
                      <img src={autor.avatar_url} alt={autor.username} className="w-10 h-10 rounded-full border border-gray-700" />
                    ) : (<DefaultIcon />)}
                  </div>
                  <div className={`p-3 rounded-xl max-w-[75%] ${bgColor} text-white shadow-md whitespace-pre-wrap`}>
                    <p className="font-semibold text-sm mb-1">{autor?.username || "Usuário"} • {nomeTipo}</p>
                    {r.texto.split("\n").map((linha: any, i: any) => <p key={i}>{linha}</p>)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-gray-800 bg-gray-900 p-4">
          <div className="flex justify-around mb-3 border-b border-gray-700">
            <button className={`pb-2 ${tab === "respostas" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`} onClick={() => setTab("respostas")}>🗨️ Respostas</button>
            <button className={`pb-2 ${tab === "responder" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`} onClick={() => setTab("responder")}>✏️ Responder</button>
            <button className={`pb-2 ${tab === "exportar" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`} onClick={() => setTab("exportar")}>📄 Exportar</button>
          </div>

          {tab === "responder" && (
            <div>
              <h3 className="text-sm text-gray-300 mb-2">✏️ Perguntas e Respostas</h3>
              {qaPairs.map((pair: any, i: any) => (
                <div key={i} className="flex flex-col gap-1 mb-2">
                  <input placeholder={`Pergunta ${i + 1}`} value={pair.pergunta} onChange={(e) => atualizarQAPair(i, "pergunta", e.target.value)} className="p-2 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500" />
                  <textarea placeholder={`Resposta ${i + 1}`} value={pair.resposta} onChange={(e) => atualizarQAPair(i, "resposta", e.target.value)} rows={2} className="p-2 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
              ))}
              <div className="flex gap-2 mb-4">
                <button onClick={adicionarQAPair} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold">➕ Adicionar Pergunta</button>
                <button onClick={enviarQAPairs} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">Enviar</button>
              </div>

              <h3 className="text-sm text-gray-300 mb-2">💬 Mensagem Normal</h3>
              <div className="flex gap-2 mb-2">
                <textarea placeholder="Digite uma mensagem..." value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={2} className="flex-1 p-2 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 resize-none" />
                <button onClick={enviarMensagem} className="py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold">Enviar Mensagem</button>
              </div>
            </div>
          )}

          {tab === "exportar" && (
            <div className="flex flex-col gap-2">
              <button onClick={gerarPDFAtual} className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold">📄 Exportar Atividade</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
