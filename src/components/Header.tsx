'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { MoreVertical, X } from 'lucide-react';
import MobileMenu from './MobileMenu';

export default function Header() {
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
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                >
                    {isMenuOpen ? <X size={24} /> : <MoreVertical size={24} />}
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-4 items-center">
                    {loading ? null : (
                        user ? (
                            <>
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

            <MobileMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        </nav>
    );
}
