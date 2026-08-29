"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { Vehicle, ServiceCategory } from "@/types";
import { Car, Wrench, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function CustomerCreateJobCardPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [subService, setSubService] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/vehicles").then((res) => {
      if (res.data.success) {
        setVehicles(res.data.vehicles);
        if (res.data.vehicles.length > 0) {
          setSelectedVehicle(res.data.vehicles[0]._id);
        }
      }
    });

    api.get("/service-categories?status=active").then((res) => {
      if (res.data.success) {
        setCategories(res.data.categories);
        if (res.data.categories.length > 0) {
          setServiceType(res.data.categories[0].name);
        }
      }
    });
  }, []);

  const selectedCategoryObj = categories.find((c) => c.name === serviceType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !subject || !description || !serviceType) {
      showToast("Please complete all required fields.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/jobcards", {
        vehicle: selectedVehicle,
        subject,
        description,
        serviceType,
        subService,
        priority
      });

      if (res.data.success) {
        showToast("Service request booked successfully!", "success");
        router.push(`/portal/jobcards/${res.data.jobCard._id}`);
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to submit request.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/portal/jobcards"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Book Vehicle Service</h1>
          <p className="text-xs text-slate-400 mt-0.5">Submit an issue report or schedule maintenance with our team</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Select Your Vehicle <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {vehicles.length === 0 ? (
              <option value="">-- No vehicles registered. Register one first --</option>
            ) : (
              vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.make} {v.model} ({v.year}) - [{v.registrationNumber}]
                </option>
              ))
            )}
          </select>
          {vehicles.length === 0 && (
            <p className="text-[11px] text-amber-400 mt-1.5">
              Please register your vehicle in <Link href="/portal/vehicles" className="underline font-bold">My Vehicles</Link> first.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Service Domain <span className="text-rose-500">*</span>
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
              Specific Task (Optional)
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

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Subject / Main Complaint <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Brake noise and periodic maintenance inspection"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Describe the Issue in Detail <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you hear, feel, or see on dashboard..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
          <Link
            href="/portal/jobcards"
            className="px-5 py-2.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || vehicles.length === 0}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            {submitting ? "Booking..." : "Submit Service Booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
