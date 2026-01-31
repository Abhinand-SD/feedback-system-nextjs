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
        <nav className="bg-card border-b border-border text-card-foreground p-4 shadow-sm relative z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold hover:text-primary transition-colors">
                    FeedbackSystem
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-muted-foreground hover:text-foreground focus:outline-none"
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
                                    <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors font-medium">Admin Dashboard</Link>
                                ) : (
                                    <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors font-medium">Dashboard</Link>
                                )}
                                <div className="flex items-center gap-4">
                                    <span className="text-sm bg-muted text-muted-foreground px-3 py-1 rounded-full font-medium">{user.name}</span>
                                    <button
                                        onClick={logout}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-full text-sm transition shadow-sm hover:shadow"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors font-medium">Login</Link>
                                <Link
                                    href="/signup"
                                    className="bg-primary hover:bg-sky-500 text-primary-foreground px-5 py-2 rounded-full transition shadow-sm hover:shadow font-medium"
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
                <div className="md:hidden absolute top-full left-0 right-0 bg-card border-b border-border p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
                    {loading ? null : (
                        user ? (
                            <>
                                <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                                    <span className="font-medium text-foreground">{user.name}</span>
                                    <span className="text-xs text-muted-foreground capitalize bg-background px-2 py-0.5 rounded border border-border">{user.role}</span>
                                </div>

                                {user.role === 'admin' ? (
                                    <Link
                                        href="/admin"
                                        className="text-muted-foreground hover:text-primary py-2 block font-medium"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Admin Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href="/dashboard"
                                        className="text-muted-foreground hover:text-primary py-2 block font-medium"
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
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-center transition w-full font-medium"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="hover:text-primary hover:bg-muted py-2.5 block text-center border border-border rounded-lg text-muted-foreground transition"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="bg-primary hover:bg-sky-500 text-primary-foreground px-4 py-2.5 rounded-lg transition text-center block font-medium"
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
