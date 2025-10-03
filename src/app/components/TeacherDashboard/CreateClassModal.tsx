import React from "react";

interface Props {
  onClose: () => void;
}

export default function CreateClassModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md text-white">
        <h3 className="text-lg font-bold mb-4">Create Class</h3>
        <input
          type="text"
          placeholder="Class Name"
          className="w-full p-2 mb-4 rounded text-black"
        />
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 p-2 rounded w-full"
        >
          Create
        </button>
      </div>
    </div>
  );
}
