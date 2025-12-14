import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
    return (
        <div
            className={`
        bg-[#111] border border-[#222] rounded-xl p-6
        ${
            hover
                ? 'transition-all duration-300 hover:border-[#39FF14] hover:shadow-[0_0_20px_rgba(57,255,20,0.2)]'
                : ''
        }
        ${className}
      `}
        >
            {children}
        </div>
    );
}
