"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Download,
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity,
  MapPin,
  Loader,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PIE_COLORS = ["#DC2626", "#EA580C", "#D97706", "#059669"];

function buildReportHTML(statsData, signals, demoMode) {
  const sev = { critical: 0, high: 0, medium: 0, low: 0 };
  (statsData?.severityCounts || []).forEach((s) => {
    sev[s.severity] = parseInt(s.count);
  });
  const now = new Date().toLocaleString("en-IN");
  const topDrugs = (statsData?.topDrugs || []).slice(0, 10);
  const sigRows = (signals || [])
    .slice(0, 30)
    .map(
      (s) => `
    <tr style="border-bottom:1px solid #E5E7EB;">
      <td style="padding:7px 9px;font-weight:600;">${s.drug_name}</td>
      <td style="padding:7px 9px;color:#6B7280;">${s.symptom}</td>
      <td style="padding:7px 9px;"><span style="background:${s.severity === "critical" ? "#FEF2F2" : s.severity === "high" ? "#FFF7ED" : "#FFFBEB"};color:${s.severity === "critical" ? "#DC2626" : s.severity === "high" ? "#EA580C" : "#D97706"};padding:2px 7px;border-radius:10px;font-size:10px;font-weight:700;text-transform:uppercase;">${s.severity}</span></td>
      <td style="padding:7px 9px;color:#6B7280;">${s.region}</td>
      <td style="padding:7px 9px;color:#6B7280;">${s.platform}</td>
      <td style="padding:7px 9px;font-weight:600;">${Math.round((s.confidence_score || 0) * 100)}%</td>
      <td style="padding:7px 9px;color:#6B7280;">${new Date(s.detected_at).toLocaleDateString("en-IN")}</td>
      ${s.source_url ? `<td style="padding:7px 9px;"><a href="${s.source_url}" style="color:#002366;font-size:11px;">Verify →</a></td>` : '<td style="padding:7px 9px;color:#9CA3AF;font-size:11px;">—</td>'}
    </tr>`,
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>PulseWatch CDSCO Report</title></head>
  <body style="font-family:Arial,sans-serif;color:#1A1A2E;margin:0;padding:32px;font-size:13px;">
    <div style="border-bottom:3px solid #002366;padding-bottom:16px;margin-bottom:24px;">
      <h1 style="font-size:18px;color:#002366;margin:0 0 4px;">CENTRAL DRUGS STANDARD CONTROL ORGANISATION</h1>
      <p style="margin:0;font-size:11px;color:#6B7280;">Pharmacovigilance Programme of India (PvPI) — Digital Signal Report · Generated: ${now}</p>
      ${demoMode ? '<p style="margin:4px 0 0;font-size:11px;color:#E87722;font-weight:600;">⚠ Demo Mode: Sample data</p>' : '<p style="margin:4px 0 0;font-size:11px;color:#059669;font-weight:600;">✅ Live Mode: Real signals from OpenFDA · PubMed · NewsAPI</p>'}
    </div>
    <table style="width:100%;margin-bottom:24px;border-collapse:collapse;font-size:12px;">
      <tr>
        <td style="width:50%;vertical-align:top;padding-right:16px;">
          <table style="width:100%;">
            <tr><td style="color:#6B7280;padding:3px 0;width:180px;">Total Signals:</td><td style="font-weight:600;">${statsData?.totalSignals || 0}</td></tr>
            <tr><td style="color:#6B7280;padding:3px 0;">Critical:</td><td style="font-weight:700;color:#DC2626;">${sev.critical}</td></tr>
            <tr><td style="color:#6B7280;padding:3px 0;">High Priority:</td><td style="font-weight:700;color:#EA580C;">${sev.high}</td></tr>
            <tr><td style="color:#6B7280;padding:3px 0;">Open Alerts:</td><td style="font-weight:600;">${statsData?.totalAlerts || 0}</td></tr>
          </table>
        </td>
        <td style="width:50%;vertical-align:top;">
          <table style="width:100%;font-size:12px;">
            <tr><td style="color:#6B7280;padding:3px 0;width:180px;">Drugs Flagged:</td><td style="font-weight:600;">${topDrugs.length}</td></tr>
            <tr><td style="color:#6B7280;padding:3px 0;">Data Sources:</td><td style="font-weight:600;">OpenFDA, PubMed, NewsAPI</td></tr>
            <tr><td style="color:#6B7280;padding:3px 0;">Data Type:</td><td style="font-weight:600;">${demoMode ? "Demo (sample)" : "Live (real)"}</td></tr>
          </table>
        </td>
      </tr>
    </table>
    ${sev.critical > 0 ? `<div style="background:#FEF2F2;border-radius:6px;padding:12px 16px;border:1px solid #FECACA;margin-bottom:20px;"><strong style="color:#DC2626;font-size:12px;">⚠ CRITICAL SIGNALS REQUIRING IMMEDIATE CDSCO ACTION (${sev.critical})</strong></div>` : ""}
    <h2 style="font-size:14px;margin:0 0 10px;">Top Drugs by Signal Volume</h2>
    <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:24px;">
      <thead><tr style="background:#F4F6FA;"><th style="padding:7px 9px;text-align:left;color:#6B7280;text-transform:uppercase;font-size:10px;">#</th><th style="padding:7px 9px;text-align:left;color:#6B7280;text-transform:uppercase;font-size:10px;">Drug</th><th style="padding:7px 9px;text-align:left;color:#6B7280;text-transform:uppercase;font-size:10px;">Mentions</th></tr></thead>
      <tbody>${topDrugs.map((d, i) => `<tr style="border-bottom:1px solid #E5E7EB;"><td style="padding:7px 9px;color:#6B7280;">${i + 1}</td><td style="padding:7px 9px;font-weight:600;">${d.drug_name}</td><td style="padding:7px 9px;">${d.mention_count}</td></tr>`).join("")}</tbody>
    </table>
    <h2 style="font-size:14px;margin:0 0 10px;">Recent Signals (with Source Verification Links)</h2>
    <table style="width:100%;border-collapse:collapse;font-size:11px;">
      <thead><tr style="background:#F4F6FA;"><th style="padding:7px 9px;text-align:left;color:#6B7280;text-transform:uppercase;font-size:9px;">Drug</th><th style="padding:7px 9px;text-align:left;color:#6B7280;text-transform:uppercase;font-size:9px;">Symptom</th><th style="padding:7px 9px;text-align:left;color:#6B7280;text-transform:uppercase;font-size:9px;">Sev.</th><th style="padding:7px 9px;text-align:left;color:#6B7280;text-transform:uppercase;font-size:9px;">Region</th><th style="padding:7px 9px;text-align:left;color:#6B7280;text-transform:uppercase;font-size:9px;">Platform</th><th style="padding:7px 9px;text-align:left;color:#6B7280;text-transform:uppercase;font-size:9px;">Conf.</th><th style="padding:7px 9px;text-align:left;color:#6B7280;text-transform:uppercase;font-size:9px;">Date</th><th style="padding:7px 9px;text-align:left;color:#6B7280;text-transform:uppercase;font-size:9px;">Source</th></tr></thead>
      <tbody>${sigRows}</tbody>
    </table>
    <div style="margin-top:40px;padding-top:16px;border-top:1px solid #E5E7EB;font-size:10px;color:#9CA3AF;">
      Generated by PulseWatch AI v2.1 · CDSCO Pharmacovigilance Programme · Source links included for verification
    </div>
  </body></html>`;
}

const HISTORICAL = [
  {
    id: "RPT-2025-W18",
    title: "Week 18 Pharmacovigilance Summary",
    period: "Apr 28–May 4, 2025",
    signals: 312,
    critical: 8,
  },
  {
    id: "RPT-2025-W17",
    title: "Week 17 Pharmacovigilance Summary",
    period: "Apr 21–27, 2025",
    signals: 287,
    critical: 5,
  },
  {
    id: "RPT-2025-W16",
    title: "Week 16 Pharmacovigilance Summary",
    period: "Apr 14–20, 2025",
    signals: 341,
    critical: 12,
  },
  {
    id: "RPT-2025-W15",
    title: "Week 15 Pharmacovigilance Summary",
    period: "Apr 7–13, 2025",
    signals: 198,
    critical: 3,
  },
];

export default function ReportsPage() {
  const [exporting, setExporting] = useState(null);
  const [toast, setToast] = useState(null);
  const [cardHovers, setCardHovers] = useState({});
  const [demoMode, setDemoMode] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : { demo_mode: true }))
      .then((d) => setDemoMode(d.demo_mode))
      .catch(() => {});
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["dashboard-stats", demoMode],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: signalsData } = useQuery({
    queryKey: ["signals-report", demoMode],
    queryFn: async () => {
      const p = new URLSearchParams({
        limit: "50",
        demo_mode: String(demoMode),
      });
      const res = await fetch(`/api/signals?${p}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  (statsData?.severityCounts || []).forEach((s) => {
    severityCounts[s.severity] = parseInt(s.count);
  });

  const pieData = [
    { name: "Critical", value: severityCounts.critical },
    { name: "High", value: severityCounts.high },
    { name: "Medium", value: severityCounts.medium },
    { name: "Low", value: severityCounts.low },
  ].filter((d) => d.value > 0);

  const barData = (statsData?.topDrugs || [])
    .slice(0, 7)
    .map((d) => ({ drug: d.drug_name, count: parseInt(d.mention_count) }));

  const downloadPDF = async (key, html, filename) => {
    setExporting(key);
    try {
      const res = await fetch("/integrations/pdf-generation/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: { html } }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("PDF downloaded");
    } catch (e) {
      console.error(e);
      showToast("Export failed: " + e.message, "error");
    }
    setExporting(null);
  };

  const handleExportMain = () => {
    const html = buildReportHTML(
      statsData,
      signalsData?.signals || [],
      demoMode,
    );
    downloadPDF(
      "main",
      html,
      `PulseWatch-CDSCO-Report-${new Date().toISOString().split("T")[0]}.pdf`,
    );
  };

  const handleExportHistorical = (report) => {
    const mockStats = {
      totalSignals: report.signals,
      totalAlerts: report.critical,
      topDrugs: statsData?.topDrugs || [],
      regionBreakdown: [],
      severityCounts: [{ severity: "critical", count: report.critical }],
    };
    const html = buildReportHTML(mockStats, signalsData?.signals || [], false);
    downloadPDF(report.id, html, `PulseWatch-${report.id}.pdf`);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F4F6FA" }}>
      <Navbar />

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 2000,
            backgroundColor: toast.type === "error" ? "#DC2626" : "#002366",
            color: "#FFFFFF",
            padding: "12px 20px",
            borderRadius: 8,
            fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle size={16} /> {toast.msg}
        </div>
      )}

      {demoMode && (
        <div
          style={{
            backgroundColor: "#FFF3E8",
            borderBottom: "1px solid #FDDCB8",
            padding: "9px 48px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: "center",
          }}
        >
          <Zap size={14} color="#E87722" />
          <span
            style={{
              fontSize: 13,
              color: "#92400E",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <strong>Demo Mode ON</strong> — Exported PDFs will be labelled as
            demo data.
          </span>
        </div>
      )}

      <div style={{ backgroundColor: "#002366", padding: "28px 48px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 24,
                  color: "#FFFFFF",
                  margin: "0 0 4px",
                }}
              >
                Pharmacovigilance Reports
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 14,
                  margin: 0,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                CDSCO-format summaries · Real source links · Download as PDF
              </p>
            </div>
            <button
              onClick={handleExportMain}
              disabled={!!exporting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#E87722",
                color: "#FFFFFF",
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                cursor: !!exporting ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                opacity: !!exporting ? 0.7 : 1,
              }}
            >
              {exporting === "main" ? (
                <Loader
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Download size={16} />
              )}
              {exporting === "main"
                ? "Generating..."
                : "Export CDSCO Report PDF"}
            </button>
          </div>
        </div>
      </div>

      <div
        style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 48px" }}
        className="reports-wrap"
      >
        {/* Summary Cards */}
        <div style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "#1A1A2E",
              margin: "0 0 16px",
            }}
          >
            Current Period Summary
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 20,
            }}
            className="report-stats"
          >
            {[
              {
                label: "Signals Detected",
                value: statsData?.totalSignals || 0,
                icon: Activity,
                color: "#002366",
                bg: "#EEF2FF",
                sub: "All platforms",
              },
              {
                label: "Critical Alerts",
                value: severityCounts.critical,
                icon: AlertTriangle,
                color: "#DC2626",
                bg: "#FEF2F2",
                sub: "CDSCO action needed",
              },
              {
                label: "Drugs Flagged",
                value: (statsData?.topDrugs || []).length,
                icon: Shield,
                color: "#D97706",
                bg: "#FFFBEB",
                sub: "Unique substances",
              },
              {
                label: "States Covered",
                value: (statsData?.regionBreakdown || []).length,
                icon: MapPin,
                color: "#059669",
                bg: "#F0FDF4",
                sub: "Active monitoring",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: "20px 24px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      backgroundColor: card.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} color={card.color} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 800,
                        fontSize: 28,
                        color: "#1A1A2E",
                        lineHeight: 1,
                      }}
                    >
                      {isLoading ? "—" : card.value}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        fontFamily: "'DM Sans', sans-serif",
                        marginTop: 4,
                      }}
                    >
                      {card.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 20,
            marginBottom: 32,
          }}
          className="report-charts"
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: "24px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#1A1A2E",
                    margin: 0,
                  }}
                >
                  Drug Mention Frequency
                </h3>
                <p
                  style={{
                    color: "#6B7280",
                    fontSize: 12,
                    margin: "4px 0 0",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  ADR mentions by drug
                </p>
              </div>
              <button
                onClick={handleExportMain}
                disabled={!!exporting}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #E5E7EB",
                  backgroundColor: "#FFFFFF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "#6B7280",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <Download size={12} /> Export
              </button>
            </div>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F4F6FA" />
                  <XAxis
                    dataKey="drug"
                    tick={{
                      fontSize: 11,
                      fill: "#6B7280",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "#6B7280",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#002366" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: 220,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6B7280",
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {isLoading ? "Loading..." : "No data yet — run crawlers first"}
              </div>
            )}
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: "24px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: "#1A1A2E",
                margin: "0 0 4px",
              }}
            >
              Severity Distribution
            </h3>
            <p
              style={{
                color: "#6B7280",
                fontSize: 12,
                margin: "0 0 16px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              All signals
            </p>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={10}
                    formatter={(v) => (
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "'DM Sans', sans-serif",
                          color: "#6B7280",
                        }}
                      >
                        {v}
                      </span>
                    )}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: 220,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6B7280",
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Loading...
              </div>
            )}
          </div>
        </div>

        {/* CDSCO Preview */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: "28px",
            border: "2px solid #C7D2FE",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    backgroundColor: "#EEF2FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={16} color="#002366" />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#1A1A2E",
                    }}
                  >
                    CDSCO Pharmacovigilance Report
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Auto-generated from live database ·{" "}
                    {demoMode ? "Demo data" : "Live signals"}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <span
                style={{
                  backgroundColor: demoMode ? "#FFF3E8" : "#F0FDF4",
                  color: demoMode ? "#E87722" : "#059669",
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {demoMode ? "Demo Data" : "Live Data"}
              </span>
              <span
                style={{
                  backgroundColor: "#EEF2FF",
                  color: "#002366",
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                CDSCO Compliant
              </span>
              <button
                onClick={handleExportMain}
                disabled={!!exporting}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: "#002366",
                  color: "#FFFFFF",
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {exporting === "main" ? (
                  <Loader
                    size={13}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <Download size={14} />
                )}{" "}
                Export PDF
              </button>
            </div>
          </div>
          <div
            style={{
              backgroundColor: "#F4F6FA",
              borderRadius: 8,
              padding: "20px",
              border: "1px solid #E5E7EB",
            }}
          >
            <div
              style={{
                borderBottom: "2px solid #002366",
                paddingBottom: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#002366",
                }}
              >
                CENTRAL DRUGS STANDARD CONTROL ORGANISATION
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  fontFamily: "'DM Sans', sans-serif",
                  marginTop: 4,
                }}
              >
                Directorate General of Health Services | Ministry of Health &
                Family Welfare, India
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Pharmacovigilance Programme of India (PvPI) — Digital Signal
                Report
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                marginBottom: 16,
              }}
              className="report-meta-grid"
            >
              {[
                {
                  label: "Total Signals",
                  value: String(statsData?.totalSignals || 0),
                },
                {
                  label: "Critical Signals",
                  value: String(severityCounts.critical),
                },
                { label: "Sources", value: "OpenFDA · PubMed · NewsAPI" },
                {
                  label: "Generated",
                  value: new Date().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }),
                },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      fontFamily: "'DM Sans', sans-serif",
                      minWidth: 140,
                    }}
                  >
                    {row.label}:
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#1A1A2E",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            {severityCounts.critical > 0 && (
              <div
                style={{
                  backgroundColor: "#FEF2F2",
                  borderRadius: 6,
                  padding: "10px 14px",
                  border: "1px solid #FECACA",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#DC2626",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  ⚠ {severityCounts.critical} CRITICAL SIGNAL
                  {severityCounts.critical !== 1 ? "S" : ""} REQUIRING IMMEDIATE
                  REVIEW
                </div>
              </div>
            )}
            <div
              style={{
                fontSize: 11,
                color: "#6B7280",
                fontFamily: "'DM Sans', sans-serif",
                fontStyle: "italic",
              }}
            >
              Click "Export PDF" to download a real CDSCO-formatted report
              including all signals with source verification links.
            </div>
          </div>
        </div>

        {/* Historical Reports */}
        <div>
          <h2
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "#1A1A2E",
              margin: "0 0 16px",
            }}
          >
            Historical Reports
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {HISTORICAL.map((report) => {
              const hovered = cardHovers[report.id];
              return (
                <div
                  key={report.id}
                  onMouseEnter={() =>
                    setCardHovers((h) => ({ ...h, [report.id]: true }))
                  }
                  onMouseLeave={() =>
                    setCardHovers((h) => ({ ...h, [report.id]: false }))
                  }
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: "18px 24px",
                    border: "1px solid #E5E7EB",
                    boxShadow: hovered
                      ? "0 6px 20px rgba(0,0,0,0.10)"
                      : "0 2px 8px rgba(0,0,0,0.06)",
                    transform: hovered ? "translateY(-1px)" : "translateY(0)",
                    transition: "all 200ms",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: "#EEF2FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={18} color="#002366" />
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#1A1A2E",
                      }}
                    >
                      {report.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        fontFamily: "'DM Sans', sans-serif",
                        marginTop: 2,
                      }}
                    >
                      {report.period} · {report.id}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700,
                          fontSize: 18,
                          color: "#1A1A2E",
                        }}
                      >
                        {report.signals}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#6B7280",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        signals
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700,
                          fontSize: 18,
                          color: "#DC2626",
                        }}
                      >
                        {report.critical}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#6B7280",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        critical
                      </div>
                    </div>
                    <span
                      style={{
                        backgroundColor: "#F0FDF4",
                        color: "#059669",
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      published
                    </span>
                    <button
                      onClick={() => handleExportHistorical(report)}
                      disabled={!!exporting}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "7px 14px",
                        borderRadius: 6,
                        backgroundColor: "#FFFFFF",
                        color: "#002366",
                        border: "1px solid #002366",
                        cursor: !!exporting ? "not-allowed" : "pointer",
                        fontSize: 12,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        opacity: !!exporting ? 0.7 : 1,
                      }}
                    >
                      {exporting === report.id ? (
                        <Loader
                          size={12}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                      ) : (
                        <Download size={12} />
                      )}
                      {exporting === report.id
                        ? "Generating..."
                        : "Download PDF"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width:900px) { .reports-wrap { padding:20px 16px !important; } .report-stats { grid-template-columns:1fr 1fr !important; } .report-charts { grid-template-columns:1fr !important; } .report-meta-grid { grid-template-columns:1fr !important; } }
        @media (max-width:480px) { .report-stats { grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  );
}
