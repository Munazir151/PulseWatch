"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Shield,
  TrendingUp,
  Filter,
  RefreshCw,
  ChevronRight,
  Eye,
  Flag,
  MapPin,
  X,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SEVERITY_COLORS = {
  critical: "#DC2626",
  high: "#EA580C",
  medium: "#D97706",
  low: "#059669",
};
const SEVERITY_BG = {
  critical: "#FEF2F2",
  high: "#FFF7ED",
  medium: "#FFFBEB",
  low: "#F0FDF4",
};

// India grid — approximates geographical layout
const INDIA_GRID = [
  [null, null, "Jammu & Kashmir", null, null],
  [null, "Himachal Pradesh", "Punjab", null, null],
  ["Rajasthan", "Haryana", "Delhi", "Uttar Pradesh", null],
  [null, "Gujarat", "Madhya Pradesh", "Bihar", "West Bengal"],
  [null, null, "Maharashtra", "Jharkhand", null],
  [null, "Goa", "Telangana", "Odisha", null],
  [null, null, "Karnataka", "Andhra Pradesh", null],
  [null, null, "Kerala", "Tamil Nadu", null],
];

const HEAT_COLORS = {
  critical: { bg: "#FEE2E2", border: "#DC2626", text: "#991B1B" },
  high: { bg: "#FFEDD5", border: "#EA580C", text: "#9A3412" },
  medium: { bg: "#FEF9C3", border: "#D97706", text: "#92400E" },
  low: { bg: "#DCFCE7", border: "#059669", text: "#065F46" },
  none: { bg: "#F4F6FA", border: "#E5E7EB", text: "#9CA3AF" },
};

function getTopSeverity(rd) {
  if (!rd) return "none";
  if (parseInt(rd.critical || 0) > 0) return "critical";
  if (parseInt(rd.high || 0) > 0) return "high";
  if (parseInt(rd.medium || 0) > 0) return "medium";
  if (parseInt(rd.low || 0) > 0) return "low";
  return "none";
}

function SeverityPill({ severity }) {
  return (
    <span
      style={{
        backgroundColor: SEVERITY_BG[severity] || "#F4F6FA",
        color: SEVERITY_COLORS[severity] || "#6B7280",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {severity}
    </span>
  );
}

function ConfidenceBar({ score }) {
  const pct = Math.round((score || 0) * 100);
  const color = pct >= 85 ? "#002366" : pct >= 70 ? "#D97706" : "#6B7280";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          backgroundColor: "#E5E7EB",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: 3,
          }}
        />
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color,
          fontFamily: "'DM Sans', sans-serif",
          minWidth: 32,
        }}
      >
        {pct}%
      </span>
    </div>
  );
}

