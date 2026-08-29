"use client";

import React from "react";
import { Settings, Shield, Bell, Database } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Workshop CRM Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure system parameters, business profile, and operational preferences</p>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Settings className="w-4 h-4 text-blue-400" /> Workshop Information
        </h2>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Workshop Name</label>
            <input
              type="text"
              readOnly
              value="Pro Auto Service & Repair Workshop"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Support Hotline</label>
            <input
              type="text"
              readOnly
              value="+92 300 1112233"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
