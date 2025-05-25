'use client';
import React from 'react';
import Link from 'next/link';

const Navbar = () => {
    return (
        <nav className="bg-primary-dark/50 backdrop-blur-sm border-b border-primary-light/20">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-primary-lightest">ShortenMe</Link>
                <div className="space-x-4">
                    <Link href="/login" className="text-primary-lightest hover:text-white transition-colors">Login</Link>
                    <Link href="/signup" className="bg-primary-light hover:bg-primary-lightest text-white px-4 py-2 rounded-lg transition-colors">Sign Up</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 