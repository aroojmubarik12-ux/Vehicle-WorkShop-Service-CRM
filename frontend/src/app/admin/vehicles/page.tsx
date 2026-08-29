"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { Vehicle, Customer } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Car, Plus, Search, Calendar, Gauge, Fuel } from "lucide-react";
import { format } from "date-fns";

export default function AdminVehiclesPage() {
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [owner, setOwner] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("2022");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [fuelType, setFuelType] = useState("Petrol");
  const [mileage, setMileage] = useState("35000");

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/vehicles${search ? `?search=${search}` : ""}`);
      if (res.data.success) {
        setVehicles(res.data.vehicles);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    api.get("/customers?status=active").then((res) => {
      if (res.data.success) setCustomers(res.data.customers);
    });
  }, [search]);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/vehicles", {
        owner,
        make,
        model,
        year: Number(year),
        registrationNumber,
        chassisNumber,
        fuelType,
        mileage: Number(mileage)
      });
      if (res.data.success) {
        showToast("Vehicle registered successfully.", "success");
        setModalOpen(false);
        setMake("");
        setModel("");
        setRegistrationNumber("");
        setChassisNumber("");
        fetchVehicles();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to register vehicle.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Vehicles Fleet & Garage</h1>
          <p className="text-xs text-slate-400 mt-1">Vehicle records, chassis numbers, odometer readings, and service history</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by registration number, make, model, or chassis..."
          className="flex-1 bg-transparent border-none text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => {
          const ownerObj = typeof v.owner === "object" ? v.owner : null;
          return (
            <div
              key={v._id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 shadow-md">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">
                      {v.make} {v.model}
                    </h3>
                    <span className="text-[11px] font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">
                      {v.registrationNumber}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {v.year}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Fuel className="w-3.5 h-3.5 text-slate-500" /> {v.fuelType}
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Gauge className="w-3.5 h-3.5 text-slate-500" /> {v.mileage?.toLocaleString()} km
                </div>
                <div className="col-span-2 text-[11px] text-slate-400 truncate">
                  Owner: <span className="text-slate-200 font-semibold">{ownerObj?.name || "N/A"}</span>
                </div>
                <div className="col-span-2 text-[10px] text-slate-500 font-mono">
                  VIN/Chassis: {v.chassisNumber}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Vehicle">
        <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-1.5">Vehicle Owner (Customer)</label>
            <select
              required
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">Make</label>
              <input
                type="text"
                required
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="Toyota"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">Model</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Corolla"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">Year</label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">Registration #</label>
              <input
                type="text"
                required
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="LEA-21-9842"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">Chassis # (VIN)</label>
              <input
                type="text"
                required
                value={chassisNumber}
                onChange={(e) => setChassisNumber(e.target.value)}
                placeholder="NZE161-9048214"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">Fuel Type</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
                <option value="CNG">CNG</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">Mileage (km)</label>
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
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
              Save Vehicle
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
