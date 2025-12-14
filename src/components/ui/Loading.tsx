import React from 'react';

interface LoadingProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

export default function Loading({ size = 'md', text }: LoadingProps) {
    const sizes = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-16 h-16 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div
                className={`
          ${sizes[size]}
          border-[#333] border-t-[#39FF14]
          rounded-full animate-spin
        `}
            />
            {text && <p className="text-gray-400 text-sm">{text}</p>}
        </div>
    );
}
