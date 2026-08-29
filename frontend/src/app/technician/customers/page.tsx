"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { Customer } from "@/types";
import { Users, Phone, Mail, MapPin, Search } from "lucide-react";

export default function TechnicianCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await api.get(`/customers${search ? `?search=${search}` : ""}`);
      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Assigned Customer Contacts</h1>
        <p className="text-xs text-slate-400 mt-1">Vehicle owners and contact directory for your active jobs</p>
      </div>

      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer by name, email, or phone..."
          className="flex-1 bg-transparent border-none text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customers.map((c) => (
          <div key={c._id} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-100 text-sm">{c.name}</h3>
            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> {c.phone}
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> {c.email}
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> {c.address || c.city}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
