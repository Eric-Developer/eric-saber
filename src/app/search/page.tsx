"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import Header from "../components/Header";

interface Quiz {
  id: number;
  titulo: string;
  tema: string;
  materia: string;
  anoestudo: string;
  tags: string[];
}

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function Search() {
  const [pesquisa, setPesquisa] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagsFiltradas, setTagsFiltradas] = useState<string[]>([]);
  const router = useRouter();

  // 🔹 Verifica se o usuário está logado
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        setAuthLoading(false);
      }
    };
    checkUser();
  }, [router]);

  // 🔹 Carrega todas as tags únicas
  useEffect(() => {
    const fetchTags = async () => {
      const { data: quizzes, error } = await supabase.from("Quiz").select("tags");
      if (error || !quizzes) return;

      const tags: string[] = [];
      quizzes.forEach((q: any) => {
        q.tags?.forEach((t: string) => {
          if (!tags.includes(t)) tags.push(t);
        });
      });
      setAllTags(tags);
    };
    fetchTags();
  }, []);

  // 🔹 Filtra tags enquanto o usuário digita
  useEffect(() => {
    if (!pesquisa) {
      setTagsFiltradas([]);
      return;
    }
    const filtro = allTags.filter((tag) =>
      normalize(tag).includes(normalize(pesquisa))
    );
    setTagsFiltradas(filtro);
  }, [pesquisa, allTags]);

  // 🔹 Função gerar quiz
  const handleGenerateQuiz = async () => {
    if (!pesquisa) return;
    setLoading(true);

    const slug = normalize(pesquisa);

    try {
      const { data: quizzes, error } = await supabase.from("Quiz").select("*");
      if (error || !quizzes) {
        console.error("Erro ao buscar quizzes:", error);
        alert("Erro ao carregar quizzes!");
        setLoading(false);
        return;
      }

      const quizEncontrado = quizzes.find((q: Quiz) =>
        q.tags?.some((tag: string) => normalize(tag).includes(slug))
      );

      if (!quizEncontrado) {
        alert("Nenhum quiz encontrado para essa tag!");
        setLoading(false);
        return;
      }

      const tagOriginal =
        quizEncontrado.tags.find((tag: string) => normalize(tag).includes(slug)) ||
        quizEncontrado.tags[0];

      const tagParaUrl = normalize(tagOriginal);

      setTimeout(() => {
        router.push(`/quiz/${tagParaUrl}`);
      }, 500);
    } catch (err) {
      console.error("Erro inesperado:", err);
      alert("Ocorreu um erro ao gerar o quiz.");
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Verificando usuário...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-4">
          Bem-vindo ao Quiz!
        </h1>
        <p className="text-gray-300 text-center max-w-lg mb-6">
          Pesquise por uma tag e clique em Gerar Quiz para testar seus conhecimentos.
        </p>

        <div className="w-full max-w-md mb-4 relative">
          <input
            type="text"
            placeholder="Digite a tag..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Lista de tags filtradas */}
          {tagsFiltradas.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-gray-800 text-white rounded-b-md max-h-40 overflow-y-auto z-10">
              {tagsFiltradas.map((tag) => (
                <li
                  key={tag}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    setPesquisa(tag);       // preenche o input
                    setTagsFiltradas([]);   // fecha a lista ao selecionar
                  }}
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={handleGenerateQuiz}
          disabled={loading}
          className={`px-8 py-4 rounded-full text-xl font-semibold shadow-lg transition ${
            loading
              ? "bg-gray-500 text-gray-200 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {loading ? "Gerando quiz..." : "Gerar Quiz"}
        </button>
      </main>
    </div>
  );
}
