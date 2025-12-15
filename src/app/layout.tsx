import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Devxtra Evaluation',
    description: 'Evaluation portal for Devxtra offline bootcamp admission.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-black text-white antialiased`}>{children}</body>
        </html>
    );
}
