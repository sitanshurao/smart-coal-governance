// frontend/src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";

const HazardMap = dynamic(() => import("@/components/HazardMap"), { ssr: false });

// Defaults to your future live Render backend URL, falls back to local
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://smart-coal-governance.onrender.com";

interface Inspection {
  id: number;
  inspector_id: number;
  hazard_category: string;
  location_zone: string;
  days_since_last_check: number;
  severity: string;
  description: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  is_resolved: boolean;
}

export default function Dashboard() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchData = () => {
    setLoading(true);
    axios
      .get(`${API_BASE}/inspections/`)
      .then((res) => {
        setInspections(res.data.reverse());
        setLoading(false);
      })
      .catch((err) => {
        console.error("Backend fetch error:", err);
        setLoading(false);
      });
  };

  const resolveTicket = (id: number) => {
    axios
      .patch(`${API_BASE}/inspections/${id}/resolve`)
      .then(() => fetchData())
      .catch((err) => console.error("Action error:", err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const total = inspections.length;
  const criticalCount = inspections.filter((i) => i.severity === "Critical" && !i.is_resolved).length;
  const openCount = inspections.filter((i) => !i.is_resolved).length;
  const resolvedCount = inspections.filter((i) => i.is_resolved).length;

  const filteredData =
    filter === "ALL"
      ? inspections
      : inspections.filter((i) => i.severity.toUpperCase() === filter);

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-800">
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-300 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Coal Mine Smart Governance & Compliance Portal
          </h1>
          <p className="text-sm text-slate-500">
            Real-time Statutory Compliance, DGMS Safety Logging & AI Risk Monitoring
          </p>
        </div>
        <button
          onClick={fetchData}
          className="mt-3 md:mt-0 px-4 py-2 bg-slate-800 text-white rounded text-sm hover:bg-slate-700 transition"
        >
          Refresh Feed
        </button>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Audits</span>
          <p className="text-2xl font-bold mt-1 text-slate-800">{total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <span className="text-xs uppercase tracking-wider text-red-600 font-semibold">Active Critical</span>
          <p className="text-2xl font-bold mt-1 text-red-600">{criticalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <span className="text-xs uppercase tracking-wider text-amber-600 font-semibold">Open CAPA</span>
          <p className="text-2xl font-bold mt-1 text-amber-600">{openCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <span className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">Resolved</span>
          <p className="text-2xl font-bold mt-1 text-emerald-600">{resolvedCount}</p>
        </div>
      </section>

      {/* GIS Mapping */}
      <section className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-base font-bold text-slate-900 mb-1">Spatial Violation Plot</h2>
        <HazardMap inspections={inspections} />
      </section>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((level) => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            className={`px-3 py-1.5 text-xs font-semibold rounded border transition ${
              filter === level ? "bg-slate-800 text-white" : "bg-white text-slate-700"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-800 text-slate-200 uppercase text-xs">
            <tr>
              <th className="py-3 px-4">Ticket</th>
              <th className="py-3 px-4">Zone</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Days Overdue</th>
              <th className="py-3 px-4">AI Severity</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-500">
                  Connecting to live cloud engine...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-500">No records logged.</td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">#TKT-{item.id}</td>
                  <td className="py-3 px-4">{item.location_zone}</td>
                  <td className="py-3 px-4">{item.hazard_category}</td>
                  <td className="py-3 px-4">{item.days_since_last_check} d</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 border">
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 truncate max-w-xs">{item.description}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold ${item.is_resolved ? "text-green-600" : "text-rose-600"}`}>
                      {item.is_resolved ? "Closed" : "Active"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {!item.is_resolved && (
                      <button
                        onClick={() => resolveTicket(item.id)}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-500"
                      >
                        Close CAPA
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}