'use client';

import React from 'react';

interface OptionButtonProps {
    label: string;
    text: string;
    selected: boolean;
    onClick: () => void;
}

export default function OptionButton({ label, text, selected, onClick }: OptionButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
        w-full flex items-center gap-4 p-4 rounded-xl
        border-2 transition-all duration-300
        text-left
        ${
            selected
                ? 'border-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                : 'border-[#333] bg-[#111] hover:border-white hover:bg-white/5'
        }
      `}
        >
            {/* Option label */}
            <span
                className={`
          flex-shrink-0 w-10 h-10 rounded-lg
          flex items-center justify-center
          font-semibold text-lg
          transition-all duration-300
          ${selected ? 'bg-white text-black' : 'bg-[#222] text-gray-400'}
        `}
            >
                {label}
            </span>

            {/* Option text */}
            <span className={`text-lg ${selected ? 'text-white' : 'text-gray-300'}`}>{text}</span>
        </button>
    );
}
