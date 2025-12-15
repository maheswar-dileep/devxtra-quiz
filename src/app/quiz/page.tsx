'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuestionCard from '@/components/quiz/QuestionCard';
import ProgressBar from '@/components/quiz/ProgressBar';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';

interface Question {
    _id: string;
    questionText: string;
    options: string[];
}

interface QuizConfig {
    questionLimit: number;
    passPercentage: number;
}

export default function QuizPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [questionIds, setQuestionIds] = useState<string[]>([]); // Store question IDs for submission
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [config, setConfig] = useState<QuizConfig | null>(null);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await fetch('/api/quiz/questions');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load questions');
            }

            // Store questions and their IDs
            setQuestions(data.questions);
            setQuestionIds(data.questions.map((q: Question) => q._id));
            setAnswers(new Array(data.questions.length).fill(null));

            // Store config info
            if (data.config) {
                setConfig(data.config);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAnswer = (index: number) => {
        const newAnswers = [...answers];
        newAnswers[currentIndex] = index;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleFinish = () => {
        // Store answers AND question IDs in sessionStorage for submission
        sessionStorage.setItem('quizAnswers', JSON.stringify(answers));
        sessionStorage.setItem('questionIds', JSON.stringify(questionIds));
        sessionStorage.setItem('quizConfig', JSON.stringify(config));
        router.push('/quiz/details');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading size="lg" text="Loading quiz..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Oops!</h1>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;
    const canProceed = answers[currentIndex] !== null;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="p-4 md:p-6 border-b border-[#222]">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-xl font-bold text-white mb-4">Devxtra Internship Evaluation</h1>
                    <ProgressBar current={currentIndex} total={questions.length} />
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 p-4 md:p-6">
                <div className="max-w-3xl mx-auto">
                    <QuestionCard
                        question={currentQuestion}
                        selectedAnswer={answers[currentIndex]}
                        onSelectAnswer={handleSelectAnswer}
                    />
                </div>
            </main>

            {/* Footer with navigation */}
            <footer className="p-4 md:p-6 border-t border-[#222]">
                <div className="max-w-3xl mx-auto flex justify-between gap-4">
                    <Button
                        variant="secondary"
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                    >
                        Previous
                    </Button>

                    {isLastQuestion ? (
                        <Button onClick={handleFinish} disabled={!canProceed}>
                            Finish Quiz
                        </Button>
                    ) : (
                        <Button onClick={handleNext} disabled={!canProceed}>
                            Next
                        </Button>
                    )}
                </div>
            </footer>
        </div>
    );
}
