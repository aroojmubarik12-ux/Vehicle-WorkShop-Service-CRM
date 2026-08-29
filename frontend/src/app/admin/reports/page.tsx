"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { BarChart3, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Download } from "lucide-react";

export default function AdminReportsPage() {
  const [slaReport, setSlaReport] = useState<any>(null);
  const [techReport, setTechReport] = useState<any[]>([]);
  const [feedbackReport, setFeedbackReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [slaRes, techRes, fbRes] = await Promise.all([
          api.get("/reports/sla"),
          api.get("/reports/technicians"),
          api.get("/reports/feedback")
        ]);
        if (slaRes.data.success) setSlaReport(slaRes.data);
        if (techRes.data.success) setTechReport(techRes.data.technicians);
        if (fbRes.data.success) setFeedbackReport(fbRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Workshop Reports & Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">Audit SLA compliance, turnaround performance, mechanic efficiency and CSAT</p>
      </div>

      {/* SLA Section */}
      {slaReport && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" /> SLA Compliance Metrics
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Historical turnaround compliance vs deadlines</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-400">{slaReport.slaComplianceRate}%</span>
              <span className="text-[10px] text-slate-400 block font-semibold">Compliance Rate</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] font-bold uppercase text-slate-400">SLA Met on Time</div>
              <div className="text-xl font-black text-emerald-400 mt-1">{slaReport.metSlaCount} jobs</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] font-bold uppercase text-slate-400">SLA Breached</div>
              <div className="text-xl font-black text-rose-400 mt-1">{slaReport.breachedSlaCount} jobs</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] font-bold uppercase text-slate-400">Avg Turnaround</div>
              <div className="text-xl font-black text-indigo-400 mt-1">{slaReport.avgTurnaroundHours} hrs</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] font-bold uppercase text-slate-400">Avg First Response</div>
              <div className="text-xl font-black text-blue-400 mt-1">{slaReport.avgResponseHours} hrs</div>
            </div>
          </div>
        </div>
      )}

      {/* Technician Efficiency Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" /> Technician Efficiency & Quality Report
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="pb-3">Technician</th>
                <th className="pb-3">Specialization</th>
                <th className="pb-3 text-center">Total Assigned</th>
                <th className="pb-3 text-center">Completed</th>
                <th className="pb-3 text-center">Overdue</th>
                <th className="pb-3 text-right">Customer Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {techReport.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-semibold text-slate-100">{t.name}</td>
                  <td className="py-3 text-slate-300">{t.specialization}</td>
                  <td className="py-3 text-center text-slate-200 font-semibold">{t.totalAssigned}</td>
                  <td className="py-3 text-center text-emerald-400 font-semibold">{t.completed}</td>
                  <td className="py-3 text-center text-rose-400 font-semibold">{t.overdue}</td>
                  <td className="py-3 text-right font-bold text-amber-400">{t.rating} ★ ({t.totalReviews} reviews)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
