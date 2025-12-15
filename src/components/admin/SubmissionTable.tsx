import React from 'react';

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

interface SubmissionTableProps {
    submissions: Submission[];
    loading?: boolean;
}

export default function SubmissionTable({ submissions, loading }: SubmissionTableProps) {
    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-[#222] rounded-lg" />
                ))}
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-gray-400">No submissions yet</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-[#333]">
                        <th className="text-left py-4 px-4 text-gray-400 font-medium">Name</th>
                        <th className="text-left py-4 px-4 text-gray-400 font-medium hidden md:table-cell">
                            Email
                        </th>
                        <th className="text-left py-4 px-4 text-gray-400 font-medium hidden lg:table-cell">
                            Mobile
                        </th>
                        <th className="text-center py-4 px-4 text-gray-400 font-medium">Score</th>
                        <th className="text-center py-4 px-4 text-gray-400 font-medium">Status</th>
                        <th className="text-right py-4 px-4 text-gray-400 font-medium hidden sm:table-cell">
                            Date
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.map((submission) => (
                        <tr
                            key={submission._id}
                            className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors"
                        >
                            <td className="py-4 px-4">
                                <div>
                                    <p className="text-white font-medium">{submission.name}</p>
                                    <p className="text-gray-500 text-sm md:hidden">
                                        {submission.email}
                                    </p>
                                </div>
                            </td>
                            <td className="py-4 px-4 text-gray-300 hidden md:table-cell">
                                {submission.email}
                            </td>
                            <td className="py-4 px-4 text-gray-300 hidden lg:table-cell">
                                {submission.mobile}
                            </td>
                            <td className="py-4 px-4 text-center">
                                <span className="text-white font-semibold">
                                    {submission.score}/{submission.totalQuestions}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                        submission.pass
                                            ? 'bg-white/10 text-white border-white/30'
                                            : 'bg-red-500/10 text-red-500 border-red-500/30'
                                    }`}
                                >
                                    {submission.pass ? 'Passed' : 'Failed'}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-right text-gray-400 text-sm hidden sm:table-cell">
                                {new Date(submission.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
