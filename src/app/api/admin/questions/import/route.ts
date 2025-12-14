import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';
import { getAdminFromCookie } from '@/lib/auth';

/**
 * Question interface for validation
 */
interface QuestionInput {
    questionText: string;
    options: string[];
    correctAnswer: number;
    difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Validates a single question object
 */
function validateQuestion(q: unknown, index: number): { valid: boolean; error?: string } {
    // Type guard
    if (!q || typeof q !== 'object') {
        return { valid: false, error: `Question ${index + 1}: Must be an object` };
    }

    const question = q as Record<string, unknown>;

    // Check questionText
    if (!question.questionText || typeof question.questionText !== 'string') {
        return { valid: false, error: `Question ${index + 1}: Missing or invalid 'questionText'` };
    }

    if (question.questionText.trim().length === 0) {
        return { valid: false, error: `Question ${index + 1}: 'questionText' cannot be empty` };
    }

    // Check options
    if (!Array.isArray(question.options)) {
        return { valid: false, error: `Question ${index + 1}: 'options' must be an array` };
    }

    if (question.options.length !== 4) {
        return { valid: false, error: `Question ${index + 1}: Exactly 4 options required, got ${question.options.length}` };
    }

    for (let i = 0; i < question.options.length; i++) {
        if (typeof question.options[i] !== 'string' || question.options[i].trim().length === 0) {
            return { valid: false, error: `Question ${index + 1}: Option ${i + 1} must be a non-empty string` };
        }
    }

    // Check correctAnswer
    if (typeof question.correctAnswer !== 'number') {
        return { valid: false, error: `Question ${index + 1}: 'correctAnswer' must be a number` };
    }

    if (question.correctAnswer < 0 || question.correctAnswer > 3) {
        return { valid: false, error: `Question ${index + 1}: 'correctAnswer' must be 0-3` };
    }

    // Check difficulty (optional)
    if (question.difficulty !== undefined) {
        if (!['easy', 'medium', 'hard'].includes(question.difficulty as string)) {
            return { valid: false, error: `Question ${index + 1}: 'difficulty' must be 'easy', 'medium', or 'hard'` };
        }
    }

    return { valid: true };
}

/**
 * POST /api/admin/questions/import
 *
 * Bulk import questions from JSON array.
 * Requires admin authentication.
 *
 * Request body: Array of question objects
 * [
 *   {
 *     "questionText": "What is 2+2?",
 *     "options": ["1", "2", "3", "4"],
 *     "correctAnswer": 3,
 *     "difficulty": "easy"  // optional
 *   }
 * ]
 */
export async function POST(request: NextRequest) {
    try {
        // Verify admin is logged in
        const admin = await getAdminFromCookie();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Parse request body
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON format' },
                { status: 400 }
            );
        }

        // Validate it's an array
        if (!Array.isArray(body)) {
            return NextResponse.json(
                { error: 'Request body must be a JSON array of questions' },
                { status: 400 }
            );
        }

        if (body.length === 0) {
            return NextResponse.json(
                { error: 'Array cannot be empty' },
                { status: 400 }
            );
        }

        // Validate each question
        const validationErrors: string[] = [];
        const validQuestions: QuestionInput[] = [];

        for (let i = 0; i < body.length; i++) {
            const result = validateQuestion(body[i], i);
            if (!result.valid) {
                validationErrors.push(result.error!);
            } else {
                const q = body[i] as QuestionInput;
                validQuestions.push({
                    questionText: q.questionText.trim(),
                    options: q.options.map((opt: string) => opt.trim()),
                    correctAnswer: q.correctAnswer,
                    difficulty: q.difficulty || 'medium',
                });
            }
        }

        // If there are validation errors, return them
        if (validationErrors.length > 0) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationErrors,
                    validCount: validQuestions.length,
                    invalidCount: validationErrors.length,
                },
                { status: 400 }
            );
        }

        // Insert all valid questions
        const insertedQuestions = await Question.insertMany(validQuestions);

        return NextResponse.json({
            success: true,
            message: `Successfully imported ${insertedQuestions.length} questions`,
            count: insertedQuestions.length,
        }, { status: 201 });

    } catch (error) {
        console.error('Error importing questions:', error);
        return NextResponse.json(
            { error: 'Failed to import questions' },
            { status: 500 }
        );
    }
}
