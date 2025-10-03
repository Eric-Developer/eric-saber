import React from "react";

interface Props {
  onClose: () => void;
}

export default function SendActivityModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md text-white">
        <h3 className="text-lg font-bold mb-4">Send Activity</h3>
        
        <select className="w-full p-2 mb-4 rounded text-black">
          <option>Select Class</option>
        </select>
        
        <select className="w-full p-2 mb-4 rounded text-black">
          <option>Select Quiz</option>
        </select>
        
        <button
          onClick={onClose}
          className="bg-green-500 hover:bg-green-600 p-2 rounded w-full"
        >
          Send
        </button>
      </div>
    </div>
  );
}
