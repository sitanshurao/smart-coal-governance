"use client";

import { useEffect, useState } from "react";
import axios from "axios";

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
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    inspector_id: 101,
    hazard_category: "Slope Stability",
    location_zone: "Bench 3",
    days_since_last_check: 15,
    latitude: 23.7957,
    longitude: 86.4304,
    description: "",
  });

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE}/inspections/`, formData);
      alert(`✅ Ticket Created! AI Evaluated Severity: ${res.data.severity}`);
      setFormData({
        inspector_id: 101,
        hazard_category: "Slope Stability",
        location_zone: "Bench 3",
        days_since_last_check: 15,
        latitude: 23.7957,
        longitude: 86.4304,
        description: "",
      });
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to submit inspection. Please verify backend connectivity.");
    } finally {
      setSubmitting(false);
    }
  };

  const resolveTicket = (id: number) => {
    axios
      .patch(`${API_BASE}/inspections/${id}/resolve`)
      .then(() => fetchData())
      .catch((err) => console.error("Action error:", err));
  };

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
        <div className="mt-4 md:mt-0 flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded text-sm hover:bg-blue-500 transition shadow-sm"
          >
            {showForm ? "Close Form" : "+ Log Field Inspection"}
          </button>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-slate-800 text-white rounded text-sm hover:bg-slate-700 transition"
          >
            Refresh Feed
          </button>
        </div>
      </header>

      {/* Web Inspection Form */}
      {showForm && (
        <section className="mb-6 bg-white p-6 rounded-lg shadow border border-blue-200">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Direct Web Inspection Form</h2>
          <p className="text-xs text-slate-500 mb-4">
            Submissions run through the cloud Random Forest classifier to determine risk severity in real time.
          </p>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Hazard Category</label>
              <select
                value={formData.hazard_category}
                onChange={(e) => setFormData({ ...formData, hazard_category: e.target.value })}
                className="w-full border border-slate-300 rounded p-2 text-sm bg-white"
              >
                <option value="Slope Stability">Slope Stability</option>
                <option value="Haul Road Damage">Haul Road Damage</option>
                <option value="Gas Leakage / Methane">Gas Leakage / Methane</option>
                <option value="Dust & Ventilation">Dust & Ventilation</option>
                <option value="Electrical / Equipment">Electrical / Equipment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Location Zone</label>
              <select
                value={formData.location_zone}
                onChange={(e) => setFormData({ ...formData, location_zone: e.target.value })}
                className="w-full border border-slate-300 rounded p-2 text-sm bg-white"
              >
                <option value="Bench 3">Bench 3</option>
                <option value="Pit 1 North">Pit 1 North</option>
                <option value="Overburden Dump B">Overburden Dump B</option>
                <option value="Underground Shaft 2">Underground Shaft 2</option>
                <option value="Crusher Unit">Crusher Unit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Days Overdue (Since Last Check)</label>
              <input
                type="number"
                min="0"
                value={formData.days_since_last_check}
                onChange={(e) => setFormData({ ...formData, days_since_last_check: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded p-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full border border-slate-300 rounded p-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full border border-slate-300 rounded p-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Inspector ID</label>
              <input
                type="number"
                value={formData.inspector_id}
                onChange={(e) => setFormData({ ...formData, inspector_id: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded p-2 text-sm"
                required
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Hazard Observation Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Enter field findings, crack width, methane ppm reading, etc."
                className="w-full border border-slate-300 rounded p-2 text-sm"
                required
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded text-sm hover:bg-emerald-500 transition disabled:opacity-50"
              >
                {submitting ? "Analyzing Risk with AI..." : "Submit Inspection"}
              </button>
            </div>
          </form>
        </section>
      )}

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

      {/* GIS Mapping Section */}
      <section className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900">Mine Hazard GIS Spatial Plot</h2>
          <p className="text-xs text-slate-500">
            Live topographic view centered on active Dhanbad/Jharia mining belts (23.7957° N, 86.4304° E).
          </p>
        </div>
        <div className="h-[320px] w-full rounded-lg overflow-hidden border border-slate-300 shadow-inner">
          <iframe
            title="Coal Mine GIS Map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src="https://www.openstreetmap.org/export/embed.html?bbox=86.35%2C23.75%2C86.50%2C23.85&amp;layer=mapnik&amp;marker=23.7957%2C86.4304"
          />
        </div>
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
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${
                        item.severity === "Critical"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : item.severity === "High"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate">{item.description}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold ${item.is_resolved ? "text-green-600" : "text-rose-600"}`}>
                      {item.is_resolved ? "Resolved" : "Open Breach"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {!item.is_resolved && (
                      <button
                        onClick={() => resolveTicket(item.id)}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-500 transition"
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
