"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { History, Clock, User, FileText } from "lucide-react";
import { format } from "date-fns";

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/activity-logs?limit=50");
        if (res.data.success) {
          setLogs(res.data.logs);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Workshop Activity & Audit Logs</h1>
        <p className="text-xs text-slate-400 mt-1">Full chronological event timeline of all job actions, updates, and assignments</p>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 divide-y divide-slate-800/60">
        {logs.map((log) => (
          <div key={log._id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-blue-400 shrink-0 mt-0.5">
                <History className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100">{log.user?.name || "System"}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold">
                    {log.action}
                  </span>
                  {log.jobCard && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      [{log.jobCard.jobCardNumber}]
                    </span>
                  )}
                </div>
                <p className="text-slate-300 mt-1">{log.description}</p>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 whitespace-nowrap">
              {format(new Date(log.createdAt), "MMM d, h:mm a")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
