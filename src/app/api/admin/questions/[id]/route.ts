import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import { getAdminFromCookie } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT - Update a question
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const admin = await getAdminFromCookie();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { id } = await params;
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

        const question = await Question.findByIdAndUpdate(
            id,
            {
                questionText: questionText.trim(),
                options: options.map((opt: string) => opt.trim()),
                correctAnswer,
                difficulty: difficulty || 'medium',
            },
            { new: true }
        );

        if (!question) {
            return NextResponse.json(
                { error: 'Question not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, question });
    } catch (error) {
        console.error('Error updating question:', error);
        return NextResponse.json(
            { error: 'Failed to update question' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a question
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const admin = await getAdminFromCookie();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { id } = await params;

        const question = await Question.findByIdAndDelete(id);

        if (!question) {
            return NextResponse.json(
                { error: 'Question not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: 'Question deleted' });
    } catch (error) {
        console.error('Error deleting question:', error);
        return NextResponse.json(
            { error: 'Failed to delete question' },
            { status: 500 }
        );
    }
}
