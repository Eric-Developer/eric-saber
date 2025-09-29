import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // 1️⃣ Busca o usuário pelo username
    const { data: user, error } = await supabase
      .from("User")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // 2️⃣ Compara a senha com bcrypt
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // 3️⃣ Retorna dados do usuário (sem senha) e token opcional
    return NextResponse.json({
      user: { id: user.id, username: user.username },
      message: "Login bem-sucedido",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
