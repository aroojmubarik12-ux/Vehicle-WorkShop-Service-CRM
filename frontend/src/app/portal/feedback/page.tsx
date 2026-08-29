"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { Star, MessageSquareHeart } from "lucide-react";
import { format } from "date-fns";

export default function CustomerFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/feedback").then((res) => {
      if (res.data.success) {
        setFeedbacks(res.data.feedbacks);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">My Feedback & Ratings</h1>
        <p className="text-xs text-slate-400 mt-1">Review your past ratings and comments submitted for completed services</p>
      </div>

      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">
            You haven't submitted any feedback yet. Complete a service to rate our mechanics!
          </div>
        ) : (
          feedbacks.map((fb) => (
            <div key={fb._id} className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-3">
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
                  <span className="text-xs font-bold text-slate-200 ml-1">{fb.rating}.0</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {format(new Date(fb.createdAt), "MMM d, yyyy")}
                </span>
              </div>

              <p className="text-xs text-slate-200 italic bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                "{fb.comment || "No written review"}"
              </p>

              <div className="text-[11px] text-slate-400">
                Job Card: <span className="font-mono text-blue-400 font-semibold">{fb.jobCard?.jobCardNumber}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
