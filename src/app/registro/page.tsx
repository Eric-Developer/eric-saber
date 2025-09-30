"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 🔹 Verifica se o username já existe
      const { data: existingUsername } = await supabase
        .from("User")
        .select("id")
        .eq("username", username)
        .single();

      if (existingUsername) {
        setError("Este nome de usuário já está em uso. Escolha outro.");
        setLoading(false);
        return;
      }

      // 🔹 Verifica se o email já existe na tabela User
      const { data: existingEmail } = await supabase
        .from("User")
        .select("id")
        .eq("email", email)
        .single();

      if (existingEmail) {
        setError("Este e-mail já está cadastrado. Use outro.");
        setLoading(false);
        return;
      }

      // 🔹 Cria usuário no Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, type: "student" },
        },
      });

      if (signUpError) {
        setError("Erro ao criar usuário: " + signUpError.message);
        setLoading(false);
        return;
      }

      const { error: tableError } = await supabase
        .from("User")
        .insert([
          {
            auth_id: signUpData.user?.id,
            username,
            email,
            type: "student",
          }
        ]);

      if (tableError) {
        setError("Erro ao salvar dados na tabela: " + tableError.message);
        setLoading(false);
        return;
      }

      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setSuccess("Cadastro realizado com sucesso!");
      setError("");

      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (err) {
      console.error(err);
      setError("Erro inesperado ao cadastrar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg font-medium">Cadastrando...</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative z-10">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Cadastro
        </h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="password"
            placeholder="Confirmar Senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          {error && <p className="text-red-600 font-semibold text-center">{error}</p>}
          {success && <p className="text-green-600 font-semibold text-center">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full py-3 rounded-full font-semibold text-xl shadow-lg transition ${
              loading
                ? "bg-gray-500 text-gray-200 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}
