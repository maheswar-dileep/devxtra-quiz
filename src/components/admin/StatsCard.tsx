import React from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: 'white' | 'red' | 'blue' | 'yellow';
}

export default function StatsCard({ title, value, icon, color = 'white' }: StatsCardProps) {
    const styles = {
        white: 'from-white/20 to-white/5 border-white/30',
        red: 'from-red-500/20 to-red-500/5 border-red-500/30',
        blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
        yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
    };

    const textColors = {
        white: 'text-white',
        red: 'text-red-400',
        blue: 'text-blue-400',
        yellow: 'text-yellow-400',
    };

    return (
        <div className={`bg-linear-to-br ${styles[color]} border rounded-xl p-6`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-black/30 ${textColors[color]}`}>{icon}</div>
            </div>
        </div>
    );
}
