import React from "react";
import { JobCard } from "@/types";
import { CheckCircle2, Clock, PlayCircle, AlertCircle, Wrench, PackageCheck, Send, RotateCcw } from "lucide-react";
import { format } from "date-fns";

interface TimelineProps {
  jobCard: JobCard;
}

export const Timeline: React.FC<TimelineProps> = ({ jobCard }) => {
  const steps = [
    {
      id: "created",
      title: "Service Request Created",
      subtitle: `Source: ${jobCard.source.replace(/_/g, " ").toUpperCase()}`,
      date: jobCard.createdAt,
      done: true,
      icon: Clock,
      color: "text-blue-400 bg-blue-500/20 border-blue-500/40"
    },
    {
      id: "assigned",
      title: "Assigned to Technician",
      subtitle: jobCard.assignedTo ? `${jobCard.assignedTo.name} (${jobCard.assignedTo.specialization})` : "Unassigned",
      date: jobCard.assignedTo ? jobCard.updatedAt : undefined,
      done: !!jobCard.assignedTo,
      icon: Wrench,
      color: "text-indigo-400 bg-indigo-500/20 border-indigo-500/40"
    },
    {
      id: "diagnosis",
      title: "Diagnosis & Inspection",
      subtitle: jobCard.firstResponseAt ? "First inspection logged" : "Awaiting technician diagnosis",
      date: jobCard.firstResponseAt,
      done: ["diagnosis", "in_progress", "waiting_for_parts", "waiting_for_customer_approval", "completed", "delivered"].includes(jobCard.status),
      icon: PlayCircle,
      color: "text-purple-400 bg-purple-500/20 border-purple-500/40"
    },
    {
      id: "in_progress",
      title: "Repair & Service In Progress",
      subtitle: jobCard.partsUsed?.length ? `${jobCard.partsUsed.length} parts installed` : "Active maintenance",
      date: undefined,
      done: ["in_progress", "waiting_for_parts", "waiting_for_customer_approval", "completed", "delivered"].includes(jobCard.status),
      icon: Wrench,
      color: "text-amber-400 bg-amber-500/20 border-amber-500/40"
    },
    {
      id: "completed",
      title: "Service Completed",
      subtitle: jobCard.completedAt ? "Ready for customer pickup" : "Pending quality check",
      date: jobCard.completedAt,
      done: ["completed", "delivered"].includes(jobCard.status),
      icon: PackageCheck,
      color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/40"
    },
    {
      id: "delivered",
      title: "Vehicle Delivered",
      subtitle: jobCard.deliveredAt ? "Handed over to customer" : "Awaiting handover",
      date: jobCard.deliveredAt,
      done: jobCard.status === "delivered",
      icon: Send,
      color: "text-teal-400 bg-teal-500/20 border-teal-500/40"
    }
  ];

  return (
    <div className="flow-root py-2">
      <ul className="-mb-8">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isLast = idx === steps.length - 1;
          return (
            <li key={step.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className={`absolute left-5 top-5 -ml-px h-full w-0.5 ${
                      step.done ? "bg-blue-600/60" : "bg-slate-800"
                    }`}
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3.5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border shadow-md ${
                      step.done
                        ? step.color
                        : "bg-slate-900 border-slate-800 text-slate-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className={`text-xs font-bold ${step.done ? "text-slate-100" : "text-slate-500"}`}>
                        {step.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{step.subtitle}</p>
                    </div>
                    {step.date && (
                      <div className="text-right text-[10px] text-slate-500 whitespace-nowrap">
                        {format(new Date(step.date), "MMM d, h:mm a")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
