'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

interface FormData {
    name: string;
    email: string;
    mobile: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    mobile?: string;
}

export default function DetailsPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        mobile: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        // Check if answers and question IDs exist
        const answers = sessionStorage.getItem('quizAnswers');
        const questionIds = sessionStorage.getItem('questionIds');
        if (!answers || !questionIds) {
            router.push('/quiz');
        }
    }, [router]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.mobile.trim()) {
            newErrors.mobile = 'Mobile number is required';
        } else if (!/^[0-9]{10}$/.test(formData.mobile.replace(/[\s-]/g, ''))) {
            newErrors.mobile = 'Invalid mobile number (10 digits required)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Get both answers and question IDs from sessionStorage
            const answers = JSON.parse(sessionStorage.getItem('quizAnswers') || '[]');
            const questionIds = JSON.parse(sessionStorage.getItem('questionIds') || '[]');

            const response = await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    answers,
                    questionIds, // Include question IDs for randomized quiz scoring
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit quiz');
            }

            // Store result and clear session data
            sessionStorage.setItem('quizResult', JSON.stringify(data.result));
            sessionStorage.removeItem('quizAnswers');
            sessionStorage.removeItem('questionIds');
            sessionStorage.removeItem('quizConfig');

            router.push('/quiz/result');
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Failed to submit quiz');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🎉</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Quiz Completed!</h1>
                    <p className="text-gray-400">Enter your details to view your score</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Full Name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                    />

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                    />

                    <Input
                        label="Mobile Number"
                        name="mobile"
                        type="tel"
                        placeholder="Enter your 10-digit mobile number"
                        value={formData.mobile}
                        onChange={handleChange}
                        error={errors.mobile}
                    />

                    {submitError && (
                        <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                            <p className="text-red-500 text-sm">{submitError}</p>
                        </div>
                    )}

                    <Button type="submit" loading={loading} className="w-full" size="lg">
                        View Score
                    </Button>
                </form>
            </Card>
        </div>
    );
}
