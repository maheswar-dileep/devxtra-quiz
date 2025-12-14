import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Quiz App - Test Your Knowledge',
    description:
        'Take our interactive quiz and test your knowledge. No login required! Just start answering questions and see your results instantly.',
    keywords: ['quiz', 'test', 'knowledge', 'exam', 'assessment'],
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
