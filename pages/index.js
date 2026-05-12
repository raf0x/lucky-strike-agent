import { useState } from "react";
import Head from "next/head";

const accounts = [
  { id: 1, company: "Salesforce", contact: "Jordan Ellis", title: "VP of Employee Experience", email: "j.ellis@salesforce.com", location: "Seattle, WA", last_booking: "14 days ago", days_since: 14, annual_value: 48000, events_per_year: 8, preferred_package: "Corporate Premier", team_size: 180, notes: "Loves bowling leagues, requested private lanes, strong Q1 spender", status: "healthy" },
  { id: 2, company: "Deloitte LLP", contact: "Sarah Kim", title: "Director of Talent", email: "s.kim@deloitte.com", location: "Portland, OR", last_booking: "67 days ago", days_since: 67, annual_value: 72000, events_per_year: 12, preferred_package: "Executive Retreat", team_size: 340, notes: "Q4 end-of-year events historically large, 2 planners on team", status: "at_risk" },
  { id: 3, company: "Microsoft", contact: "Marcus Chen", title: "Head of Culture & Events", email: "m.chen@microsoft.com", location: "Redmond, WA", last_booking: "112 days ago", days_since: 112, annual_value: 95000, events_per_year: 15, preferred_package: "Full Venue Buyout", team_size: 600, notes: "Xbox and Surface teams, all-hands events, prefers Friday evenings", status: "critical" },
  { id: 4, company: "Amazon", contact: "Priya Patel", title: "Senior Events Manager", email: "p.patel@amazon.com", location: "Seattle, WA", last_booking: "31 days ago", days_since: 31, annual_value: 62000, events_per_year: 10, preferred_package: "Corporate Premier", team_size: 250, notes: "AWS team prefers weekday evenings, very responsive to exclusive offers", status: "healthy" },
  { id: 5, company: "JPMorgan Chase", contact: "David Wu", title: "Facilities & Events Lead", email: "d.wu@jpmorgan.com", location: "Chicago, IL", last_booking: "88 days ago", days_since: 88, annual_value: 55000, events_per_year: 6, preferred_package: "Executive Retreat", team_size: 200, notes: "Compliance-sensitive, requires NDAs, big summer outing budget", status: "at_risk" },
];

const statusConfig = {
  healthy: { label: "Healthy", bg: "#e8f5e9", color: "#2e7d32" },
  at_risk: { label: "At Risk", bg: "#fff8e1", color: "#f57f17" },
  critical: { label: "Critical", bg: "#ffebee", color: "#c62828" },
};

