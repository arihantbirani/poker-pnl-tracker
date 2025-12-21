"use client";

import { useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Session } from "@/types/session";
import { formatCurrency } from "@/lib/utils";

interface PNLChartProps {
    sessions: Session[];
}

export function PNLChart({ sessions }: PNLChartProps) {
    const data = useMemo(() => {
        // Sort sessions by date/time ascending
        const sorted = [...sessions].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA === dateB) return a.createdAt - b.createdAt;
            return dateA - dateB;
        });

        let cumulative = 0;
        return sorted.map((session) => {
            const gross = session.cashOut - session.buyIn;
            const stakerCut = gross * (session.stakeSold / 100);
            const net = gross - stakerCut;
            cumulative += net;

            return {
                date: session.date,
                pnl: cumulative,
            };
        });
    }, [sessions]);

    // Add a start point (0, 0) if data exists
    const chartData = data.length > 0
        ? [{ date: 'Start', pnl: 0 }, ...data]
        : [];

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Cumulative PNL Over Time</h2>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickLine={false}
                            axisLine={false}
                            padding={{ left: 0, right: 0 }}
                        />
                        <YAxis
                            tickFormatter={(value) => `$${value}`}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            formatter={(value: any) => [formatCurrency(value), "Cumulative PNL"]}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="pnl"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPnl)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
