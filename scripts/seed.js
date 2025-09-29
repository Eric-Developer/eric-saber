// scripts/seed.js

/*const { supabase } = require("../src/app/lib/supabse");
const questionsJson = require("../src/app/data/questions.json");
const matematicaJson = require("../src/app/data/matematica.json");

async function seed() {
  const allQuizzes = [...questionsJson, ...matematicaJson]; // corrigido: quizzesJson -> questionsJson

  for (const quiz of allQuizzes) {
    // Insere o quiz
    const { data: insertedQuiz, error: quizError } = await supabase
      .from("Quiz")
      .insert([
        {
          titulo: quiz.titulo,
          tema: quiz.tema,
          materia: quiz.materia,
          anoestudo: quiz.anoEstudo,
          tags: quiz.tags,
        },
      ])
      .select()
      .single();

    if (quizError) {
      console.error("Erro ao inserir quiz:", quizError);
      continue;
    }

    const quizId = insertedQuiz.id;

    // Insere as perguntas
    const perguntasToInsert = quiz.perguntas.map((p) => ({
      quiz_id: quizId,
      texto: p.texto,
      alternativas: p.alternativas,
      correta: p.correta,
    }));

    const { error: perguntasError } = await supabase
      .from("Pergunta")
      .insert(perguntasToInsert);

    if (perguntasError) {
      console.error("Erro ao inserir perguntas:", perguntasError);
    }
  }

  console.log("Seed finalizado!");
}

seed();
*/