"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Globe,
  Plus,
  RefreshCw,
  Settings,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  Activity,
  X,
  Loader,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SOURCE_TYPE_COLORS = {
  twitter: { bg: "#E8F5FD", color: "#1DA1F2" },
  reddit: { bg: "#FFF1EC", color: "#FF4500" },
  quora: { bg: "#FFECEB", color: "#B92B27" },
  forum: { bg: "#F0FDF4", color: "#059669" },
};

const LATENCY_LABELS = {
  realtime: "Real-time",
  daily: "Daily",
  weekly: "Weekly",
};
const LATENCY_COLORS = {
  realtime: "#059669",
  daily: "#D97706",
  weekly: "#6B7280",
};

function StatusBadge({ status }) {
  const configs = {
    active: {
      bg: "#F0FDF4",
      color: "#059669",
      icon: CheckCircle,
      label: "Active",
    },
    paused: {
      bg: "#FFFBEB",
      color: "#D97706",
      icon: PauseCircle,
      label: "Paused",
    },
    error: {
      bg: "#FEF2F2",
      color: "#DC2626",
      icon: AlertCircle,
      label: "Error",
    },
  };
  const conf = configs[status] || configs.paused;
  const Icon = conf.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        backgroundColor: conf.bg,
        color: conf.color,
        padding: "4px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Icon size={11} /> {conf.label}
    </span>
  );
}

function AddSourceModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("forum");
  const [latency, setLatency] = useState("daily");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    if (!url) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      if (!name) {
        const domain = url.replace(/https?:\/\/(www\.)?/, "").split("/")[0];
        setName(domain.charAt(0).toUpperCase() + domain.slice(1));
      }
    }, 2200);
  };

  const handleSubmit = () => {
    if (!name) return;
    onAdd({ name, source_type: type, latency_mode: latency });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 32,
          width: "100%",
          maxWidth: 520,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "#1A1A2E",
              margin: 0,
            }}
          >
            Add New Data Source
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={20} color="#6B7280" />
          </button>
        </div>

        {/* LLM-assisted URL */}
        <div
          style={{
            backgroundColor: "#EEF2FF",
            borderRadius: 8,
            padding: 16,
            marginBottom: 20,
            border: "1px solid #C7D2FE",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#002366",
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: 10,
            }}
          >
            🤖 LLM-Assisted Crawler Generation
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="url"
              placeholder="https://health-forum.example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                flex: 1,
                padding: "9px 12px",
                border: "1px solid #C7D2FE",
                borderRadius: 6,
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
                color: "#1A1A2E",
              }}
            />
            <button
              onClick={handleGenerate}
              disabled={!url || generating}
              style={{
                padding: "9px 14px",
                borderRadius: 6,
                backgroundColor: generating ? "#6B7280" : "#002366",
                color: "#FFFFFF",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
              }}
            >
              {generating ? (
                <Loader
                  size={13}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Zap size={13} />
              )}
              {generating ? "Generating..." : "Auto-Generate"}
            </button>
          </div>
          {generated && (
            <div
              style={{
                marginTop: 10,
                padding: "8px 12px",
                backgroundColor: "#F0FDF4",
                borderRadius: 6,
                border: "1px solid #BBF7D0",
                fontSize: 12,
                color: "#059669",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              ✅ Crawler config generated! Review and save below.
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#6B7280",
                fontFamily: "'DM Sans', sans-serif",
                display: "block",
                marginBottom: 6,
              }}
            >
              SOURCE NAME *
            </label>
            <input
              type="text"
              placeholder="e.g. MedScape India Forum"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
                color: "#1A1A2E",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#002366")}
              onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                  fontFamily: "'DM Sans', sans-serif",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                SOURCE TYPE
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                  color: "#1A1A2E",
                  boxSizing: "border-box",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <option value="forum">Health Forum</option>
                <option value="twitter">Twitter/X</option>
                <option value="reddit">Reddit</option>
                <option value="quora">Quora</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                  fontFamily: "'DM Sans', sans-serif",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                CRAWL FREQUENCY
              </label>
              <select
                value={latency}
                onChange={(e) => setLatency(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                  color: "#1A1A2E",
                  boxSizing: "border-box",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <option value="realtime">Real-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              onClick={handleSubmit}
              disabled={!name}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 8,
                backgroundColor: name ? "#002366" : "#E5E7EB",
                color: name ? "#FFFFFF" : "#6B7280",
                border: "none",
                cursor: name ? "pointer" : "not-allowed",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Add Source
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 8,
                backgroundColor: "#FFFFFF",
                color: "#6B7280",
                border: "1px solid #E5E7EB",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function SourcesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [cardHovers, setCardHovers] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["sources"],
    queryFn: async () => {
      const res = await fetch("/api/sources");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const updateSource = useMutation({
    mutationFn: async ({ id, updates }) => {
      const res = await fetch(`/api/sources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      showToast("Source updated");
    },
  });

  const addSource = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      showToast("Source added successfully");
    },
  });

  const sources = data?.sources || [];
  const activeSources = sources.filter((s) => s.status === "active").length;
  const totalSignals = sources.reduce(
    (acc, s) => acc + (s.signals_found_count || 0),
    0,
  );

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

      {showModal && (
        <AddSourceModal
          onClose={() => setShowModal(false)}
          onAdd={(data) => addSource.mutate(data)}
        />
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
                Crawler Source Manager
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 14,
                  margin: 0,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Configure and monitor all data ingestion modules
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
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
                fontSize: 14,
              }}
            >
              <Plus size={16} /> Add New Source
            </button>
          </div>
        </div>
      </div>

      <div
        style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 48px" }}
        className="sources-wrap"
      >
        {/* Summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginBottom: 28,
          }}
          className="sources-stats"
        >
          {[
            {
              label: "Active Sources",
              value: activeSources,
              icon: CheckCircle,
              color: "#059669",
              bg: "#F0FDF4",
            },
            {
              label: "Total Signals Found",
              value: totalSignals.toLocaleString(),
              icon: Activity,
              color: "#002366",
              bg: "#EEF2FF",
            },
            {
              label: "Total Sources",
              value: sources.length,
              icon: Globe,
              color: "#6B7280",
              bg: "#F4F6FA",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  padding: "20px 24px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    backgroundColor: s.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color={s.color} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800,
                      fontSize: 24,
                      color: "#1A1A2E",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#6B7280",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Source Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
          className="source-cards"
        >
          {isLoading && (
            <p
              style={{
                gridColumn: "1/-1",
                textAlign: "center",
                color: "#6B7280",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Loading sources...
            </p>
          )}
          {sources.map((source) => {
            const typeStyle =
              SOURCE_TYPE_COLORS[source.source_type] ||
              SOURCE_TYPE_COLORS.forum;
            const hovered = cardHovers[source.id];
            return (
              <div
                key={source.id}
                onMouseEnter={() =>
                  setCardHovers((h) => ({ ...h, [source.id]: true }))
                }
                onMouseLeave={() =>
                  setCardHovers((h) => ({ ...h, [source.id]: false }))
                }
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  padding: "24px",
                  border: "1px solid #E5E7EB",
                  boxShadow: hovered
                    ? "0 6px 20px rgba(0,0,0,0.12)"
                    : "0 2px 8px rgba(0,0,0,0.06)",
                  transform: hovered ? "translateY(-2px)" : "translateY(0)",
                  transition: "all 200ms",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: typeStyle.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Globe size={18} color={typeStyle.color} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#1A1A2E",
                        }}
                      >
                        {source.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#6B7280",
                          fontFamily: "'DM Sans', sans-serif",
                          textTransform: "capitalize",
                        }}
                      >
                        {source.source_type}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={source.status} />
                </div>

                {/* Stats */}
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    marginBottom: 16,
                    padding: "12px 0",
                    borderTop: "1px solid #F4F6FA",
                    borderBottom: "1px solid #F4F6FA",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 18,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700,
                        color: "#1A1A2E",
                      }}
                    >
                      {(source.signals_found_count || 0).toLocaleString()}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#6B7280",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Signals Found
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        color: LATENCY_COLORS[source.latency_mode],
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        marginTop: 2,
                      }}
                    >
                      <Zap size={11} />{" "}
                      {LATENCY_LABELS[source.latency_mode] ||
                        source.latency_mode}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#6B7280",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {source.last_crawled_at
                        ? `Crawled ${new Date(source.last_crawled_at).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                        : "Never crawled"}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    value={source.latency_mode}
                    onChange={(e) =>
                      updateSource.mutate({
                        id: source.id,
                        updates: { latency_mode: e.target.value },
                      })
                    }
                    style={{
                      flex: 1,
                      padding: "7px 10px",
                      borderRadius: 6,
                      border: "1px solid #E5E7EB",
                      fontSize: 12,
                      fontFamily: "'DM Sans', sans-serif",
                      color: "#1A1A2E",
                      backgroundColor: "#FFFFFF",
                      cursor: "pointer",
                    }}
                  >
                    <option value="realtime">Real-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>

                  <button
                    onClick={() =>
                      updateSource.mutate({
                        id: source.id,
                        updates: {
                          status:
                            source.status === "active" ? "paused" : "active",
                        },
                      })
                    }
                    style={{
                      padding: "7px 12px",
                      borderRadius: 6,
                      backgroundColor:
                        source.status === "active" ? "#FFFBEB" : "#F0FDF4",
                      color: source.status === "active" ? "#D97706" : "#059669",
                      border: `1px solid ${source.status === "active" ? "#FDE68A" : "#BBF7D0"}`,
                      cursor: "pointer",
                      fontSize: 12,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {source.status === "active" ? (
                      <>
                        <PauseCircle size={12} /> Pause
                      </>
                    ) : (
                      <>
                        <CheckCircle size={12} /> Activate
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .sources-wrap { padding: 20px 16px !important; }
          .sources-stats { grid-template-columns: 1fr !important; }
          .source-cards { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .source-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
