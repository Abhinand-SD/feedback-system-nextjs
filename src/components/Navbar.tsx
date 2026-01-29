'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-gray-800 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold hover:text-gray-200">
                    FeedbackSystem
                </Link>

                <div className="flex gap-4 items-center">
                    {user ? (
                        <>
                            {user.role === 'admin' ? (
                                <Link href="/admin" className="hover:text-blue-300">Admin Dashboard</Link>
                            ) : (
                                <Link href="/dashboard" className="hover:text-blue-300">Dashboard</Link>
                            )}
                            <div className="flex items-center gap-4">
                                <span className="text-sm bg-gray-700 px-2 py-1 rounded">{user.name}</span>
                                <button
                                    onClick={logout}
                                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="hover:text-gray-300">Login</Link>
                            <Link
                                href="/signup"
                                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
