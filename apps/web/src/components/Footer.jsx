import { Activity } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Signal Alerts", href: "/dashboard/alerts" },
    { label: "Data Sources", href: "/dashboard/sources" },
    { label: "Reports", href: "/dashboard/reports" },
  ],
  Compliance: [
    { label: "CDSCO Framework", href: "#" },
    { label: "NDHM Standards", href: "#" },
    { label: "PV Guidelines", href: "#" },
    { label: "Audit Logs", href: "#" },
  ],
  "Health Bodies": [
    { label: "Ayushman Bharat", href: "#" },
    { label: "IPC Collaboration", href: "#" },
    { label: "AIIMS Network", href: "#" },
    { label: "State Health Depts", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Contact Us", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#002366",
        color: "#FFFFFF",
        padding: "64px 0 0",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px" }}>
        <div
          className="footer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            gap: 48,
            paddingBottom: 48,
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: "rgba(255,255,255,0.15)",
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
                  fontSize: 18,
                  color: "#FFFFFF",
                }}
              >
                Pulse<span style={{ color: "#E87722" }}>Watch</span>
              </span>
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 14,
                lineHeight: 1.7,
                maxWidth: 280,
                fontFamily: "'DM Sans', sans-serif",
                margin: "0 0 20px",
              }}
            >
              AI-powered patient safety signal detection from social media —
              built for India's public health system and CDSCO pharmacovigilance
              framework.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["CDSCO Aligned", "NDHM Compliant", "AIIMS Pilot"].map(
                (badge) => (
                  <span
                    key={badge}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.8)",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 500,
                      border: "1px solid rgba(255,255,255,0.15)",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {badge}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  margin: "0 0 16px",
                }}
              >
                {section}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {links.map((link) => (
                  <li key={link.label} style={{ marginBottom: 10 }}>
                    <a
                      href={link.href}
                      style={{
                        color: "rgba(255,255,255,0.65)",
                        textDecoration: "none",
                        fontSize: 14,
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "color 200ms",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = "#FFFFFF")}
                      onMouseLeave={(e) =>
                        (e.target.style.color = "rgba(255,255,255,0.65)")
                      }
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "20px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 13,
              margin: 0,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            © 2024 PulseWatch. Built for India's National Digital Health
            Mission.
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 13,
              margin: 0,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Theme 6: Real-Time Social Listening for Patient Safety
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
