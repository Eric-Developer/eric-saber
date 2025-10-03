import React from "react";
import Link from "next/link";

interface Props {
  onCreateClass: () => void;
  onSendActivity: () => void;
}

export default function TeacherActions({ onCreateClass, onSendActivity }: Props) {
  return (
    <section className="mb-6 w-full max-w-6xl">
      <h2 className="text-xl font-bold text-white mb-4">Teacher Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={onCreateClass}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-2xl text-center"
        >
          Create Class
        </button>
        <button
          onClick={onSendActivity}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-2xl text-center"
        >
          Send Activity
        </button>
        <Link
          href="/professor/manage-classes"
          className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-2xl text-center"
        >
          Manage Classes
        </Link>
        <Link
          href="/professor/reports"
          className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-2xl text-center"
        >
          Class Reports
        </Link>
        <Link
          href="/professor/tracking"
          className="bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-2xl text-center"
        >
          Track Submissions
        </Link>
      </div>
    </section>
  );
}
