import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubmission extends Document {
    name: string;
    email: string;
    mobile: string;
    answers: number[];
    score: number;
    totalQuestions: number;
    pass: boolean;
    createdAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
    },
    mobile: {
        type: String,
        required: [true, 'Mobile number is required'],
        trim: true,
    },
    answers: {
        type: [Number],
        required: true,
        default: [],
    },
    score: {
        type: Number,
        required: true,
        min: 0,
    },
    totalQuestions: {
        type: Number,
        required: true,
        min: 1,
    },
    pass: {
        type: Boolean,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Submission: Model<ISubmission> = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);

export default Submission;
