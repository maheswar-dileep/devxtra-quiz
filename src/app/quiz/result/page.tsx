'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';

interface QuizResult {
    id: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    pass: boolean;
}

export default function ResultPage() {
    const router = useRouter();
    const [result, setResult] = useState<QuizResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedResult = sessionStorage.getItem('quizResult');
        if (!storedResult) {
            router.push('/quiz');
            return;
        }

        setResult(JSON.parse(storedResult));
        setLoading(false);
    }, [router]);

    if (loading || !result) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading size="lg" text="Loading result..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                {/* Result icon */}
                <div className="text-7xl mb-6">{result.pass ? '🎉' : '😔'}</div>

                {/* Pass/Fail message */}
                <h1
                    className={`text-3xl font-bold mb-2 ${
                        result.pass ? 'text-[#39FF14]' : 'text-red-500'
                    }`}
                >
                    {result.pass ? 'Congratulations!' : 'Better Luck Next Time'}
                </h1>
                <p className="text-gray-400 mb-8">
                    {result.pass
                        ? 'You passed the quiz successfully!'
                        : "Don't give up, you can try again!"}
                </p>

                {/* Score display */}
                <div className="mb-8">
                    <div className="relative inline-flex items-center justify-center">
                        <svg className="w-40 h-40">
                            {/* Background circle */}
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="none"
                                stroke="#222"
                                strokeWidth="10"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="none"
                                stroke={result.pass ? '#39FF14' : '#ff4444'}
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${(result.percentage / 100) * 440} 440`}
                                transform="rotate(-90 80 80)"
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute">
                            <span
                                className={`text-4xl font-bold ${
                                    result.pass ? 'text-[#39FF14]' : 'text-red-500'
                                }`}
                            >
                                {result.percentage}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Score details */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-[#1a1a1a] rounded-lg">
                        <p className="text-gray-400 text-sm mb-1">Correct Answers</p>
                        <p className="text-2xl font-bold text-white">{result.score}</p>
                    </div>
                    <div className="p-4 bg-[#1a1a1a] rounded-lg">
                        <p className="text-gray-400 text-sm mb-1">Total Questions</p>
                        <p className="text-2xl font-bold text-white">{result.totalQuestions}</p>
                    </div>
                </div>

                {/* Status badge */}
                <div
                    className={`
            inline-flex items-center gap-2 px-6 py-3 rounded-full
            ${
                result.pass
                    ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]'
                    : 'bg-red-500/10 text-red-500 border border-red-500'
            }
          `}
                >
                    <span className="text-lg font-semibold">
                        {result.pass ? '✓ PASSED' : '✗ FAILED'}
                    </span>
                </div>
            </Card>
        </div>
    );
}
