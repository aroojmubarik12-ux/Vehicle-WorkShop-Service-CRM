"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { Customer, Vehicle, User, ServiceCategory } from "@/types";
import { Wrench, Car, UserCheck, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function CreateJobCardPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [subService, setSubService] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [source, setSource] = useState("walk_in");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [custRes, techRes, catRes] = await Promise.all([
          api.get("/customers?status=active"),
          api.get("/users?role=technician&status=active"),
          api.get("/service-categories?status=active")
        ]);
        if (custRes.data.success) setCustomers(custRes.data.customers);
        if (techRes.data.success) setTechnicians(techRes.data.users);
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
          if (catRes.data.categories.length > 0) {
            setServiceType(catRes.data.categories[0].name);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      api.get(`/vehicles?owner=${selectedCustomer}`).then((res) => {
        if (res.data.success) {
          setVehicles(res.data.vehicles);
          if (res.data.vehicles.length > 0) {
            setSelectedVehicle(res.data.vehicles[0]._id);
          } else {
            setSelectedVehicle("");
          }
        }
      });
    } else {
      setVehicles([]);
      setSelectedVehicle("");
    }
  }, [selectedCustomer]);

  const selectedCategoryObj = categories.find((c) => c.name === serviceType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedVehicle || !subject || !description || !serviceType) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/jobcards", {
        customer: selectedCustomer,
        vehicle: selectedVehicle,
        subject,
        description,
        serviceType,
        subService,
        priority,
        assignedTo: assignedTo || undefined,
        source
      });

      if (res.data.success) {
        showToast(res.data.message || "Job card created successfully.", "success");
        router.push(`/admin/jobcards/${res.data.jobCard._id}`);
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to create job card.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/jobcards"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create New Job Card</h1>
          <p className="text-xs text-slate-400 mt-0.5">Register a vehicle service or repair request</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Customer <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Select Registered Customer --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.phone}) - {c.city || "General"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Vehicle <span className="text-rose-500">*</span>
            </label>
            <select
              required
              disabled={!selectedCustomer}
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            >
              <option value="">
                {!selectedCustomer
                  ? "-- Select customer first --"
                  : vehicles.length === 0
                  ? "-- No vehicles registered for customer --"
                  : "-- Select Vehicle --"}
              </option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.make} {v.model} ({v.year}) - [{v.registrationNumber}]
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Subject / Primary Issue <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Engine knocking sound on acceleration & periodic oil service"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Customer Complaint Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed symptoms, customer remarks, warning lights on dashboard, or specific repair requests..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800/80">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Service Category <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={serviceType}
              onChange={(e) => {
                setServiceType(e.target.value);
                setSubService("");
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Sub-Service / Task (Optional)
            </label>
            <select
              value={subService}
              onChange={(e) => setSubService(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Select Specific Sub-Service --</option>
              {selectedCategoryObj?.subServices?.map((sub, idx) => (
                <option key={idx} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-800/80">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="low">Low (72h turnaround)</option>
              <option value="medium">Medium (48h turnaround)</option>
              <option value="high">High (24h turnaround)</option>
              <option value="critical">Critical (4h emergency)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Assign Technician
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Unassigned (Assign Later) --</option>
              {technicians.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.specialization})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Intake Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="walk_in">Walk-in Customer</option>
              <option value="phone_call">Phone Call</option>
              <option value="whatsapp">WhatsApp Booking</option>
              <option value="website">Website Portal</option>
              <option value="email">Email</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
          <Link
            href="/admin/jobcards"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create & Initialize Job Card"}
          </button>
        </div>
      </form>
    </div>
  );
}
