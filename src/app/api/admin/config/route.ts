import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import QuizConfig, { getQuizConfig } from '@/models/QuizConfig';
import { getAdminFromCookie } from '@/lib/auth';

/**
 * GET /api/admin/config
 *
 * Fetches the current quiz configuration.
 * Requires admin authentication.
 */
export async function GET() {
    try {
        // Verify admin is logged in
        const admin = await getAdminFromCookie();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get or create the config (singleton pattern)
        const config = await getQuizConfig();

        return NextResponse.json({
            success: true,
            config: {
                questionLimit: config.questionLimit,
                passPercentage: config.passPercentage,
                isActive: config.isActive,
                whatsappNumber: config.whatsappNumber,
                whatsappMessage: config.whatsappMessage,
                updatedAt: config.updatedAt,
            },
        });
    } catch (error) {
        console.error('Error fetching quiz config:', error);
        return NextResponse.json(
            { error: 'Failed to fetch configuration' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/config
 *
 * Updates quiz configuration settings.
 * Requires admin authentication.
 *
 * Request body:
 * {
 *   questionLimit?: number,   // 1-100
 *   passPercentage?: number,  // 0-100
 *   isActive?: boolean
 * }
 */
export async function PUT(request: NextRequest) {
    try {
        // Verify admin is logged in
        const admin = await getAdminFromCookie();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const body = await request.json();
        const { questionLimit, passPercentage, isActive, whatsappNumber, whatsappMessage } = body;

        // Build update object with only provided fields
        const updateData: Partial<{
            questionLimit: number;
            passPercentage: number;
            isActive: boolean;
            whatsappNumber: string;
            whatsappMessage: string;
        }> = {};

        // Validate and add questionLimit if provided
        if (questionLimit !== undefined) {
            const limit = Number(questionLimit);
            if (isNaN(limit) || limit < 1 || limit > 100) {
                return NextResponse.json(
                    { error: 'Question limit must be between 1 and 100' },
                    { status: 400 }
                );
            }
            updateData.questionLimit = limit;
        }

        // Validate and add passPercentage if provided
        if (passPercentage !== undefined) {
            const percentage = Number(passPercentage);
            if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                return NextResponse.json(
                    { error: 'Pass percentage must be between 0 and 100' },
                    { status: 400 }
                );
            }
            updateData.passPercentage = percentage;
        }

        // Add isActive if provided
        if (isActive !== undefined) {
            updateData.isActive = Boolean(isActive);
        }

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        // Add whatsappNumber if provided
        if (whatsappNumber !== undefined) {
            // Clean up phone number - remove spaces and ensure it starts with +
            updateData.whatsappNumber = String(whatsappNumber).trim();
        }

        // Add whatsappMessage if provided
        if (whatsappMessage !== undefined) {
            updateData.whatsappMessage = String(whatsappMessage);
        }

        // Update or create config (upsert)
        const config = await QuizConfig.findOneAndUpdate(
            {},
            { ...updateData, updatedAt: new Date() },
            { new: true, upsert: true, runValidators: true }
        );

        return NextResponse.json({
            success: true,
            config: {
                questionLimit: config.questionLimit,
                passPercentage: config.passPercentage,
                isActive: config.isActive,
                whatsappNumber: config.whatsappNumber,
                whatsappMessage: config.whatsappMessage,
                updatedAt: config.updatedAt,
            },
        });
    } catch (error) {
        console.error('Error updating quiz config:', error);
        return NextResponse.json(
            { error: 'Failed to update configuration' },
            { status: 500 }
        );
    }
}
