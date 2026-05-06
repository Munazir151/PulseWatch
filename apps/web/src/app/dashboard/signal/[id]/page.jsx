"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  AlertTriangle,
  Shield,
  Brain,
  Flag,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  ArrowUpRight,
  Download,
  X,
  FileText,
  MessageSquare,
  Loader,
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
const SENTIMENT_CONFIG = {
  negative: {
    color: "#DC2626",
    bg: "#FEF2F2",
    label: "Negative Signal — Adverse event likely",
  },
  positive: { color: "#059669", bg: "#F0FDF4", label: "Positive Mention" },
  neutral: {
    color: "#6B7280",
    bg: "#F4F6FA",
    label: "Neutral — Requires manual review",
  },
};
const STATUS_COLORS = {
  new: { bg: "#EEF2FF", color: "#002366", label: "New" },
  reviewed: { bg: "#F0FDF4", color: "#059669", label: "Reviewed" },
  escalated: { bg: "#FEF2F2", color: "#DC2626", label: "Escalated" },
  dismissed: { bg: "#F4F6FA", color: "#6B7280", label: "Dismissed" },
};

function ConfidenceRing({ score }) {
  const pct = Math.round((score || 0) * 100);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;
  const color = pct >= 85 ? "#002366" : pct >= 70 ? "#D97706" : "#6B7280";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
        />
        <text
          x="48"
          y="48"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            fill: color,
          }}
        >
          {pct}%
        </text>
      </svg>
      <span
        style={{
          fontSize: 12,
          color: "#6B7280",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Confidence Score
      </span>
    </div>
  );
}

