"use client";
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Header from "../components/Header";

interface ProfileData {
  username: string;
  avatar_url: string | null;
}

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      setEmail(data.user.email ?? "");

      const { data: profileData, error: profileError } = await supabase
        .from("User")
        .select("username, avatar_url")
        .eq("auth_id", data.user.id)
        .single();

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError);
        return;
      }

      if (profileData) {
        setProfile(profileData);
        setAvatarUrl(profileData.avatar_url ?? "");
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setAvatarUrl(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let uploadedUrl = avatarUrl;

      // Upload avatar se houver arquivo novo
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(fileName);
        uploadedUrl = publicData.publicUrl;
      }

      // Atualiza tabela User
      const { error: userError } = await supabase
        .from("User")
        .update({ username: profile.username, avatar_url: uploadedUrl })
        .eq("auth_id", user.id);
      if (userError) throw userError;

      // Atualiza Auth (email/senha)
      const updateData: { email?: string; password?: string } = {};
      if (email !== user.email) updateData.email = email;
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setError("As senhas não coincidem");
          setLoading(false);
          return;
        }
        updateData.password = newPassword;
      }

      if (Object.keys(updateData).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(updateData);
        if (authError) throw authError;
      }

      setSuccess("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header fixo */}
      <Header />

      {/* Conteúdo centralizado */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Meu Perfil</h1>

          {/* Avatar clicável */}
          <div className="flex flex-col items-center mb-6">
            <div
              onClick={handleAvatarClick}
              className="w-24 h-24 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center cursor-pointer border-2 border-green-500 relative"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-semibold">Sem foto</span>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-70 bg-black/30 text-white font-semibold">
                Trocar
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Username"
              value={profile?.username ?? ""}
              onChange={(e) => setProfile((prev) => prev ? { ...prev, username: e.target.value } : prev)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="password"
              placeholder="Nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="password"
              placeholder="Confirmar senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {error && <p className="text-red-600 font-semibold text-center">{error}</p>}
            {success && <p className="text-green-600 font-semibold text-center">{success}</p>}

            <button
              onClick={handleSave}
              disabled={loading}
              className={`mt-4 w-full py-3 rounded-full font-semibold text-xl shadow-lg transition ${
                loading
                  ? "bg-gray-500 text-gray-200 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg font-medium">Salvando...</span>
          </div>
        </div>
      )}
    </div>
  );
}
