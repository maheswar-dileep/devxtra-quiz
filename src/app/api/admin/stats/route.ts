import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Submission from '@/models/Submission';
import { getAdminFromCookie } from '@/lib/auth';

export async function GET() {
    try {
        const admin = await getAdminFromCookie();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const [total, passed, failed, recentSubmissions] = await Promise.all([
            Submission.countDocuments({}),
            Submission.countDocuments({ pass: true }),
            Submission.countDocuments({ pass: false }),
            Submission.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name email score totalQuestions pass createdAt'),
        ]);

        return NextResponse.json({
            stats: {
                total,
                passed,
                failed,
                passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
            },
            recentSubmissions,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
