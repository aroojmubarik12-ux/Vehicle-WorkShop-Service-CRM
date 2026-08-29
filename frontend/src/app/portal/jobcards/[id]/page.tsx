"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { JobCard } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Timeline } from "@/components/jobcards/Timeline";
import { MessageThread } from "@/components/jobcards/MessageThread";
import { PartsLaborEstimator } from "@/components/jobcards/PartsLaborEstimator";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";
import { ArrowLeft, Car, Wrench, Star, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function CustomerJobCardDetailsPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [jobCard, setJobCard] = useState<JobCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const fetchJobCard = async () => {
    try {
      const res = await api.get(`/jobcards/${id}`);
      if (res.data.success) {
        setJobCard(res.data.jobCard);
      }
    } catch (e) {
      console.error(e);
      showToast("Job card not found or unauthorized.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchJobCard();
  }, [id]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post(`/jobcards/${id}/feedback`, { rating, comment });
      if (res.data.success) {
        showToast("Thank you for your rating!", "success");
        setFeedbackModalOpen(false);
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to submit feedback.", "error");
    }
  };

  if (loading || !jobCard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isComplete = ["completed", "delivered"].includes(jobCard.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/portal/jobcards"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-white">{jobCard.jobCardNumber}</h1>
              <StatusBadge status={jobCard.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{jobCard.subject}</p>
          </div>
        </div>

        {isComplete && (
          <button
            onClick={() => setFeedbackModalOpen(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Star className="w-4 h-4 fill-slate-950" /> Rate Service Experience
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Vehicle info & Stepper */}
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-3">
            <span className="text-xs font-bold uppercase text-slate-400 block border-b border-slate-800 pb-3">
              Vehicle Information
            </span>
            <div className="text-xs space-y-1.5">
              <div className="font-bold text-slate-100 text-sm">
                {jobCard.vehicle?.make} {jobCard.vehicle?.model} ({jobCard.vehicle?.year})
              </div>
              <div className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded inline-block">
                {jobCard.vehicle?.registrationNumber}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-4">
            <span className="text-xs font-bold uppercase text-slate-400 block border-b border-slate-800 pb-3">
              Live Progress Stepper
            </span>
            <Timeline jobCard={jobCard} />
          </div>
        </div>

        {/* Right Column: Estimate & Chat */}
        <div className="lg:col-span-2 space-y-6">
          <PartsLaborEstimator jobCard={jobCard} onUpdate={fetchJobCard} />
          <MessageThread jobCardId={jobCard._id} />
        </div>
      </div>

      {/* Feedback Modal */}
      <Modal isOpen={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} title="Rate Service Quality">
        <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-2">Overall Rating (1 to 5 Stars)</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  className={`p-2 rounded-xl border transition-all ${
                    s <= rating
                      ? "bg-amber-500/20 border-amber-500 text-amber-400"
                      : "bg-slate-950 border-slate-800 text-slate-600"
                  }`}
                >
                  <Star className={`w-6 h-6 ${s <= rating ? "fill-amber-400" : ""}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-1.5">Your Review / Remarks</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the mechanic's work, vehicle condition, or overall satisfaction..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:ring-2 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setFeedbackModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
