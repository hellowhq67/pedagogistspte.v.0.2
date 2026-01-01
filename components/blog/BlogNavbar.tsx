"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function BlogNavbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Home */}
                    <Link href="/blog" className="font-bold text-lg hover:text-primary transition-colors">
                        PTE Blog
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/blog" className="hover:text-primary transition-colors text-sm">
                            All Articles
                        </Link>
                        <Link href="/" className="hover:text-primary transition-colors text-sm">
                            Home
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                        >
                            <Link href="/practice">Back to Practice</Link>
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden pb-4 space-y-2 border-t border-border/50">
                        <Link
                            href="/blog"
                            className="block py-2 hover:text-primary transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            All Articles
                        </Link>
                        <Link
                            href="/"
                            className="block py-2 hover:text-primary transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Home
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            asChild
                        >
                            <Link href="/practice">Back to Practice</Link>
                        </Button>
                    </div>
                )}
            </div>
        </nav>
    );
}
