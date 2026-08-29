"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { MessageSquareHeart, Star, User, Car } from "lucide-react";
import { format } from "date-fns";

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(5.0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await api.get("/feedback");
        if (res.data.success) {
          setFeedbacks(res.data.feedbacks);
          setAvgRating(res.data.averageRating);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Customer Feedback & Reviews</h1>
          <p className="text-xs text-slate-400 mt-1">Post-service customer ratings, reviews, and satisfaction monitoring</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
          <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
          <div>
            <div className="text-2xl font-black text-white">{avgRating} / 5.0</div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Average Score</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feedbacks.map((fb) => (
          <div key={fb._id} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < fb.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"
                    }`}
                  />
                ))}
                <span className="text-xs font-bold ml-1 text-slate-200">{fb.rating}.0</span>
              </div>
              <span className="text-[10px] text-slate-500">{format(new Date(fb.createdAt), "MMM d, yyyy")}</span>
            </div>

            <p className="text-xs text-slate-200 italic leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              "{fb.comment || "No written review provided."}"
            </p>

            <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-800/80 text-slate-400">
              <div>
                <span className="font-semibold text-slate-200">{fb.customer?.name}</span>
                <span className="block text-[10px] text-slate-500">{fb.jobCard?.jobCardNumber}</span>
              </div>
              {fb.technician && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Mechanic</span>
                  <span className="text-slate-300 font-semibold">{fb.technician.name}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
