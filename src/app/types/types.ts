// src/app/types.ts

export interface Quiz {
  id: number;
  titulo: string;
  materia: string;
  tema: string;
}

export interface QuizProgresso {
  titulo: string;
  materia: string;
  tema: string; 
  acertos: number;
  erros: number;
  ultimaPontuacao: number;
  data: string; 
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

// app/types.ts
export interface Quiz {
  id: number;
  titulo: string;
  materia: string;
}

export interface QuizResult {
  quiz_id: number;
  correct: number;
  wrong: number;
  score: number;
  username: string;
  Quiz: Quiz;
  created_at: string;
}

export interface QuizProgress {
  title: string;
  subject: string;
  correct: number;
  wrong: number;
  lastScore: number;
}

export interface StudentProgress {
  username: string;
  email?: string;
  quizzesTaken: QuizProgress[];
}

export interface UserData {
  id?: string;
  auth_id: string;
  username?: string;
  avatar_url?: string;
  type?: "teacher" | "student" | "admin"; 
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: string;
  subject?: string;
  creator_id: string;
  class_id: string;
}

export interface Resposta {
  id: string;
  autor_id: string;
  texto: string;
  tipo: string;
}
