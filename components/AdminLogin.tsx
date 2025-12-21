"use client";

import { useState } from "react";
import { useSessions } from "@/hooks/useSessions";
import { Lock, LogOut, Loader2 } from "lucide-react";

export function AdminLogin() {
    const { user, login, logout, authLoading, restoreDefaults, sessions } = useSessions();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRestore = async () => {
        if (confirm("Import legacy data? This will add 9 sessions to your database.")) {
            await restoreDefaults();
        }
    }

    if (authLoading) return null;

    if (user) {
        return (
            <div className="fixed bottom-4 right-4 z-50 flex gap-2">
                {sessions.length === 0 && (
                    <button
                        onClick={handleRestore}
                        className="bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2 px-4 text-sm"
                    >
                        <span>Import Data</span>
                    </button>
                )}
                <button
                    onClick={logout}
                    className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-all flex items-center gap-2 px-4 text-sm"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </div>
        );
    }

    if (!isOpen) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-white text-indigo-900 p-3 rounded-full shadow-xl hover:bg-gray-100 transition-all flex items-center gap-2 font-bold ring-4 ring-indigo-900/20"
                    title="Admin Access"
                >
                    <Lock className="w-5 h-5" />
                    <span className="sr-only">Admin Login</span>
                </button>
            </div>
        );
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            await login(email, password);
            setIsOpen(false);
            setEmail("");
            setPassword("");
        } catch (err: any) {
            setError("Invalid credentials");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Admin Access
                </h3>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
