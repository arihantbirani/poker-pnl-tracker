"use client";

import { useSessions } from "@/hooks/useSessions";
import { formatCurrency, formatPercentage, cn } from "@/lib/utils";
import { Trash2, Pencil } from "lucide-react";
import { Session } from "@/types/session";

interface SessionTableProps {
    onEdit: (session: Session) => void;
}

export function SessionTable({ onEdit }: SessionTableProps) {
    const { sessions, deleteSession, user } = useSessions();

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this session?")) {
            await deleteSession(id);
        }
    };

    if (sessions.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">No sessions recorded yet.</div>
        );
    }

    // Sort sessions descending by default for the table
    const displaySessions = [...sessions];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Game</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Buy-in</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cash-out</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hours</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stake Sold</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Net PNL</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">$/Hour</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {displaySessions.map((session) => {
                            const gross = session.cashOut - session.buyIn;
                            const stakerCut = gross * (session.stakeSold / 100);
                            const net = gross - stakerCut;
                            const hourly = session.hours > 0 ? net / session.hours : 0;

                            return (
                                <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium whitespace-nowrap">{session.date}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 font-bold whitespace-nowrap">{session.location}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{session.gameType}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium whitespace-nowrap">{formatCurrency(session.buyIn)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium whitespace-nowrap">{formatCurrency(session.cashOut)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{session.hours}h</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatPercentage(session.stakeSold)}</td>
                                    <td className={cn(
                                        "px-6 py-4 text-sm font-bold whitespace-nowrap",
                                        net >= 0 ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                        {formatCurrency(net)}
                                    </td>
                                    <td className={cn(
                                        "px-6 py-4 text-sm font-medium whitespace-nowrap",
                                        hourly >= 0 ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                        {formatCurrency(hourly)}
                                    </td>
                                    <td className="px-6 py-4 text-sm whitespace-nowrap flex gap-2">
                                        {user ? (
                                            <>
                                                <button
                                                    onClick={() => onEdit(session)}
                                                    className="px-3 py-1 bg-indigo-500 text-white text-xs font-medium rounded hover:bg-indigo-600 transition-colors flex items-center gap-1"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(session.id)}
                                                    className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 transition-colors flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Delete
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs">Read Only</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
