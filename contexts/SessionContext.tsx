"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    query,
    orderBy
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Session } from "@/types/session";
import { User, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// Data from user screenshot
const MOCK_DATA: Session[] = [
    {
        id: "1",
        date: "2025-12-20",
        location: "Online",
        gameType: "2/5 NLH",
        buyIn: 500,
        cashOut: 686,
        hours: 3,
        stakeSold: 20,
        notes: "-",
        createdAt: 1734739200000
    },
    {
        id: "2",
        date: "2025-12-20",
        location: "Online",
        gameType: "1/2 NLH",
        buyIn: 200,
        cashOut: 293.50,
        hours: 1,
        stakeSold: 20,
        notes: "-",
        createdAt: 1734739201000
    },
    {
        id: "3",
        date: "2025-12-20",
        location: "Online",
        gameType: "1/2 NLH",
        buyIn: 200,
        cashOut: 0,
        hours: 0.5,
        stakeSold: 20,
        notes: "-",
        createdAt: 1734739202000
    },
    {
        id: "4",
        date: "2025-12-20",
        location: "Online",
        gameType: "1/2 NLH",
        buyIn: 200,
        cashOut: 532,
        hours: 2,
        stakeSold: 20,
        notes: "-",
        createdAt: 1734739203000
    },
    {
        id: "5",
        date: "2025-12-20",
        location: "Online",
        gameType: "50 PLO",
        buyIn: 50,
        cashOut: 293.33,
        hours: 0.5,
        stakeSold: 0,
        notes: "-",
        createdAt: 1734739204000
    },
    {
        id: "6",
        date: "2025-12-21",
        location: "Online",
        gameType: "100 NL",
        buyIn: 200,
        cashOut: 307,
        hours: 1,
        stakeSold: 20,
        notes: "-",
        createdAt: 1734825600000
    },
    {
        id: "7",
        date: "2025-12-21",
        location: "Online",
        gameType: "50 PLO",
        buyIn: 50,
        cashOut: 339.42,
        hours: 1,
        stakeSold: 0,
        notes: "-",
        createdAt: 1734825601000
    },
    {
        id: "8",
        date: "2025-12-21",
        location: "Online",
        gameType: "1/2 NLH",
        buyIn: 200,
        cashOut: 214.98,
        hours: 1,
        stakeSold: 20,
        notes: "-",
        createdAt: 1734825602000
    },
    {
        id: "9",
        date: "2025-12-21",
        location: "Online",
        gameType: "100NL",
        buyIn: 200,
        cashOut: 418,
        hours: 0.617,
        stakeSold: 20,
        notes: "-",
        createdAt: 1734825603000
    }
];

interface SessionContextType {
    sessions: Session[];
    loading: boolean;
    error: string | null;
    addSession: (session: Omit<Session, "id" | "createdAt">) => Promise<void>;
    deleteSession: (id: string) => Promise<void>;
    updateSession: (id: string, data: Partial<Session>) => Promise<void>;
    user: User | null;
    authLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    restoreDefaults: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
    // Start with empty to avoid hydration mismatch, load in effect
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPersisted, setIsPersisted] = useState(false); // Track if we've loaded initial data

    // Auth State
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Monitor Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        await signOut(auth);
    };

    useEffect(() => {
        setLoading(true);
        try {
            const q = query(collection(db, "sessions"), orderBy("date", "desc"), orderBy("createdAt", "desc"));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const sessionData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Session[];

                setSessions(sessionData);
                setLoading(false);
            }, (err) => {
                console.error("Firebase error details:", err);
                // Fallback to local storage if permission denied or any other error
                try {
                    const savedData = localStorage.getItem("poker-tracker-sessions");
                    if (savedData) {
                        setSessions(JSON.parse(savedData));
                    } else {
                        setSessions(MOCK_DATA);
                    }
                } catch (e) {
                    setSessions(MOCK_DATA);
                }
                setIsPersisted(true);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (err: any) {
            console.error("Error setting up listener:", err);
            setLoading(false);
        }
    }, []);

    // Save to localStorage whenever sessions change (as backup)
    useEffect(() => {
        if (isPersisted) {
            localStorage.setItem("poker-tracker-sessions", JSON.stringify(sessions));
        }
    }, [sessions, isPersisted]);

    const addSession = async (newSession: Omit<Session, "id" | "createdAt">) => {
        try {
            const tempId = Math.random().toString(36).substr(2, 9);
            const optimisticSession = { ...newSession, id: tempId, createdAt: Date.now() };

            // We don't update local state immediately here because the snapshot listener will handle it
            // UNLESS we are in fallback mode.
            if (isPersisted) {
                setSessions(prev => [optimisticSession, ...prev]);
            }

            await addDoc(collection(db, "sessions"), {
                ...newSession,
                createdAt: Date.now(),
            });
        } catch (err: any) {
            console.error("Error adding session:", err);
            // If firebase failed, update local state
            if (!isPersisted) {
                // If we weren't in persisted mode but failed, force persisted mode
                const tempId = Math.random().toString(36).substr(2, 9);
                const optimisticSession = { ...newSession, id: tempId, createdAt: Date.now() };
                setSessions(prev => [optimisticSession, ...prev]);
            }
        }
    };

    const updateSession = async (id: string, updatedData: Partial<Session>) => {
        try {
            if (isPersisted) {
                setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updatedData } : s));
            }
            await updateDoc(doc(db, "sessions", id), updatedData);
        } catch (err) {
            console.error("Error updating session:", err);
            // Verify local update happened if fallback
        }
    }

    const deleteSession = async (id: string) => {
        try {
            if (isPersisted) {
                setSessions(prev => prev.filter(s => s.id !== id));
            }
            await deleteDoc(doc(db, "sessions", id));
        } catch (err) {
            console.error("Error deleting session:", err);
        }
    };

    const restoreDefaults = async () => {
        if (!user) return;
        setLoading(true);
        try {
            for (const session of MOCK_DATA) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...data } = session;
                await addDoc(collection(db, "sessions"), {
                    ...data
                });
            }
        } catch (err) {
            console.error("Error restoring defaults:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SessionContext.Provider value={{
            sessions,
            loading,
            error,
            addSession,
            deleteSession,
            updateSession,
            user,
            authLoading,
            login,
            logout,
            restoreDefaults
        }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSessionContext() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error("useSessionContext must be used within a SessionProvider");
    }
    return context;
}
