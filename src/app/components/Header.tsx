"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { HiMenu, HiX } from "react-icons/hi";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erro ao deslogar:", error.message);
        return;
      }
      localStorage.clear();
      router.push("/login");
    } catch (err) {
      console.error("Erro inesperado ao deslogar:", err);
    }
  };

  // 🔹 Clique na logo
  const handleLogoClick = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gray-800 text-white shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={handleLogoClick}
        >
          <div className="w-11 h-11 flex items-center justify-center">
            <Image
              src="/logo_aprendi+.png"
              alt="Logo Aprendi+"
              className="w-full h-full object-contain"
              width={400}
              height={400}
            />
          </div>
          <div className="font-semibold text-lg">Aprendi+</div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className="hover:text-green-400 transition font-medium"
          >
            Painel
          </Link>
          <Link
            href="/profile"
            className="hover:text-green-400 transition font-medium"
          >
            Perfil
          </Link>

          {user && (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition"
            >
              Sair
            </button>
          )}
        </nav>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
            {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-gray-800 text-white px-6 pb-4">
          <Link
            href="/dashboard"
            className="block py-2 hover:text-green-400 transition font-medium"
            onClick={() => setIsOpen(false)}
          >
            Painel
          </Link>
          <Link
            href="/profile"
            className="block py-2 hover:text-green-400 transition font-medium"
            onClick={() => setIsOpen(false)}
          >
            Perfil
          </Link>
          {user && (
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 mt-2 rounded-lg font-semibold transition"
            >
              Sair
            </button>
          )}
        </div>
      )}
    </header>
  );
}
