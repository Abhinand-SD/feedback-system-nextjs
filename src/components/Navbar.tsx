'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Hide navbar on auth pages to avoid double header/layout issues
    if (['/login', '/signup', '/verify'].some(path => pathname?.startsWith(path))) {
        return null;
    }

    return (
        <nav className="bg-gray-800 text-white p-4 shadow-md relative z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold hover:text-gray-200">
                    FeedbackSystem
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-200 hover:text-white focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-4 items-center">
                    {loading ? null : (
                        user ? (
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
                        )
                    )}
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5 duration-200">
                    {loading ? null : (
                        user ? (
                            <>
                                <div className="flex items-center justify-between bg-gray-700 p-2 rounded">
                                    <span className="font-medium">{user.name}</span>
                                    <span className="text-xs text-gray-400 capitalize">{user.role}</span>
                                </div>

                                {user.role === 'admin' ? (
                                    <Link
                                        href="/admin"
                                        className="hover:text-blue-300 py-2 block"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Admin Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href="/dashboard"
                                        className="hover:text-blue-300 py-2 block"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                )}

                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-center transition w-full"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="hover:text-gray-300 py-2 block text-center border border-gray-600 rounded"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition text-center block"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )
                    )}
                </div>
            )}
        </nav>
    );
}
