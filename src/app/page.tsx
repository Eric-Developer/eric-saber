"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient"; 

export default function Welcome() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!error && data.user) {
        router.push("/dashboard");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl md:text-6xl font-extrabold text-white text-center mb-6">
        Bem-vindo ao EricSaber!
      </h1>

      {/* Subtítulo */}
      <p className="text-gray-300 text-center max-w-lg mb-10 text-lg md:text-xl">
        Acesse seu painel, participe de quizzes e teste seus conhecimentos.
      </p>

      {/* Botões */}
      <div className="flex flex-col sm:flex-row gap-6">
        <button
          onClick={() => router.push("/login")}
          className="px-8 py-4 rounded-full text-xl font-semibold shadow-lg bg-green-500 hover:bg-green-600 text-white transition"
        >
          Entrar
        </button>

        <button
          onClick={() => router.push("/registro")}
          className="px-8 py-4 rounded-full text-xl font-semibold shadow-lg bg-white hover:bg-gray-100 text-gray-900 transition"
        >
          Cadastrar
        </button>
      </div>
    </div>
  );
}
