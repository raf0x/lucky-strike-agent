import { useState, useEffect, useRef } from "react";
import Head from "next/head";

const accounts = [
  { id: 1, company: "Salesforce", contact: "Jordan Ellis", title: "VP of Employee Experience", location: "Seattle, WA", last_booking: "14 days ago", days_since: 14, annual_value: 48000, events_per_year: 8, preferred_package: "Corporate Premier", team_size: 180, notes: "Bowling leagues, private lanes, strong Q1 spender", status: "healthy" },
  { id: 2, company: "Deloitte LLP", contact: "Sarah Kim", title: "Director of Talent", location: "Portland, OR", last_booking: "67 days ago", days_since: 67, annual_value: 72000, events_per_year: 12, preferred_package: "Executive Retreat", team_size: 340, notes: "Q4 end-of-year events historically large, 2 planners on team", status: "at_risk" },
  { id: 3, company: "Microsoft", contact: "Marcus Chen", title: "Head of Culture & Events", location: "Redmond, WA", last_booking: "112 days ago", days_since: 112, annual_value: 95000, events_per_year: 15, preferred_package: "Full Venue Buyout", team_size: 600, notes: "Xbox and Surface teams, all-hands events, prefers Friday evenings", status: "critical" },
  { id: 4, company: "Amazon", contact: "Priya Patel", title: "Senior Events Manager", location: "Seattle, WA", last_booking: "31 days ago", days_since: 31, annual_value: 62000, events_per_year: 10, preferred_package: "Corporate Premier", team_size: 250, notes: "AWS team, weekday evenings, responsive to exclusive offers", status: "healthy" },
  { id: 5, company: "JPMorgan Chase", contact: "David Wu", title: "Facilities & Events Lead", location: "Chicago, IL", last_booking: "88 days ago", days_since: 88, annual_value: 55000, events_per_year: 6, preferred_package: "Executive Retreat", team_size: 200, notes: "Compliance-sensitive, NDAs required, large summer outing budget", status: "at_risk" },
];

