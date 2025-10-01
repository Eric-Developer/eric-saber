import Link from "next/link";

interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string; // <-- adicionamos o avatar
}

interface UserCardProps {
  user: User | null;
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <div className="mt-17 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between bg-gray-800 text-white px-4 sm:px-6 py-4 rounded-2xl shadow-2xl mb-6 sm:mb-12 gap-4 sm:gap-0">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username || user.email}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-xl">
            {user?.email.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold truncate">{user?.username || user?.email}</h1>
          <p className="text-gray-400 text-sm sm:text-base">Dashboard do aluno</p>
        </div>
      </div>
      <Link
        href="/search"
        className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 w-full sm:w-auto text-center"
      >
        Pesquisar Quizzes
      </Link>
       <Link
        href="/reading"
        className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 w-full sm:w-auto text-center"
      >
        Treinar Leitura
      </Link>
    </div>
  );
}