const probColor = (p) => (p >= 65 ? "#2e7d32" : p >= 40 ? "#f57f17" : "#c62828");

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [error, setError] = useState(null);

  const handleSelect = (account) => {
    setSelected(account);
    setStrategy(null);
    setError(null);
  };

  const generateStrategy = async (account) => {
    setLoading(true);
    setStrategy(null);
    setError(null);
    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStrategy(data);
    } catch (err) {
      setError("Could not generate strategy. Check your API key in Vercel environment variables.");
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    { label: "Total Accounts", value: 5 },
    { label: "Healthy", value: 2, color: "#2e7d32" },
    { label: "At Risk", value: 2, color: "#f57f17" },
    { label: "Critical", value: 1, color: "#c62828" },
  ];

  return (
    <>
      <Head>
        <title>Lucky Strike · Enterprise Retention Agent</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <main style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem", background: "#fff", minHeight: "100vh" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem", borderBottom: "1px solid #f0f0f0", paddingBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "-0.3px" }}>
                Enterprise Retention Agent
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>
                Lucky Strike Entertainment · Powered by Claude AI
              </p>
            </div>
            <span style={{ fontSize: 11, padding: "4px 12px", background: "#e8f5e9", color: "#2e7d32", borderRadius: 20, fontWeight: 500 }}>
              Live
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: "1.75rem" }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, color: "#999" }}>{m.label}</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 600, color: m.color || "#111" }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, alignItems: "start" }}>

          {/* Account list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 500, color: "#999", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Accounts
            </p>
            {accounts.map((acc) => {
              const sc = statusConfig[acc.status];
              const sel = selected?.id === acc.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => handleSelect(acc)}
                  style={{
                    background: sel ? "#f9f9f9" : "#fff",
                    border: sel ? "1.5px solid #111" : "1px solid #eee",
                    borderRadius: 10,
                    padding: "10px 12px",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{acc.company}</span>
                    <span style={{ fontSize: 10, padding: "2px 8px", background: sc.bg, color: sc.color, borderRadius: 20, fontWeight: 500 }}>
                      {sc.label}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 1px", fontSize: 11, color: "#777" }}>{acc.contact}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "#bbb" }}>Last event: {acc.last_booking}</p>
                </div>
              );
            })}
            <p style={{ margin: "8px 0 0", fontSize: 10, color: "#ccc", textAlign: "center" }}>
              Simulated data · Select any account
            </p>
          </div>

          {/* Detail panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {!selected && (
              <div style={{ background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 12, padding: "3rem 1.5rem", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 14, color: "#aaa" }}>
                  Select an account to generate a personalized re-engagement strategy
                </p>
              </div>
            )}

            {selected && (
              <>
                {/* Account card */}
                <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 16 }}>{selected.company}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{selected.contact} · {selected.title}</p>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 600, color: "#111" }}>
                      ${(selected.annual_value / 1000).toFixed(0)}K/yr
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 10 }}>
                    {[["Team size", selected.team_size], ["Events/yr", selected.events_per_year], ["Days inactive", selected.days_since]].map(([l, v]) => (
                      <div key={l} style={{ background: "#fafafa", borderRadius: 8, padding: "8px 10px" }}>
                        <p style={{ margin: "0 0 2px", fontSize: 10, color: "#999" }}>{l}</p>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: "#aaa", fontStyle: "italic" }}>{selected.notes}</p>
                </div>

                {/* Generate button */}
                {!strategy && !loading && (
                  <button
                    onClick={() => generateStrategy(selected)}
                    style={{ padding: "11px 16px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: "pointer", border: "1px solid #111", borderRadius: 8, background: "#111", color: "#fff", transition: "opacity 0.15s" }}
                    onMouseEnter={(e) => (e.target.style.opacity = 0.85)}
                    onMouseLeave={(e) => (e.target.style.opacity = 1)}
                  >
                    Generate re-engagement strategy →
                  </button>
                )}

                {loading && (
                  <div style={{ background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 12, padding: "1.5rem", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#aaa" }}>Analyzing account · Drafting outreach...</p>
                  </div>
                )}

                {error && (
                  <div style={{ background: "#ffebee", border: "1px solid #ffcdd2", borderRadius: 8, padding: "10px 14px" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#c62828" }}>{error}</p>
                  </div>
                )}

                {strategy && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div style={{ background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 10, padding: "12px 14px" }}>
                        <p style={{ margin: "0 0 4px", fontSize: 11, color: "#999" }}>Rebooking probability</p>
                        <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: probColor(strategy.rebooking_probability) }}>
                          {strategy.rebooking_probability}%
                        </p>
                      </div>
                      <div style={{ background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 10, padding: "12px 14px" }}>
                        <p style={{ margin: "0 0 4px", fontSize: 11, color: "#999" }}>Recommended offer</p>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 500, lineHeight: 1.5 }}>{strategy.recommended_offer}</p>
                      </div>
                    </div>

                    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "14px 16px" }}>
                      <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#999" }}>Talking points</p>
                      {strategy.talking_points.map((tp, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < 2 ? 8 : 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#ccc", minWidth: 14, paddingTop: 1 }}>{i + 1}.</span>
                          <p style={{ margin: 0, fontSize: 13, color: "#555", lineHeight: 1.55 }}>{tp}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "14px 16px" }}>
                      <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#999" }}>Draft outreach email</p>
                      <p style={{ margin: "0 0 10px", fontSize: 12, color: "#555", borderBottom: "1px solid #f0f0f0", paddingBottom: 10 }}>
                        <strong>Subject:</strong> {strategy.email_subject}
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: "#555", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{strategy.email_body}</p>
                    </div>

                    <button
                      onClick={() => setStrategy(null)}
                      style={{ padding: "9px 14px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", border: "1px solid #ddd", borderRadius: 8, background: "#fff", color: "#555" }}
                    >
                      ↺ Regenerate
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid #f0f0f0", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 11, color: "#ccc" }}>
            Built by Rafael · Lucky Strike Entertainment · Powered by Anthropic Claude
          </p>
        </div>
      </main>
    </>
  );
}
