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
    whatsappNumber?: string;
    whatsappMessage?: string;
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

    // Generate WhatsApp message by replacing placeholders with actual values
    const getWhatsAppMessage = () => {
        if (!result) return '';

        const defaultMessage = `Hi! I have completed the internship quiz.\n\n📊 My Score: {{score}}/{{total}} ({{percentage}}%)\n📝 Status: {{status}}\n\nWhat is my next step?`;
        const template = result.whatsappMessage || defaultMessage;

        return template
            .replace(/\{\{score\}\}/g, String(result.score))
            .replace(/\{\{total\}\}/g, String(result.totalQuestions))
            .replace(/\{\{percentage\}\}/g, String(result.percentage))
            .replace(/\{\{status\}\}/g, result.pass ? 'PASSED ✓' : 'FAILED ✗');
    };

    // Generate WhatsApp URL with optional phone number
    const getWhatsAppUrl = () => {
        if (!result) return '#';

        const message = encodeURIComponent(getWhatsAppMessage());
        const phoneNumber = result.whatsappNumber?.replace(/[^0-9+]/g, '') || '';

        if (phoneNumber) {
            // Remove leading + for the URL if present
            const cleanNumber = phoneNumber.startsWith('+') ? phoneNumber.slice(1) : phoneNumber;
            return `https://wa.me/${cleanNumber}?text=${message}`;
        }

        return `https://wa.me/?text=${message}`;
    };

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
                        result.pass ? 'text-white' : 'text-red-500'
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
                                stroke={result.pass ? '#ffffff' : '#ff4444'}
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
                                    result.pass ? 'text-white' : 'text-red-500'
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
                    ? 'bg-white/10 text-white border border-white'
                    : 'bg-red-500/10 text-red-500 border border-red-500'
            }
          `}
                >
                    <span className="text-lg font-semibold">
                        {result.pass ? '✓ PASSED' : '✗ FAILED'}
                    </span>
                </div>

                {/* WhatsApp CTA Button */}
                <div className="mt-8">
                    <a
                        href={getWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-1"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Get Next Steps on WhatsApp
                    </a>
                </div>
            </Card>
        </div>
    );
}
