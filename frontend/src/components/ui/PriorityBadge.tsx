import React from "react";
import { Priority } from "@/types";
import { Flame, AlertTriangle, Clock, ShieldCheck } from "lucide-react";

interface PriorityBadgeProps {
  priority: Priority | string;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = "" }) => {
  const priorityStyles: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    critical: {
      label: "Critical",
      bg: "bg-rose-500/15 border-rose-500/40",
      text: "text-rose-400",
      icon: <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
    },
    high: {
      label: "High",
      bg: "bg-orange-500/15 border-orange-500/40",
      text: "text-orange-400",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
    },
    medium: {
      label: "Medium",
      bg: "bg-blue-500/15 border-blue-500/40",
      text: "text-blue-400",
      icon: <Clock className="w-3.5 h-3.5 text-blue-400" />
    },
    low: {
      label: "Low",
      bg: "bg-slate-700/30 border-slate-700",
      text: "text-slate-300",
      icon: <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
    }
  };

  const style = priorityStyles[priority] || {
    label: priority,
    bg: "bg-slate-800 border-slate-700",
    text: "text-slate-300",
    icon: null
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${style.bg} ${style.text} ${className}`}
    >
      {style.icon}
      {style.label}
    </span>
  );
};
