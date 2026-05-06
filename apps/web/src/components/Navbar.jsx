"use client";
import { useState } from "react";
import { Activity, Menu, X, Shield } from "lucide-react";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Alerts", href: "/dashboard/alerts" },
  { label: "Sources", href: "/dashboard/sources" },
  { label: "Reports", href: "/dashboard/reports" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [ctaHover, setCtaHover] = useState(false);

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: "64px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          borderBottom: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          padding: "0 48px",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: "#002366",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Activity size={20} color="#FFFFFF" />
          </div>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: "18px",
              color: "#002366",
              letterSpacing: "-0.3px",
            }}
          >
            Pulse<span style={{ color: "#E87722" }}>Watch</span>
          </span>
        </a>

        {/* Center Nav - Desktop */}
        <div
          style={{ display: "flex", gap: "32px", alignItems: "center" }}
          className="nav-desktop"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                textDecoration: "none",
                color: hoveredLink === link.href ? "#002366" : "#6B7280",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                transition: "color 200ms",
              }}
              onMouseEnter={() => setHoveredLink(link.href)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: ctaHover ? "#001a4d" : "#002366",
              color: "#FFFFFF",
              padding: "9px 20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              transition: "all 200ms",
              boxShadow: ctaHover
                ? "0 4px 12px rgba(0,35,102,0.3)"
                : "0 2px 8px rgba(0,35,102,0.2)",
            }}
            onMouseEnter={() => setCtaHover(true)}
            onMouseLeave={() => setCtaHover(false)}
          >
            <Shield size={15} />
            Open Dashboard
          </a>

          {/* Hamburger */}
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "none",
            }}
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X size={22} color="#002366" />
            ) : (
              <Menu size={22} color="#002366" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            zIndex: 999,
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid #E5E7EB",
            padding: "16px 24px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "12px 0",
                borderBottom: "1px solid #F4F6FA",
                color: "#1A1A2E",
                textDecoration: "none",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: "15px",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: "64px" }} />

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
