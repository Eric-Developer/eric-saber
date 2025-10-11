// scripts/seed.js

const { supabase } = require("../src/app/lib/supabse");
const questionsJson = require("../src/app/data//geografia/meios_de_transporte_e_fontes_de_energia.json");

async function seed() {
  if (!Array.isArray(questionsJson)) {
    console.error("O JSON não é um array!");
    return;
  }

  for (const item of questionsJson) {
    if (!item.quiz) {
      console.warn("Item sem quiz encontrado, pulando...");
      continue;
    }

    const q = item.quiz;

    // Preenchendo valores padrão caso algum campo esteja faltando
    const quizData = {
      titulo: q.titulo || "Título Padrão",
      tema: q.tema || "Tema Padrão",
      materia: q.materia || "Matéria Padrão",
      anoestudo: q.anoestudo || "Ano Padrão",
      tags: Array.isArray(q.tags) ? q.tags : [],
    };

    // Insere o quiz no Supabase
    const { data: insertedQuiz, error: quizError } = await supabase
      .from("Quiz")
      .insert([quizData])
      .select()
      .single();

    if (quizError) {
      console.error("Erro ao inserir quiz:", quizError);
      continue;
    }

    console.log(`Quiz inserido com sucesso: ${insertedQuiz.titulo} (ID: ${insertedQuiz.id})`);

    // Insere as perguntas
    if (!Array.isArray(item.perguntas) || item.perguntas.length === 0) {
      console.warn(`Quiz "${insertedQuiz.titulo}" não possui perguntas, pulando inserção de perguntas.`);
      continue;
    }

    const perguntasToInsert = item.perguntas.map((p) => ({
      quiz_id: insertedQuiz.id,
      texto: p.texto || "Texto não informado",
      alternativas: Array.isArray(p.alternativas) ? p.alternativas : [],
      correta: typeof p.correta === "number" ? p.correta : 0,
    }));

    const { error: perguntasError } = await supabase
      .from("Pergunta")
      .insert(perguntasToInsert);

    if (perguntasError) {
      console.error(`Erro ao inserir perguntas do quiz "${insertedQuiz.titulo}":`, perguntasError);
    } else {
      console.log(`Perguntas inseridas com sucesso para o quiz "${insertedQuiz.titulo}"`);
    }
  }

  console.log("Seed finalizado!");
}

seed();
