'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import SubmissionTable from '@/components/admin/SubmissionTable';
import Loading from '@/components/ui/Loading';

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

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

type FilterType = 'all' | 'passed' | 'failed';

export default function SubmissionsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchSubmissions();
    }, [filter, page]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
            });

            if (filter !== 'all') {
                params.set('filter', filter);
            }

            const response = await fetch(`/api/admin/submissions?${params}`);
            const data = await response.json();

            if (response.ok) {
                setSubmissions(data.submissions);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
        setPage(1);
    };

    const filters: { label: string; value: FilterType }[] = [
        { label: 'All', value: 'all' },
        { label: 'Passed', value: 'passed' },
        { label: 'Failed', value: 'failed' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Submissions</h1>
                <p className="text-gray-400">View all quiz submissions</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => handleFilterChange(f.value)}
                        className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${
                  filter === f.value
                      ? f.value === 'passed'
                          ? 'bg-white text-black'
                          : f.value === 'failed'
                          ? 'bg-red-500 text-white'
                          : 'bg-white text-black'
                      : 'bg-[#222] text-gray-400 hover:bg-[#333] hover:text-white'
              }
            `}
                    >
                        {f.label}
                        {pagination && (
                            <span className="ml-2 opacity-70">
                                (
                                {f.value === 'all'
                                    ? pagination.total
                                    : f.value === 'passed'
                                    ? submissions.filter((s) => s.pass).length
                                    : submissions.filter((s) => !s.pass).length}
                                )
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Table */}
            <Card>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loading size="lg" text="Loading submissions..." />
                    </div>
                ) : (
                    <>
                        <SubmissionTable submissions={submissions} />

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#222]">
                                <p className="text-gray-400 text-sm">
                                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                                    {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                                    of {pagination.total} submissions
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 bg-[#222] text-gray-400 rounded-lg hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() =>
                                            setPage((p) => Math.min(pagination.totalPages, p + 1))
                                        }
                                        disabled={page === pagination.totalPages}
                                        className="px-4 py-2 bg-[#222] text-gray-400 rounded-lg hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
}