function IndiaHeatmap({ regionBreakdown, selectedRegion, onSelect }) {
  const regionMap = {};
  (regionBreakdown || []).forEach((r) => {
    regionMap[r.region] = r;
  });

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {INDIA_GRID.map((row, ri) => (
          <div key={ri} style={{ display: "flex", gap: 5 }}>
            {row.map((state, ci) => {
              if (!state)
                return (
                  <div
                    key={ci}
                    style={{ width: 88, height: 54, flexShrink: 0 }}
                  />
                );
              const rd = regionMap[state];
              const sev = getTopSeverity(rd);
              const col = HEAT_COLORS[sev];
              const isSelected = selectedRegion === state;
              const total = parseInt(rd?.total || 0);
              return (
                <button
                  key={ci}
                  onClick={() => onSelect(isSelected ? null : state)}
                  title={`${state}: ${total} signal${total !== 1 ? "s" : ""}`}
                  style={{
                    width: 88,
                    height: 54,
                    flexShrink: 0,
                    cursor: "pointer",
                    backgroundColor: isSelected ? "#002366" : col.bg,
                    border: `2px solid ${isSelected ? "#002366" : col.border}`,
                    borderRadius: 8,
                    padding: "4px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 200ms",
                    transform: isSelected ? "scale(1.06)" : "scale(1)",
                    boxShadow: isSelected
                      ? "0 4px 14px rgba(0,35,102,0.3)"
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = "scale(1.04)";
                      e.currentTarget.style.boxShadow =
                        "0 3px 10px rgba(0,0,0,0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  <span
                    style={{
                      fontSize: 8.5,
                      fontWeight: 700,
                      lineHeight: 1.3,
                      textAlign: "center",
                      color: isSelected ? "#FFFFFF" : col.text,
                      fontFamily: "'DM Sans', sans-serif",
                      maxWidth: "100%",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {state}
                  </span>
                  {total > 0 && (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        marginTop: 2,
                        color: isSelected ? "rgba(255,255,255,0.9)" : col.text,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {total}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div
        style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}
      >
        {[
          ["critical", "Critical ADR"],
          ["high", "High Risk"],
          ["medium", "Medium"],
          ["low", "Low"],
          ["none", "No Data"],
        ].map(([sev, label]) => (
          <div
            key={sev}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <div
              style={{
                width: 11,
                height: 11,
                borderRadius: 3,
                backgroundColor: HEAT_COLORS[sev].bg,
                border: `2px solid ${HEAT_COLORS[sev].border}`,
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: "#6B7280",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState("all");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: signalsData, isLoading: signalsLoading } = useQuery({
    queryKey: ["signals", severityFilter, selectedRegion],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: "12" });
      if (severityFilter !== "all") p.set("severity", severityFilter);
      if (selectedRegion) p.set("region", selectedRegion);
      const res = await fetch(`/api/signals?${p.toString()}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(`/api/signals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["signals"] }),
  });

  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  (statsData?.severityCounts || []).forEach((s) => {
    severityCounts[s.severity] = parseInt(s.count);
  });

  const trendData = (statsData?.recentTrends || []).map((t) => ({
    day: new Date(t.day).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
    critical: parseInt(t.critical),
    high: parseInt(t.high),
    medium: parseInt(t.medium),
    low: parseInt(t.low),
  }));

  const topDrugs = (statsData?.topDrugs || []).slice(0, 6);

  const STAT_CARDS = [
    {
      label: "Total Signals",
      value: statsData?.totalSignals || 0,
      icon: Activity,
      color: "#002366",
      bg: "#EEF2FF",
      sub: "Across all platforms",
    },
    {
      label: "Critical Alerts",
      value: severityCounts.critical,
      icon: AlertTriangle,
      color: "#DC2626",
      bg: "#FEF2F2",
      sub: "Require immediate action",
    },
    {
      label: "High Priority",
      value: severityCounts.high,
      icon: TrendingUp,
      color: "#EA580C",
      bg: "#FFF7ED",
      sub: "Needs review today",
    },
    {
      label: "Open Alerts",
      value: statsData?.totalAlerts || 0,
      icon: Shield,
      color: "#002366",
      bg: "#EEF2FF",
      sub: "Active surveillance",
    },
  ];

  // For the selected region panel
  const regionMap = {};
  (statsData?.regionBreakdown || []).forEach((r) => {
    regionMap[r.region] = r;
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F4F6FA" }}>
      <Navbar />

      {/* Header */}
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
                Signal Intelligence Dashboard
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 14,
                  margin: 0,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Real-time patient safety signal monitoring — CDSCO
                pharmacovigilance framework
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => queryClient.invalidateQueries()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#FFFFFF",
                  padding: "9px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <a
                href="/dashboard/alerts"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: "#E87722",
                  color: "#FFFFFF",
                  padding: "9px 18px",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                }}
              >
                <AlertTriangle size={14} /> View Alerts
              </a>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 48px" }}
        className="dash-container"
      >
        {/* Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            marginBottom: 28,
          }}
          className="stat-cards"
        >
          {STAT_CARDS.map((card) => {
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
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#6B7280",
                        fontSize: 12,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 8,
                      }}
                    >
                      {card.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 800,
                        fontSize: 32,
                        color: "#1A1A2E",
                        lineHeight: 1,
                      }}
                    >
                      {statsLoading ? "—" : card.value}
                    </div>
                    <div
                      style={{
                        color: "#6B7280",
                        fontSize: 12,
                        fontFamily: "'DM Sans', sans-serif",
                        marginTop: 6,
                      }}
                    >
                      {card.sub}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      backgroundColor: card.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={20} color={card.color} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 20,
            marginBottom: 28,
          }}
          className="charts-grid"
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
            <h3
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: "#1A1A2E",
                margin: "0 0 4px",
              }}
            >
              Signal Detection Timeline
            </h3>
            <p
              style={{
                color: "#6B7280",
                fontSize: 12,
                margin: "0 0 20px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Last 14 days · By severity
            </p>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F4F6FA" />
                  <XAxis
                    dataKey="day"
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
                  <Area
                    type="monotone"
                    dataKey="critical"
                    stackId="1"
                    stroke="#DC2626"
                    fill="#FEE2E2"
                  />
                  <Area
                    type="monotone"
                    dataKey="high"
                    stackId="1"
                    stroke="#EA580C"
                    fill="#FFEDD5"
                  />
                  <Area
                    type="monotone"
                    dataKey="medium"
                    stackId="1"
                    stroke="#D97706"
                    fill="#FEF3C7"
                  />
                  <Area
                    type="monotone"
                    dataKey="low"
                    stackId="1"
                    stroke="#059669"
                    fill="#D1FAE5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6B7280",
                  fontSize: 14,
                }}
              >
                Loading chart...
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
                margin: "0 0 16px",
              }}
            >
              Top Mentioned Drugs
            </h3>
            {topDrugs.map((drug, i) => (
              <div key={drug.drug_name} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontFamily: "'DM Sans', sans-serif",
                      color: "#1A1A2E",
                      fontWeight: 500,
                    }}
                  >
                    {drug.drug_name}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {drug.mention_count}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    backgroundColor: "#F4F6FA",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, (drug.mention_count / (topDrugs[0]?.mention_count || 1)) * 100)}%`,
                      height: "100%",
                      borderRadius: 3,
                      backgroundColor:
                        i === 0 ? "#002366" : i < 3 ? "#4472C4" : "#A3B8E0",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── INDIA HEATMAP ── */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: "24px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 20,
              flexWrap: "wrap",
              gap: 12,
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
                India Signal Heatmap
              </h3>
              <p
                style={{
                  color: "#6B7280",
                  fontSize: 12,
                  margin: "4px 0 0",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Click any state to drill down · Colour = highest severity
                detected
              </p>
            </div>
            {selectedRegion && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    backgroundColor: "#EEF2FF",
                    color: "#002366",
                    padding: "5px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <MapPin size={12} /> {selectedRegion}
                </span>
                <button
                  onClick={() => setSelectedRegion(null)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: "1px solid #E5E7EB",
                    backgroundColor: "#FFFFFF",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={13} color="#6B7280" />
                </button>
              </div>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 32,
              alignItems: "start",
            }}
            className="heatmap-grid"
          >
            {/* Map grid */}
            <div style={{ overflowX: "auto" }}>
              <IndiaHeatmap
                regionBreakdown={statsData?.regionBreakdown}
                selectedRegion={selectedRegion}
                onSelect={setSelectedRegion}
              />
            </div>

            {/* Side panel */}
            <div>
              {selectedRegion ? (
                (() => {
                  const rd = regionMap[selectedRegion];
                  return (
                    <div>
                      <div
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700,
                          fontSize: 18,
                          color: "#1A1A2E",
                          marginBottom: 16,
                        }}
                      >
                        {selectedRegion}
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 10,
                          marginBottom: 16,
                        }}
                      >
                        {[
                          {
                            label: "Total Signals",
                            value: parseInt(rd?.total || 0),
                            color: "#002366",
                            bg: "#EEF2FF",
                          },
                          {
                            label: "Critical",
                            value: parseInt(rd?.critical || 0),
                            color: "#DC2626",
                            bg: "#FEF2F2",
                          },
                          {
                            label: "High",
                            value: parseInt(rd?.high || 0),
                            color: "#EA580C",
                            bg: "#FFF7ED",
                          },
                          {
                            label: "Medium",
                            value: parseInt(rd?.medium || 0),
                            color: "#D97706",
                            bg: "#FFFBEB",
                          },
                        ].map((s) => (
                          <div
                            key={s.label}
                            style={{
                              backgroundColor: s.bg,
                              borderRadius: 8,
                              padding: "14px 16px",
                            }}
                          >
                            <div
                              style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontWeight: 800,
                                fontSize: 24,
                                color: s.color,
                              }}
                            >
                              {s.value}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#6B7280",
                                fontFamily: "'DM Sans', sans-serif",
                                marginTop: 2,
                              }}
                            >
                              {s.label}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          backgroundColor: "#F4F6FA",
                          borderRadius: 8,
                          padding: "12px 14px",
                          border: "1px solid #E5E7EB",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 13,
                            color: "#6B7280",
                            fontFamily: "'DM Sans', sans-serif",
                            lineHeight: 1.6,
                            margin: 0,
                          }}
                        >
                          The signals table below is filtered for{" "}
                          <strong style={{ color: "#002366" }}>
                            {selectedRegion}
                          </strong>
                          . Click the × to clear and see all regions.
                        </p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div>
                  <div
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: 13,
                      color: "#6B7280",
                      marginBottom: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Regions by signal volume
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {(statsData?.regionBreakdown || []).map((r, i) => {
                      const sev = getTopSeverity(r);
                      const col = HEAT_COLORS[sev];
                      return (
                        <div
                          key={r.region}
                          onClick={() => setSelectedRegion(r.region)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "9px 14px",
                            borderRadius: 8,
                            cursor: "pointer",
                            backgroundColor: "#F4F6FA",
                            border: "1px solid #E5E7EB",
                            transition: "all 150ms",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#EEF2FF";
                            e.currentTarget.style.borderColor = "#C7D2FE";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#F4F6FA";
                            e.currentTarget.style.borderColor = "#E5E7EB";
                          }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 2,
                              backgroundColor: col.border,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 13,
                              color: "#1A1A2E",
                              fontFamily: "'DM Sans', sans-serif",
                              fontWeight: 500,
                              flex: 1,
                            }}
                          >
                            {r.region}
                          </span>
                          {parseInt(r.critical) > 0 && (
                            <span
                              style={{
                                backgroundColor: "#FEF2F2",
                                color: "#DC2626",
                                padding: "1px 7px",
                                borderRadius: 10,
                                fontSize: 10,
                                fontWeight: 700,
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              {r.critical} crit
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#002366",
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              minWidth: 24,
                              textAlign: "right",
                            }}
                          >
                            {r.total}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Signals Table */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #E5E7EB",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
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
                {selectedRegion
                  ? `Signals — ${selectedRegion}`
                  : "Recent Signals"}
              </h3>
              <p
                style={{
                  color: "#6B7280",
                  fontSize: 12,
                  margin: "4px 0 0",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Click any row to view full signal detail
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {selectedRegion && (
                <span
                  style={{
                    backgroundColor: "#EEF2FF",
                    color: "#002366",
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <MapPin size={10} /> {selectedRegion}
                </span>
              )}
              <Filter size={14} color="#6B7280" />
              {["all", "critical", "high", "medium", "low"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    border: "1px solid",
                    backgroundColor:
                      severityFilter === sev ? "#002366" : "#FFFFFF",
                    color: severityFilter === sev ? "#FFFFFF" : "#6B7280",
                    borderColor: severityFilter === sev ? "#002366" : "#E5E7EB",
                    transition: "all 200ms",
                  }}
                >
                  {sev.charAt(0).toUpperCase() + sev.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F4F6FA" }}>
                  {[
                    "Drug / Symptom",
                    "Platform",
                    "Region",
                    "Language",
                    "Severity",
                    "Confidence",
                    "Detected",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#6B7280",
                        fontFamily: "'DM Sans', sans-serif",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        whiteSpace: "nowrap",
                        borderBottom: "1px solid #E5E7EB",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {signalsLoading && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: "40px 16px",
                        textAlign: "center",
                        color: "#6B7280",
                        fontSize: 14,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Loading signals...
                    </td>
                  </tr>
                )}
                {!signalsLoading &&
                  (signalsData?.signals || []).length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          padding: "48px 16px",
                          textAlign: "center",
                          color: "#6B7280",
                          fontSize: 14,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        No signals found for this filter.
                      </td>
                    </tr>
                  )}
                {(signalsData?.signals || []).map((signal) => (
                  <tr
                    key={signal.id}
                    onMouseEnter={() => setHoveredRow(signal.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: "1px solid #F4F6FA",
                      backgroundColor:
                        hoveredRow === signal.id ? "#F9FAFB" : "#FFFFFF",
                      transition: "background-color 150ms",
                    }}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 600,
                          fontSize: 13,
                          color: "#1A1A2E",
                        }}
                      >
                        {signal.drug_name}
                      </div>
                      <div
                        style={{ color: "#6B7280", fontSize: 12, marginTop: 2 }}
                      >
                        {signal.symptom}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          backgroundColor: "#F4F6FA",
                          color: "#1A1A2E",
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 500,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {signal.platform}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 13,
                        color: "#6B7280",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {signal.region}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          backgroundColor: "#EEF2FF",
                          color: "#002366",
                          padding: "3px 8px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {signal.language}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <SeverityPill severity={signal.severity} />
                    </td>
                    <td style={{ padding: "14px 16px", minWidth: 120 }}>
                      <ConfidenceBar score={signal.confidence_score} />
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 12,
                        color: "#6B7280",
                        fontFamily: "'DM Sans', sans-serif",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(signal.detected_at).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <a
                          href={`/dashboard/signal/${signal.id}`}
                          title="View detail"
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 6,
                            backgroundColor: "#EEF2FF",
                            color: "#002366",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textDecoration: "none",
                          }}
                        >
                          <Eye size={14} />
                        </a>
                        <button
                          title="Flag for review"
                          onClick={() =>
                            updateStatus.mutate({
                              id: signal.id,
                              status: "reviewed",
                            })
                          }
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 6,
                            backgroundColor: "#FFF3E8",
                            color: "#E87722",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            border: "none",
                          }}
                        >
                          <Flag size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #E5E7EB",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <a
              href="/dashboard/alerts"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "#002366",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              View all alerts <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 1024px) {
          .heatmap-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .dash-container { padding: 20px 16px !important; }
          .stat-cards { grid-template-columns: 1fr 1fr !important; }
          .charts-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .stat-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
