'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Question {
    _id?: string;
    questionText: string;
    options: string[];
    correctAnswer: number;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface QuestionFormProps {
    question?: Question | null;
    onSubmit: (data: Omit<Question, '_id'>) => Promise<void>;
    onCancel: () => void;
}

export default function QuestionForm({ question, onSubmit, onCancel }: QuestionFormProps) {
    const [formData, setFormData] = useState<Omit<Question, '_id'>>({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        difficulty: 'medium',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (question) {
            setFormData({
                questionText: question.questionText,
                options: [...question.options],
                correctAnswer: question.correctAnswer,
                difficulty: question.difficulty || 'medium',
            });
        }
    }, [question]);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData((prev) => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate
        if (!formData.questionText.trim()) {
            setError('Question text is required');
            return;
        }

        if (formData.options.some((opt) => !opt.trim())) {
            setError('All options are required');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save question');
        } finally {
            setLoading(false);
        }
    };

    const optionLabels = ['A', 'B', 'C', 'D'];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question Text */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Question Text
                </label>
                <textarea
                    value={formData.questionText}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, questionText: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#333] text-white placeholder-gray-500 focus:outline-none focus:border-white focus:shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-300 min-h-[100px] resize-none"
                    placeholder="Enter your question here..."
                />
            </div>

            {/* Options */}
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Options</label>
                {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <span
                            className={`
                flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm
                ${
                    formData.correctAnswer === index
                        ? 'bg-white text-black'
                        : 'bg-[#222] text-gray-400'
                }
              `}
                        >
                            {optionLabels[index]}
                        </span>
                        <Input
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${optionLabels[index]}`}
                        />
                    </div>
                ))}
            </div>

            {/* Correct Answer */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Correct Answer
                </label>
                <div className="flex gap-3">
                    {optionLabels.map((label, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() =>
                                setFormData((prev) => ({ ...prev, correctAnswer: index }))
                            }
                            className={`
                w-12 h-12 rounded-lg font-semibold transition-all duration-200
                ${
                    formData.correctAnswer === index
                        ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                        : 'bg-[#222] text-gray-400 hover:bg-[#333]'
                }
              `}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Difficulty */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                <div className="flex gap-3">
                    {(['easy', 'medium', 'hard'] as const).map((level) => (
                        <button
                            key={level}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, difficulty: level }))}
                            className={`
                px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200
                ${
                    formData.difficulty === level
                        ? level === 'easy'
                            ? 'bg-white text-black'
                            : level === 'medium'
                            ? 'bg-yellow-500 text-black'
                            : 'bg-red-500 text-white'
                        : 'bg-[#222] text-gray-400 hover:bg-[#333]'
                }
              `}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                    <p className="text-red-500 text-sm">{error}</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" loading={loading}>
                    {question ? 'Update Question' : 'Add Question'}
                </Button>
            </div>
        </form>
    );
}
