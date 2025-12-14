import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import Submission from '@/models/Submission';
import { getQuizConfig } from '@/models/QuizConfig';

/**
 * POST /api/quiz/submit
 *
 * Submits a completed quiz for grading.
 * Now handles randomized questions by accepting question IDs.
 *
 * Request body:
 * {
 *   name: string,
 *   email: string,
 *   mobile: string,
 *   answers: number[],           // Array of selected option indices
 *   questionIds: string[]        // Array of question IDs (in same order as answers)
 * }
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { name, email, mobile, answers, questionIds } = body;

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

        // Validate questionIds for randomized quiz support
        if (!questionIds || !Array.isArray(questionIds)) {
            return NextResponse.json(
                { error: 'Question IDs are required' },
                { status: 400 }
            );
        }

        // Ensure answers and questionIds match in length
        if (answers.length !== questionIds.length) {
            return NextResponse.json(
                { error: 'Answers and question IDs must have the same length' },
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

        // Get quiz configuration for pass percentage
        const config = await getQuizConfig();

        // Fetch only the questions that were answered (by their IDs)
        // This handles randomized question sets correctly
        const questions = await Question.find({
            _id: { $in: questionIds }
        }).select('_id correctAnswer');

        if (questions.length === 0) {
            return NextResponse.json(
                { error: 'Invalid question IDs' },
                { status: 400 }
            );
        }

        // Create a map for quick lookup of correct answers by question ID
        const correctAnswerMap = new Map<string, number>();
        questions.forEach((q) => {
            correctAnswerMap.set(q._id.toString(), q.correctAnswer);
        });

        // Calculate score by matching answers with correct answers
        // Using question IDs to ensure correct ordering
        let correctCount = 0;
        questionIds.forEach((qId: string, index: number) => {
            const correctAnswer = correctAnswerMap.get(qId);
            if (correctAnswer !== undefined && answers[index] === correctAnswer) {
                correctCount++;
            }
        });

        const totalQuestions = questionIds.length;
        const percentage = (correctCount / totalQuestions) * 100;
        const pass = percentage >= config.passPercentage;

        // Create submission record
        const submission = await Submission.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            mobile: mobile.trim(),
            answers,
            score: correctCount,
            totalQuestions,
            pass,
            // Store question IDs for reference
            questionIds: questionIds,
        });

        return NextResponse.json({
            success: true,
            result: {
                id: submission._id,
                score: correctCount,
                totalQuestions,
                percentage: Math.round(percentage),
                pass,
                passPercentage: config.passPercentage,
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
