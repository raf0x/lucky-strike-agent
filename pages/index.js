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

const CHANNEL_COLORS = {
  Email: { color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  SMS: { color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  Phone: { color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  Event: { color: "#e8b84b", bg: "rgba(232,184,75,0.1)" },
};

const C = {
  heading: "#f0f0fa",
  body: "#c0c0e0",
  label: "#9090b0",
  gold: "#e8b84b",
  border: "#1e1e2c",
  card: "#13131e",
  deep: "#0e0e18",
};

const probColor = (p) => p >= 65 ? "#4ade80" : p >= 40 ? "#fb923c" : "#f87171";

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

function useElapsed(active) {
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!active) { setElapsed(0); return; }
    setElapsed(0);
    ref.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(ref.current);
  }, [active]);
  return elapsed;
}

function calcInaction(account) {
  const dailyValue = account.annual_value / 365;
  const projectedLoss = Math.round(dailyValue * 90 * 0.85 / 1000) * 1000;
  const bookingsAtRisk = Math.round(account.events_per_year / 4);
  const guestsAtRisk = Math.round(account.team_size * 0.6);
  const risk = account.days_since >= 90 ? "Critical" : account.days_since >= 60 ? "High" : "Moderate";
  const riskColor = account.days_since >= 90 ? "#f87171" : account.days_since >= 60 ? "#fb923c" : "#e8b84b";
  return { projectedLoss, bookingsAtRisk, guestsAtRisk, risk, riskColor };
}

function Gauge({ value }) {
  const r = 46, circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  const color = probColor(value);
  return (
    <div style={{ position: "relative", width: 130, height: 130, margin: "0 auto" }}>
      <svg width="130" height="130" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#1c1c28" strokeWidth="8" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)", filter: `drop-shadow(0 0 6px ${color}60)` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 700, color, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1, textShadow: `0 0 20px ${color}60` }}>{value}%</span>
        <span style={{ fontSize: 9, color: C.label, marginTop: 3, letterSpacing: "0.8px", textTransform: "uppercase" }}>rebook score</span>
      </div>
    </div>
  );
}

