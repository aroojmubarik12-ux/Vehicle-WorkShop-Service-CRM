"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { Vehicle } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Car, Plus, Fuel, Gauge, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function CustomerVehiclesPage() {
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("2022");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [fuelType, setFuelType] = useState("Petrol");
  const [mileage, setMileage] = useState("30000");

  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles");
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
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/vehicles", {
        make,
        model,
        year: Number(year),
        registrationNumber,
        chassisNumber,
        fuelType,
        mileage: Number(mileage)
      });
      if (res.data.success) {
        showToast("Vehicle added to your garage!", "success");
        setModalOpen(false);
        setMake("");
        setModel("");
        setRegistrationNumber("");
        setChassisNumber("");
        fetchVehicles();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to add vehicle.", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">My Registered Vehicles</h1>
          <p className="text-xs text-slate-400 mt-1">Manage vehicles in your personal garage</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <div key={v._id} className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">
                    {v.make} {v.model}
                  </h3>
                  <span className="text-[11px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    {v.registrationNumber}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {v.year}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
              <div className="flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-slate-500" /> {v.fuelType}
              </div>
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-slate-500" /> {v.mileage?.toLocaleString()} km
              </div>
              <div className="col-span-2 text-[10px] text-slate-500 font-mono">
                Chassis: {v.chassisNumber}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Vehicle to Garage">
        <form onSubmit={handleAddVehicle} className="space-y-4 text-xs">
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
                placeholder="Yaris"
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
                placeholder="ICT-22-1092"
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
                placeholder="NCP150-10928"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">Fuel</label>
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
              Register Vehicle
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
