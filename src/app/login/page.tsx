"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // pode ser email ou username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Tenta preencher email automaticamente se já existir sessão/usuário
  useEffect(() => {
    const fillFromSession = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) {
          setIdentifier(data.user.email);
        }
      } catch (err) {
        // não é crítico — apenas não pré-preenche
        console.error("Não foi possível preencher email automaticamente", err);
      }
    };
    fillFromSession();
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validações locais antes de chamar o Supabase
    if (!identifier.trim()) {
      setError("Informe o e-mail ou nome de usuário.");
      return;
    }

    if (!password) {
      setError("Informe a senha.");
      return;
    }

    if (password.length < 6 || password.length > 9) {
      setError("A senha deve ter entre 6 e 8 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // Se o identificador contiver '@', trata como email direto
      let emailToUse = "";
      if (identifier.includes("@")) {
        emailToUse = identifier.trim();
      } else {
        // Trata como username: buscar email na tabela User
        const { data: userData, error: userErr } = await supabase
          .from("User")
          .select("email")
          .eq("username", identifier.trim())
          .single();

        if (userErr) {
          // se erro 406/404 etc, mostra mensagem amigável
          console.error("Erro ao buscar usuário por username:", userErr);
          setError("Nome de usuário não encontrado.");
          setLoading(false);
          return;
        }

        if (!userData?.email) {
          setError("Nome de usuário não encontrado.");
          setLoading(false);
          return;
        }

        emailToUse = userData.email;
      }

      // Fazer login com email resolvido
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (signInError) {
        // Mensagens amigáveis em pt-BR
        const msg = signInError.message || "Erro ao autenticar. Verifique suas credenciais.";
        setError(msg);
        setLoading(false);
        return;
      }

      if (data?.session?.user) {
        // Redireciona para dashboard (ou rota que você preferir)
        router.push("/dashboard");
      } else {
        setError("Não foi possível criar sessão. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setError("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Login</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="E-mail (@gmail.com) ou nome de usuário"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-400"
            required
          />

          <input
            type="password"
            placeholder="Senha (6-8 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-400"
            required
          />

          {error && <p className="text-red-600 font-semibold text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-full font-semibold transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
