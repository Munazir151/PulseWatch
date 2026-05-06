"use client";
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Shield,
  AlertTriangle,
  Globe,
  Zap,
  Brain,
  FileText,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Users,
  Database,
  ChevronRight,
  MapPin,
  Clock,
  BarChart2,
  Search,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STATS = [
  {
    label: "Signals Detected",
    value: "3,241+",
    icon: Activity,
    color: "#002366",
  },
  { label: "Drugs Monitored", value: "180+", icon: Shield, color: "#002366" },
  { label: "States Covered", value: "28", icon: MapPin, color: "#002366" },
  {
    label: "ADRs Flagged",
    value: "847",
    icon: AlertTriangle,
    color: "#E87722",
  },
];

const FEATURES = [
  {
    icon: Globe,
    title: "Modular Crawler Engine",
    desc: "Each data source — X, Reddit, Quora, regional forums — is an independent module. Onboard new sources via LLM-assisted agent from any URL.",
    tags: ["Real-time", "Daily", "Weekly"],
  },
  {
    icon: Brain,
    title: "Biomedical NLP Pipeline",
    desc: "Named entity recognition for drugs & diseases, sentiment analysis, adverse event detection, and Microsoft Presidio PII masking — all with SHAP explanations.",
    tags: ["BERT NER", "Presidio PII", "SHAP"],
  },
  {
    icon: BarChart2,
    title: "Real-Time Dashboard",
    desc: "Signal timelines, safety alert flags, trending clusters, and CDSCO-format exportable reports — designed for pharmacovigilance teams.",
    tags: ["Signal Feed", "Alerts", "Reports"],
  },
  {
    icon: FileText,
    title: "CDSCO Report Export",
    desc: "One-click generation of CDSCO-compliant pharmacovigilance reports with full audit trail, confidence scores, and evidence links.",
    tags: ["CDSCO", "NDHM", "Audit Trail"],
  },
  {
    icon: Globe,
    title: "Multilingual Ingestion",
    desc: "Native support for Hindi, Tamil, Telugu, Bengali alongside English. Regional health forums onboarded with zero engineering effort.",
    tags: ["HI", "TA", "TE", "BN", "EN"],
  },
  {
    icon: Zap,
    title: "Privacy by Design",
    desc: "Every patient mention automatically masked using Microsoft Presidio. Every AI output carries a confidence score and immutable audit ID.",
    tags: ["HIPAA-aligned", "Audit IDs", "PHI Masked"],
  },
];

