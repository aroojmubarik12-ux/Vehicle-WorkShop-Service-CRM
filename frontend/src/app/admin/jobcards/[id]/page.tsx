"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { JobCard, User } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { Timeline } from "@/components/jobcards/Timeline";
import { MessageThread } from "@/components/jobcards/MessageThread";
import { PartsLaborEstimator } from "@/components/jobcards/PartsLaborEstimator";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";
import {
  ArrowLeft,
  UserCheck,
  Car,
  AlertTriangle,
  Save,
  Clock
} from "lucide-react";
import { format } from "date-fns";

export default function AdminJobCardDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [jobCard, setJobCard] = useState<JobCard | null>(null);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);

  // Form states
  const [newStatus, setNewStatus] = useState("");
  const [diagnosisNotes, setDiagnosisNotes] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [selectedTech, setSelectedTech] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [activeTab, setActiveTab] = useState<"estimator" | "messages" | "diagnosis" | "followups">("estimator");

  // Follow-up state
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("11:00 AM");
  const [followUpType, setFollowUpType] = useState("phone_call");
  const [followUpNotes, setFollowUpNotes] = useState("");

  const fetchJobCard = async () => {
    try {
      const res = await api.get(`/jobcards/${id}`);
      if (res.data.success) {
        setJobCard(res.data.jobCard);
        setNewStatus(res.data.jobCard.status);
        setDiagnosisNotes(res.data.jobCard.diagnosisNotes || "");
        setResolutionNotes(res.data.jobCard.resolutionNotes || "");
        setSelectedTech(res.data.jobCard.assignedTo?._id || "");
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to load job card.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowUps = async () => {
    try {
      const res = await api.get(`/followups?jobCardId=${id}`);
      if (res.data.success) {
        setFollowUps(res.data.followUps);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (id) {
      fetchJobCard();
      fetchFollowUps();
      api.get("/users?role=technician&status=active").then((res) => {
        if (res.data.success) setTechnicians(res.data.users);
      });
    }
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      const res = await api.patch(`/jobcards/${id}/status`, {
        status: newStatus,
        diagnosisNotes,
        resolutionNotes
      });
      if (res.data.success) {
        showToast(`Status changed to ${newStatus}.`, "success");
        setStatusModalOpen(false);
        fetchJobCard();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Status update failed.", "error");
    }
  };

  const handleAssignTechnician = async () => {
    if (!selectedTech) return;
    try {
      const res = await api.patch(`/jobcards/${id}/assign`, { assignedTo: selectedTech });
      if (res.data.success) {
        showToast("Technician assigned successfully.", "success");
        setAssignModalOpen(false);
        fetchJobCard();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Assignment failed.", "error");
    }
  };

  const handleEscalate = async () => {
    try {
      const res = await api.post(`/jobcards/${id}/escalate`, { reason: escalationReason });
      if (res.data.success) {
        showToast("Job card escalated to Critical priority.", "success");
        setEscalateModalOpen(false);
        fetchJobCard();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Escalation failed.", "error");
    }
  };

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/followups", {
        jobCard: id,
        date: followUpDate,
        time: followUpTime,
        type: followUpType,
        notes: followUpNotes
      });
      if (res.data.success) {
        showToast("Follow-up scheduled.", "success");
        setFollowUpModalOpen(false);
        setFollowUpNotes("");
        fetchFollowUps();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to schedule follow-up.", "error");
    }
  };

  if (loading || !jobCard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/jobcards"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-white tracking-tight">{jobCard.jobCardNumber}</h1>
              <PriorityBadge priority={jobCard.priority} />
              <StatusBadge status={jobCard.status} />
              {jobCard.isEscalated && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                  ESCALATED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">{jobCard.subject}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Update Status
          </button>
          <button
            onClick={() => setAssignModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            {jobCard.assignedTo ? "Reassign Tech" : "Assign Tech"}
          </button>
          <button
            onClick={() => setFollowUpModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            + Follow-up
          </button>
          {!jobCard.isEscalated && (
            <button
              onClick={() => setEscalateModalOpen(true)}
              className="px-3.5 py-2 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Escalate
            </button>
          )}
        </div>
      </div>

      {/* SLA Alert banner */}
      {jobCard.slaBreached && !["completed", "delivered"].includes(jobCard.status) && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-between text-rose-200 text-xs font-semibold">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              SLA BREACH ALERT: This job card was due on{" "}
              {jobCard.slaDeadline && format(new Date(jobCard.slaDeadline), "MMM d, h:mm a")}. Immediate action required!
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Left info / Right tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-400" /> Customer Information
              </span>
              <span className="text-[10px] text-slate-500">{jobCard.customer?.tags?.join(", ")}</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-slate-100 text-sm">{jobCard.customer?.name}</div>
              <div className="text-slate-300">📞 {jobCard.customer?.phone}</div>
              <div className="text-slate-400">✉️ {jobCard.customer?.email}</div>
              <div className="text-slate-400">📍 {jobCard.customer?.address}, {jobCard.customer?.city}</div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-indigo-400" /> Vehicle Information
              </span>
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                {jobCard.vehicle?.registrationNumber}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-100 text-sm">
                {jobCard.vehicle?.make} {jobCard.vehicle?.model} ({jobCard.vehicle?.year})
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px] pt-1">
                <div>Chassis: <span className="font-mono text-slate-300">{jobCard.vehicle?.chassisNumber}</span></div>
                <div>Fuel: <span className="text-slate-300">{jobCard.vehicle?.fuelType}</span></div>
                <div>Mileage: <span className="text-slate-300">{jobCard.vehicle?.mileage?.toLocaleString()} km</span></div>
                <div>
                  Last Service:{" "}
                  <span className="text-slate-300">
                    {jobCard.vehicle?.lastServiceDate ? format(new Date(jobCard.vehicle.lastServiceDate), "MMM yyyy") : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-bold uppercase text-slate-400 block border-b border-slate-800 pb-3">
              Assigned Mechanic / Tech
            </span>
            {jobCard.assignedTo ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400">
                  {jobCard.assignedTo.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-100 text-xs">{jobCard.assignedTo.name}</div>
                  <div className="text-[11px] text-amber-400 font-medium">{jobCard.assignedTo.specialization}</div>
                  <div className="text-[10px] text-slate-400">{jobCard.assignedTo.phone}</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-400 font-semibold">No technician assigned yet.</div>
            )}
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <span className="text-xs font-bold uppercase text-slate-400 block border-b border-slate-800 pb-3">
              Workflow Status Lifecycle
            </span>
            <Timeline jobCard={jobCard} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab("estimator")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "estimator"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              Parts & Labor Estimate
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "messages"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              Communication & Notes
            </button>
            <button
              onClick={() => setActiveTab("diagnosis")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "diagnosis"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              Diagnosis & Resolution
            </button>
            <button
              onClick={() => setActiveTab("followups")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "followups"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              Follow-ups ({followUps.length})
            </button>
          </div>

          {activeTab === "estimator" && (
            <PartsLaborEstimator jobCard={jobCard} onUpdate={fetchJobCard} />
          )}

          {activeTab === "messages" && <MessageThread jobCardId={jobCard._id} />}

          {activeTab === "diagnosis" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Technical Diagnosis Notes
                </label>
                <textarea
                  rows={4}
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                  placeholder="Record OBD-II error codes, initial inspection findings, electrical measurements..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Work Completion / Resolution Summary
                </label>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Record final test drive outcome, adjustments made, torque specs checked..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleStatusUpdate}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Notes
                </button>
              </div>
            </div>
          )}

          {activeTab === "followups" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Scheduled Customer Follow-ups</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Call reminders, parts arrival updates, satisfaction check</p>
                </div>
                <button
                  onClick={() => setFollowUpModalOpen(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all"
                >
                  + Add Follow-up
                </button>
              </div>

              <div className="space-y-3">
                {followUps.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">No follow-ups scheduled yet.</div>
                ) : (
                  followUps.map((f) => (
                    <div
                      key={f._id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-2">
                          <span>{format(new Date(f.date), "EEE, MMM d, yyyy")}</span>
                          <span className="text-slate-400">at {f.time}</span>
                          <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                            {f.type.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-slate-300 mt-1">{f.notes}</p>
                        {f.nextAction && (
                          <div className="text-[11px] text-slate-500 mt-1">Next Action: {f.nextAction}</div>
                        )}
                      </div>

                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase border ${
                          f.status === "completed"
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                            : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                        }`}
                      >
                        {f.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Update Status */}
      <Modal isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Update Job Card Status">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-1.5">Select New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="diagnosis">Diagnosis</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_for_parts">Waiting for Parts</option>
              <option value="waiting_for_customer_approval">Waiting for Customer Approval</option>
              <option value="completed">Completed (Service Done)</option>
              <option value="delivered">Delivered (Handed Over to Customer)</option>
              <option value="reopened">Reopened</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-1.5">Diagnosis Notes</label>
            <textarea
              rows={3}
              value={diagnosisNotes}
              onChange={(e) => setDiagnosisNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
              placeholder="Technical findings..."
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-1.5">Resolution Notes</label>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
              placeholder="Repairs completed summary..."
            />
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30"
            >
              Confirm Status Update
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Assign / Reassign Technician */}
      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Technician">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-1.5">Select Active Technician</label>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Technician --</option>
              {technicians.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.specialization}) - {t.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignTechnician}
              disabled={!selectedTech}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl disabled:opacity-50"
            >
              Save Assignment
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Escalate */}
      <Modal isOpen={escalateModalOpen} onClose={() => setEscalateModalOpen(false)} title="Escalate Job Card">
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
            ⚠️ Escalating this job card will automatically set its priority to <strong>CRITICAL</strong> and notify the
            management team.
          </div>
          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-1.5">Reason for Escalation</label>
            <textarea
              rows={3}
              required
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              placeholder="e.g. Critical breakdown, parts delayed from supplier, urgent VIP customer deadline..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              onClick={() => setEscalateModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleEscalate}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl"
            >
              Escalate Immediately
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Create Follow-up */}
      <Modal isOpen={followUpModalOpen} onClose={() => setFollowUpModalOpen(false)} title="Schedule Customer Follow-Up">
        <form onSubmit={handleCreateFollowUp} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">Follow-up Date</label>
              <input
                type="date"
                required
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">Time</label>
              <input
                type="text"
                value={followUpTime}
                onChange={(e) => setFollowUpTime(e.target.value)}
                placeholder="10:30 AM"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-1.5">Contact Channel</label>
            <select
              value={followUpType}
              onChange={(e) => setFollowUpType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100"
            >
              <option value="phone_call">📞 Phone Call</option>
              <option value="whatsapp">📱 WhatsApp</option>
              <option value="email">✉️ Email</option>
              <option value="in_person">👤 In-Person Handover</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-1.5">Follow-up Notes / Agenda</label>
            <textarea
              rows={3}
              required
              value={followUpNotes}
              onChange={(e) => setFollowUpNotes(e.target.value)}
              placeholder="e.g. Call customer to verify satisfaction and confirm engine sound is gone..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setFollowUpModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
            >
              Schedule Follow-Up
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