const STATUS = {
  healthy: { label: "Healthy", color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.2)" },
  at_risk: { label: "At Risk", color: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.2)" },
  critical: { label: "Critical", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
};

const INTEGRATIONS = [
  { name: "Salesforce", color: "#00a1e0" },
  { name: "HubSpot", color: "#ff7a59" },
  { name: "Toast", color: "#ff6b35" },
  { name: "Twilio", color: "#f22f46" },
  { name: "SevenRooms", color: "#8b5cf6" },
  { name: "Segment", color: "#52bd95" },
];

const CHANNEL_COLORS = {
  Email: { color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  SMS: { color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  Phone: { color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  Event: { color: "#e8b84b", bg: "rgba(232,184,75,0.1)" },
};

const probColor = (p) => p >= 65 ? "#4ade80" : p >= 40 ? "#fb923c" : "#f87171";

// Animated counter hook
function useCounter(target, duration = 1200, active = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || !target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setValue(Math.floor(start));
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, active]);
  return value;
}

function Gauge({ value }) {
  const r = 46, circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  const color = probColor(value);
  return (
    <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto" }}>
      <svg width="140" height="140" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#1c1c28" strokeWidth="8" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)", filter: `drop-shadow(0 0 6px ${color}60)` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1, textShadow: `0 0 20px ${color}60` }}>{value}%</span>
        <span style={{ fontSize: 9, color: "#4b4b60", marginTop: 3, letterSpacing: "0.8px", textTransform: "uppercase" }}>rebook score</span>
      </div>
    </div>
  );
}

function KpiCard({ label, value, prefix = "", suffix = "", color = "#e8b84b", active }) {
  const count = useCounter(value, 1400, active);
  return (
    <div style={{ background: "#13131e", border: `1px solid ${color}22`, borderRadius: 12, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
      <p style={{ fontSize: 10, color: "#4b4b60", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>{label}</p>
      <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 22, fontWeight: 700, color, margin: 0, textShadow: `0 0 20px ${color}40` }}>
        {prefix}{count.toLocaleString()}{suffix}
      </p>
    </div>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, border: `1px solid ${copied ? "rgba(74,222,128,0.4)" : "#2a2a38"}`, background: copied ? "rgba(74,222,128,0.08)" : "transparent", color: copied ? "#4ade80" : "#4b4b60", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
      {copied ? "✓ Copied" : "Copy email"}
    </button>
  );
}

const card = (extra = {}) => ({ background: "#13131e", border: "1px solid #1e1e2c", borderRadius: 12, padding: "16px", ...extra });

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [error, setError] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (acc) => { setSelected(acc); setStrategy(null); setError(null); setRevealed(false); };

  const generate = async (acc) => {
    setLoading(true); setStrategy(null); setError(null); setRevealed(false);
    try {
      const res = await fetch("/api/strategy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(acc) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStrategy(data);
      setTimeout(() => setRevealed(true), 100);
    } catch (e) { setError(e.message || "Could not generate strategy."); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Head>
        <title>Lucky Strike · Enterprise Retention Agent</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0;}
          body{background:#0a0a12;}
          ::selection{background:rgba(232,184,75,0.2);}
          @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
          @keyframes spin{to{transform:rotate(360deg);}}
          @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
          @keyframes glow{0%,100%{opacity:0.6;}50%{opacity:1;}}
          .acc-row{transition:all 0.15s;cursor:pointer;}
          .acc-row:hover{background:#16161e!important;border-color:#2a2a38!important;}
          .gen-btn{transition:all 0.2s;}
          .gen-btn:hover{background:#e8b84b!important;color:#0a0a12!important;box-shadow:0 0 24px rgba(232,184,75,0.3)!important;}
          .reveal{animation:fadeUp 0.5s ease forwards;}
          .reveal-1{animation:fadeUp 0.5s 0.05s ease both;}
          .reveal-2{animation:fadeUp 0.5s 0.15s ease both;}
          .reveal-3{animation:fadeUp 0.5s 0.25s ease both;}
          .reveal-4{animation:fadeUp 0.5s 0.35s ease both;}
          .reveal-5{animation:fadeUp 0.5s 0.45s ease both;}
          .reveal-6{animation:fadeUp 0.5s 0.55s ease both;}
        `}</style>
      </Head>

      <main style={{ fontFamily: "'IBM Plex Sans',sans-serif", maxWidth: 1040, margin: "0 auto", padding: "2rem 1.5rem", minHeight: "100vh" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", paddingBottom: "1.25rem", borderBottom: "1px solid #1a1a26" }}>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 21, fontWeight: 800, color: "#f0f0fa", letterSpacing: "-0.3px", margin: 0 }}>
              Enterprise Retention Agent
            </h1>
            <p style={{ fontSize: 12, color: "#4b4b62", marginTop: 4 }}>Lucky Strike Entertainment · Revenue Intelligence Platform</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 8px #4ade80", animation: "glow 2s ease infinite" }} />
              <span style={{ fontSize: 11, color: "#4ade80", fontFamily: "'IBM Plex Mono',monospace", letterSpacing: "0.5px" }}>LIVE</span>
            </div>
          </div>
        </div>

        {/* Metrics row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: "1.5rem" }}>
          {[
            { label: "Total Accounts", value: "5", color: "#f0f0fa" },
            { label: "Healthy", value: "2", color: "#4ade80" },
            { label: "At Risk", value: "2", color: "#fb923c" },
            { label: "Critical", value: "1", color: "#f87171" },
          ].map(m => (
            <div key={m.label} style={{ ...card(), padding: "12px 14px" }}>
              <p style={{ fontSize: 10, color: "#4b4b62", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>{m.label}</p>
              <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 26, fontWeight: 700, color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Integration strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.75rem", padding: "10px 14px", background: "#0e0e18", border: "1px solid #1a1a26", borderRadius: 10 }}>
          <span style={{ fontSize: 10, color: "#3a3a50", textTransform: "uppercase", letterSpacing: "0.8px", whiteSpace: "nowrap", marginRight: 4 }}>Integrations</span>
          {INTEGRATIONS.map(int => (
            <span key={int.name} style={{ fontSize: 11, fontWeight: 600, color: int.color, padding: "3px 10px", background: `${int.color}12`, border: `1px solid ${int.color}25`, borderRadius: 20, whiteSpace: "nowrap" }}>
              {int.name}
            </span>
          ))}
        </div>

        {/* Main layout */}
        <div style={{ display: "grid", gridTemplateColumns: "245px 1fr", gap: 12, alignItems: "start" }}>

          {/* Account list */}
          <div>
            <p style={{ fontSize: 10, color: "#3a3a50", textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: 8 }}>Accounts</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {accounts.map(acc => {
                const s = STATUS[acc.status];
                const sel = selected?.id === acc.id;
                return (
                  <div key={acc.id} className="acc-row" onClick={() => handleSelect(acc)}
                    style={{ ...card({ padding: "10px 12px" }), borderLeft: `3px solid ${s.color}`, borderColor: sel ? s.border : "#1e1e2c", background: sel ? "#16161e" : "#13131e" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#e0e0f0" }}>{acc.company}</span>
                      <span style={{ fontSize: 9, padding: "2px 7px", background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20, fontWeight: 600 }}>{s.label}</span>
                    </div>
                    <p style={{ fontSize: 11, color: "#5a5a72", marginBottom: 2 }}>{acc.contact}</p>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, color: "#2e2e42" }}>{acc.last_booking}</span>
                      <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", color: "#4b4b62" }}>${(acc.annual_value / 1000).toFixed(0)}K/yr</span>
                    </div>
                  </div>
                );
              })}
              <p style={{ fontSize: 10, color: "#2a2a38", textAlign: "center", marginTop: 6 }}>Simulated data · Select any account</p>
            </div>
          </div>

          {/* Detail panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {!selected && (
              <div style={{ ...card(), padding: "4rem 2rem", textAlign: "center" }}>
                <p style={{ fontSize: 24, marginBottom: 10 }}>🎳</p>
                <p style={{ fontSize: 14, color: "#3a3a50" }}>Select an account to generate a revenue re-engagement strategy</p>
              </div>
            )}

            {selected && (
              <>
                {/* Account card */}
                <div style={card()}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 700, color: "#f0f0fa", marginBottom: 3 }}>{selected.company}</p>
                      <p style={{ fontSize: 12, color: "#5a5a72" }}>{selected.contact} · {selected.title}</p>
                      <p style={{ fontSize: 11, color: "#3a3a50", marginTop: 2 }}>{selected.location} · {selected.preferred_package}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 22, fontWeight: 700, color: "#e8b84b", textShadow: "0 0 20px rgba(232,184,75,0.3)" }}>${(selected.annual_value / 1000).toFixed(0)}K</p>
                      <p style={{ fontSize: 10, color: "#4b4b62", marginTop: 2 }}>annual value</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 10 }}>
                    {[["Team size", selected.team_size], ["Events/yr", selected.events_per_year], ["Days inactive", selected.days_since]].map(([l, v]) => (
                      <div key={l} style={{ background: "#0e0e18", border: "1px solid #1a1a26", borderRadius: 8, padding: "8px 10px" }}>
                        <p style={{ fontSize: 10, color: "#3a3a50", marginBottom: 3 }}>{l}</p>
                        <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 500, color: "#c8c8e8" }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "#3a3a4e", fontStyle: "italic" }}>{selected.notes}</p>
                </div>

                {!strategy && !loading && (
                  <button className="gen-btn" onClick={() => generate(selected)}
                    style={{ padding: "13px 20px", fontSize: 13, fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 600, cursor: "pointer", border: "1px solid #e8b84b", borderRadius: 10, background: "transparent", color: "#e8b84b", letterSpacing: "0.2px" }}>
                    Generate re-engagement strategy →
                  </button>
                )}

                {loading && (
                  <div style={{ ...card(), padding: "2.5rem", textAlign: "center" }}>
                    <div style={{ width: 22, height: 22, border: "2px solid #2a2a38", borderTop: "2px solid #e8b84b", borderRadius: "50%", margin: "0 auto 14px", animation: "spin 0.8s linear infinite" }} />
                    <p style={{ fontSize: 12, color: "#4b4b62", marginBottom: 4 }}>Analyzing account signals</p>
                    <p style={{ fontSize: 11, color: "#3a3a50" }}>Calculating revenue recovery · Building campaign timeline...</p>
                  </div>
                )}

                {error && (
                  <div style={{ ...card(), borderColor: "rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.05)" }}>
                    <p style={{ fontSize: 12, color: "#f87171" }}>{error}</p>
                  </div>
                )}

                {strategy && (
                  <>
                    {/* Row 1: Gauge + KPIs */}
                    <div className="reveal-1" style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10 }}>
                      <div style={{ ...card(), display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 12px" }}>
                        <Gauge value={strategy.rebooking_probability} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 8 }}>
                        <KpiCard label="90-Day Revenue Recovery" value={strategy.revenue_recovery_90d} prefix="$" color="#e8b84b" active={revealed} />
                        <KpiCard label="Projected Bookings" value={strategy.projected_bookings} suffix=" events" color="#60a5fa" active={revealed} />
                        <KpiCard label="Returning Guests" value={strategy.returning_guests} color="#a78bfa" active={revealed} />
                        <div style={{ ...card({ padding: "14px 16px" }), borderColor: "rgba(74,222,128,0.15)" }}>
                          <p style={{ fontSize: 10, color: "#4b4b62", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Recommended offer</p>
                          <p style={{ fontSize: 12, color: "#c8c8e8", lineHeight: 1.55, fontWeight: 500 }}>{strategy.recommended_offer}</p>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: AI Insights */}
                    <div className="reveal-2" style={card()}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 11, padding: "3px 10px", background: "rgba(232,184,75,0.1)", color: "#e8b84b", border: "1px solid rgba(232,184,75,0.2)", borderRadius: 20, fontWeight: 600, letterSpacing: "0.3px" }}>✦ AI INSIGHTS DETECTED</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {(strategy.ai_insights || []).map((ins, i) => (
                          <div key={i} style={{ background: "#0e0e18", border: "1px solid #1e1e2c", borderLeft: "3px solid #e8b84b", borderRadius: 8, padding: "10px 12px" }}>
                            <p style={{ fontSize: 12, color: "#9090b0", lineHeight: 1.6 }}>{ins.insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Row 3: AI Signals */}
                    <div className="reveal-3" style={card()}>
                      <p style={{ fontSize: 10, color: "#4b4b62", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>AI Signals</p>
                      <p style={{ fontSize: 11, color: "#2e2e42", marginBottom: 12 }}>Data points analyzed to build this strategy</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {(strategy.signals || []).map((s, i) => {
                          const ic = s.impact === "positive" ? "#4ade80" : s.impact === "negative" ? "#f87171" : "#6b6b82";
                          const ib = s.impact === "positive" ? "rgba(74,222,128,0.08)" : s.impact === "negative" ? "rgba(248,113,113,0.08)" : "rgba(107,107,130,0.06)";
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: "#0e0e18", border: "1px solid #1a1a26", borderRadius: 7 }}>
                              <span style={{ fontSize: 12, color: "#7070a0" }}>{s.label}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: "#d0d0f0", fontWeight: 500 }}>{s.value}</span>
                                <span style={{ fontSize: 9, padding: "2px 8px", background: ib, color: ic, borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>{s.impact}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                        <div style={{ padding: "9px 11px", background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 8 }}>
                          <p style={{ fontSize: 9, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4, fontWeight: 600 }}>Risk</p>
                          <p style={{ fontSize: 11, color: "#8080a0", lineHeight: 1.5 }}>{strategy.risk_summary}</p>
                        </div>
                        <div style={{ padding: "9px 11px", background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 8 }}>
                          <p style={{ fontSize: 9, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4, fontWeight: 600 }}>Opportunity</p>
                          <p style={{ fontSize: 11, color: "#8080a0", lineHeight: 1.5 }}>{strategy.opportunity_summary}</p>
                        </div>
                      </div>
                    </div>

                    {/* Row 4: Campaign Timeline */}
                    <div className="reveal-4" style={card()}>
                      <p style={{ fontSize: 10, color: "#4b4b62", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>30-Day Campaign Timeline</p>
                      <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: 15, top: 8, bottom: 8, width: 1, background: "linear-gradient(180deg, #e8b84b40, #e8b84b10)" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {(strategy.timeline || []).map((t, i) => {
                            const ch = CHANNEL_COLORS[t.channel] || { color: "#6b6b82", bg: "rgba(107,107,130,0.1)" };
                            return (
                              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
                                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#0e0e18", border: "2px solid #e8b84b40", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: "#e8b84b" }}>{t.week}</span>
                                  </div>
                                </div>
                                <div style={{ flex: 1, background: "#0e0e18", border: "1px solid #1a1a26", borderRadius: 8, padding: "9px 12px" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: "#d0d0f0" }}>{t.action}</span>
                                    <span style={{ fontSize: 10, padding: "2px 8px", background: ch.bg, color: ch.color, borderRadius: 20, fontWeight: 600 }}>{t.channel}</span>
                                  </div>
                                  <p style={{ fontSize: 11, color: "#5a5a72", lineHeight: 1.5, margin: 0 }}>{t.goal}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Row 5: Email */}
                    <div className="reveal-5" style={card()}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <p style={{ fontSize: 10, color: "#4b4b62", textTransform: "uppercase", letterSpacing: "0.8px" }}>Draft outreach email</p>
                        <CopyBtn text={`Subject: ${strategy.email_subject}\n\n${strategy.email_body}`} />
                      </div>
                      <div style={{ background: "#0e0e18", border: "1px solid #1a1a26", borderRadius: 8, padding: "14px 16px" }}>
                        <p style={{ fontSize: 11, color: "#5a5a72", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #1a1a26" }}>
                          <span style={{ color: "#3a3a50" }}>Subject: </span>{strategy.email_subject}
                        </p>
                        <p style={{ fontSize: 13, color: "#8080a0", lineHeight: 1.75, whiteSpace: "pre-wrap", margin: 0 }}>{strategy.email_body}</p>
                      </div>
                    </div>

                    <div className="reveal-6" style={{ display: "flex", justifyContent: "flex-start" }}>
                      <button onClick={() => { setStrategy(null); setRevealed(false); }}
                        style={{ fontSize: 11, padding: "8px 14px", borderRadius: 7, border: "1px solid #1e1e2c", background: "transparent", color: "#4b4b62", cursor: "pointer", fontFamily: "inherit" }}>
                        ↺ Regenerate
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid #1a1a26", textAlign: "center" }}>
          <p style={{ fontSize: 10, color: "#2a2a38", fontFamily: "'IBM Plex Mono',monospace", letterSpacing: "0.5px" }}>
            BUILT BY RAFAEL LEMOR · LUCKY STRIKE ENTERTAINMENT · POWERED BY ANTHROPIC CLAUDE
          </p>
        </div>
      </main>
    </>
  );
}
