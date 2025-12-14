import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import { getAdminFromCookie } from '@/lib/auth';

// GET - List all questions (with correct answers for admin)
export async function GET() {
    try {
        const admin = await getAdminFromCookie();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const questions = await Question.find({}).sort({ createdAt: -1 });

        return NextResponse.json({ questions });
    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch questions' },
            { status: 500 }
        );
    }
}

// POST - Create a new question
export async function POST(request: NextRequest) {
    try {
        const admin = await getAdminFromCookie();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const body = await request.json();
        const { questionText, options, correctAnswer, difficulty } = body;

        // Validate input
        if (!questionText || !options || correctAnswer === undefined) {
            return NextResponse.json(
                { error: 'Question text, options, and correct answer are required' },
                { status: 400 }
            );
        }

        if (!Array.isArray(options) || options.length !== 4) {
            return NextResponse.json(
                { error: 'Exactly 4 options are required' },
                { status: 400 }
            );
        }

        if (correctAnswer < 0 || correctAnswer > 3) {
            return NextResponse.json(
                { error: 'Correct answer must be between 0 and 3' },
                { status: 400 }
            );
        }

        const question = await Question.create({
            questionText: questionText.trim(),
            options: options.map((opt: string) => opt.trim()),
            correctAnswer,
            difficulty: difficulty || 'medium',
        });

        return NextResponse.json({ success: true, question }, { status: 201 });
    } catch (error) {
        console.error('Error creating question:', error);
        return NextResponse.json(
            { error: 'Failed to create question' },
            { status: 500 }
        );
    }
}
