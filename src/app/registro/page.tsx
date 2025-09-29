"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import bcrypt from "bcryptjs";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    try {
      // 🔹 Criptografa a senha
      const hashedPassword = bcrypt.hashSync(password, 10);

      // 🔹 Insere no Supabase
      const { data, error } = await supabase
        .from("User")
        .insert([{ username, password: hashedPassword }])
        .select()
        .single();

      if (error) {
        setError("Erro ao cadastrar usuário: " + error.message);
        setSuccess("");
      } else {
        setError("");
        setSuccess("Cadastro realizado com sucesso!");
        setUsername("");
        setPassword("");
        setConfirmPassword("");

        // Redireciona para login
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError("Erro inesperado ao cadastrar usuário");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
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
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-full font-semibold transition"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}
