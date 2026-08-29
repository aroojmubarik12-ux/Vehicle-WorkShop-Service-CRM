"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { SLA } from "@/types";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { ShieldAlert, Clock, CheckCircle2 } from "lucide-react";

export default function AdminSlaPage() {
  const { showToast } = useToast();
  const [slas, setSlas] = useState<SLA[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSlas = async () => {
    try {
      const res = await api.get("/sla");
      if (res.data.success) {
        setSlas(res.data.slas);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlas();
  }, []);

  const handleUpdateSla = async (id: string, responseHours: number, turnaroundHours: number) => {
    try {
      const res = await api.put(`/sla/${id}`, {
        responseTimeHours: responseHours,
        turnaroundTimeHours: turnaroundHours
      });
      if (res.data.success) {
        showToast("SLA rule updated successfully.", "success");
        fetchSlas();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to update SLA.", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Service Level Agreements (SLA)</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure response deadlines and repair turnaround targets per priority level
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slas.map((sla) => (
          <div key={sla._id} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <PriorityBadge priority={sla.priority} />
              <span className="text-[10px] font-bold uppercase text-slate-500">Service: {sla.serviceType}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" /> First Response Target
                </span>
                <div className="text-xl font-black text-white mt-1">{sla.responseTimeHours} Hours</div>
                <span className="text-[10px] text-slate-500">Creation to diagnosis</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Turnaround Target
                </span>
                <div className="text-xl font-black text-white mt-1">{sla.turnaroundTimeHours} Hours</div>
                <span className="text-[10px] text-slate-500">Creation to completion</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
