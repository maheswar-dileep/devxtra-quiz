'use client';

import React from 'react';
import OptionButton from './OptionButton';

interface Question {
    _id: string;
    questionText: string;
    options: string[];
}

interface QuestionCardProps {
    question: Question;
    selectedAnswer: number | null;
    onSelectAnswer: (index: number) => void;
}

export default function QuestionCard({
    question,
    selectedAnswer,
    onSelectAnswer,
}: QuestionCardProps) {
    const optionLabels = ['A', 'B', 'C', 'D'];

    return (
        <div className="w-full fade-in">
            {/* Question */}
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8 leading-relaxed">
                {question.questionText}
            </h2>

            {/* Options */}
            <div className="space-y-4">
                {question.options.map((option, index) => (
                    <OptionButton
                        key={index}
                        label={optionLabels[index]}
                        text={option}
                        selected={selectedAnswer === index}
                        onClick={() => onSelectAnswer(index)}
                    />
                ))}
            </div>
        </div>
    );
}
