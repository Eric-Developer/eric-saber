
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Inicializa Supabase com Service Role Key
const supabase = createClient(
"https://jjbxawdkitlvdlrmfbbc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqYnhhd2RraXRsdmRscm1mYmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTE4MTE4MSwiZXhwIjoyMDQ2NzU3MTgxfQ.73dbzxV_qyZ7EgcgCBiJxq4lqvS-dkvsMsLNwUeVn0U"
);

export async function POST(req: NextRequest) {
  try {
    // Pega todos os usuários da tabela User
    const { data: usuarios, error } = await supabase
      .from("User")
      .select("id, email");

    if (error || !usuarios) {
      return NextResponse.json({ error: error?.message || "Erro ao buscar usuários" }, { status: 400 });
    }

    const resultados = [];

    for (const u of usuarios) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: "senha123", 
        email_confirm: true,
      });
      resultados.push({ email: u.email, data, error });
    }

    return NextResponse.json({ resultados });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro inesperado" }, { status: 500 });
  }
}
