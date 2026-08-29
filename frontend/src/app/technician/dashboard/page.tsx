"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import Link from "next/link";
import {
  Wrench,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
  CalendarCheck,
  ArrowRight,
  RotateCcw
} from "lucide-react";
import { format } from "date-fns";

export default function TechnicianDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard/technician");
      if (res.data.success) {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { kpis, todayFollowUps, activeJobCards, recentFeedbacks } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Mechanic Workshop Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Your active assigned repairs, today's schedule, and customer satisfaction rating</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Assigned</span>
          <div className="text-2xl font-black text-white mt-1.5">{kpis.totalAssigned}</div>
          <span className="text-[10px] text-slate-500">Lifetime jobs</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-indigo-400">Pending Diagnosis</span>
          <div className="text-2xl font-black text-indigo-400 mt-1.5">{kpis.openJobs}</div>
          <span className="text-[10px] text-slate-500">Waiting inspection</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-amber-400">In Progress</span>
          <div className="text-2xl font-black text-amber-400 mt-1.5">{kpis.inProgressJobs}</div>
          <span className="text-[10px] text-slate-500">Under active repair</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-rose-400">SLA Overdue</span>
          <div className="text-2xl font-black text-rose-400 mt-1.5">{kpis.overdueJobs}</div>
          <span className="text-[10px] text-rose-400/80">Action required</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-emerald-400">Rating</span>
          <div className="text-2xl font-black text-emerald-400 mt-1.5">{kpis.averageRating} ★</div>
          <span className="text-[10px] text-slate-500">{kpis.totalReviews} reviews</span>
        </div>
      </div>

      {/* Active Jobs & Follow-ups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Job Cards */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" /> Active Assigned Vehicles
            </h3>
            <Link
              href="/technician/jobcards"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              All My Jobs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60">
            {activeJobCards.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                🎉 No pending jobs assigned to you right now. Great job!
              </div>
            ) : (
              activeJobCards.map((jc: any) => (
                <div key={jc._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-400">{jc.jobCardNumber}</span>
                      <PriorityBadge priority={jc.priority} />
                      <StatusBadge status={jc.status} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 mt-1">{jc.subject}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      🚗 {jc.vehicle?.make} {jc.vehicle?.model} ({jc.vehicle?.registrationNumber}) • 👤 {jc.customer?.name} ({jc.customer?.phone})
                    </p>
                  </div>
                  <Link
                    href={`/technician/jobcards/${jc._id}`}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all shrink-0"
                  >
                    Open Job
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Today's Follow-ups & Rating Feedbacks */}
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-400" /> Today's Scheduled Calls
            </h3>
            <div className="space-y-2.5">
              {todayFollowUps.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">No follow-ups due today.</div>
              ) : (
                todayFollowUps.map((f: any) => (
                  <div key={f._id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{f.time}</span>
                      <span className="text-[10px] uppercase font-bold text-blue-400">{f.type}</span>
                    </div>
                    <p className="text-slate-300 mt-1 text-[11px]">{f.notes}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
