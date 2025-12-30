"use client";

import { useState, useRef, useEffect } from "react";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  title: string;
  actionType: "approve" | "reject";
}

export default function CommentModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  actionType,
}: CommentModalProps) {
  const [comment, setComment] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = () => {
    onSubmit(comment);
    setComment("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-2xl border border-white/20 dark:border-purple-500/20 p-6 w-full max-w-md mx-4"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="mb-4">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Opmerking (optioneel)
          </label>
          <textarea
            ref={textareaRef}
            id="comment"
            rows={4}
            className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm rounded-lg backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 p-3"
            placeholder="Voeg een opmerking toe..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center py-2 px-4 backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 min-h-[44px] transition-colors"
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`inline-flex justify-center py-2 px-4 shadow-lg text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] transition-all ${
              actionType === "approve"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 focus:ring-green-500"
                : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 focus:ring-red-500"
            }`}
          >
            {actionType === "approve" ? "Goedkeuren" : "Afkeuren"}
          </button>
        </div>
      </div>
    </div>
  );
}
