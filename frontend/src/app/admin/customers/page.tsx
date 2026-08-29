"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { Customer } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { UserCheck, Plus, Phone, Mail, MapPin, Search, Building } from "lucide-react";

export default function AdminCustomersPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [city, setCity] = useState("Lahore");
  const [address, setAddress] = useState("");
  const [company, setCompany] = useState("");
  const [tags, setTags] = useState("Regular");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers${search ? `?search=${search}` : ""}`);
      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/customers", {
        name,
        email,
        phone,
        alternatePhone,
        city,
        address,
        company,
        tags: tags.split(",").map((t) => t.trim()),
        status: "active"
      });
      if (res.data.success) {
        showToast("Customer profile created.", "success");
        setModalOpen(false);
        setName("");
        setEmail("");
        setPhone("");
        setAddress("");
        setCompany("");
        fetchCustomers();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to create customer.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Customer Database</h1>
          <p className="text-xs text-slate-400 mt-1">Manage private owners, corporate fleet accounts, and contact profiles</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer by name, email, phone, or company..."
          className="flex-1 bg-transparent border-none text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 uppercase font-semibold">
              <th className="py-3.5 px-4">Customer Name</th>
              <th className="py-3.5 px-4">Contact Info</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Company / Fleet</th>
              <th className="py-3.5 px-4">Tags</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {customers.map((c) => (
              <tr key={c._id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-100">
                  {c.name}
                  {c.alternatePhone && (
                    <span className="block text-[10px] text-slate-500 font-normal">Alt: {c.alternatePhone}</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-slate-300">
                  <div>📞 {c.phone}</div>
                  <div className="text-[11px] text-slate-400">✉️ {c.email}</div>
                </td>
                <td className="py-3.5 px-4 text-slate-300">
                  <div className="font-semibold text-slate-200">{c.city || "N/A"}</div>
                  <div className="text-[10px] text-slate-500 truncate max-w-xs">{c.address}</div>
                </td>
                <td className="py-3.5 px-4 text-slate-300">
                  {c.company ? (
                    <span className="flex items-center gap-1 font-medium text-indigo-400">
                      <Building className="w-3 h-3" /> {c.company}
                    </span>
                  ) : (
                    <span className="text-slate-500">Individual</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {c.tags?.map((t, idx) => (
                      <span key={idx} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      c.status === "active"
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Customer Account">
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-1.5">Customer Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Usman Khan"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usman@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">Primary Phone</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 321 9876543"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Lahore"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1.5">Company (Optional)</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Fleet company name"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-300 mb-1.5">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address, sector, phase"
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
              Create Customer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
