'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { MoreVertical, X, LogOut, ShieldAlert } from 'lucide-react';
import MobileMenu from './MobileMenu';

export default function Header() {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    // Close settings dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [settingsRef]);

    // Hide navbar on auth/admin pages to avoid double header/layout issues
    if (['/login', '/signup', '/verify', '/admin'].some(path => pathname?.startsWith(path))) {
        return null;
    }

    return (
        <nav className="bg-card border-b border-border text-card-foreground p-4 shadow-sm relative z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold hover:text-primary transition-colors">
                    FeedbackSystem
                </Link>

                <div className="flex items-center gap-4">
                    {loading ? null : (
                        user ? (
                            <div className="relative" ref={settingsRef}>
                                <button 
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-muted transition-colors ring-2 ring-transparent focus:outline-none focus:ring-primary/50"
                                >
                                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-violet-800 flex items-center justify-center text-lg text-white font-bold border border-primary/20 shadow-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </button>
                                
                                {/* Settings Dropdown Popover */}
                                {isSettingsOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-card rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="p-4 border-b border-border bg-muted/30">
                                            <p className="font-bold text-foreground truncate">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                        {user.role === 'admin' && (
                                            <div className="p-2 border-b border-border">
                                                <Link href="/admin" className="w-full px-3 py-2 flex items-center gap-2 rounded-lg hover:bg-primary/10 text-primary text-sm font-medium transition-colors" onClick={() => setIsSettingsOpen(false)}>
                                                    <ShieldAlert size={16} />
                                                    Admin Dashboard
                                                </Link>
                                            </div>
                                        )}
                                        <div className="p-2">
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setIsSettingsOpen(false);
                                                }}
                                                className="w-full px-3 py-2.5 flex items-center gap-2 rounded-lg hover:bg-red-500/10 text-red-500 text-sm font-medium transition-colors font-bold"
                                            >
                                                <LogOut size={16} />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="hidden md:flex gap-4 items-center">
                                    <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors font-medium">Login</Link>
                                    <Link
                                        href="/signup"
                                        className="bg-primary hover:bg-sky-500 text-primary-foreground px-5 py-2 rounded-full transition shadow-sm hover:shadow font-medium"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                                <button
                                    className="md:hidden text-muted-foreground hover:text-foreground focus:outline-none"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                                >
                                    {isMenuOpen ? <X size={24} /> : <MoreVertical size={24} />}
                                </button>
                            </>
                        )
                    )}
                </div>
            </div>

            <MobileMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        </nav>
    );
}
