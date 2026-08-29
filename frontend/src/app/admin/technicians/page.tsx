"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { User } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Users, Plus, Wrench, Phone, Mail, CheckCircle2, XCircle, Search } from "lucide-react";

export default function AdminTechniciansPage() {
  const { showToast } = useToast();
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("password123");
  const [specialization, setSpecialization] = useState("General Service");

  const fetchTechnicians = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users?role=technician${search ? `&search=${search}` : ""}`);
      if (res.data.success) {
        setTechnicians(res.data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, [search]);

  const handleCreateTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/users", {
        name,
        email,
        phone,
        password,
        role: "technician",
        specialization,
        status: "active"
      });
      if (res.data.success) {
        showToast("Technician created successfully.", "success");
        setModalOpen(false);
        setName("");
        setEmail("");
        setPhone("");
        fetchTechnicians();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to create technician.", "error");
    }
  };

  const toggleStatus = async (tech: User) => {
    const nextStatus = tech.status === "active" ? "inactive" : "active";
    try {
      const res = await api.patch(`/users/${tech._id}/status`, { status: nextStatus });
      if (res.data.success) {
        showToast(`Technician marked as ${nextStatus}.`, "success");
        fetchTechnicians();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to update status.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Mechanics & Technicians</h1>
          <p className="text-xs text-slate-400 mt-1">Manage workshop technician profiles, specializations, and availability</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Technician
        </button>
      </div>

      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search technician by name, email, or phone..."
          className="flex-1 bg-transparent border-none text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map((tech) => (
          <div
            key={tech._id}
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                  {tech.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{tech.name}</h3>
                  <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 mt-0.5">
                    <Wrench className="w-3 h-3" /> {tech.specialization}
                  </span>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  tech.status === "active"
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
              >
                {tech.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> {tech.email}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> {tech.phone}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
              <button
                onClick={() => toggleStatus(tech)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                  tech.status === "active"
                    ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                    : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                }`}
              >
                {tech.status === "active" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Mechanic / Technician">
        <form onSubmit={handleCreateTechnician} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bilal Sheikh"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bilal@workshop.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">Specialization</label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Engine Repair">Engine Repair</option>
                <option value="Electrical">Electrical</option>
                <option value="AC & Cooling">AC & Cooling</option>
                <option value="Suspension & Brakes">Suspension & Brakes</option>
                <option value="Body & Paint">Body & Paint</option>
                <option value="General Service">General Service</option>
                <option value="Transmission">Transmission</option>
                <option value="Diagnostics">Diagnostics</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">Default Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
