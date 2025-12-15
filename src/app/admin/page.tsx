'use client';

import { useState, useEffect } from 'react';
import StatsCard from '@/components/admin/StatsCard';
import SubmissionTable from '@/components/admin/SubmissionTable';
import Card from '@/components/ui/Card';

interface Stats {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
}

interface Submission {
    _id: string;
    name: string;
    email: string;
    mobile: string;
    score: number;
    totalQuestions: number;
    pass: boolean;
    createdAt: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/admin/stats');
            const data = await response.json();

            if (response.ok) {
                setStats(data.stats);
                setRecentSubmissions(data.recentSubmissions);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-gray-400">Overview of your quiz statistics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Submissions"
                    value={loading ? '...' : stats?.total || 0}
                    color="blue"
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    }
                />
                <StatsCard
                    title="Passed"
                    value={loading ? '...' : stats?.passed || 0}
                    color="white"
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    }
                />
                <StatsCard
                    title="Failed"
                    value={loading ? '...' : stats?.failed || 0}
                    color="red"
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    }
                />
                <StatsCard
                    title="Pass Rate"
                    value={loading ? '...' : `${stats?.passRate || 0}%`}
                    color="yellow"
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                        </svg>
                    }
                />
            </div>

            {/* Recent Submissions */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Recent Submissions</h2>
                    <a href="/admin/submissions" className="text-white hover:underline text-sm">
                        View all →
                    </a>
                </div>
                <SubmissionTable submissions={recentSubmissions} loading={loading} />
            </Card>
        </div>
    );
}
