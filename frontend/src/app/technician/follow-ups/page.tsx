"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { FollowUp } from "@/types";
import { CalendarCheck, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

export default function TechnicianFollowUpsPage() {
  const { showToast } = useToast();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowUps = async () => {
    try {
      const res = await api.get("/followups");
      if (res.data.success) {
        setFollowUps(res.data.followUps);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const markComplete = async (id: string) => {
    try {
      const res = await api.patch(`/followups/${id}/status`, { status: "completed" });
      if (res.data.success) {
        showToast("Follow-up marked as completed.", "success");
        fetchFollowUps();
      }
    } catch (e) {
      showToast("Failed to update follow-up.", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Customer Follow-ups & Reminders</h1>
        <p className="text-xs text-slate-400 mt-1">Scheduled phone calls and customer service check-ins</p>
      </div>

      <div className="space-y-3">
        {followUps.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-500">No pending follow-ups assigned to you.</div>
        ) : (
          followUps.map((f) => (
            <div
              key={f._id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-4 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100">{format(new Date(f.date), "EEE, MMM d, yyyy")}</span>
                  <span className="text-slate-400">at {f.time}</span>
                  <span className="text-[10px] font-bold uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    {f.type}
                  </span>
                  {f.jobCard && (
                    <span className="text-[10px] font-mono text-slate-400">
                      [{f.jobCard.jobCardNumber}]
                    </span>
                  )}
                </div>
                <p className="text-slate-300 mt-1.5">{f.notes}</p>
                {f.nextAction && <div className="text-[11px] text-slate-500 mt-1">Next: {f.nextAction}</div>}
              </div>

              {f.status === "pending" ? (
                <button
                  onClick={() => markComplete(f._id)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center gap-1 shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
                </button>
              ) : (
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                  Completed
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
