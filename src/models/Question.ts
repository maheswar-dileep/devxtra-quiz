import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestion extends Document {
    questionText: string;
    options: string[];
    correctAnswer: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
    questionText: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true,
    },
    options: {
        type: [String],
        required: [true, 'Options are required'],
        validate: {
            validator: function (v: string[]) {
                return v.length === 4;
            },
            message: 'Exactly 4 options are required'
        }
    },
    correctAnswer: {
        type: Number,
        required: [true, 'Correct answer index is required'],
        min: 0,
        max: 3,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

export default Question;
