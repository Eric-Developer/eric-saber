// src/app/types.ts

export interface Quiz {
  id: number;
  titulo: string;
  materia: string;
}

export interface QuizProgresso {
  titulo: string;
  materia: string;
  acertos: number;
  erros: number;
  ultimaPontuacao: number;
  data: string; // ISO string da data do quiz
}

export interface AlunoProgresso {
  username: string;
  quizzesFeitos: QuizProgresso[];
}

export interface User {
  id: string;
  email: string;
  username?: string;
}

export interface QuizResultado {
  quiz_id: number;
  acertos: number;
  erros: number;
  pontuacao: number;
  Quiz: Quiz[];
  user_id?: string;
  created_at?: string;
}
