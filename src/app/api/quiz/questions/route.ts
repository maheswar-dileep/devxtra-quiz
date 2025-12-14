import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';

export async function GET() {
    try {
        await connectDB();

        // Fetch all questions, excluding the correct answer for security
        const questions = await Question.find({})
            .select('questionText options')
            .sort({ createdAt: 1 });

        if (questions.length === 0) {
            return NextResponse.json(
                { error: 'No questions available. Please contact the administrator.' },
                { status: 404 }
            );
        }

        return NextResponse.json({ questions });
    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch questions' },
            { status: 500 }
        );
    }
}
