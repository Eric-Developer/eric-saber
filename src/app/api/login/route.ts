// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "minha_chave_secreta";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Usuário e senha obrigatórios" }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from("User")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Senha inválida" }, { status: 401 });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: "7d" });

    return NextResponse.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
