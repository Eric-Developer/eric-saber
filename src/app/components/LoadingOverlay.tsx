"use client";
import React from "react";

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = "Carregando..." }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-white text-lg font-medium">{message}</span>
      </div>
    </div>
  );
}
