import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import Submission from '@/models/Submission';

const PASS_PERCENTAGE = parseInt(process.env.PASS_PERCENTAGE || '60', 10);

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { name, email, mobile, answers } = body;

        // Validate required fields
        if (!name || !email || !mobile) {
            return NextResponse.json(
                { error: 'Name, email, and mobile are required' },
                { status: 400 }
            );
        }

        if (!answers || !Array.isArray(answers)) {
            return NextResponse.json(
                { error: 'Answers are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate mobile format (basic validation)
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(mobile.replace(/[\s-]/g, ''))) {
            return NextResponse.json(
                { error: 'Invalid mobile number format (10 digits required)' },
                { status: 400 }
            );
        }

        // Fetch all questions with correct answers
        const questions = await Question.find({}).sort({ createdAt: 1 });

        if (questions.length === 0) {
            return NextResponse.json(
                { error: 'No questions available' },
                { status: 404 }
            );
        }

        // Calculate score
        let correctCount = 0;
        questions.forEach((question, index) => {
            if (answers[index] === question.correctAnswer) {
                correctCount++;
            }
        });

        const totalQuestions = questions.length;
        const percentage = (correctCount / totalQuestions) * 100;
        const pass = percentage >= PASS_PERCENTAGE;

        // Create submission
        const submission = await Submission.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            mobile: mobile.trim(),
            answers,
            score: correctCount,
            totalQuestions,
            pass,
        });

        return NextResponse.json({
            success: true,
            result: {
                id: submission._id,
                score: correctCount,
                totalQuestions,
                percentage: Math.round(percentage),
                pass,
            },
        });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        return NextResponse.json(
            { error: 'Failed to submit quiz' },
            { status: 500 }
        );
    }
}