const PLATFORMS = [
  { name: "X (Twitter)", count: "1,247 signals", color: "#1DA1F2" },
  { name: "Reddit India", count: "834 signals", color: "#FF4500" },
  { name: "Quora Health", count: "562 signals", color: "#B92B27" },
  { name: "Practo Community", count: "318 signals", color: "#5CB85C" },
  { name: "HealthUnlocked", count: "201 signals", color: "#FF6B00" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Crawl & Ingest",
    desc: "Configurable crawlers collect public posts from social platforms in real-time or scheduled intervals.",
  },
  {
    step: "02",
    title: "NLP Processing",
    desc: "Biomedical NER models extract drug names, symptoms, and conditions. PII is masked before storage.",
  },
  {
    step: "03",
    title: "Signal Scoring",
    desc: "Adverse event classifiers assign confidence scores and severity levels with SHAP-based explanations.",
  },
  {
    step: "04",
    title: "Alert & Export",
    desc: "Pharmacovigilance teams receive prioritized alerts and export CDSCO-format reports in one click.",
  },
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("drug");
  const [cardHovers, setCardHovers] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const inputRef = useRef(null);

  const { data: statsData } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const { data: suggestionsData } = useQuery({
    queryKey: ["suggestions", activeTab, searchQuery],
    queryFn: async () => {
      if (!searchQuery) return { suggestions: [] };
      const res = await fetch(
        `/api/signals/suggestions?q=${encodeURIComponent(searchQuery)}&type=${activeTab}`,
      );
      if (!res.ok) return { suggestions: [] };
      return res.json();
    },
    enabled: searchQuery.length >= 1,
  });

  const suggestions = suggestionsData?.suggestions || [];
  const totalSignals = statsData?.totalSignals || 3241;
  const totalAlerts = statsData?.totalAlerts || 12;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchQuery("");
    setShowDropdown(false);
    setHighlightedIdx(-1);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
    setHighlightedIdx(-1);
  };

  const handleSelectSuggestion = (value) => {
    setSearchQuery(value);
    setShowDropdown(false);
    setHighlightedIdx(-1);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && highlightedIdx >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[highlightedIdx].value);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      <Navbar />

      {/* HERO */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "45% 55%",
          minHeight: "calc(100vh - 64px)",
          maxHeight: 720,
          overflow: "hidden",
          position: "relative",
        }}
        className="hero-grid"
      >
        {/* Left Panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 48px 60px 80px",
            backgroundColor: "#FFFFFF",
            zIndex: 2,
          }}
          className="hero-left"
        >
          {/* Badge — removed Theme 6 label */}
          <div style={{ marginBottom: 24 }}>
            <span
              style={{
                backgroundColor: "#EEF2FF",
                color: "#002366",
                padding: "6px 16px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                border: "1px solid #C7D2FE",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Zap size={12} />
              India Pharmacovigilance Platform
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(28px, 3.5vw, 48px)",
              color: "#1A1A2E",
              lineHeight: 1.15,
              margin: "0 0 16px",
              letterSpacing: "-0.5px",
            }}
          >
            AI-Powered
            <br />
            <span style={{ color: "#002366" }}>Patient Safety</span>
            <br />
            Signal Detection
          </h1>
          <p
            style={{
              color: "#6B7280",
              fontSize: "clamp(14px, 1.2vw, 16px)",
              lineHeight: 1.7,
              margin: "0 0 32px",
              fontFamily: "'DM Sans', sans-serif",
              maxWidth: 440,
            }}
          >
            India reports only{" "}
            <strong style={{ color: "#E87722" }}>
              ~0.5% of estimated ADRs
            </strong>{" "}
            annually. PulseWatch monitors X, Reddit, Quora and regional forums
            in real-time — surfacing patient safety signals before they become
            crises.
          </p>

          {/* Search Card */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {/* Tab switcher */}
            <div
              style={{
                display: "flex",
                gap: 0,
                marginBottom: 20,
                borderBottom: "1px solid #E5E7EB",
              }}
            >
              {[
                { id: "drug", label: "Search Drug" },
                { id: "symptom", label: "Search Symptom" },
                { id: "region", label: "By Region" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    color: activeTab === tab.id ? "#002366" : "#6B7280",
                    borderBottom:
                      activeTab === tab.id
                        ? "2px solid #002366"
                        : "2px solid transparent",
                    marginBottom: -1,
                    transition: "all 200ms",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Input with Autocomplete */}
            <div style={{ position: "relative", marginBottom: 16 }}>
              <Search
                size={16}
                color="#6B7280"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              />
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  activeTab === "drug"
                    ? "e.g. Dolo-650, Metformin, Azithromycin..."
                    : activeTab === "symptom"
                      ? "e.g. cardiac arrhythmia, liver pain..."
                      : "e.g. Maharashtra, Tamil Nadu..."
                }
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (searchQuery) setShowDropdown(true);
                }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 160)}
                style={{
                  width: "100%",
                  padding: "11px 36px 11px 38px",
                  border: "1px solid #E5E7EB",
                  borderRadius:
                    showDropdown && suggestions.length > 0 ? "8px 8px 0 0" : 8,
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#1A1A2E",
                  outline: "none",
                  transition: "border-color 200ms",
                  boxSizing: "border-box",
                  borderColor:
                    showDropdown && suggestions.length > 0
                      ? "#002366"
                      : "#E5E7EB",
                }}
                onFocusCapture={(e) => (e.target.style.borderColor = "#002366")}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowDropdown(false);
                    inputRef.current?.focus();
                  }}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <X size={14} color="#9CA3AF" />
                </button>
              )}

              {/* Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "100%",
                    zIndex: 100,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #002366",
                    borderTop: "none",
                    borderRadius: "0 0 8px 8px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                  }}
                >
                  {suggestions.map((s, idx) => (
                    <div
                      key={s.value}
                      onMouseDown={() => handleSelectSuggestion(s.value)}
                      style={{
                        padding: "10px 14px",
                        cursor: "pointer",
                        backgroundColor:
                          idx === highlightedIdx ? "#EEF2FF" : "#FFFFFF",
                        borderBottom:
                          idx < suggestions.length - 1
                            ? "1px solid #F4F6FA"
                            : "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "background-color 100ms",
                      }}
                      onMouseEnter={() => setHighlightedIdx(idx)}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Search size={12} color="#6B7280" />
                        <span
                          style={{
                            fontSize: 13,
                            color: "#1A1A2E",
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 500,
                          }}
                        >
                          {s.value}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#6B7280",
                          fontFamily: "'DM Sans', sans-serif",
                          backgroundColor: "#F4F6FA",
                          padding: "2px 8px",
                          borderRadius: 10,
                        }}
                      >
                        {s.count} signals
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <a
              href={`/dashboard?q=${encodeURIComponent(searchQuery)}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                backgroundColor: "#002366",
                color: "#FFFFFF",
                textDecoration: "none",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 200ms",
                boxShadow: "0 2px 8px rgba(0,35,102,0.25)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#001a4d";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#002366";
              }}
            >
              <Activity size={16} />
              Detect Safety Signals
            </a>
          </div>
        </div>

        {/* Right Panel - Hero Image */}
        <div
          style={{ position: "relative", overflow: "hidden", minHeight: 500 }}
          className="hero-right"
        >
          <img
            src="https://raw.createusercontent.com/15af753d-4768-4bfd-a4b9-1bfd2bede207/"
            alt="Healthcare data monitoring"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* Left fade gradient */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.3) 35%, transparent 65%)",
            }}
          />
          {/* Bottom text */}
          <div
            style={{
              position: "absolute",
              bottom: 32,
              right: 32,
              textAlign: "right",
            }}
          >
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 24,
                color: "#FFFFFF",
                textShadow: "0 2px 12px rgba(0,0,0,0.5)",
              }}
            >
              PulseWatch
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                marginTop: 4,
              }}
            >
              Detect · Analyse · Protect
            </div>
          </div>
        </div>
      </section>

      {/* STATS — directly below hero */}
      <section
        style={{ padding: "60px 80px 40px", backgroundColor: "#FFFFFF" }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 24,
            }}
            className="stats-grid"
          >
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  onMouseEnter={() =>
                    setCardHovers((h) => ({ ...h, [stat.label]: true }))
                  }
                  onMouseLeave={() =>
                    setCardHovers((h) => ({ ...h, [stat.label]: false }))
                  }
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: "24px",
                    border: "1px solid #E5E7EB",
                    boxShadow: cardHovers[stat.label]
                      ? "0 6px 20px rgba(0,0,0,0.12)"
                      : "0 2px 8px rgba(0,0,0,0.08)",
                    transform: cardHovers[stat.label]
                      ? "translateY(-2px)"
                      : "translateY(0)",
                    transition: "all 200ms",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 10,
                      backgroundColor:
                        stat.color === "#E87722" ? "#FFF3E8" : "#EEF2FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} color={stat.color} />
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
                      {stat.value}
                    </div>
                    <div
                      style={{
                        color: "#6B7280",
                        fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                        marginTop: 4,
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "80px 80px", backgroundColor: "#F4F6FA" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 12,
                backgroundColor: "#EEF2FF",
                padding: "6px 16px",
                borderRadius: 20,
              }}
            >
              <Zap size={12} color="#002366" />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#002366",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                PLATFORM CAPABILITIES
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(24px, 2.5vw, 36px)",
                color: "#1A1A2E",
                margin: "0 0 12px",
              }}
            >
              Three Core Innovations
            </h2>
            <p
              style={{
                color: "#6B7280",
                fontSize: 16,
                fontFamily: "'DM Sans', sans-serif",
                margin: 0,
              }}
            >
              Built specifically for India's pharmacovigilance ecosystem
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
            }}
            className="features-grid"
          >
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              const hovered = cardHovers[feat.title];
              return (
                <div
                  key={feat.title}
                  onMouseEnter={() =>
                    setCardHovers((h) => ({ ...h, [feat.title]: true }))
                  }
                  onMouseLeave={() =>
                    setCardHovers((h) => ({ ...h, [feat.title]: false }))
                  }
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: "24px",
                    border: "1px solid #E5E7EB",
                    boxShadow: hovered
                      ? "0 6px 20px rgba(0,0,0,0.12)"
                      : "0 2px 8px rgba(0,0,0,0.08)",
                    transform: hovered ? "translateY(-3px)" : "translateY(0)",
                    transition: "all 200ms",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      backgroundColor: "#EEF2FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Icon size={20} color="#002366" />
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#1A1A2E",
                      margin: "0 0 8px",
                    }}
                  >
                    {feat.title}
                  </h3>
                  <p
                    style={{
                      color: "#6B7280",
                      fontSize: 14,
                      lineHeight: 1.7,
                      fontFamily: "'DM Sans', sans-serif",
                      margin: "0 0 16px",
                    }}
                  >
                    {feat.desc}
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {feat.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          backgroundColor: "#F4F6FA",
                          color: "#002366",
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          fontFamily: "'DM Sans', sans-serif",
                          border: "1px solid #E5E7EB",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "80px 80px", backgroundColor: "#FFFFFF" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(24px, 2.5vw, 36px)",
                color: "#1A1A2E",
                margin: "0 0 12px",
              }}
            >
              How PulseWatch Works
            </h2>
            <p
              style={{
                color: "#6B7280",
                fontSize: 16,
                fontFamily: "'DM Sans', sans-serif",
                margin: 0,
              }}
            >
              From social media post to pharmacovigilance report in minutes
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 32,
            }}
            className="how-grid"
          >
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    backgroundColor: "#002366",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {step.step}
                </div>
                <h3
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#1A1A2E",
                    margin: "0 0 8px",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    color: "#6B7280",
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontFamily: "'DM Sans', sans-serif",
                    margin: 0,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORMS */}
      <section style={{ padding: "80px 80px", backgroundColor: "#F4F6FA" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 64,
              alignItems: "center",
            }}
            className="platforms-grid"
          >
            <div>
              <div style={{ marginBottom: 12 }}>
                <span
                  style={{
                    backgroundColor: "#EEF2FF",
                    color: "#002366",
                    padding: "6px 16px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  ACTIVE DATA SOURCES
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(22px, 2.2vw, 32px)",
                  color: "#1A1A2E",
                  margin: "0 0 16px",
                }}
              >
                Monitoring 5+ Platforms Across India
              </h2>
              <p
                style={{
                  color: "#6B7280",
                  fontSize: 15,
                  lineHeight: 1.7,
                  fontFamily: "'DM Sans', sans-serif",
                  margin: "0 0 32px",
                }}
              >
                Every crawler is a self-contained module. Configure latency per
                source. Add new regional health forums in minutes via our
                LLM-assisted onboarding agent — zero engineering required.
              </p>
              {[
                "Real-time ingestion from X and Reddit",
                "Multilingual: EN, HI, TA, TE, BN",
                "Auto-generated crawlers from any URL",
                "CDSCO-aligned signal classification",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <CheckCircle
                    size={18}
                    color="#002366"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <span
                    style={{
                      fontSize: 14,
                      color: "#1A1A2E",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {item}
                  </span>
                </div>
              ))}
              <a
                href="/dashboard/sources"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 24,
                  backgroundColor: "#002366",
                  color: "#FFFFFF",
                  padding: "12px 24px",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  boxShadow: "0 2px 8px rgba(0,35,102,0.25)",
                }}
              >
                Manage Sources <ArrowRight size={16} />
              </a>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PLATFORMS.map((p) => (
                <div
                  key={p.name}
                  onMouseEnter={() =>
                    setCardHovers((h) => ({ ...h, [p.name]: true }))
                  }
                  onMouseLeave={() =>
                    setCardHovers((h) => ({ ...h, [p.name]: false }))
                  }
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 10,
                    padding: "16px 20px",
                    border: "1px solid #E5E7EB",
                    boxShadow: cardHovers[p.name]
                      ? "0 6px 20px rgba(0,0,0,0.12)"
                      : "0 2px 8px rgba(0,0,0,0.06)",
                    transform: cardHovers[p.name]
                      ? "translateY(-2px)"
                      : "translateY(0)",
                    transition: "all 200ms",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: "#22C55E",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#1A1A2E",
                      }}
                    >
                      {p.name}
                    </span>
                  </div>
                  <span
                    style={{
                      color: "#6B7280",
                      fontSize: 13,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {p.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: "80px 80px", backgroundColor: "#002366" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
          <span
            style={{
              backgroundColor: "rgba(232,119,34,0.2)",
              color: "#E87722",
              padding: "6px 16px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: 20,
              display: "inline-block",
              border: "1px solid rgba(232,119,34,0.3)",
            }}
          >
            FOR PHARMACOVIGILANCE TEAMS
          </span>
          <h2
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(24px, 2.8vw, 40px)",
              color: "#FFFFFF",
              margin: "0 0 16px",
            }}
          >
            Ready to Detect the Next Safety Signal?
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 16,
              fontFamily: "'DM Sans', sans-serif",
              margin: "0 0 36px",
              maxWidth: 600,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Join CDSCO, state health departments, and AIIMS-affiliated
            pharmacovigilance teams already using PulseWatch to protect India's
            patients.
          </p>
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="/dashboard"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#002366",
                padding: "13px 32px",
                borderRadius: 8,
                textDecoration: "none",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "all 200ms",
              }}
            >
              <Activity size={18} />
              Open Live Dashboard
            </a>
            <a
              href="/dashboard/reports"
              style={{
                backgroundColor: "transparent",
                color: "#FFFFFF",
                padding: "13px 32px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.3)",
                textDecoration: "none",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 15,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "all 200ms",
              }}
            >
              <FileText size={18} />
              View Sample Report
            </a>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-right { display: none; }
          .hero-left { padding: 40px 24px !important; }
          .info-banner-wrap { padding: 0 24px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
          .how-grid { grid-template-columns: 1fr 1fr !important; }
          .platforms-grid { grid-template-columns: 1fr !important; }
          section { padding-left: 24px !important; padding-right: 24px !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .how-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
