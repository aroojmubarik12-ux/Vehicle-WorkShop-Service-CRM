"use client";

import React, { useState } from "react";
import { JobCard, PartUsed } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import api from "@/services/api";
import { Plus, Trash2, Save, DollarSign, CheckCircle2, XCircle } from "lucide-react";

interface PartsLaborEstimatorProps {
  jobCard: JobCard;
  onUpdate: () => void;
}

export const PartsLaborEstimator: React.FC<PartsLaborEstimatorProps> = ({ jobCard, onUpdate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [parts, setParts] = useState<PartUsed[]>(jobCard.partsUsed || []);
  const [labor, setLabor] = useState<number>(jobCard.laborCharges || 0);
  const [saving, setSaving] = useState<boolean>(false);

  const isStaff = user?.role === "admin" || user?.role === "technician";
  const isCustomer = user?.role === "customer";

  const handleAddPart = () => {
    setParts([
      ...parts,
      { name: "", partNumber: "", quantity: 1, unitPrice: 0, total: 0 }
    ]);
  };

  const handleRemovePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handlePartChange = (index: number, field: keyof PartUsed, val: any) => {
    const updated = [...parts];
    const current = { ...updated[index], [field]: val };
    if (field === "quantity" || field === "unitPrice") {
      const q = field === "quantity" ? Number(val) : current.quantity;
      const p = field === "unitPrice" ? Number(val) : current.unitPrice;
      current.total = Number((q * p).toFixed(2));
    }
    updated[index] = current;
    setParts(updated);
  };

  const totalPartsCost = parts.reduce((acc, p) => acc + (p.total || 0), 0);
  const grandTotal = totalPartsCost + Number(labor || 0);

  const handleSaveEstimate = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/jobcards/${jobCard._id}/parts-labor`, {
        partsUsed: parts,
        laborCharges: Number(labor)
      });
      if (res.data.success) {
        showToast("Parts & labor estimate saved successfully.", "success");
        onUpdate();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to update estimate.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCustomerApproval = async (status: "approved" | "rejected") => {
    try {
      const res = await api.patch(`/jobcards/${jobCard._id}/approval`, { status });
      if (res.data.success) {
        showToast(`Estimate ${status} successfully.`, "success");
        onUpdate();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Action failed.", "error");
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Parts & Labor Quotation / Estimate
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Itemized billing breakdown and customer approval</p>
        </div>

        {/* Approval status badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Customer Approval:</span>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase border ${
              jobCard.customerApprovalStatus === "approved"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : jobCard.customerApprovalStatus === "rejected"
                ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                : "bg-amber-500/15 border-amber-500/30 text-amber-400"
            }`}
          >
            {jobCard.customerApprovalStatus}
          </span>
        </div>
      </div>

      {/* Parts Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <th className="pb-3">Part Description</th>
              <th className="pb-3">Part #</th>
              <th className="pb-3 w-20">Qty</th>
              <th className="pb-3 w-28">Unit Price ($)</th>
              <th className="pb-3 w-28 text-right">Total ($)</th>
              {isStaff && <th className="pb-3 w-12 text-center">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {parts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500">
                  No parts added yet.
                </td>
              </tr>
            ) : (
              parts.map((p, idx) => (
                <tr key={idx} className="group">
                  <td className="py-3 pr-2">
                    {isStaff ? (
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => handlePartChange(idx, "name", e.target.value)}
                        placeholder="e.g. Synthetic Engine Oil 5W-30"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="font-medium text-slate-200">{p.name}</span>
                    )}
                  </td>
                  <td className="py-3 pr-2">
                    {isStaff ? (
                      <input
                        type="text"
                        value={p.partNumber || ""}
                        onChange={(e) => handlePartChange(idx, "partNumber", e.target.value)}
                        placeholder="OEM-12345"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    ) : (
                      <span className="font-mono text-slate-400">{p.partNumber || "-"}</span>
                    )}
                  </td>
                  <td className="py-3 pr-2">
                    {isStaff ? (
                      <input
                        type="number"
                        min="1"
                        value={p.quantity}
                        onChange={(e) => handlePartChange(idx, "quantity", e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-slate-300">{p.quantity}</span>
                    )}
                  </td>
                  <td className="py-3 pr-2">
                    {isStaff ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={p.unitPrice}
                        onChange={(e) => handlePartChange(idx, "unitPrice", e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-slate-300">${p.unitPrice.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="py-3 text-right font-semibold text-slate-100">
                    ${(p.total || 0).toFixed(2)}
                  </td>
                  {isStaff && (
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleRemovePart(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isStaff && (
        <button
          onClick={handleAddPart}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Part / Consumable
        </button>
      )}

      {/* Summary Box */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-300">Labor Charges:</span>
          {isStaff ? (
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-xs">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={labor}
                onChange={(e) => setLabor(Number(e.target.value))}
                className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ) : (
            <span className="text-xs font-bold text-slate-200">${labor.toFixed(2)}</span>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Quotation</span>
            <span className="text-lg font-black text-emerald-400">${grandTotal.toFixed(2)}</span>
          </div>

          {isStaff && (
            <button
              onClick={handleSaveEstimate}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save Estimate"}
            </button>
          )}

          {isCustomer && jobCard.customerApprovalStatus === "pending" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCustomerApproval("approved")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/30"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve Estimate
              </button>
              <button
                onClick={() => handleCustomerApproval("rejected")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-all"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
