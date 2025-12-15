'use client';

import React from 'react';

interface ProgressBarProps {
    current: number;
    total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
    const percentage = ((current + 1) / total) * 100;

    return (
        <div className="w-full">
            {/* Text indicator */}
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">
                    Question {current + 1} of {total}
                </span>
                <span className="text-sm text-white">{Math.round(percentage)}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                <div
                    className="h-full bg-white transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: total }, (_, i) => (
                    <div
                        key={i}
                        className={`
              w-2.5 h-2.5 rounded-full transition-all duration-300
              ${
                  i < current
                      ? 'bg-[#2db811]'
                      : i === current
                      ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]'
                      : 'bg-[#333]'
              }
            `}
                    />
                ))}
            </div>
        </div>
    );
}
