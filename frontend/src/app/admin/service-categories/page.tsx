"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { ServiceCategory } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Wrench, Plus, Clock } from "lucide-react";

export default function AdminServiceCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subServices, setSubServices] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("2");

  const fetchCategories = async () => {
    try {
      const res = await api.get("/service-categories");
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/service-categories", {
        name,
        description,
        subServices: subServices.split(",").map((s) => s.trim()),
        estimatedHours: Number(estimatedHours)
      });
      if (res.data.success) {
        showToast("Service category created.", "success");
        setModalOpen(false);
        setName("");
        setDescription("");
        setSubServices("");
        fetchCategories();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to create category.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Service Categories & Sub-Services</h1>
          <p className="text-xs text-slate-400 mt-1">Configure auto workshop repair catalog, standard task definitions, and time estimates</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Service Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-400" /> {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{cat.description}</p>
              </div>
              <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3" /> ~{cat.estimatedHours} hrs
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">Sub-Services / Tasks</span>
              <div className="flex flex-wrap gap-1.5">
                {cat.subServices?.map((sub, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-medium"
                  >
                    • {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Service Category">
        <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-1.5">Category Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engine & Transmission"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this service domain..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-1.5">Sub-Services (Comma Separated)</label>
            <input
              type="text"
              required
              value={subServices}
              onChange={(e) => setSubServices(e.target.value)}
              placeholder="Spark Plug Replacement, Timing Belt, Oil Flush"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-1.5">Estimated Turnaround (Hours)</label>
            <input
              type="number"
              required
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100"
            />
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
              Save Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
