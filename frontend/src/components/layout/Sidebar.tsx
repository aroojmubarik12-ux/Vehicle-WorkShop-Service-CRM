"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  Car,
  Wrench,
  ShieldAlert,
  BarChart3,
  MessageSquareHeart,
  History,
  Settings,
  CalendarCheck,
  Award,
  Bell,
  UserCheck,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  const role = user?.role || "customer";

  const adminNav = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Job Cards", href: "/admin/jobcards", icon: FileText },
    { label: "Create Job Card", href: "/admin/jobcards/create", icon: PlusCircle },
    { label: "Technicians", href: "/admin/technicians", icon: Users },
    { label: "Customers", href: "/admin/customers", icon: UserCheck },
    { label: "Vehicles", href: "/admin/vehicles", icon: Car },
    { label: "Categories", href: "/admin/service-categories", icon: Wrench },
    { label: "SLA Policies", href: "/admin/sla", icon: ShieldAlert },
    { label: "Reports & Stats", href: "/admin/reports", icon: BarChart3 },
    { label: "Feedback", href: "/admin/feedback", icon: MessageSquareHeart },
    { label: "Activity Logs", href: "/admin/activity-logs", icon: History },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const techNav = [
    { label: "Dashboard", href: "/technician/dashboard", icon: LayoutDashboard },
    { label: "My Job Cards", href: "/technician/jobcards", icon: FileText },
    { label: "Follow-Ups", href: "/technician/follow-ups", icon: CalendarCheck },
    { label: "Customers", href: "/technician/customers", icon: Users },
    { label: "My Performance", href: "/technician/performance", icon: Award },
    { label: "Notifications", href: "/technician/notifications", icon: Bell },
    { label: "Profile", href: "/technician/profile", icon: Settings },
  ];

  const customerNav = [
    { label: "Dashboard", href: "/portal/dashboard", icon: LayoutDashboard },
    { label: "Book Service", href: "/portal/jobcards/create", icon: PlusCircle },
    { label: "My Services", href: "/portal/jobcards", icon: FileText },
    { label: "My Vehicles", href: "/portal/vehicles", icon: Car },
    { label: "Feedback", href: "/portal/feedback", icon: MessageSquareHeart },
    { label: "Notifications", href: "/portal/notifications", icon: Bell },
    { label: "Profile", href: "/portal/profile", icon: Settings },
  ];

  const navItems = role === "admin" ? adminNav : role === "technician" ? techNav : customerNav;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-slate-900/95 border-r border-slate-800 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-wider text-slate-100">PRO WORKSHOP</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {role.toUpperCase()} PORTAL
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-[11px] text-slate-300 font-medium truncate">
              System Online (v1.0.0)
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
