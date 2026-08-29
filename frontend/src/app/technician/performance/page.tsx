"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { Award, Star, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

export default function TechnicianPerformancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/technician").then((res) => {
      if (res.data.success) {
        setData(res.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { kpis, recentFeedbacks } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Mechanic Performance & CSAT</h1>
        <p className="text-xs text-slate-400 mt-1">Review your service quality rating, completed volume, and customer reviews</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400" /> Customer Satisfaction
          </span>
          <div className="text-3xl font-black text-amber-400">{kpis.averageRating} / 5.0</div>
          <span className="text-xs text-slate-500">{kpis.totalReviews} total customer ratings</span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed Jobs
          </span>
          <div className="text-3xl font-black text-emerald-400">{kpis.completedJobs}</div>
          <span className="text-xs text-slate-500">Repairs successfully finished</span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-400" /> Total Volume
          </span>
          <div className="text-3xl font-black text-white">{kpis.totalAssigned}</div>
          <span className="text-xs text-slate-500">Assigned workload</span>
        </div>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Customer Ratings & Comments</h3>
        <div className="divide-y divide-slate-800/60">
          {recentFeedbacks.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">No customer reviews yet.</div>
          ) : (
            recentFeedbacks.map((fb: any, idx: number) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < fb.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-200 ml-1">{fb.rating}.0</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {format(new Date(fb.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <p className="text-slate-300 italic">"{fb.comment || "Great repair service!"}"</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
