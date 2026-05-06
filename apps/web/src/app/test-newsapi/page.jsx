"use client";
import { useState } from "react";

export default function TestNewsAPIPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testNewsAPI = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/crawlers/newsapi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 10 }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ success: false, error: e.message });
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F4F6FA",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: "40px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: 28,
            color: "#1A1A2E",
            marginBottom: 12,
          }}
        >
          NewsAPI Test — Real Indian News
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "#6B7280",
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          Click below to fetch real drug safety news from{" "}
          <strong>
            Times of India, NDTV, The Hindu, Hindustan Times, BBC India
          </strong>{" "}
          using your NewsAPI key.
        </p>

        <button
          onClick={testNewsAPI}
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 10,
            border: "none",
            backgroundColor: loading ? "#6B7280" : "#002366",
            color: "#FFFFFF",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: 16,
            marginBottom: 24,
          }}
        >
          {loading
            ? "⏳ Fetching real news from India..."
            : "🚀 Test NewsAPI Now"}
        </button>

        {result && (
          <div
            style={{
              backgroundColor: result.success === false ? "#FEF2F2" : "#F0FDF4",
              borderRadius: 10,
              padding: "20px",
              border: `1px solid ${result.success === false ? "#FCA5A5" : "#BBF7D0"}`,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: result.success === false ? "#DC2626" : "#059669",
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {result.success === false ? "❌ Error" : "✅ Success"}
            </div>

            {result.success === false ? (
              <div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#DC2626",
                    fontFamily: "'DM Sans', sans-serif",
                    marginBottom: 8,
                  }}
                >
                  {result.authError
                    ? "API key not configured — make sure NEWSAPI_KEY is set in environment variables"
                    : result.error || "Unknown error"}
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  {[
                    {
                      label: "Articles Fetched",
                      value: result.articles_fetched || 0,
                      color: "#002366",
                    },
                    {
                      label: "New Signals",
                      value: result.inserted || 0,
                      color: "#059669",
                    },
                    {
                      label: "Duplicates",
                      value: result.skipped || 0,
                      color: "#D97706",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 8,
                        padding: "14px",
                        textAlign: "center",
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
                          fontSize: 12,
                          color: "#6B7280",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                {result.message && (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#059669",
                      fontFamily: "'DM Sans', sans-serif",
                      marginBottom: 16,
                      padding: "10px 14px",
                      backgroundColor: "#FFFFFF",
                      borderRadius: 6,
                    }}
                  >
                    💬 {result.message}
                  </div>
                )}

                {result.signals && result.signals.length > 0 && (
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#1A1A2E",
                        fontFamily: "'DM Sans', sans-serif",
                        marginBottom: 10,
                      }}
                    >
                      📰 Sample Real News Signals Collected:
                    </div>
                    {result.signals.map((s, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderRadius: 8,
                          padding: "14px",
                          marginBottom: 10,
                          border: "1px solid #E5E7EB",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            marginBottom: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              backgroundColor: "#EEF2FF",
                              color: "#002366",
                              padding: "3px 8px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {s.drug}
                          </span>
                          <span
                            style={{
                              backgroundColor: "#FEF2F2",
                              color: "#DC2626",
                              padding: "3px 8px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {s.severity}
                          </span>
                          <span
                            style={{
                              backgroundColor: "#F4F6FA",
                              color: "#6B7280",
                              padding: "3px 8px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {s.region}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#1A1A2E",
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                        >
                          {s.symptom}
                        </div>
                        {s.title && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#6B7280",
                              fontFamily: "'DM Sans', sans-serif",
                              marginBottom: 4,
                            }}
                          >
                            📄 {s.title}
                          </div>
                        )}
                        {s.source && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "#9CA3AF",
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            Source: {s.source}
                          </div>
                        )}
                        {s.url && (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: 11,
                              color: "#002366",
                              fontFamily: "'DM Sans', sans-serif",
                              textDecoration: "none",
                              display: "inline-block",
                              marginTop: 6,
                            }}
                          >
                            🔗 Read full article →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <details style={{ marginTop: 16 }}>
              <summary
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                🔍 View Full JSON Response
              </summary>
              <pre
                style={{
                  fontSize: 11,
                  color: "#1A1A2E",
                  fontFamily: "monospace",
                  backgroundColor: "#F4F6FA",
                  padding: "12px",
                  borderRadius: 6,
                  marginTop: 8,
                  overflow: "auto",
                  maxHeight: 400,
                }}
              >
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div
          style={{
            marginTop: 32,
            padding: "16px",
            backgroundColor: "#EEF2FF",
            borderRadius: 10,
            border: "1px solid #C7D2FE",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#002366",
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: 8,
            }}
          >
            ℹ️ What This Test Does:
          </div>
          <ul
            style={{
              fontSize: 13,
              color: "#1A1A2E",
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.8,
              margin: 0,
              paddingLeft: 20,
            }}
          >
            <li>
              Calls NewsAPI.org with your key{" "}
              <code
                style={{
                  backgroundColor: "#DBEAFE",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                new1_f9585c4b39d347dd92bd01adaa775445
              </code>
            </li>
            <li>
              Searches for drug safety news from Indian media (Times of India,
              NDTV, The Hindu, etc.)
            </li>
            <li>
              Extracts drug names, symptoms, severity, and regions from real
              articles
            </li>
            <li>Inserts new signals into your database (skips duplicates)</li>
            <li>
              Returns sample articles with links to the original news sources
            </li>
          </ul>
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <a
            href="/dashboard/sources"
            style={{
              fontSize: 14,
              color: "#002366",
              fontFamily: "'DM Sans', sans-serif",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ← Back to Sources Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
