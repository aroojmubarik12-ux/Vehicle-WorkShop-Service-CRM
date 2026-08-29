"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { JobCard } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { Timeline } from "@/components/jobcards/Timeline";
import { MessageThread } from "@/components/jobcards/MessageThread";
import { PartsLaborEstimator } from "@/components/jobcards/PartsLaborEstimator";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";
import { ArrowLeft, UserCheck, Car, Save, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function TechnicianJobCardDetailsPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [jobCard, setJobCard] = useState<JobCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [diagnosisNotes, setDiagnosisNotes] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"estimator" | "messages" | "diagnosis">("diagnosis");

  const fetchJobCard = async () => {
    try {
      const res = await api.get(`/jobcards/${id}`);
      if (res.data.success) {
        setJobCard(res.data.jobCard);
        setNewStatus(res.data.jobCard.status);
        setDiagnosisNotes(res.data.jobCard.diagnosisNotes || "");
        setResolutionNotes(res.data.jobCard.resolutionNotes || "");
      }
    } catch (e) {
      console.error(e);
      showToast("Access forbidden or job card not found.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchJobCard();
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      const res = await api.patch(`/jobcards/${id}/status`, {
        status: newStatus,
        diagnosisNotes,
        resolutionNotes
      });
      if (res.data.success) {
        showToast(`Status updated to ${newStatus}.`, "success");
        setStatusModalOpen(false);
        fetchJobCard();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Update failed.", "error");
    }
  };

  if (loading || !jobCard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/technician/jobcards"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-white">{jobCard.jobCardNumber}</h1>
              <PriorityBadge priority={jobCard.priority} />
              <StatusBadge status={jobCard.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{jobCard.subject}</p>
          </div>
        </div>

        <button
          onClick={() => setStatusModalOpen(true)}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition-all self-start sm:self-auto"
        >
          Update Status / Notes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-bold uppercase text-slate-400 block border-b border-slate-800 pb-3">
              Customer Details
            </span>
            <div className="text-xs space-y-1">
              <div className="font-bold text-slate-100">{jobCard.customer?.name}</div>
              <div className="text-slate-300">📞 {jobCard.customer?.phone}</div>
              <div className="text-slate-400">📍 {jobCard.customer?.city}</div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-bold uppercase text-slate-400 block border-b border-slate-800 pb-3">
              Vehicle Details
            </span>
            <div className="text-xs space-y-1">
              <div className="font-bold text-slate-100">{jobCard.vehicle?.make} {jobCard.vehicle?.model}</div>
              <div className="font-mono text-blue-400 font-bold">{jobCard.vehicle?.registrationNumber}</div>
              <div className="text-slate-400">VIN: {jobCard.vehicle?.chassisNumber}</div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <span className="text-xs font-bold uppercase text-slate-400 block border-b border-slate-800 pb-3">
              Workflow Status
            </span>
            <Timeline jobCard={jobCard} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab("diagnosis")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "diagnosis"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              Diagnosis & Work Notes
            </button>
            <button
              onClick={() => setActiveTab("estimator")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "estimator"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              Parts & Labor Estimate
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "messages"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              Internal Notes & Client Chat
            </button>
          </div>

          {activeTab === "diagnosis" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-2">Inspection & Diagnosis Findings</label>
                <textarea
                  rows={4}
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                  placeholder="OBD-II codes, diagnostic findings, tests performed..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-2">Resolution / Repair Done Summary</label>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Parts installed, adjustments, final inspection notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleStatusUpdate}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Notes
                </button>
              </div>
            </div>
          )}

          {activeTab === "estimator" && (
            <PartsLaborEstimator jobCard={jobCard} onUpdate={fetchJobCard} />
          )}

          {activeTab === "messages" && <MessageThread jobCardId={jobCard._id} />}
        </div>
      </div>

      <Modal isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Update Repair Status">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-1.5">New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:ring-2 focus:ring-amber-500"
            >
              <option value="diagnosis">Diagnosis</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_for_parts">Waiting for Parts</option>
              <option value="waiting_for_customer_approval">Waiting for Customer Approval</option>
              <option value="completed">Completed (Ready for Pickup)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleStatusUpdate}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl"
            >
              Update Status
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
