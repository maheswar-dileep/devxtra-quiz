import mongoose, { Schema, Document, Model } from 'mongoose';
import connectDB from '@/lib/db';

/**
 * QuizConfig Model
 *
 * Stores global quiz configuration settings. Only one document should exist.
 * This allows admins to configure:
 * - How many questions each student sees
 * - What percentage is needed to pass
 * - Whether the quiz is currently active
 */
export interface IQuizConfig extends Document {
    questionLimit: number;      // Maximum questions per quiz (e.g., 10, 15, 20)
    passPercentage: number;     // Minimum % to pass (e.g., 60)
    isActive: boolean;          // Enable/disable quiz for students
    updatedAt: Date;
}

const QuizConfigSchema = new Schema<IQuizConfig>({
    questionLimit: {
        type: Number,
        required: [true, 'Question limit is required'],
        min: [1, 'Minimum 1 question required'],
        max: [100, 'Maximum 100 questions allowed'],
        default: 10,
    },
    passPercentage: {
        type: Number,
        required: [true, 'Pass percentage is required'],
        min: [0, 'Pass percentage cannot be negative'],
        max: [100, 'Pass percentage cannot exceed 100'],
        default: 60,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const QuizConfig: Model<IQuizConfig> = mongoose.models.QuizConfig || mongoose.model<IQuizConfig>('QuizConfig', QuizConfigSchema);

export default QuizConfig;

/**
 * Helper function to get or create the quiz config
 * Ensures only one config document exists
 */
export async function getQuizConfig(): Promise<IQuizConfig> {
    // Ensure database connection is established
    await connectDB();

    let config = await QuizConfig.findOne();

    if (!config) {
        // Create default config if none exists
        config = await QuizConfig.create({
            questionLimit: 10,
            passPercentage: 60,
            isActive: true,
        });
    }

    return config;
}
