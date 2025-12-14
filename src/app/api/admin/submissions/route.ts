import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Submission from '@/models/Submission';
import { getAdminFromCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const admin = await getAdminFromCookie();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter'); // 'passed', 'failed', or null for all
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        const query: { pass?: boolean } = {};

        if (filter === 'passed') {
            query.pass = true;
        } else if (filter === 'failed') {
            query.pass = false;
        }

        const skip = (page - 1) * limit;

        const [submissions, total] = await Promise.all([
            Submission.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Submission.countDocuments(query),
        ]);

        return NextResponse.json({
            submissions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch submissions' },
            { status: 500 }
        );
    }
}
