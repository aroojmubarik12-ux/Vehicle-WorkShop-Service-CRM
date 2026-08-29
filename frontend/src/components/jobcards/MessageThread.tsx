"use client";

import React, { useState, useEffect } from "react";
import { JobCardMessage } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import api from "@/services/api";
import { MessageSquare, Lock, Send, User, Shield, Wrench, PhoneCall, Mail } from "lucide-react";
import { format } from "date-fns";

interface MessageThreadProps {
  jobCardId: string;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ jobCardId }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<JobCardMessage[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "internal" | "public">("all");
  const [newMessage, setNewMessage] = useState("");
  const [messageType, setMessageType] = useState<string>("internal_note");
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/jobcards/${jobCardId}/messages`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMessages();
    if (user?.role === "customer") {
      setMessageType("customer_reply");
      setActiveTab("public");
    }
  }, [jobCardId, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const payload = {
        message: newMessage,
        type: user?.role === "customer" ? "customer_reply" : messageType
      };
      const res = await api.post(`/jobcards/${jobCardId}/messages`, payload);
      if (res.data.success) {
        setNewMessage("");
        showToast("Message added successfully.", "success");
        fetchMessages();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to send message.", "error");
    } finally {
      setSending(false);
    }
  };

  const isStaff = user?.role === "admin" || user?.role === "technician";

  const filteredMessages = messages.filter((m) => {
    if (activeTab === "internal") return m.type === "internal_note";
    if (activeTab === "public") return m.type !== "internal_note";
    return true;
  });

  return (
    <div className="flex flex-col h-[520px] bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-slate-100">Service Communication & Notes</h3>
        </div>

        {isStaff && (
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab("internal")}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                activeTab === "internal" ? "bg-amber-500/20 text-amber-300" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Lock className="w-3 h-3 text-amber-400" /> Internal Notes
            </button>
            <button
              onClick={() => setActiveTab("public")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === "public" ? "bg-blue-500/20 text-blue-300" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Customer Replies
            </button>
          </div>
        )}
      </div>

      {/* Messages list */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
            <MessageSquare className="w-8 h-8 opacity-40" />
            No conversation logs yet.
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isInternal = msg.type === "internal_note";
            const isMe = msg.sender?._id === user?._id;

            return (
              <div
                key={msg._id}
                className={`p-4 rounded-2xl border text-xs max-w-[85%] ${
                  isInternal
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-100 ml-0 mr-auto"
                    : isMe
                    ? "bg-blue-600/20 border-blue-500/40 text-slate-100 ml-auto mr-0"
                    : "bg-slate-800/80 border-slate-700 text-slate-100 ml-0 mr-auto"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {msg.sender?.name ? msg.sender.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="font-bold text-slate-200">{msg.sender?.name}</span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-semibold ${
                        msg.senderRole === "admin"
                          ? "bg-purple-500/20 text-purple-400"
                          : msg.senderRole === "technician"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {msg.senderRole}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    {isInternal && (
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Lock className="w-3 h-3" /> Staff Only
                      </span>
                    )}
                    <span>{format(new Date(msg.createdAt), "MMM d, h:mm a")}</span>
                  </div>
                </div>

                <p className="whitespace-pre-wrap leading-relaxed mt-1 text-slate-200">{msg.message}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
        {isStaff && (
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-400">Message Type:</span>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="internal_note">🔒 Internal Note (Team Only)</option>
              <option value="customer_reply">💬 Customer Reply (Visible to Client)</option>
              <option value="phone">📞 Phone Call Log</option>
              <option value="whatsapp">📱 WhatsApp Note</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              user?.role === "customer"
                ? "Write a message or question to the workshop team..."
                : messageType === "internal_note"
                ? "Add internal technical note (hidden from customer)..."
                : "Type message to send to customer..."
            }
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </div>
      </form>
    </div>
  );
};
