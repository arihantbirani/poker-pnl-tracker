"use client";

import { useSessions } from "@/hooks/useSessions";
import { StatsCard } from "@/components/StatsCard";
import { SessionForm } from "@/components/SessionForm";
import { PNLChart } from "@/components/PNLChart";
import { SessionTable } from "@/components/SessionTable";
import { AdminLogin } from "@/components/AdminLogin";
import { formatCurrency } from "@/lib/utils";
import { useMemo, useState, useRef } from "react";
import { Spade, Club } from "lucide-react";
import { Session } from "@/types/session";

export default function Home() {
  const { sessions, loading } = useSessions();
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    let gross = 0;
    let net = 0;
    let staker = 0;
    let totalHours = 0;

    sessions.forEach(s => {
      const sGross = s.cashOut - s.buyIn;
      const sStaker = sGross * (s.stakeSold / 100);
      const sNet = sGross - sStaker;

      gross += sGross;
      net += sNet;
      staker += sStaker;
      totalHours += s.hours;
    });

    const totalSessions = sessions.length;
    const avgPerSession = totalSessions > 0 ? net / totalSessions : 0;
    const hourlyRate = totalHours > 0 ? net / totalHours : 0;

    return { gross, net, staker, totalSessions, avgPerSession, totalHours, hourlyRate };
  }, [sessions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading Poker Tracker...</div>
      </div>
    );
  }

  const handleEditSuccess = () => {
    setEditingSession(null);
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-indigo-900 p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-center gap-4 py-4">
          <Spade className="w-8 h-8 text-black fill-black" />
          <h1 className="text-4xl font-bold text-white tracking-tight">Ari's Poker PNL Tracker</h1>
          <Club className="w-8 h-8 text-black fill-black" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatsCard
            title="Gross PNL (Before Stake)"
            value={formatCurrency(stats.gross)}
            textColor={stats.gross >= 0 ? "text-emerald-500" : "text-rose-500"}
          />
          <StatsCard
            title="Net PNL"
            value={formatCurrency(stats.net)}
            textColor={stats.net >= 0 ? "text-emerald-500" : "text-rose-500"}
          />
          <StatsCard
            title="Staker PNL"
            value={formatCurrency(stats.staker)}
            textColor={stats.staker >= 0 ? "text-emerald-500" : "text-rose-500"}
          />
          {/* Removed Total Sessions as requested */}

          <StatsCard
            title="Avg Per Session"
            value={formatCurrency(stats.avgPerSession)}
            textColor={stats.avgPerSession >= 0 ? "text-emerald-500" : "text-rose-500"}
          />
          <StatsCard
            title="Total Hours"
            value={stats.totalHours.toFixed(1)}
            textColor="text-blue-500"
          />
          <StatsCard
            title="$/Hour"
            value={formatCurrency(stats.hourlyRate)}
            textColor={stats.hourlyRate >= 0 ? "text-emerald-500" : "text-rose-500"}
          />
        </div>

        {/* Add/Edit Session Form */}
        <div ref={formRef}>
          <SessionForm
            editingSession={editingSession}
            onCancelEdit={() => setEditingSession(null)}
            onSuccess={handleEditSuccess}
          />
        </div>

        {/* Chart */}
        <PNLChart sessions={sessions} />

        {/* Data Table */}
        <SessionTable onEdit={handleEditSession} />

        <AdminLogin />
      </div>
    </div>
  );
}
