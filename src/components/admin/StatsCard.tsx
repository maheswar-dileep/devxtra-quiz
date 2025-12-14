import React from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: 'green' | 'red' | 'blue' | 'yellow';
}

export default function StatsCard({ title, value, icon, color = 'green' }: StatsCardProps) {
    const colors = {
        green: 'from-[#39FF14]/20 to-[#39FF14]/5 border-[#39FF14]/30',
        red: 'from-red-500/20 to-red-500/5 border-red-500/30',
        blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
        yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
    };

    const iconColors = {
        green: 'text-[#39FF14]',
        red: 'text-red-500',
        blue: 'text-blue-500',
        yellow: 'text-yellow-500',
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-6`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-black/30 ${iconColors[color]}`}>{icon}</div>
            </div>
        </div>
    );
}
