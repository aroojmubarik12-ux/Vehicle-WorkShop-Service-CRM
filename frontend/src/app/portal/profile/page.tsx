"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Phone, MapPin } from "lucide-react";

export default function CustomerProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Customer Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Your registered account details and contact preferences</p>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-blue-600/30">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user?.name}</h2>
            <span className="text-xs text-slate-400">Registered Vehicle Owner</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-800 pt-6">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Email Address</label>
            <input
              type="text"
              readOnly
              value={user?.email || ""}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
            />
          </div>
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Phone Number</label>
            <input
              type="text"
              readOnly
              value={user?.phone || ""}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
