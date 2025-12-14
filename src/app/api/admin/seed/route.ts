import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';

// This route seeds the initial admin user
// Should be called once during setup
export async function POST() {
    try {
        await connectDB();

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: 'admin@quiz.com' });

        if (existingAdmin) {
            return NextResponse.json({
                message: 'Admin already exists',
                email: 'admin@quiz.com',
            });
        }

        // Create default admin
        const admin = await Admin.create({
            email: 'admin@quiz.com',
            password: 'admin123',
        });

        return NextResponse.json({
            success: true,
            message: 'Admin created successfully',
            admin: {
                id: admin._id,
                email: admin.email,
            },
        });
    } catch (error) {
        console.error('Error seeding admin:', error);
        return NextResponse.json(
            { error: 'Failed to seed admin' },
            { status: 500 }
        );
    }
}
