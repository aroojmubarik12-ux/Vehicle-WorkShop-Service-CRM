"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { JobCard } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import Link from "next/link";
import { Search, Filter, AlertTriangle, ArrowRight, RotateCcw } from "lucide-react";
import { format } from "date-fns";

export default function TechnicianJobCardsPage() {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const fetchJobCards = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;

      const res = await api.get("/jobcards", { params });
      if (res.data.success) {
        setJobCards(res.data.jobCards);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobCards();
  }, [status, priority]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobCards();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">My Assigned Job Cards</h1>
        <p className="text-xs text-slate-400 mt-1">Vehicle service tasks and repairs assigned exclusively to you</p>
      </div>

      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by JC#, Reg#, Customer..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
          >
            <option value="">All Statuses</option>
            <option value="assigned">Assigned</option>
            <option value="diagnosis">Diagnosis</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_for_parts">Waiting for Parts</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 uppercase font-semibold">
              <th className="py-3.5 px-4">Job Card #</th>
              <th className="py-3.5 px-4">Vehicle</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Due Date / SLA</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {jobCards.map((jc) => (
              <tr key={jc._id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                  <Link href={`/technician/jobcards/${jc._id}`} className="hover:underline">
                    {jc.jobCardNumber}
                  </Link>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-200">{jc.vehicle?.make} {jc.vehicle?.model}</div>
                  <div className="text-[10px] font-mono text-slate-400">{jc.vehicle?.registrationNumber}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="text-slate-200">{jc.customer?.name}</div>
                  <div className="text-[10px] text-slate-500">{jc.customer?.phone}</div>
                </td>
                <td className="py-3.5 px-4">
                  <PriorityBadge priority={jc.priority} />
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={jc.status} />
                </td>
                <td className="py-3.5 px-4 text-slate-300">
                  {jc.slaDeadline ? format(new Date(jc.slaDeadline), "MMM d, h:mm a") : "-"}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={`/technician/jobcards/${jc._id}`}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold inline-block"
                  >
                    Open Job
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
