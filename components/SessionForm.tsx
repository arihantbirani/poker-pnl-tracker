"use client";

import { useState, useEffect } from "react";
import { Session } from "@/types/session";
import { useSessions } from "@/hooks/useSessions";
import { Loader2, X } from "lucide-react";

interface SessionFormProps {
    editingSession?: Session | null;
    onCancelEdit?: () => void;
    onSuccess?: () => void;
}

export function SessionForm({ editingSession, onCancelEdit, onSuccess }: SessionFormProps) {
    const { addSession, updateSession, user } = useSessions();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        location: "",
        gameType: "",
        buyIn: "",
        cashOut: "",
        hours: "",
        stakeSold: "",
        notes: "",
    });

    useEffect(() => {
        if (editingSession) {
            setFormData({
                location: editingSession.location,
                gameType: editingSession.gameType,
                buyIn: editingSession.buyIn.toString(),
                cashOut: editingSession.cashOut.toString(),
                hours: editingSession.hours.toString(),
                stakeSold: editingSession.stakeSold.toString(),
                notes: editingSession.notes || "",
            });
        } else {
            // Reset if no editing session (e.g. cancelled)
            setFormData({
                location: "",
                gameType: "",
                buyIn: "",
                cashOut: "",
                hours: "",
                stakeSold: "",
                notes: "",
            });
        }
    }, [editingSession]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const buyIn = parseFloat(formData.buyIn) || 0;
            const cashOut = parseFloat(formData.cashOut) || 0;
            const hours = parseFloat(formData.hours) || 0;
            const stakeSold = parseFloat(formData.stakeSold) || 0;

            const sessionData = {
                location: formData.location || "Online",
                gameType: formData.gameType || "NLH",
                buyIn,
                cashOut,
                hours,
                stakeSold,
                notes: formData.notes,
            };

            if (editingSession) {
                await updateSession(editingSession.id, sessionData);
            } else {
                await addSession({
                    ...sessionData,
                    date: new Date().toISOString().split('T')[0],
                });
            }

            // Reset form if just adding, or notify parent if editing
            if (!editingSession) {
                setFormData({
                    location: "",
                    gameType: "",
                    buyIn: "",
                    cashOut: "",
                    hours: "",
                    stakeSold: "",
                    notes: "",
                });
            }

            if (onSuccess) onSuccess();

        } catch (error) {
            console.error("Failed to save session:", error);
            alert("Failed to save session. Check console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                    {editingSession ? "Edit Poker Session" : "Add Poker Session"}
                </h2>
                {editingSession && (
                    <button onClick={onCancelEdit} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Online, Casino, etc."
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Game Type</label>
                        <input
                            type="text"
                            name="gameType"
                            value={formData.gameType}
                            onChange={handleChange}
                            placeholder="200NL, 500NL, etc."
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Buy-in ($)</label>
                        <input
                            type="number"
                            name="buyIn"
                            value={formData.buyIn}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Cash-out ($)</label>
                        <input
                            type="number"
                            name="cashOut"
                            value={formData.cashOut}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Hours Played (optional)</label>
                        <input
                            type="number"
                            name="hours"
                            value={formData.hours}
                            onChange={handleChange}
                            placeholder="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Stake Sold (%)</label>
                        <input
                            type="number"
                            name="stakeSold"
                            value={formData.stakeSold}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Notes (optional)</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Session notes..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {editingSession ? "Update Session" : "Add Session"}
                    </button>
                    {editingSession && (
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                    {!editingSession && (
                        <button
                            type="button"
                            className="px-6 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Data
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
