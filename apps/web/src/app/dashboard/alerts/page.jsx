"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Filter,
  CheckCircle,
  ArrowUpRight,
  FileText,
  X,
  Activity,
  Shield,
  Clock,
  RefreshCw,
} from "lucide-react";
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
const STATUS_CONFIG = {
  open: { bg: "#EEF2FF", color: "#002366", label: "Open" },
  reviewed: { bg: "#FFFBEB", color: "#D97706", label: "Reviewed" },
  escalated: { bg: "#FEF2F2", color: "#DC2626", label: "Escalated" },
  closed: { bg: "#F4F6FA", color: "#6B7280", label: "Closed" },
};
const ALERT_TYPE_LABELS = {
  ADR: "Adverse Drug Reaction",
  outbreak: "Disease Outbreak",
  treatment_failure: "Treatment Failure",
};

const REGIONS = [
  "All Regions",
  "Maharashtra",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Karnataka",
  "West Bengal",
  "Rajasthan",
  "Gujarat",
  "Delhi",
  "Punjab",
  "Telangana",
];

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState([]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const queryParams = new URLSearchParams();
  if (severityFilter !== "all") queryParams.set("severity", severityFilter);
  if (regionFilter !== "All Regions") queryParams.set("region", regionFilter);
  if (statusFilter !== "all") queryParams.set("status", statusFilter);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["alerts", severityFilter, regionFilter, statusFilter],
    queryFn: async () => {
      const res = await fetch(`/api/alerts?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const updateAlert = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(`/api/alerts/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      showToast(`Alert marked as ${status}`);
    },
  });

  const alerts = data?.alerts || [];
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const openCount = alerts.filter((a) => a.status === "open").length;
  const escalatedCount = alerts.filter((a) => a.status === "escalated").length;

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
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
            backgroundColor: "#002366",
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
          <CheckCircle size={16} /> {toast}
        </div>
      )}

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
                Safety Alert Management
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 14,
                  margin: 0,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Prioritized adverse event alerts — CDSCO pharmacovigilance
                escalation workflow
              </p>
            </div>
            <button
              onClick={() => refetch()}
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
          </div>
        </div>
      </div>

      <div
        style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 48px" }}
        className="alerts-wrap"
      >
        {/* Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            marginBottom: 28,
          }}
          className="alert-stats"
        >
          {[
            {
              label: "Total Alerts",
              value: alerts.length,
              icon: AlertTriangle,
              color: "#002366",
              bg: "#EEF2FF",
            },
            {
              label: "Critical",
              value: criticalCount,
              icon: Activity,
              color: "#DC2626",
              bg: "#FEF2F2",
            },
            {
              label: "Open / Unreviewed",
              value: openCount,
              icon: Clock,
              color: "#D97706",
              bg: "#FFFBEB",
            },
            {
              label: "Escalated to CDSCO",
              value: escalatedCount,
              icon: ArrowUpRight,
              color: "#E87722",
              bg: "#FFF3E8",
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

        {/* Filters */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: "16px 24px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#6B7280",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Filter size={14} /> Filters:
          </div>

          {/* Severity */}
          <div style={{ display: "flex", gap: 6 }}>
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

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #E5E7EB",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              color: "#1A1A2E",
              backgroundColor: "#FFFFFF",
              cursor: "pointer",
            }}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="reviewed">Reviewed</option>
            <option value="escalated">Escalated</option>
            <option value="closed">Closed</option>
          </select>

          {/* Region */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #E5E7EB",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              color: "#1A1A2E",
              backgroundColor: "#FFFFFF",
              cursor: "pointer",
            }}
          >
            {REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>

          {selected.length > 0 && (
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  selected.forEach((id) =>
                    updateAlert.mutate({ id, status: "reviewed" }),
                  );
                  setSelected([]);
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "1px solid #BBF7D0",
                  backgroundColor: "#F0FDF4",
                  color: "#059669",
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <CheckCircle size={12} /> Mark {selected.length} Reviewed
              </button>
              <button
                onClick={() => setSelected([])}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #E5E7EB",
                  backgroundColor: "#FFFFFF",
                  color: "#6B7280",
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Alerts Table */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F4F6FA" }}>
                  <th style={{ padding: "10px 16px", width: 36 }}>
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        setSelected(
                          e.target.checked ? alerts.map((a) => a.id) : [],
                        )
                      }
                    />
                  </th>
                  {[
                    "Drug",
                    "Alert Type",
                    "Severity",
                    "Region",
                    "Est. Patients",
                    "Platform",
                    "Status",
                    "Created",
                    "Actions",
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
                {isLoading && (
                  <tr>
                    <td
                      colSpan={10}
                      style={{
                        padding: "40px 16px",
                        textAlign: "center",
                        color: "#6B7280",
                        fontSize: 14,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Loading alerts...
                    </td>
                  </tr>
                )}
                {!isLoading && alerts.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      style={{ padding: "60px 16px", textAlign: "center" }}
                    >
                      <Shield
                        size={32}
                        color="#E5E7EB"
                        style={{ marginBottom: 8 }}
                      />
                      <p
                        style={{
                          color: "#6B7280",
                          fontSize: 14,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        No alerts match your filters.
                      </p>
                    </td>
                  </tr>
                )}
                {alerts.map((alert) => {
                  const statusConf =
                    STATUS_CONFIG[alert.status] || STATUS_CONFIG.open;
                  return (
                    <tr
                      key={alert.id}
                      onMouseEnter={() => setHoveredRow(alert.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        borderBottom: "1px solid #F4F6FA",
                        backgroundColor:
                          hoveredRow === alert.id ? "#F9FAFB" : "#FFFFFF",
                        transition: "background-color 150ms",
                      }}
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <input
                          type="checkbox"
                          checked={selected.includes(alert.id)}
                          onChange={() => toggleSelect(alert.id)}
                        />
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: 13,
                            color: "#1A1A2E",
                          }}
                        >
                          {alert.drug_name}
                        </div>
                        {alert.platform && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "#6B7280",
                              marginTop: 2,
                            }}
                          >
                            {alert.platform}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            backgroundColor: "#EEF2FF",
                            color: "#002366",
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 500,
                            fontFamily: "'DM Sans', sans-serif",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ALERT_TYPE_LABELS[alert.alert_type] ||
                            alert.alert_type}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            backgroundColor: SEVERITY_BG[alert.severity],
                            color: SEVERITY_COLORS[alert.severity],
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: "'DM Sans', sans-serif",
                            textTransform: "uppercase",
                          }}
                        >
                          {alert.severity}
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
                        {alert.region}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: 14,
                            color: "#1A1A2E",
                          }}
                        >
                          {alert.affected_patients_estimate?.toLocaleString() ||
                            "—"}
                        </div>
                        <div style={{ fontSize: 11, color: "#6B7280" }}>
                          est. patients
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: 13,
                          color: "#6B7280",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {alert.platform || "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            backgroundColor: statusConf.bg,
                            color: statusConf.color,
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {statusConf.label}
                        </span>
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
                        {new Date(alert.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            title="Mark Reviewed"
                            onClick={() =>
                              updateAlert.mutate({
                                id: alert.id,
                                status: "reviewed",
                              })
                            }
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              border: "1px solid #BBF7D0",
                              backgroundColor: "#F0FDF4",
                              color: "#059669",
                              cursor: "pointer",
                              fontSize: 11,
                              fontFamily: "'DM Sans', sans-serif",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <CheckCircle size={10} /> Review
                          </button>
                          <button
                            title="Escalate to CDSCO"
                            onClick={() =>
                              updateAlert.mutate({
                                id: alert.id,
                                status: "escalated",
                              })
                            }
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              border: "1px solid #FDDCB8",
                              backgroundColor: "#FFF3E8",
                              color: "#E87722",
                              cursor: "pointer",
                              fontSize: 11,
                              fontFamily: "'DM Sans', sans-serif",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <ArrowUpRight size={10} /> Escalate
                          </button>
                          <button
                            title="Export"
                            onClick={() =>
                              showToast(`Alert #${alert.id} exported as PDF`)
                            }
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              border: "1px solid #E5E7EB",
                              backgroundColor: "#FFFFFF",
                              color: "#6B7280",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <FileText size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .alerts-wrap { padding: 20px 16px !important; }
          .alert-stats { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .alert-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
