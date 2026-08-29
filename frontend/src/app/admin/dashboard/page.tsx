"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { StatusPieChart, ServiceTypeBarChart } from "@/components/charts/DashboardCharts";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Users,
  Car,
  Award,
  ArrowUpRight,
  TrendingUp,
  RotateCcw,
  Plus
} from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard/admin");
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
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { kpis, charts, technicianPerformance, recentActivity, recentJobCards } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Workshop Operations Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Live tracking of service workload, turnaround efficiency, and mechanics</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <Link
            href="/admin/jobcards/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" /> New Job Card
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden">
          <div className="text-[11px] font-semibold uppercase text-slate-400 flex items-center justify-between">
            Total Jobs <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{kpis.totalJobs}</div>
          <div className="text-[10px] text-slate-500 mt-1">Lifetime service requests</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden">
          <div className="text-[11px] font-semibold uppercase text-slate-400 flex items-center justify-between">
            Open / Pending <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-2">{kpis.openJobs}</div>
          <div className="text-[10px] text-slate-500 mt-1">Awaiting technician intake</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden">
          <div className="text-[11px] font-semibold uppercase text-slate-400 flex items-center justify-between">
            In Progress <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">{kpis.inProgressJobs}</div>
          <div className="text-[10px] text-slate-500 mt-1">Active on workshop floor</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden">
          <div className="text-[11px] font-semibold uppercase text-slate-400 flex items-center justify-between">
            Critical Priority <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2">{kpis.highCriticalJobs}</div>
          <div className="text-[10px] text-rose-400/80 mt-1">Urgent attention needed</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden">
          <div className="text-[11px] font-semibold uppercase text-slate-400 flex items-center justify-between">
            SLA Overdue <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-500 mt-2">{kpis.overdueJobs}</div>
          <div className="text-[10px] text-red-400/80 mt-1">Breached deadline</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden">
          <div className="text-[11px] font-semibold uppercase text-slate-400 flex items-center justify-between">
            Satisfaction <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{kpis.avgSatisfactionScore} ★</div>
          <div className="text-[10px] text-slate-500 mt-1">{kpis.satisfactionPercentage}% positive rating</div>
        </div>
      </div>

      {/* Turnaround Time KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-500/20 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-blue-300">Avg First Response Time</div>
            <div className="text-2xl font-black text-white mt-1">{kpis.avgResponseTime} hrs</div>
            <div className="text-[11px] text-slate-400">Creation to initial diagnosis</div>
          </div>
          <Clock className="w-8 h-8 text-blue-400/40" />
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-indigo-300">Avg Turnaround Time</div>
            <div className="text-2xl font-black text-white mt-1">{kpis.avgTurnaroundTime} hrs</div>
            <div className="text-[11px] text-slate-400">Creation to completed repair</div>
          </div>
          <TrendingUp className="w-8 h-8 text-indigo-400/40" />
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-slate-900 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-emerald-300">Delivered & Closed</div>
            <div className="text-2xl font-black text-white mt-1">{kpis.deliveredJobs} vehicles</div>
            <div className="text-[11px] text-slate-400">Handed over to customer</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400/40" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-100 mb-1">Job Status Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Proportion of active vs completed jobs</p>
          <StatusPieChart data={charts.statusDistribution} />
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-100 mb-1">Service Category Breakdown</h3>
          <p className="text-xs text-slate-400 mb-4">Volume by service types</p>
          <ServiceTypeBarChart data={charts.serviceTypeDistribution} />
        </div>
      </div>

      {/* Technician Performance Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Technician & Mechanic Performance</h3>
            <p className="text-xs text-slate-400 mt-0.5">Assigned workload, completed repairs, overdue jobs and customer ratings</p>
          </div>
          <Link
            href="/admin/technicians"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            Manage Technicians <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="pb-3">Technician</th>
                <th className="pb-3">Specialization</th>
                <th className="pb-3 text-center">Assigned</th>
                <th className="pb-3 text-center">Open</th>
                <th className="pb-3 text-center">Completed</th>
                <th className="pb-3 text-center">Overdue</th>
                <th className="pb-3 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {technicianPerformance.map((tech: any) => (
                <tr key={tech.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-semibold text-slate-100 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs">
                      {tech.name.charAt(0)}
                    </div>
                    <div>
                      <div>{tech.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{tech.email}</div>
                    </div>
                  </td>
                  <td className="py-3 text-slate-300">{tech.specialization}</td>
                  <td className="py-3 text-center font-semibold text-slate-200">{tech.assignedJobs}</td>
                  <td className="py-3 text-center font-semibold text-indigo-400">{tech.openJobs}</td>
                  <td className="py-3 text-center font-semibold text-emerald-400">{tech.completedJobs}</td>
                  <td className="py-3 text-center font-semibold text-rose-400">{tech.overdueJobs}</td>
                  <td className="py-3 text-right font-bold text-amber-400">{tech.rating} ★</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Job Cards */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Recent Service Requests</h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest job cards registered in workshop</p>
          </div>
          <Link
            href="/admin/jobcards"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            View All Job Cards <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="pb-3">Job Card #</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Subject</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Assigned To</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentJobCards.map((jc: any) => (
                <tr key={jc._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-mono font-bold text-blue-400">{jc.jobCardNumber}</td>
                  <td className="py-3 font-medium text-slate-200">{jc.customer?.name || "-"}</td>
                  <td className="py-3 text-slate-300">
                    {jc.vehicle ? `${jc.vehicle.make} ${jc.vehicle.model} (${jc.vehicle.registrationNumber})` : "-"}
                  </td>
                  <td className="py-3 text-slate-300 max-w-xs truncate">{jc.subject}</td>
                  <td className="py-3">
                    <PriorityBadge priority={jc.priority} />
                  </td>
                  <td className="py-3">
                    <StatusBadge status={jc.status} />
                  </td>
                  <td className="py-3 text-slate-300">{jc.assignedTo?.name || "Unassigned"}</td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/admin/jobcards/${jc._id}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold transition-colors inline-block"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
