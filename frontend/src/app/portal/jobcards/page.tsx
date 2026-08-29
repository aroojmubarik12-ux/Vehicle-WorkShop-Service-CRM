"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { JobCard } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { Plus, Wrench, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function CustomerJobCardsPage() {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobCards = async () => {
    try {
      const res = await api.get("/jobcards");
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
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">My Service History & Job Cards</h1>
          <p className="text-xs text-slate-400 mt-1">Track all active and past repair work performed on your vehicles</p>
        </div>
        <Link
          href="/portal/jobcards/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Book Service
        </Link>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 uppercase font-semibold">
              <th className="py-3.5 px-5">Job Card #</th>
              <th className="py-3.5 px-5">Vehicle</th>
              <th className="py-3.5 px-5">Service Details</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5">Estimated Total</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {jobCards.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  No service requests found.
                </td>
              </tr>
            ) : (
              jobCards.map((jc) => (
                <tr key={jc._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-blue-400">
                    <Link href={`/portal/jobcards/${jc._id}`} className="hover:underline">
                      {jc.jobCardNumber}
                    </Link>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-slate-200">{jc.vehicle?.make} {jc.vehicle?.model}</div>
                    <div className="text-[10px] font-mono text-slate-400">{jc.vehicle?.registrationNumber}</div>
                  </td>
                  <td className="py-3.5 px-5 text-slate-300">
                    <div className="font-medium text-slate-200">{jc.subject}</div>
                    <div className="text-[10px] text-slate-500">{jc.serviceType}</div>
                  </td>
                  <td className="py-3.5 px-5">
                    <StatusBadge status={jc.status} />
                  </td>
                  <td className="py-3.5 px-5 font-bold text-emerald-400">
                    ${jc.totalCost || 0}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href={`/portal/jobcards/${jc._id}`}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold inline-block"
                    >
                      View Progress
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
