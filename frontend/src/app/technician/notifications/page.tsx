"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { Notification } from "@/types";
import { Bell, CheckCheck, Clock } from "lucide-react";
import { format } from "date-fns";

export default function TechnicianNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Technician Alert Center</h1>
          <p className="text-xs text-slate-400 mt-1">Assignment alerts, client replies, and SLA warning notifications</p>
        </div>
        <button
          onClick={markAllRead}
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
        >
          <CheckCheck className="w-4 h-4" /> Mark all as read
        </button>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 divide-y divide-slate-800/60">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">No notifications in your inbox.</div>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-100">{n.title}</h4>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                </div>
                <p className="text-slate-300 mt-1">{n.message}</p>
              </div>
              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                {format(new Date(n.createdAt), "MMM d, h:mm a")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