function KpiCard({ label, value, prefix = "", suffix = "", color = "#e8b84b", active }) {
  const count = useCounter(value, 1400, active);
  return (
    <div style={{ background: C.card, border: `1px solid ${color}22`, borderRadius: 12, padding: "12px 14px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
      <p style={{ fontSize: 10, color: C.label, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>{label}</p>
      <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 20, fontWeight: 700, color, margin: 0, textShadow: `0 0 20px ${color}40` }}>
        {prefix}{count.toLocaleString()}{suffix}
      </p>
    </div>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, border: `1px solid ${copied ? "rgba(74,222,128,0.4)" : "#3a3a50"}`, background: copied ? "rgba(74,222,128,0.08)" : "transparent", color: copied ? "#4ade80" : C.body, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", whiteSpace: "nowrap" }}>
      {copied ? "✓ Copied" : "Copy email"}
    </button>
  );
}

const card = (extra = {}) => ({ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px", ...extra });

const SectionLabel = ({ children, style = {} }) => (
  <p style={{ fontSize: 10, color: C.label, textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: 12, fontFamily: "'IBM Plex Mono',monospace", ...style }}>{children}</p>
);

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [error, setError] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showInaction, setShowInaction] = useState(false);
  const elapsed = useElapsed(revealed);

  const handleSelect = (acc) => {
    setSelected(acc); setStrategy(null); setError(null);
    setRevealed(false); setShowDetail(true); setShowInaction(false);
  };

  const handleBack = () => {
    setShowDetail(false); setSelected(null); setStrategy(null); setShowInaction(false);
  };

  const generate = async (acc) => {
    setLoading(true); setStrategy(null); setError(null); setRevealed(false); setShowInaction(false);
    try {
      const res = await fetch("/api/strategy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(acc) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStrategy(data);
      setTimeout(() => setRevealed(true), 100);
    } catch (e) { setError(e.message || "Could not generate strategy."); }
    finally { setLoading(false); }
  };

  const inaction = selected ? calcInaction(selected) : null;

  return (
    <>
      <Head>
        <title>Lucky Strike · Account Pulse</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0;}
          body{background:#0a0a12;}
          ::selection{background:rgba(232,184,75,0.2);}
          @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
          @keyframes spin{to{transform:rotate(360deg);}}
          @keyframes glow{0%,100%{opacity:0.6;}50%{opacity:1;}}
          @keyframes slideDown{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
          .acc-row{transition:all 0.15s;cursor:pointer;}
          .acc-row:hover{background:#16161e!important;}
          .gen-btn{transition:all 0.2s;}
          .gen-btn:hover{background:#e8b84b!important;color:#0a0a12!important;box-shadow:0 0 24px rgba(232,184,75,0.3)!important;}
          .inaction-btn{transition:all 0.2s;}
          .inaction-btn:hover{border-color:#f87171!important;color:#f87171!important;}
          .reveal-1{animation:fadeUp 0.5s 0.05s ease both;}
          .reveal-2{animation:fadeUp 0.5s 0.15s ease both;}
          .reveal-3{animation:fadeUp 0.5s 0.25s ease both;}
          .reveal-4{animation:fadeUp 0.5s 0.35s ease both;}
          .reveal-5{animation:fadeUp 0.5s 0.45s ease both;}
          .reveal-6{animation:fadeUp 0.5s 0.55s ease both;}
          .reveal-7{animation:fadeUp 0.5s 0.65s ease both;}
          .inaction-panel{animation:slideDown 0.3s ease both;}
          .metrics-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:1.75rem;}
          .main-grid{display:grid;grid-template-columns:245px 1fr;gap:12px;align-items:start;}
          .gauge-row{display:grid;grid-template-columns:150px 1fr;gap:10px;}
          .kpi-grid{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8px;}
          .mobile-back{display:none;}
          .signal-row{display:flex;align-items:center;justify-content:space-between;padding:7px 10px;gap:8px;}
          .signal-value-grp{display:flex;align-items:center;gap:6px;flex-shrink:0;}
          @media(max-width:640px){
            .metrics-grid{grid-template-columns:repeat(2,1fr);}
            .main-grid{grid-template-columns:1fr;}
            .gauge-row{grid-template-columns:1fr;}
            .kpi-grid{grid-template-columns:1fr 1fr;}
            .mobile-back{display:flex;align-items:center;gap:8px;margin-bottom:12px;cursor:pointer;}
            .desktop-list.hidden-mobile{display:none;}
            .detail-panel.hidden-mobile{display:none;}
            .signal-row{flex-direction:column;align-items:flex-start;gap:4px;}
            .signal-value-grp{margin-top:2px;}
          }
        `}</style>
      </Head>

      <main style={{ fontFamily: "'IBM Plex Sans',sans-serif", maxWidth: 1040, margin: "0 auto", padding: "1.25rem 1rem", minHeight: "100vh" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(16px,4vw,21px)", fontWeight: 800, color: C.heading, letterSpacing: "-0.3px", margin: 0 }}>
              Account Pulse
            </h1>
            <p style={{ fontSize: "clamp(10px,2.5vw,12px)", color: C.label, marginTop: 3 }}>Lucky Strike Entertainment · Revenue Intelligence Platform</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 8px #4ade80", animation: "glow 2s ease infinite" }} />
            <span style={{ fontSize: 11, color: "#4ade80", fontFamily: "'IBM Plex Mono',monospace", letterSpacing: "0.5px" }}>LIVE</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="metrics-grid">
          {[
            { label: "Total Accounts", value: "5", color: C.heading },
            { label: "Healthy", value: "2", color: "#4ade80" },
            { label: "At Risk", value: "2", color: "#fb923c" },
            { label: "Critical", value: "1", color: "#f87171" },
          ].map(m => (
            <div key={m.label} style={{ ...card(), padding: "10px 12px" }}>
              <p style={{ fontSize: 10, color: C.body, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>{m.label}</p>
              <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "clamp(20px,5vw,26px)", fontWeight: 700, color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Main layout */}
        <div className="main-grid">

          {/* Account list */}
          <div className={`desktop-list${showDetail ? " hidden-mobile" : ""}`}>
            <p style={{ fontSize: 10, color: C.body, textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: 8, fontFamily: "'IBM Plex Mono',monospace" }}>Accounts</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {accounts.map(acc => {
                const s = STATUS[acc.status];
                const sel = selected?.id === acc.id;
                return (
                  <div key={acc.id} className="acc-row" onClick={() => handleSelect(acc)}
                    style={{ ...card({ padding: "10px 12px" }), borderLeft: `3px solid ${s.color}`, borderColor: sel ? s.border : C.border, background: sel ? "#16161e" : C.card }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.heading }}>{acc.company}</span>
                      <span style={{ fontSize: 9, padding: "2px 7px", background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20, fontWeight: 600 }}>{s.label}</span>
                    </div>
                    <p style={{ fontSize: 11, color: C.body, marginBottom: 3 }}>{acc.contact}</p>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, color: C.label }}>{acc.last_booking}</span>
                      <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", color: C.body, fontWeight: 500 }}>${(acc.annual_value / 1000).toFixed(0)}K/yr</span>
                    </div>
                  </div>
                );
              })}
              <p style={{ fontSize: 10, color: C.label, textAlign: "center", marginTop: 6 }}>Simulated data · Select any account</p>
            </div>
          </div>

          {/* Detail panel */}
          <div className={`detail-panel${!showDetail ? " hidden-mobile" : ""}`} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            <div className="mobile-back" onClick={handleBack}>
              <span style={{ color: C.gold, fontSize: 14 }}>←</span>
              <span style={{ fontSize: 12, color: C.body }}>All accounts</span>
            </div>

            {!selected && (
              <div style={{ ...card(), padding: "4rem 2rem", textAlign: "center" }}>
                <p style={{ fontSize: 24, marginBottom: 10 }}>🎳</p>
                <p style={{ fontSize: 14, color: C.body }}>Select an account to generate a revenue re-engagement strategy</p>
              </div>
            )}

            {selected && (
              <>
                {/* Account card */}
                <div style={card()}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ flex: 1, marginRight: 12 }}>
                      <p style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(15px,4vw,19px)", fontWeight: 700, color: C.heading, marginBottom: 3 }}>{selected.company}</p>
                      <p style={{ fontSize: 12, color: C.body }}>{selected.contact} · {selected.title}</p>
                      <p style={{ fontSize: 11, color: C.label, marginTop: 2 }}>{selected.location} · {selected.preferred_package}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "clamp(16px,4vw,22px)", fontWeight: 700, color: C.gold, textShadow: "0 0 20px rgba(232,184,75,0.3)" }}>${(selected.annual_value / 1000).toFixed(0)}K</p>
                      <p style={{ fontSize: 10, color: C.label, marginTop: 2 }}>annual value</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 10 }}>
                    {[["Team size", selected.team_size], ["Events/yr", selected.events_per_year], ["Days inactive", selected.days_since]].map(([l, v]) => (
                      <div key={l} style={{ background: C.deep, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px" }}>
                        <p style={{ fontSize: 10, color: C.label, marginBottom: 3 }}>{l}</p>
                        <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "clamp(14px,4vw,18px)", fontWeight: 500, color: C.heading }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: C.label, fontStyle: "italic" }}>{selected.notes}</p>
                </div>

                {!strategy && !loading && (
                  <button className="gen-btn" onClick={() => generate(selected)}
                    style={{ padding: "13px 20px", fontSize: 13, fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 600, cursor: "pointer", border: `1px solid ${C.gold}`, borderRadius: 10, background: "transparent", color: C.gold, letterSpacing: "0.2px", width: "100%" }}>
                    Generate re-engagement strategy →
                  </button>
                )}

                {loading && (
                  <div style={{ ...card(), padding: "2.5rem", textAlign: "center" }}>
                    <div style={{ width: 22, height: 22, border: "2px solid #2a2a38", borderTop: `2px solid ${C.gold}`, borderRadius: "50%", margin: "0 auto 14px", animation: "spin 0.8s linear infinite" }} />
                    <p style={{ fontSize: 12, color: C.body, marginBottom: 4 }}>Analyzing account signals</p>
                    <p style={{ fontSize: 11, color: C.label }}>Calculating revenue exposure · Building campaign timeline...</p>
                  </div>
                )}

                {error && (
                  <div style={{ ...card(), borderColor: "rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.05)" }}>
                    <p style={{ fontSize: 12, color: "#f87171" }}>{error}</p>
                  </div>
                )}

                {strategy && (
                  <>
                    {/* Timestamp */}
                    <div className="reveal-1" style={{ display: "flex", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 10, color: C.label, fontFamily: "'IBM Plex Mono',monospace" }}>
                        Analysis refreshed {elapsed}s ago
                      </span>
                    </div>

                    {/* Gauge + KPIs */}
                    <div className="reveal-1 gauge-row">
                      <div style={{ ...card(), display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 12px" }}>
                        <Gauge value={strategy.rebooking_probability} />
                      </div>
                      <div className="kpi-grid">
                        <KpiCard label="Revenue at Stake" value={strategy.revenue_recovery_90d} prefix="$" color={C.gold} active={revealed} />
                        <KpiCard label="Projected Bookings" value={strategy.projected_bookings} suffix=" events" color="#60a5fa" active={revealed} />
                        <KpiCard label="Returning Guests" value={strategy.returning_guests} color="#a78bfa" active={revealed} />
                        <div style={{ ...card({ padding: "12px 14px" }), borderColor: "rgba(74,222,128,0.15)" }}>
                          <p style={{ fontSize: 10, color: C.label, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Recommended offer</p>
                          <p style={{ fontSize: 11, color: C.body, lineHeight: 1.5, fontWeight: 500 }}>{strategy.recommended_offer}</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Insights */}
                    <div className="reveal-2" style={card()}>
                      <SectionLabel>AI Insights</SectionLabel>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {(strategy.ai_insights || []).map((ins, i) => (
                          <div key={i} style={{ background: C.deep, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.gold}`, borderRadius: 8, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <span style={{ color: C.gold, fontSize: 12, marginTop: 1, flexShrink: 0 }}>✦</span>
                            <p style={{ fontSize: 12, color: C.body, lineHeight: 1.6, margin: 0 }}>{ins.insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Signals */}
                    <div className="reveal-3" style={card()}>
                      <SectionLabel>AI Signals</SectionLabel>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {(strategy.signals || []).map((s, i) => {
                          const ic = s.impact === "positive" ? "#4ade80" : s.impact === "negative" ? "#f87171" : C.label;
                          const ib = s.impact === "positive" ? "rgba(74,222,128,0.08)" : s.impact === "negative" ? "rgba(248,113,113,0.08)" : "rgba(144,144,176,0.06)";
                          return (
                            <div key={i} className="signal-row" style={{ background: C.deep, border: `1px solid ${C.border}`, borderRadius: 7 }}>
                              <span style={{ fontSize: 12, color: C.body }}>{s.label}</span>
                              <div className="signal-value-grp">
                                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: C.heading, fontWeight: 500 }}>{s.value}</span>
                                <span style={{ fontSize: 9, padding: "2px 7px", background: ib, color: ic, borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.4px", fontWeight: 600 }}>{s.impact}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                        <div style={{ padding: "9px 11px", background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 8 }}>
                          <p style={{ fontSize: 9, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4, fontWeight: 600 }}>Risk</p>
                          <p style={{ fontSize: 11, color: C.body, lineHeight: 1.5 }}>{strategy.risk_summary}</p>
                        </div>
                        <div style={{ padding: "9px 11px", background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 8 }}>
                          <p style={{ fontSize: 9, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4, fontWeight: 600 }}>Opportunity</p>
                          <p style={{ fontSize: 11, color: C.body, lineHeight: 1.5 }}>{strategy.opportunity_summary}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="reveal-4" style={card()}>
                      <SectionLabel>30-Day Campaign Timeline</SectionLabel>
                      <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: 15, top: 8, bottom: 8, width: 1, background: "linear-gradient(180deg, #e8b84b50, #e8b84b10)" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {(strategy.timeline || []).map((t, i) => {
                            const ch = CHANNEL_COLORS[t.channel] || { color: C.label, bg: "rgba(144,144,176,0.1)" };
                            const conf = t.confidence || 75;
                            const confColor = conf >= 75 ? "#4ade80" : conf >= 55 ? "#fb923c" : "#f87171";
                            return (
                              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.deep, border: "2px solid #e8b84b40", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: C.gold }}>{t.week}</span>
                                </div>
                                <div style={{ flex: 1, background: C.deep, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5, gap: 8 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: C.heading }}>{t.action}</span>
                                    <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                                      <span style={{ fontSize: 9, padding: "2px 7px", background: `${confColor}12`, color: confColor, borderRadius: 20, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace" }}>{conf}% conf.</span>
                                      <span style={{ fontSize: 10, padding: "2px 8px", background: ch.bg, color: ch.color, borderRadius: 20, fontWeight: 600 }}>{t.channel}</span>
                                    </div>
                                  </div>
                                  <p style={{ fontSize: 11, color: C.body, lineHeight: 1.5, margin: 0 }}>{t.goal}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="reveal-5" style={card()}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <SectionLabel style={{ marginBottom: 0 }}>Draft outreach email</SectionLabel>
                        <CopyBtn text={`Subject: ${strategy.email_subject}\n\n${strategy.email_body}`} />
                      </div>
                      <div style={{ background: C.deep, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
                        <p style={{ fontSize: 11, color: C.body, marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ color: C.label }}>Subject: </span>{strategy.email_subject}
                        </p>
                        <p style={{ fontSize: 13, color: C.body, lineHeight: 1.75, whiteSpace: "pre-wrap", margin: 0 }}>{strategy.email_body}</p>
                      </div>
                    </div>

                    {/* Simulate Inaction */}
                    <div className="reveal-6">
                      <button className="inaction-btn" onClick={() => setShowInaction(v => !v)}
                        style={{ width: "100%", padding: "11px 18px", fontSize: 12, fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 600, cursor: "pointer", border: "1px solid #3a3a52", borderRadius: 10, background: "transparent", color: C.label, letterSpacing: "0.2px" }}>
                        {showInaction ? "Hide" : "⚠ What if we do nothing?"}
                      </button>
                    </div>

                    {showInaction && inaction && (
                      <div className="inaction-panel" style={{ ...card(), borderColor: "rgba(248,113,113,0.25)", background: "rgba(248,113,113,0.03)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                          <span style={{ fontSize: 13 }}>⚠️</span>
                          <p style={{ fontSize: 11, fontWeight: 600, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.6px" }}>Projected cost of inaction · 90 days</p>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
                          {[
                            { label: "Revenue at risk", value: `$${(inaction.projectedLoss / 1000).toFixed(0)}K`, color: "#f87171" },
                            { label: "Bookings lost", value: `${inaction.bookingsAtRisk} events`, color: "#fb923c" },
                            { label: "Guests at risk", value: `${inaction.guestsAtRisk} people`, color: "#fb923c" },
                          ].map(m => (
                            <div key={m.label} style={{ background: C.deep, border: "1px solid rgba(248,113,113,0.15)", borderRadius: 8, padding: "10px 12px" }}>
                              <p style={{ fontSize: 10, color: C.label, marginBottom: 4 }}>{m.label}</p>
                              <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 700, color: m.color }}>{m.value}</p>
                            </div>
                          ))}
                        </div>
                        <div style={{ padding: "9px 12px", background: `${inaction.riskColor}10`, border: `1px solid ${inaction.riskColor}30`, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: C.body }}>Competitive displacement risk</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: inaction.riskColor, fontFamily: "'IBM Plex Mono',monospace" }}>{inaction.risk}</span>
                        </div>
                      </div>
                    )}

                    <div className="reveal-7">
                      <button onClick={() => { setStrategy(null); setRevealed(false); setShowInaction(false); }}
                        style={{ fontSize: 12, padding: "9px 18px", borderRadius: 7, border: "1px solid #3a3a52", background: "transparent", color: C.body, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", width: "100%" }}
                        onMouseEnter={e => e.target.style.borderColor = C.gold}
                        onMouseLeave={e => e.target.style.borderColor = "#3a3a52"}>
                        ↺ Regenerate strategy
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
          <p style={{ fontSize: 10, color: C.label, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: "0.5px" }}>
            BUILT BY RAFAEL LEMOR · LUCKY STRIKE ENTERTAINMENT · POWERED BY ANTHROPIC CLAUDE
          </p>
        </div>
      </main>
    </>
  );
}
