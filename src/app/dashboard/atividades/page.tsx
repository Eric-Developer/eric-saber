"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useAuth } from "@/app/hooks/useAuth";
import Header from "@/app/components/Header";
import jsPDF from "jspdf";

interface UserData {
  auth_id: string;
  username?: string;
  avatar_url?: string;
  type?: "teacher" | "student";
}

interface Activity {
  id: string;
  title: string;
  description: string;
  type: string;
  subject?: string;
  creator_id: string;
  class_id: string;
}

interface Resposta {
  id: string;
  autor_id: string;
  texto: string;
  tipo: string;
}

export default function AtividadesPage() {
  const { user } = useAuth();
  const [atividades, setAtividades] = useState<Activity[]>([]);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("atividade");
  const [subject, setSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [userClasses, setUserClasses] = useState<any[]>([]);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState<Activity | null>(null);
  const [usuarios, setUsuarios] = useState<Record<string, UserData>>({});
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [aba, setAba] = useState<"respostas" | "responder" | "exportar">("respostas");

  const [qaPairs, setQaPairs] = useState<{ pergunta: string; resposta: string }[]>([
    { pergunta: "", resposta: "" },
  ]);
  const [mensagem, setMensagem] = useState("");

  // 🔹 Buscar turmas
  useEffect(() => {
    if (!user?.id) return;
    const fetchUserClasses = async () => {
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
    fetchUserClasses();
  }, [user]);

  // 🔹 Buscar atividades
  useEffect(() => {
    if (!user?.id || userClasses.length === 0) return;
    const fetchAtividades = async () => {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .in("class_id", userClasses.map((c: any) => c.id || c))
        .order("created_at", { ascending: false });

      const unicas = data?.filter(
        (v, i, arr) =>
          arr.findIndex((x) => x.class_id === v.class_id && x.title === v.title) === i
      );
      setAtividades(unicas || []);
      setLoading(false);
    };
    fetchAtividades();
  }, [user, userClasses]);

  // 🔹 Buscar respostas
  const fetchRespostas = async (atividadeId: string) => {
    const { data } = await supabase
      .from("respostas_atividade")
      .select("*")
      .eq("atividade_id", atividadeId)
      .order("enviada_em", { ascending: true });

    setRespostas(data || []);
    const userIds = Array.from(new Set(data?.map((r: any) => r.autor_id)));
    fetchUsuarios(userIds);
  };

  // 🔹 Buscar usuários
  const fetchUsuarios = async (ids: string[]) => {
    if (ids.length === 0) return;
    const { data } = await supabase
      .from("User")
      .select("auth_id, username, avatar_url, type")
      .in("auth_id", ids);
    if (!data) return;
    const map: Record<string, UserData> = {};
    data.forEach((u) => (map[u.auth_id] = u));
    setUsuarios((prev) => ({ ...prev, ...map }));
  };

  // 🔹 Criar atividade
  const handleEnviarAtividade = async () => {
    if (!titulo || !descricao) return alert("Preencha todos os campos!");
    let classId = selectedClass;
    if (user?.type === "student") classId = userClasses[0];
    if (!classId) return alert("Selecione uma turma.");

    const { error } = await supabase.from("activities").insert([
      {
        creator_id: user?.auth_id,
        class_id: classId,
        title: titulo,
        description: descricao,
        type: tipo,
        subject,
        status: "pendente",
      },
    ]);

    if (error) {
      console.error("Erro ao criar atividade:", error);
      alert("Erro ao criar atividade!");
    } else {
      alert("Atividade enviada para a turma!");
      const novaAtividade: Activity = {
        id: crypto.randomUUID(),
        creator_id: user?.auth_id || "",
        class_id: classId,
        title: titulo,
        description: descricao,
        type: tipo,
        subject,
      };
      setAtividades((prev) => [novaAtividade, ...prev]);
    }

    setTitulo("");
    setDescricao("");
    setSubject("");
    setTipo("atividade");
    setSelectedClass(null);
  };

  // 🔹 Abrir modal
  const handleAbrirModal = async (atividade: Activity) => {
    setAtividadeSelecionada(atividade);
    setModalAberto(true);
    setAba("respostas");
    await fetchRespostas(atividade.id);
  };

  // 🔹 QA
  const atualizarQAPair = (index: number, campo: "pergunta" | "resposta", valor: string) => {
    const novas = [...qaPairs];
    novas[index][campo] = valor;
    setQaPairs(novas);
  };
  const adicionarQAPair = () => setQaPairs([...qaPairs, { pergunta: "", resposta: "" }]);

  const handleEnviarQAPairs = async () => {
    if (!atividadeSelecionada) return;
    const textoFinal = qaPairs
      .map((p, i) => `Pergunta ${i + 1}: ${p.pergunta}\nResposta ${i + 1}: ${p.resposta}`)
      .join("\n\n");

    await supabase.from("respostas_atividade").insert([
      { atividade_id: atividadeSelecionada.id, autor_id: user?.auth_id, texto: textoFinal, tipo: "qa" },
    ]);

    setQaPairs([{ pergunta: "", resposta: "" }]);
    await fetchRespostas(atividadeSelecionada.id);
  };

  // 🔹 Mensagem
  const handleEnviarMensagem = async () => {
    if (!atividadeSelecionada || !mensagem) return;
    await supabase.from("respostas_atividade").insert([
      { atividade_id: atividadeSelecionada.id, autor_id: user?.auth_id, texto: mensagem, tipo: "mensagem" },
    ]);
    setMensagem("");
    await fetchRespostas(atividadeSelecionada.id);
  };

  // 🔹 PDF export
  const gerarPDFAtual = () => {
    if (!atividadeSelecionada) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Atividade: ${atividadeSelecionada.title}`, 10, 20);
    doc.setFontSize(12);
    qaPairs.forEach((p, i) => {
      const y = 30 + i * 20;
      doc.text(`Pergunta ${i + 1}: ${p.pergunta}`, 10, y);
      doc.text(`Resposta ${i + 1}: ${p.resposta}`, 10, y + 8);
    });
    if (mensagem) {
      const startY = 30 + qaPairs.length * 20 + 10;
      doc.text("Mensagem normal:", 10, startY);
      doc.text(mensagem, 10, startY + 8);
    }
    doc.save(`Atividade-${atividadeSelecionada.title}.pdf`);
  };

  const gerarPDFRespostasEnviadas = () => {
    if (!atividadeSelecionada) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Atividade: ${atividadeSelecionada.title}`, 10, 20);
    doc.setFontSize(12);
    const minhasRespostas = respostas.filter((r) => r.autor_id === user?.auth_id);
    if (minhasRespostas.length === 0) {
      doc.text("Você ainda não enviou nenhuma resposta.", 10, 30);
    } else {
      let y = 30;
      minhasRespostas.forEach((r, i) => {
        doc.text(`Resposta ${i + 1}:`, 10, y);
        y += 8;
        r.texto.split("\n").forEach((line: string) => {
          doc.text(line, 10, y);
          y += 6;
        });
        y += 4;
      });
    }
    doc.save(`Minhas-Respostas-${atividadeSelecionada.title}.pdf`);
  };

  const DefaultIcon = () => (
    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 text-lg font-bold">?</div>
  );

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

        {user?.type === "teacher" && (
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-blue-300">✏️ Criar nova atividade</h2>
            <select value={selectedClass || ""} onChange={(e) => setSelectedClass(e.target.value)} className="w-full mb-3 p-3 rounded-lg bg-gray-800 border border-gray-700">
              <option value="">Selecione uma turma</option>
              {userClasses.map((c: any) => (<option key={c.id} value={c.id}>{c.nome || c.id}</option>))}
            </select>
            <input placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full mb-3 p-3 rounded-lg bg-gray-800 border border-gray-700" />
            <input placeholder="matéria" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full mb-3 p-3 rounded-lg bg-gray-800 border border-gray-700" />
            <textarea placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} className="w-full mb-3 p-3 rounded-lg bg-gray-800 border border-gray-700" />
            <button onClick={handleEnviarAtividade} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all">Enviar atividade</button>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-4 text-blue-300">📂 Atividades disponíveis</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {atividades.length === 0 ? (
            <p className="text-gray-400 text-center w-full">Nenhuma atividade disponível.</p>
          ) : (
            atividades.map((a) => (
              <div key={a.id} onClick={() => handleAbrirModal(a)} className="bg-gray-900 border border-gray-800 p-5 rounded-xl hover:border-blue-500 transition cursor-pointer shadow-md hover:shadow-lg">
                <h3 className="font-semibold text-lg text-white mb-1">{a.title}</h3>
                <p className="text-gray-400 text-sm">{a.subject} • {a.type}</p>
                <p className="text-gray-300 text-sm mt-2 line-clamp-3">{a.description}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {modalAberto && atividadeSelecionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center border-b border-gray-800 p-4">
              <h2 className="text-xl font-semibold text-blue-300">💬 {atividadeSelecionada.title}</h2>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-white text-lg">✖</button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-[70vh]">
              {respostas.length === 0 ? (
                <p className="text-gray-400 text-center">Nenhuma resposta ainda.</p>
              ) : (
                respostas.map((r) => {
                  const autor = usuarios[r.autor_id];
                  const isProfessor = autor?.type === "teacher";
                  const corBg = isProfessor ? "bg-blue-600" : "bg-green-600";
                  const nomeTipo = isProfessor ? "Professor" : "Aluno";
                  return (
                    <div key={r.id} className={`flex items-start gap-3 ${isProfessor ? "flex-row-reverse" : "flex-row"}`}>
                      <div className="flex-shrink-0">
                        {autor?.avatar_url ? (
                          <img src={autor.avatar_url} alt={autor.username} className="w-10 h-10 rounded-full border border-gray-700" />
                        ) : (<DefaultIcon />)}
                      </div>
                      <div className={`p-3 rounded-xl max-w-[75%] ${corBg} text-white shadow-md whitespace-pre-wrap`}>
                        <p className="font-semibold text-sm mb-1">{autor?.username || "Usuário"} • {nomeTipo}</p>
                        {r.texto.split("\n").map((linha: string, i: number) => <p key={i}>{linha}</p>)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-gray-800 bg-gray-900 p-4">
              <div className="flex justify-around mb-3 border-b border-gray-700">
                <button className={`pb-2 ${aba === "respostas" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`} onClick={() => setAba("respostas")}>🗨️ Respostas</button>
                <button className={`pb-2 ${aba === "responder" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`} onClick={() => setAba("responder")}>✏️ Responder</button>
                <button className={`pb-2 ${aba === "exportar" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`} onClick={() => setAba("exportar")}>📄 Exportar</button>
              </div>

              {aba === "responder" && (
                <>
                  <h3 className="text-sm text-gray-300 mb-2">✏️ Perguntas e respostas:</h3>
                  {qaPairs.map((pair, i) => (
                    <div key={i} className="flex flex-col gap-1 mb-2">
                      <input placeholder={`Pergunta ${i + 1}`} value={pair.pergunta} onChange={(e) => atualizarQAPair(i, "pergunta", e.target.value)} className="p-2 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500" />
                      <textarea placeholder={`Resposta ${i + 1}`} value={pair.resposta} onChange={(e) => atualizarQAPair(i, "resposta", e.target.value)} rows={2} className="p-2 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 resize-none" />
                    </div>
                  ))}
                  <div className="flex gap-2 mb-4">
                    <button onClick={adicionarQAPair} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold">➕ Adicionar pergunta</button>
                    <button onClick={handleEnviarQAPairs} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">Enviar todas</button>
                  </div>

                  <h3 className="text-sm text-gray-300 mb-2">💬 Mensagem normal:</h3>
                  <div className="flex gap-2 mb-2">
                    <textarea placeholder="Digite uma mensagem normal..." value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={2} className="flex-1 p-2 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 resize-none" />
                    <button onClick={handleEnviarMensagem} className="py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold">Enviar</button>
                  </div>
                </>
              )}

              {aba === "exportar" && (
                <div className="flex flex-col gap-2">
                  <button onClick={gerarPDFAtual} className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold">📄 Exportar PDF (atual)</button>
                  <button onClick={gerarPDFRespostasEnviadas} className="w-full py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold">📄 Exportar minhas respostas</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
