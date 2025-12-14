import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question, { IQuestion } from '@/models/Question';
import { getQuizConfig } from '@/models/QuizConfig';

/**
 * Fisher-Yates Shuffle Algorithm
 *
 * Produces an unbiased permutation: every permutation is equally likely.
 * This ensures each student gets a truly random set of questions.
 *
 * @param array - Array to shuffle (will be mutated)
 * @returns The shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
    // Create a copy to avoid mutating the original
    const shuffled = [...array];

    // Start from the last element and swap with a random element before it
    for (let i = shuffled.length - 1; i > 0; i--) {
        // Generate random index from 0 to i (inclusive)
        const randomIndex = Math.floor(Math.random() * (i + 1));

        // Swap elements at i and randomIndex
        [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }

    return shuffled;
}

/**
 * GET /api/quiz/questions
 *
 * Fetches randomized, limited questions for a student quiz.
 * - Questions are shuffled using Fisher-Yates algorithm
 * - Only configured number of questions are returned
 * - Correct answers are NOT included (security)
 * - Question IDs are included for submission tracking
 */
export async function GET() {
    try {
        await connectDB();

        // Get quiz configuration
        const config = await getQuizConfig();

        // Check if quiz is active
        if (!config.isActive) {
            return NextResponse.json(
                { error: 'Quiz is currently unavailable. Please try again later.' },
                { status: 503 }
            );
        }

        // Fetch all questions from database
        const allQuestions = await Question.find({}).select('_id questionText options');

        if (allQuestions.length === 0) {
            return NextResponse.json(
                { error: 'No questions available. Please contact the administrator.' },
                { status: 404 }
            );
        }

        // Shuffle all questions randomly (Fisher-Yates)
        const shuffledQuestions = shuffleArray(allQuestions);

        // Limit to configured number of questions
        // If there are fewer questions than limit, show all available
        const questionLimit = Math.min(config.questionLimit, shuffledQuestions.length);
        const selectedQuestions = shuffledQuestions.slice(0, questionLimit);

        // Format response (exclude correctAnswer for security)
        const questions = selectedQuestions.map((q: IQuestion) => ({
            _id: q._id,
            questionText: q.questionText,
            options: q.options,
        }));

        return NextResponse.json({
            questions,
            totalQuestions: questions.length,
            // Include config info for client display
            config: {
                questionLimit: config.questionLimit,
                passPercentage: config.passPercentage,
            },
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch questions' },
            { status: 500 }
        );
    }
}
