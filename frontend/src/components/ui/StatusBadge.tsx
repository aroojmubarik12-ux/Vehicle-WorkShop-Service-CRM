import React from "react";
import { JobCardStatus } from "@/types";

interface StatusBadgeProps {
  status: JobCardStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const statusStyles: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    open: { label: "Open", bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400", dot: "bg-blue-400" },
    assigned: { label: "Assigned", bg: "bg-indigo-500/10 border-indigo-500/30", text: "text-indigo-400", dot: "bg-indigo-400" },
    diagnosis: { label: "Diagnosis", bg: "bg-purple-500/10 border-purple-500/30", text: "text-purple-400", dot: "bg-purple-400" },
    in_progress: { label: "In Progress", bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-400", dot: "bg-amber-400 animate-pulse" },
    waiting_for_parts: { label: "Waiting for Parts", bg: "bg-orange-500/10 border-orange-500/30", text: "text-orange-400", dot: "bg-orange-400" },
    waiting_for_customer_approval: { label: "Waiting Approval", bg: "bg-yellow-500/10 border-yellow-500/30", text: "text-yellow-400", dot: "bg-yellow-400" },
    completed: { label: "Completed", bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400" },
    delivered: { label: "Delivered", bg: "bg-teal-500/10 border-teal-500/30", text: "text-teal-400", dot: "bg-teal-400" },
    reopened: { label: "Reopened", bg: "bg-rose-500/10 border-rose-500/30", text: "text-rose-400", dot: "bg-rose-400 animate-ping" }
  };

  const style = statusStyles[status] || {
    label: status.replace(/_/g, " "),
    bg: "bg-slate-800 border-slate-700",
    text: "text-slate-300",
    dot: "bg-slate-400"
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
};
