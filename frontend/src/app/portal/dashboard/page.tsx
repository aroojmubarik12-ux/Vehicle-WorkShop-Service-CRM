"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import Link from "next/link";
import { Car, Wrench, Plus, ArrowRight, CheckCircle2, Clock } from "lucide-react";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard/customer");
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
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { kpis, myVehicles, recentServices } = data;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome & Book Service Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Customer Portal</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Welcome, {user?.name}!</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
            Track your vehicle maintenance in real-time, view itemized repair quotes, and book service appointments.
          </p>
        </div>
        <Link
          href="/portal/jobcards/create"
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl shadow-xl shadow-blue-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Book Service Request
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Active Services</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{kpis.activeServices}</div>
            <span className="text-[10px] text-slate-500">Vehicles in workshop</span>
          </div>
          <Wrench className="w-8 h-8 text-amber-400/40" />
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Completed Services</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{kpis.completedServices}</div>
            <span className="text-[10px] text-slate-500">Service records completed</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400/40" />
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Registered Vehicles</span>
            <div className="text-2xl font-black text-indigo-400 mt-1">{kpis.totalVehicles}</div>
            <span className="text-[10px] text-slate-500">In your garage</span>
          </div>
          <Car className="w-8 h-8 text-indigo-400/40" />
        </div>
      </div>

      {/* Active Service Requests */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100">Live Vehicle Service Requests</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time status updates from our workshop</p>
          </div>
          <Link
            href="/portal/jobcards"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            All Services <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-800/60">
          {recentServices.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No service requests found. Click "Book Service Request" above to register your vehicle!
            </div>
          ) : (
            recentServices.map((jc: any) => (
              <div key={jc._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-400">{jc.jobCardNumber}</span>
                    <StatusBadge status={jc.status} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 mt-1">{jc.subject}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    🚗 {jc.vehicle?.make} {jc.vehicle?.model} [{jc.vehicle?.registrationNumber}] • Mechanic: {jc.assignedTo?.name || "Assigned shortly"}
                  </p>
                </div>
                <Link
                  href={`/portal/jobcards/${jc._id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all shrink-0"
                >
                  Track Live
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
