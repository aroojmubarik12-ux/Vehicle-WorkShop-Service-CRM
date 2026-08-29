"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { JobCard } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import Link from "next/link";
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Download,
  AlertTriangle,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";

export default function AdminJobCardsPage() {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [overdue, setOverdue] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchJobCards = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (overdue) params.overdue = "true";

      const res = await api.get("/jobcards", { params });
      if (res.data.success) {
        setJobCards(res.data.jobCards);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobCards();
  }, [page, status, priority, overdue]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobCards();
  };

  const handleExportCSV = () => {
    if (!jobCards.length) return;
    const headers = "JobCardNumber,Customer,Vehicle,RegNo,Priority,Status,AssignedTo,TotalCost,CreatedAt\n";
    const rows = jobCards
      .map(
        (jc) =>
          `"${jc.jobCardNumber}","${jc.customer?.name || ""}","${jc.vehicle?.make || ""} ${jc.vehicle?.model || ""}","${jc.vehicle?.registrationNumber || ""}","${jc.priority}","${jc.status}","${jc.assignedTo?.name || "Unassigned"}","${jc.totalCost || 0}","${jc.createdAt}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `JobCards_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Job Cards Management</h1>
          <p className="text-xs text-slate-400 mt-1">Manage, filter, assign, and track all workshop service requests ({totalCount} total)</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <Link
            href="/admin/jobcards/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Job Card
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by JC#, Customer Name, Reg #, or Subject..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Status:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="diagnosis">Diagnosis</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_for_parts">Waiting for Parts</option>
              <option value="waiting_for_customer_approval">Waiting Approval</option>
              <option value="completed">Completed</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Priority:</span>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <button
            onClick={() => {
              setOverdue(!overdue);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              overdue
                ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> SLA Overdue Only
          </button>

          {(search || status || priority || overdue) && (
            <button
              onClick={() => {
                setSearch("");
                setStatus("");
                setPriority("");
                setOverdue(false);
                setPage(1);
              }}
              className="text-slate-400 hover:text-white flex items-center gap-1 ml-auto font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 uppercase font-semibold">
                <th className="py-3.5 px-4">Job Card #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Vehicle</th>
                <th className="py-3.5 px-4">Service Type</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Tech</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading job cards...
                  </td>
                </tr>
              ) : jobCards.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No job cards found matching your criteria.
                  </td>
                </tr>
              ) : (
                jobCards.map((jc) => (
                  <tr key={jc._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                      <Link href={`/admin/jobcards/${jc._id}`} className="hover:underline">
                        {jc.jobCardNumber}
                      </Link>
                      {jc.slaBreached && (
                        <span className="block text-[9px] font-sans text-red-400 font-semibold mt-0.5">
                          ⚠️ SLA Breached
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{jc.customer?.name || "N/A"}</div>
                      <div className="text-[10px] text-slate-500">{jc.customer?.phone || ""}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">
                        {jc.vehicle ? `${jc.vehicle.make} ${jc.vehicle.model}` : "N/A"}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{jc.vehicle?.registrationNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{jc.serviceType}</div>
                      {jc.subService && <div className="text-[10px] text-slate-500">{jc.subService}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={jc.priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={jc.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {jc.assignedTo ? (
                        <span className="font-medium text-slate-200">{jc.assignedTo.name}</span>
                      ) : (
                        <span className="text-amber-400/80 font-semibold">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {format(new Date(jc.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/jobcards/${jc._id}`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg font-semibold transition-all inline-block"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/60 text-xs">
          <span className="text-slate-400">
            Showing Page <span className="font-bold text-slate-200">{page}</span> of{" "}
            <span className="font-bold text-slate-200">{totalPages || 1}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
