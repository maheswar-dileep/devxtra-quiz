'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Loading from '@/components/ui/Loading';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authenticated, setAuthenticated] = useState<boolean | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Check if we're on the login page
    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        if (isLoginPage) {
            setAuthenticated(true);
            return;
        }

        // Check authentication by trying to access a protected endpoint
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/admin/stats');
                if (response.status === 401) {
                    router.push('/admin/login');
                } else {
                    setAuthenticated(true);
                }
            } catch {
                router.push('/admin/login');
            }
        };

        checkAuth();
    }, [isLoginPage, router]);

    // Show loading while checking auth
    if (authenticated === null && !isLoginPage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loading size="lg" text="Checking authentication..." />
            </div>
        );
    }

    // Don't show sidebar on login page
    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-black flex">
            {/* Mobile menu button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#111] border border-[#333] rounded-lg text-white"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                </svg>
            </button>

            {/* Sidebar overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
          fixed lg:static inset-y-0 left-0 z-40
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <Sidebar onLogout={() => setAuthenticated(false)} />
            </div>

            {/* Main content */}
            <main className="flex-1 min-h-screen lg:ml-0">
                <div className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</div>
            </main>
        </div>
    );
}