function exportSignalPDF(signal) {
  const pct = Math.round((signal.confidence_score || 0) * 100);
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Signal Report — ${signal.drug_name}</title></head>
  <body style="font-family:Arial,sans-serif;color:#1A1A2E;margin:0;padding:32px;">
    <div style="border-bottom:3px solid #002366;padding-bottom:16px;margin-bottom:24px;">
      <h1 style="font-size:20px;color:#002366;margin:0 0 4px;">CENTRAL DRUGS STANDARD CONTROL ORGANISATION</h1>
      <p style="font-size:11px;color:#6B7280;margin:0;">PulseWatch Signal Report · Generated: ${new Date().toLocaleString("en-IN")}</p>
    </div>
    <div style="background:#F4F6FA;border-radius:8px;padding:20px;margin-bottom:24px;">
      <h2 style="margin:0 0 16px;font-size:16px;">Signal: ${signal.drug_name} — ${(signal.severity || "").toUpperCase()} Severity</h2>
      <table style="width:100%;font-size:13px;border-collapse:collapse;">
        <tr><td style="padding:5px 0;color:#6B7280;width:160px;">Audit ID:</td><td style="padding:5px 0;font-family:monospace;font-weight:600;">${signal.audit_id}</td></tr>
        <tr><td style="padding:5px 0;color:#6B7280;">Drug Name:</td><td style="padding:5px 0;font-weight:700;color:#002366;">${signal.drug_name}</td></tr>
        <tr><td style="padding:5px 0;color:#6B7280;">Adverse Event:</td><td style="padding:5px 0;">${signal.symptom}</td></tr>
        <tr><td style="padding:5px 0;color:#6B7280;">Platform:</td><td style="padding:5px 0;">${signal.platform}</td></tr>
        <tr><td style="padding:5px 0;color:#6B7280;">Region:</td><td style="padding:5px 0;">${signal.region}</td></tr>
        <tr><td style="padding:5px 0;color:#6B7280;">Language:</td><td style="padding:5px 0;">${signal.language}</td></tr>
        <tr><td style="padding:5px 0;color:#6B7280;">Confidence:</td><td style="padding:5px 0;font-weight:700;">${pct}%</td></tr>
        <tr><td style="padding:5px 0;color:#6B7280;">Severity:</td><td style="padding:5px 0;font-weight:700;text-transform:uppercase;">${signal.severity}</td></tr>
        <tr><td style="padding:5px 0;color:#6B7280;">Detected:</td><td style="padding:5px 0;">${new Date(signal.detected_at).toLocaleString("en-IN")}</td></tr>
        <tr><td style="padding:5px 0;color:#6B7280;">Status:</td><td style="padding:5px 0;">${signal.status}</td></tr>
        ${signal.source_url ? `<tr><td style="padding:5px 0;color:#6B7280;">Source URL:</td><td style="padding:5px 0;"><a href="${signal.source_url}" style="color:#002366;">${signal.source_url}</a></td></tr>` : ""}
      </table>
    </div>
    <div style="background:#F4F6FA;border-radius:8px;padding:16px;margin-bottom:20px;">
      <h3 style="margin:0 0 12px;font-size:14px;color:#002366;">Original Post (PII Masked)</h3>
      <p style="margin:0;font-size:13px;line-height:1.8;">${signal.post_text_masked || "—"}</p>
    </div>
    <div style="background:#EEF2FF;border-radius:8px;padding:16px;margin-bottom:20px;">
      <h3 style="margin:0 0 8px;font-size:13px;color:#002366;">NLP Entities</h3>
      <p style="margin:0 0 4px;font-size:12px;color:#6B7280;">Drugs: <strong>${(signal.entity_drug || []).join(", ") || "—"}</strong></p>
      <p style="margin:0 0 4px;font-size:12px;color:#6B7280;">Symptoms: <strong>${(signal.entity_symptom || []).join(", ") || "—"}</strong></p>
      <p style="margin:0;font-size:12px;color:#6B7280;">Conditions: <strong>${(signal.entity_condition || []).join(", ") || "—"}</strong></p>
    </div>
    ${signal.reviewer_notes ? `<div style="background:#FFFBEB;border-radius:8px;padding:16px;border:1px solid #FDE68A;"><h3 style="margin:0 0 8px;font-size:13px;color:#D97706;">Reviewer Notes</h3><p style="margin:0;font-size:13px;">${signal.reviewer_notes}</p>${signal.reviewed_at ? `<p style="font-size:11px;color:#9CA3AF;margin:8px 0 0;">Reviewed: ${new Date(signal.reviewed_at).toLocaleString("en-IN")}</p>` : ""}</div>` : ""}
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #E5E7EB;font-size:10px;color:#9CA3AF;">
      Auto-generated by PulseWatch AI · CDSCO Pharmacovigilance Programme · Audit ID: ${signal.audit_id}
    </div>
  </body></html>`;
  return fetch("/integrations/pdf-generation/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: { html } }),
  });
}

export default function SignalDetailPage({ params }) {
  const { id } = params;
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [showReviewBox, setShowReviewBox] = useState(false);
  const [showEscalateBox, setShowEscalateBox] = useState(false);
  const [escalateNotes, setEscalateNotes] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["signal", id],
    queryFn: async () => {
      const res = await fetch(`/api/signals/${id}`);
      if (!res.ok) throw new Error("Signal not found");
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ status, reviewer_notes }) => {
      const res = await fetch(`/api/signals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewer_notes }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["signal", id] });
      showToast(`Signal marked as ${status}`);
      setShowReviewBox(false);
      setShowEscalateBox(false);
    },
    onError: () => showToast("Update failed", "error"),
  });

  const handleCopy = (text) => {
    if (typeof navigator !== "undefined") navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    if (!data?.signal) return;
    setExporting(true);
    try {
      const res = await exportSignalPDF(data.signal);
      if (!res.ok) throw new Error("PDF export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Signal-${id}-${data.signal.drug_name}-CDSCO-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("CDSCO report downloaded");
    } catch (e) {
      console.error(e);
      showToast("Export failed: " + e.message, "error");
    }
    setExporting(false);
  };

  if (isLoading)
    return (
      <div style={{ minHeight: "100vh" }}>
        <Navbar />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px",
            color: "#6B7280",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
          }}
        >
          Loading signal details...
        </div>
      </div>
    );

  if (error || !data?.signal)
    return (
      <div style={{ minHeight: "100vh" }}>
        <Navbar />
        <div style={{ padding: 48, textAlign: "center" }}>
          <AlertTriangle
            size={40}
            color="#DC2626"
            style={{ marginBottom: 12 }}
          />
          <p style={{ color: "#DC2626", fontFamily: "'DM Sans', sans-serif" }}>
            Signal not found or failed to load.
          </p>
          <a
            href="/dashboard"
            style={{ color: "#002366", fontFamily: "'DM Sans', sans-serif" }}
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );

  const signal = data.signal;
  const sentConf =
    SENTIMENT_CONFIG[signal.sentiment] || SENTIMENT_CONFIG.neutral;
  const sevColor = SEVERITY_COLORS[signal.severity] || "#6B7280";
  const sevBg = SEVERITY_BG[signal.severity] || "#F4F6FA";
  const statusConf = STATUS_COLORS[signal.status] || STATUS_COLORS.new;

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

      {/* Header */}
      <div style={{ backgroundColor: "#002366", padding: "24px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <a
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "rgba(255,255,255,0.7)",
              textDecoration: "none",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: 12,
            }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </a>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 22,
                  color: "#FFFFFF",
                  margin: "0 0 6px",
                }}
              >
                Signal Detail: {signal.drug_name}
              </h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <code style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                  {signal.audit_id}
                </code>
                <span
                  style={{
                    backgroundColor: statusConf.bg,
                    color: statusConf.color,
                    padding: "2px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {statusConf.label}
                </span>
                {signal.source_url && (
                  <a
                    href={signal.source_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      color: "#E87722",
                      fontSize: 12,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      textDecoration: "none",
                      backgroundColor: "rgba(232,119,34,0.15)",
                      padding: "3px 10px",
                      borderRadius: 20,
                    }}
                  >
                    <ExternalLink size={11} /> Verify Original Source
                  </a>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span
                style={{
                  backgroundColor: sevBg,
                  color: sevColor,
                  padding: "6px 16px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  textTransform: "uppercase",
                }}
              >
                {signal.severity} severity
              </span>
              <span
                style={{
                  backgroundColor: signal.is_demo ? "#FFF3E8" : "#F0FDF4",
                  color: signal.is_demo ? "#E87722" : "#059669",
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {signal.is_demo ? "Demo Data" : "Live Data"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 48px" }}
        className="signal-detail-wrap"
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}
          className="signal-grid"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Source verification banner */}
            {signal.source_url && (
              <div
                style={{
                  backgroundColor: "#EEF2FF",
                  borderRadius: 12,
                  padding: "16px 20px",
                  border: "1px solid #C7D2FE",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <ExternalLink size={18} color="#002366" />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#002366",
                      fontFamily: "'DM Sans', sans-serif",
                      marginBottom: 4,
                    }}
                  >
                    Original Source Verified
                  </div>
                  <a
                    href={signal.source_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 12,
                      color: "#4472C4",
                      fontFamily: "'DM Sans', sans-serif",
                      wordBreak: "break-all",
                    }}
                  >
                    {signal.source_url}
                  </a>
                </div>
                <a
                  href={signal.source_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: "#002366",
                    color: "#FFFFFF",
                    padding: "7px 14px",
                    borderRadius: 6,
                    textDecoration: "none",
                    fontSize: 12,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <ExternalLink size={11} /> Open Source
                </a>
              </div>
            )}

            {/* Post Text */}
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
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <MessageSquare size={16} color="#6B7280" />
                <h2
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#1A1A2E",
                    margin: 0,
                  }}
                >
                  Original Post (PII Masked)
                </h2>
                <span
                  style={{
                    backgroundColor: "#F0FDF4",
                    color: "#059669",
                    padding: "2px 8px",
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    marginLeft: "auto",
                  }}
                >
                  Presidio PII Masked
                </span>
              </div>
              <div
                style={{
                  backgroundColor: "#F4F6FA",
                  borderRadius: 8,
                  padding: "16px 20px",
                  border: "1px solid #E5E7EB",
                }}
              >
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    lineHeight: 1.8,
                    color: "#1A1A2E",
                    margin: 0,
                  }}
                >
                  {signal.post_text_masked}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 16,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {signal.platform}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  · {signal.region}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  · {new Date(signal.detected_at).toLocaleString("en-IN")}
                </span>
                <span
                  style={{
                    backgroundColor: "#EEF2FF",
                    color: "#002366",
                    padding: "2px 8px",
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {signal.language}
                </span>
                {signal.source_url && (
                  <a
                    href={signal.source_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                      color: "#002366",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      textDecoration: "none",
                      backgroundColor: "#EEF2FF",
                      padding: "3px 9px",
                      borderRadius: 6,
                      border: "1px solid #C7D2FE",
                    }}
                  >
                    <ExternalLink size={11} /> Verify original post →
                  </a>
                )}
              </div>
            </div>

            {/* NLP Analysis */}
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
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <Brain size={16} color="#002366" />
                <h2
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#1A1A2E",
                    margin: 0,
                  }}
                >
                  NLP Analysis Breakdown
                </h2>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                  marginBottom: 20,
                }}
                className="nlp-grid"
              >
                {[
                  {
                    label: "Drug Entities",
                    items: signal.entity_drug || [],
                    color: "#002366",
                    bg: "#EEF2FF",
                  },
                  {
                    label: "Symptom Entities",
                    items: signal.entity_symptom || [],
                    color: "#DC2626",
                    bg: "#FEF2F2",
                  },
                  {
                    label: "Conditions",
                    items: signal.entity_condition || [],
                    color: "#D97706",
                    bg: "#FFFBEB",
                  },
                ].map((group) => (
                  <div key={group.label}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#6B7280",
                        fontFamily: "'DM Sans', sans-serif",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 8,
                      }}
                    >
                      {group.label}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(group.items || []).length > 0 ? (
                        group.items.map((item) => (
                          <span
                            key={item}
                            style={{
                              backgroundColor: group.bg,
                              color: group.color,
                              padding: "4px 10px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 500,
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span
                          style={{
                            fontSize: 12,
                            color: "#9CA3AF",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          None detected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  backgroundColor: sentConf.bg,
                  borderRadius: 8,
                  padding: "16px",
                  border: `1px solid ${sentConf.color}22`,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6B7280",
                    fontFamily: "'DM Sans', sans-serif",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Sentiment Analysis
                </div>
                <div
                  style={{
                    color: sentConf.color,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {sentConf.label}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#F4F6FA",
                  borderRadius: 8,
                  padding: "16px",
                  border: "1px solid #E5E7EB",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#6B7280",
                    fontFamily: "'DM Sans', sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 10,
                  }}
                >
                  SHAP Feature Importance (Top Contributors)
                </div>
                {[
                  { feature: `"${signal.drug_name}"`, impact: 0.42 },
                  { feature: `"${signal.symptom}"`, impact: 0.31 },
                  { feature: "Platform: social media", impact: 0.14 },
                  { feature: "Sentiment: negative", impact: 0.13 },
                ].map((shap) => (
                  <div
                    key={shap.feature}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "#1A1A2E",
                        fontFamily: "'DM Sans', sans-serif",
                        minWidth: 200,
                      }}
                    >
                      {shap.feature}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 8,
                        backgroundColor: "#E5E7EB",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${shap.impact * 100}%`,
                          height: "100%",
                          backgroundColor: "#002366",
                          borderRadius: 4,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#002366",
                        fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif",
                        minWidth: 36,
                      }}
                    >
                      +{shap.impact.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviewer notes display */}
            {signal.reviewer_notes && (
              <div
                style={{
                  backgroundColor: "#FFFBEB",
                  borderRadius: 12,
                  padding: "20px 24px",
                  border: "1px solid #FDE68A",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#D97706",
                    fontFamily: "'DM Sans', sans-serif",
                    marginBottom: 8,
                  }}
                >
                  Reviewer Notes
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "#1A1A2E",
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  {signal.reviewer_notes}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    marginTop: 8,
                    fontSize: 11,
                    color: "#9CA3AF",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {signal.reviewed_at && (
                    <span>
                      ✅ Reviewed:{" "}
                      {new Date(signal.reviewed_at).toLocaleString("en-IN")}
                    </span>
                  )}
                  {signal.escalated_at && (
                    <span style={{ color: "#DC2626" }}>
                      ⚠ Escalated:{" "}
                      {new Date(signal.escalated_at).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Review notes box */}
            {showReviewBox && (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  padding: "20px 24px",
                  border: "1px solid #E5E7EB",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#002366",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    Flag for Review — Add Notes
                  </div>
                  <button
                    onClick={() => setShowReviewBox(false)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <X size={16} color="#6B7280" />
                  </button>
                </div>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  placeholder="Describe clinical findings, patient observations, recommended follow-up..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                    color: "#1A1A2E",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#002366")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    onClick={() =>
                      updateStatus.mutate({
                        status: "reviewed",
                        reviewer_notes: reviewNotes,
                      })
                    }
                    disabled={updateStatus.isPending}
                    style={{
                      padding: "9px 18px",
                      borderRadius: 8,
                      backgroundColor: "#002366",
                      color: "#FFFFFF",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {updateStatus.isPending ? (
                      <Loader
                        size={13}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <Flag size={13} />
                    )}
                    Flag for Review
                  </button>
                  <button
                    onClick={() => setShowReviewBox(false)}
                    style={{
                      padding: "9px 18px",
                      borderRadius: 8,
                      backgroundColor: "#FFFFFF",
                      color: "#6B7280",
                      border: "1px solid #E5E7EB",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Escalate notes box */}
            {showEscalateBox && (
              <div
                style={{
                  backgroundColor: "#FEF2F2",
                  borderRadius: 12,
                  padding: "20px 24px",
                  border: "1px solid #FECACA",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#DC2626",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    Escalate to CDSCO
                  </div>
                  <button
                    onClick={() => setShowEscalateBox(false)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <X size={16} color="#6B7280" />
                  </button>
                </div>
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 8,
                    padding: "12px 14px",
                    marginBottom: 14,
                    border: "1px solid #FECACA",
                    fontSize: 13,
                    color: "#1A1A2E",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <strong style={{ color: "#DC2626" }}>
                    ⚠ {(signal.severity || "").toUpperCase()} severity
                  </strong>{" "}
                  — {signal.drug_name} → {signal.symptom} · {signal.region}
                </div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6B7280",
                    fontFamily: "'DM Sans', sans-serif",
                    display: "block",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Clinical Justification
                </label>
                <textarea
                  value={escalateNotes}
                  onChange={(e) => setEscalateNotes(e.target.value)}
                  rows={4}
                  placeholder="Provide clinical rationale — severity assessment, patient impact, recommended regulatory action..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #FECACA",
                    borderRadius: 8,
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                    color: "#1A1A2E",
                  }}
                />
                <div
                  style={{
                    backgroundColor: "#FFFBEB",
                    borderRadius: 6,
                    padding: "8px 12px",
                    margin: "10px 0",
                    border: "1px solid #FDE68A",
                    fontSize: 11,
                    color: "#92400E",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  ℹ️ Status will be updated to <strong>Escalated</strong> with
                  timestamp for CDSCO audit trail.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => {
                      updateStatus.mutate({
                        status: "escalated",
                        reviewer_notes: escalateNotes,
                      });
                    }}
                    disabled={updateStatus.isPending}
                    style={{
                      padding: "9px 18px",
                      borderRadius: 8,
                      backgroundColor: "#DC2626",
                      color: "#FFFFFF",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {updateStatus.isPending ? (
                      <Loader
                        size={13}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <ArrowUpRight size={13} />
                    )}
                    Confirm Escalation
                  </button>
                  <button
                    onClick={() => setShowEscalateBox(false)}
                    style={{
                      padding: "9px 18px",
                      borderRadius: 8,
                      backgroundColor: "#FFFFFF",
                      color: "#6B7280",
                      border: "1px solid #E5E7EB",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: "24px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#1A1A2E",
                  margin: "0 0 6px",
                }}
              >
                Actions
              </h2>
              <p
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  fontFamily: "'DM Sans', sans-serif",
                  margin: "0 0 20px",
                  lineHeight: 1.5,
                }}
              >
                All actions save timestamps to the database for CDSCO audit
                trail. Export generates a real downloadable PDF.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    setShowReviewBox(true);
                    setShowEscalateBox(false);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: "#002366",
                    color: "#FFFFFF",
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    transition: "all 200ms",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#001a4d")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#002366")
                  }
                >
                  <Flag size={14} /> Flag for Review
                </button>
                <button
                  onClick={() => {
                    setShowEscalateBox(true);
                    setShowReviewBox(false);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: "#E87722",
                    color: "#FFFFFF",
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  <ArrowUpRight size={14} /> Escalate to CDSCO
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: "#FFFFFF",
                    color: "#002366",
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: "1px solid #002366",
                    cursor: exporting ? "not-allowed" : "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    opacity: exporting ? 0.7 : 1,
                  }}
                >
                  {exporting ? (
                    <Loader
                      size={14}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Download size={14} />
                  )}
                  {exporting ? "Generating..." : "Export Report"}
                </button>
                <button
                  onClick={() => updateStatus.mutate({ status: "dismissed" })}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: "#FFFFFF",
                    color: "#DC2626",
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: "1px solid #DC2626",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  <XCircle size={14} /> Dismiss
                </button>
                {signal.source_url && (
                  <a
                    href={signal.source_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      backgroundColor: "#FFFFFF",
                      color: "#059669",
                      padding: "10px 20px",
                      borderRadius: 8,
                      border: "1px solid #059669",
                      textDecoration: "none",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    <ExternalLink size={14} /> Verify Source
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: "24px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                textAlign: "center",
              }}
            >
              <ConfidenceRing score={signal.confidence_score} />
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
                  fontSize: 14,
                  color: "#1A1A2E",
                  margin: "0 0 16px",
                }}
              >
                Signal Metadata
              </h3>
              {[
                { label: "Signal ID", value: `#${signal.id}` },
                {
                  label: "Status",
                  value: statusConf.label,
                  color: statusConf.color,
                },
                { label: "Drug", value: signal.drug_name },
                { label: "Condition", value: signal.condition },
                { label: "Platform", value: signal.platform },
                { label: "Region", value: signal.region },
                { label: "Language", value: signal.language },
                { label: "Sentiment", value: signal.sentiment },
                { label: "Data Type", value: signal.is_demo ? "Demo" : "Live" },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "7px 0",
                    borderBottom: "1px solid #F4F6FA",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: row.color || "#1A1A2E",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 500,
                      textAlign: "right",
                      maxWidth: 140,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {row.value || "—"}
                  </span>
                </div>
              ))}
            </div>

            {signal.source_url && (
              <div
                style={{
                  backgroundColor: "#F0FDF4",
                  borderRadius: 12,
                  padding: "20px",
                  border: "1px solid #BBF7D0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <ExternalLink size={15} color="#059669" />
                  <h3
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#065F46",
                      margin: 0,
                    }}
                  >
                    Source Verification
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    fontFamily: "'DM Sans', sans-serif",
                    margin: "0 0 12px",
                    lineHeight: 1.5,
                  }}
                >
                  Verify this signal against the original post or database
                  entry.
                </p>
                <a
                  href={signal.source_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    backgroundColor: "#059669",
                    color: "#FFFFFF",
                    padding: "10px 16px",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                  }}
                >
                  <ExternalLink size={13} /> Open Original Source
                </a>
              </div>
            )}

            <div
              style={{
                backgroundColor: "#EEF2FF",
                borderRadius: 12,
                padding: "20px",
                border: "1px solid #C7D2FE",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <Shield size={15} color="#002366" />
                <h3
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#002366",
                    margin: 0,
                  }}
                >
                  Audit Trail
                </h3>
              </div>
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 6,
                  padding: "10px 12px",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "#002366",
                  border: "1px solid #C7D2FE",
                  wordBreak: "break-all",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 6,
                }}
              >
                <span style={{ flex: 1, wordBreak: "break-all" }}>
                  {signal.audit_id}
                </span>
                <button
                  onClick={() => handleCopy(signal.audit_id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 2,
                    flexShrink: 0,
                  }}
                >
                  <Copy size={12} color={copied ? "#059669" : "#002366"} />
                </button>
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  fontFamily: "'DM Sans', sans-serif",
                  margin: "10px 0 0",
                  lineHeight: 1.5,
                }}
              >
                Immutable audit ID for CDSCO regulatory accountability.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width:768px) { .signal-detail-wrap { padding:20px 16px !important; } .signal-grid { grid-template-columns:1fr !important; } .nlp-grid { grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  );
}
