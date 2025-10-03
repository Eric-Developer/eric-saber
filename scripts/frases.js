/*const { supabase } = require("../src/app/lib/supabse");
const palavrasJson = require("../src/app/data/palavra.json"); 
const frasesJson = require("../src/app/data/frases.json"); 

// Normaliza texto para evitar duplicidade
function normalizeText(text) {
  return text.trim().toLowerCase();
}

// Filtra JSON para itens únicos
function removeDuplicates(array) {
  const seen = new Set();
  return array.filter(item => {
    const normalized = normalizeText(item.texto);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

async function seed() {
  // --- PALAVRAS ---
  const palavrasUnicas = removeDuplicates(palavrasJson);
  const palavrasToInsert = palavrasUnicas.map(p => ({
    tipo: "palavra",
    texto: p.texto,
    nivel: p.nivel,
    categoria: p.categoria,
    anoestudo: p.anoEstudo
  }));

  if (palavrasToInsert.length > 0) {
    const { error: palavraError } = await supabase
      .from("fraseleitura") // tabela correta
      .insert(palavrasToInsert);

    if (palavraError) console.error("Erro ao inserir palavras:", palavraError);
    else console.log(`Palavras inseridas: ${palavrasToInsert.length}`);
  }

  // --- FRASES ---
  const frasesUnicas = removeDuplicates(frasesJson);
  const frasesToInsert = frasesUnicas.map(f => ({
    tipo: "frase",
    texto: f.texto,
    nivel: f.nivel,
    categoria: f.categoria,
    anoestudo: f.anoEstudo
  }));

  if (frasesToInsert.length > 0) {
    const { error: fraseError } = await supabase
      .from("fraseleitura") // tabela correta
      .insert(frasesToInsert);

    if (fraseError) console.error("Erro ao inserir frases:", fraseError);
    else console.log(`Frases inseridas: ${frasesToInsert.length}`);
  }

  console.log("Seed finalizado!");
}

seed();
*/