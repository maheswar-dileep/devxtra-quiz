'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';

/**
 * Quiz Configuration Interface
 */
interface QuizConfig {
    questionLimit: number;
    passPercentage: number;
    isActive: boolean;
    whatsappNumber: string;
    whatsappMessage: string;
    updatedAt: string;
}

/**
 * Admin Settings Page
 *
 * Allows admins to configure:
 * - Question limit per quiz
 * - Pass percentage threshold
 * - Quiz active/inactive status
 */
export default function SettingsPage() {
    const [config, setConfig] = useState<QuizConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [questionLimit, setQuestionLimit] = useState('10');
    const [passPercentage, setPassPercentage] = useState('60');
    const [isActive, setIsActive] = useState(true);
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [whatsappMessage, setWhatsappMessage] = useState('');

    // Fetch current configuration on mount
    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/config');
            const data = await response.json();

            if (response.ok) {
                setConfig(data.config);
                setQuestionLimit(String(data.config.questionLimit));
                setPassPercentage(String(data.config.passPercentage));
                setIsActive(data.config.isActive);
                setWhatsappNumber(data.config.whatsappNumber || '');
                setWhatsappMessage(data.config.whatsappMessage || '');
            } else {
                setError(data.error || 'Failed to load configuration');
            }
        } catch (err) {
            setError('Failed to fetch configuration');
            console.error('Error fetching config:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            // Validate inputs
            const limit = parseInt(questionLimit, 10);
            const percentage = parseInt(passPercentage, 10);

            if (isNaN(limit) || limit < 1 || limit > 100) {
                setError('Question limit must be between 1 and 100');
                return;
            }

            if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                setError('Pass percentage must be between 0 and 100');
                return;
            }

            const response = await fetch('/api/admin/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionLimit: limit,
                    passPercentage: percentage,
                    isActive,
                    whatsappNumber,
                    whatsappMessage,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setConfig(data.config);
                setSuccess('Settings saved successfully!');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(data.error || 'Failed to save settings');
            }
        } catch (err) {
            setError('Failed to save settings');
            console.error('Error saving config:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loading size="lg" text="Loading settings..." />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400">Configure quiz behavior and requirements</p>
            </div>

            {/* Settings Card */}
            <Card className="max-w-2xl">
                <h2 className="text-xl font-semibold text-white mb-6">Quiz Configuration</h2>

                {/* Error/Success Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
                        {success}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Question Limit */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Questions Per Quiz
                        </label>
                        <Input
                            type="number"
                            value={questionLimit}
                            onChange={(e) => setQuestionLimit(e.target.value)}
                            min="1"
                            max="100"
                            placeholder="e.g., 10"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Maximum number of questions shown to each student (1-100)
                        </p>
                    </div>

                    {/* Pass Percentage */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Pass Percentage
                        </label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={passPercentage}
                                onChange={(e) => setPassPercentage(e.target.value)}
                                min="0"
                                max="100"
                                placeholder="e.g., 60"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                %
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            Minimum percentage required to pass the quiz
                        </p>
                    </div>

                    {/* Quiz Active Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Quiz Status
                        </label>
                        <button
                            type="button"
                            onClick={() => setIsActive(!isActive)}
                            className={`
                                relative w-14 h-7 rounded-full transition-colors duration-200
                            ${isActive ? 'bg-white' : 'bg-gray-600'}
                            `}
                        >
                            <span
                                className={`
                                    absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200
                                    ${isActive ? 'translate-x-8' : 'translate-x-1'}
                                `}
                            />
                        </button>
                        <p className="mt-2 text-sm text-gray-500">
                            {isActive ? (
                                <span className="text-green-400">
                                    Quiz is active - students can take the quiz
                                </span>
                            ) : (
                                <span className="text-yellow-400">
                                    Quiz is inactive - students cannot access
                                </span>
                            )}
                        </p>
                    </div>

                    {/* WhatsApp Configuration Section */}
                    <div className="pt-6 border-t border-[#333]">
                        <h3 className="text-lg font-medium text-white mb-4">WhatsApp Settings</h3>

                        {/* WhatsApp Number */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                WhatsApp Number
                            </label>
                            <Input
                                type="text"
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                placeholder="e.g., +91XXXXXXXXXX"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Enter phone number with country code (leave empty to let users
                                choose contact)
                            </p>
                        </div>

                        {/* WhatsApp Message Template */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Message Template
                            </label>
                            <textarea
                                value={whatsappMessage}
                                onChange={(e) => setWhatsappMessage(e.target.value)}
                                rows={5}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                                placeholder="Enter the message template..."
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Use placeholders:{' '}
                                <code className="text-gray-400">{'{{score}}'}</code>,{' '}
                                <code className="text-gray-400">{'{{total}}'}</code>,{' '}
                                <code className="text-gray-400">{'{{percentage}}'}</code>,{' '}
                                <code className="text-gray-400">{'{{status}}'}</code>
                            </p>
                        </div>
                    </div>

                    {/* Last Updated Info */}
                    {config && (
                        <div className="pt-4 border-t border-[#333] text-sm text-gray-500">
                            Last updated: {new Date(config.updatedAt).toLocaleString()}
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="pt-4">
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
