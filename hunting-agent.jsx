import { useState, useEffect, useRef } from "react";

const STANDS = [
  { id: "s1", name: "Ridge Line Stand", lat: 38.921, lng: -92.413, type: "treestand", activity: 94 },
  { id: "s2", name: "Creek Crossing", lat: 38.918, lng: -92.408, type: "ground blind", activity: 71 },
  { id: "s3", name: "Oak Flat", lat: 38.925, lng: -92.417, type: "treestand", activity: 88 },
  { id: "s4", name: "Pinch Point", lat: 38.915, lng: -92.404, type: "treestand", activity: 62 },
  { id: "s5", name: "South Field Edge", lat: 38.911, lng: -92.411, type: "ground blind", activity: 45 },
];

const DEER_PROFILES = [
  {
    id: "d1", name: "Tall 10", score: 162, age: "5.5+", encounters: 47,
    lastSeen: "Ridge Line Stand", lastSeenTime: "6:24 AM", daysAgo: 0,
    pattern: "Pre-dawn mover, consistent SE-NW travel corridor",
    peakWindows: ["5:45–7:15 AM", "5:30–7:00 PM"],
    preferredStands: ["Ridge Line Stand", "Oak Flat"],
    predictedNext: "Ridge Line Stand — Tomorrow 6:10 AM",
    confidence: 87,
    photo: null,
    sightings: [
      { stand: "Ridge Line Stand", time: "6:24 AM", date: "Today", behavior: "Feeding" },
      { stand: "Oak Flat", time: "6:01 AM", date: "3 days ago", behavior: "Traveling" },
      { stand: "Ridge Line Stand", time: "5:58 AM", date: "5 days ago", behavior: "Scraping" },
    ]
  },
  {
    id: "d2", name: "Split Brow", score: 148, age: "4.5", encounters: 31,
    lastSeen: "Creek Crossing", lastSeenTime: "7:02 PM", daysAgo: 1,
    pattern: "Evening creek walker, enters from CRP to the south",
    peakWindows: ["6:45–8:00 PM"],
    preferredStands: ["Creek Crossing", "South Field Edge"],
    predictedNext: "Creek Crossing — Tonight 7:15 PM",
    confidence: 74,
    photo: null,
    sightings: [
      { stand: "Creek Crossing", time: "7:02 PM", date: "Yesterday", behavior: "Cruising" },
      { stand: "South Field Edge", time: "6:55 PM", date: "4 days ago", behavior: "Feeding" },
    ]
  },
  {
    id: "d3", name: "Crab Claw", score: 134, age: "3.5", encounters: 19,
    lastSeen: "Pinch Point", lastSeenTime: "5:48 PM", daysAgo: 2,
    pattern: "Irregular, nocturnal tendency — most daylight hits during rut",
    peakWindows: ["5:30–6:30 PM", "Rut only: all day"],
    preferredStands: ["Pinch Point"],
    predictedNext: "Pinch Point — Rut window (Nov 5–12)",
    confidence: 51,
    photo: null,
    sightings: [
      { stand: "Pinch Point", time: "5:48 PM", date: "2 days ago", behavior: "Checking scrape" },
    ]
  },
];

const CAMERA_FEEDS = [
  { id: "c1", name: "Ridge Cam", stand: "s1", lastTrigger: "6:24 AM", detections: 12, todayBucks: 2, status: "live" },
  { id: "c2", name: "Creek Cam", stand: "s2", lastTrigger: "7:02 PM Yesterday", detections: 8, todayBucks: 1, status: "live" },
  { id: "c3", name: "Oak Flat Cam", stand: "s3", lastTrigger: "5:51 AM", detections: 6, todayBucks: 1, status: "live" },
  { id: "c4", name: "Pinch Cam", stand: "s4", lastTrigger: "2 days ago", detections: 3, todayBucks: 0, status: "delayed" },
];

const WIND_DATA = { direction: "NW", speed: "8 mph", optimal: ["Ridge Line Stand", "Oak Flat"] };

const PRESSURE_DATA = [28.9, 29.1, 29.3, 29.6, 29.8, 29.5, 29.2, 28.8];
const PRESSURE_LABELS = ["6d", "5d", "4d", "3d", "2d", "1d", "Now", "Fcst"];

function AIConsole({ query, onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: `Analyzing your property data for: "${query}"...` }
  ]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const context = `You are an elite whitetail hunting intelligence AI assistant embedded in a property management dashboard. You have access to:
- 5 stands: Ridge Line Stand (94% activity), Oak Flat (88%), Creek Crossing (71%), Pinch Point (62%), South Field Edge (45%)
- 3 tracked bucks: "Tall 10" (162" B&C, 5.5yr, 47 encounters, last seen Ridge Line this morning 6:24 AM), "Split Brow" (148", 4.5yr, Creek Crossing last evening), "Crab Claw" (134", 3.5yr, Pinch Point 2 days ago)
- 4 trail cameras with Deer ID AI: Ridge Cam, Creek Cam, Oak Flat Cam, Pinch Cam
- Current wind: NW at 8 mph (favorable for Ridge Line and Oak Flat)
- Barometric pressure: rising trend, currently 29.2 inHg
- ONX property layer with travel corridors, food sources, bedding areas mapped
- Historical pattern data: Tall 10 is a consistent pre-dawn mover on a SE-NW corridor. Split Brow is an evening creek walker entering from southern CRP. Crab Claw is largely nocturnal outside rut.

Be specific, tactical, and data-driven. Reference actual stand names, buck names, times, wind directions, and pressure trends. Give real hunting advice based on this data. Keep answers to 3-5 sentences unless a breakdown is specifically requested.`;

    async function fetchAI() {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: context,
            messages: [{ role: "user", content: query }]
          })
        });
        const data = await res.json();
        const text = data.content?.find(b => b.type === "text")?.text || "Unable to generate analysis.";
        setMessages([{ role: "assistant", text }]);
      } catch {
        setMessages([{ role: "assistant", text: "Error connecting to hunting intelligence engine. Check your connection." }]);
      }
      setLoading(false);
    }
    fetchAI();
  }, [query]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    const context = `You are an elite whitetail hunting intelligence AI. Property data: 5 stands (Ridge Line Stand 94% activity, Oak Flat 88%, Creek Crossing 71%, Pinch Point 62%, South Field Edge 45%), 3 tracked bucks (Tall 10 162" 5.5yr last seen Ridge Line 6:24AM today, Split Brow 148" Creek Crossing last evening, Crab Claw 134" Pinch Point 2 days ago), wind NW 8mph, rising barometric pressure 29.2 inHg. Be tactical and specific.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: context,
          messages: newMessages.map(m => ({ role: m.role, content: m.text }))
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "No response.";
      setMessages([...newMessages, { role: "assistant", text }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", text: "Connection error." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
    }}>
      <div style={{
        background: "#0d1117", border: "1px solid #2a3a2a", borderRadius: "12px",
        width: "100%", maxWidth: "680px", maxHeight: "80vh", display: "flex", flexDirection: "column",
        boxShadow: "0 0 60px rgba(74,161,74,0.15)"
      }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #1a2a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#4aa14a", fontFamily: "monospace", fontSize: "11px", letterSpacing: "2px", marginBottom: "4px" }}>HUNTING INTELLIGENCE ENGINE</div>
            <div style={{ color: "#e8e0d0", fontFamily: "'Georgia', serif", fontSize: "16px" }}>AI Field Analysis</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #2a3a2a", borderRadius: "6px", color: "#666", padding: "6px 12px", cursor: "pointer", fontSize: "12px" }}>✕ Close</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                background: m.role === "assistant" ? "#1a3a1a" : "#1a2533",
                border: `1px solid ${m.role === "assistant" ? "#4aa14a" : "#4a7aa1"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px"
              }}>
                {m.role === "assistant" ? "🎯" : "👤"}
              </div>
              <div style={{
                background: m.role === "assistant" ? "#0f1f0f" : "#0f1a2a",
                border: `1px solid ${m.role === "assistant" ? "#1a3a1a" : "#1a2a3a"}`,
                borderRadius: "8px", padding: "12px 16px",
                color: "#c8c0b0", fontSize: "13px", lineHeight: "1.7",
                fontFamily: "'Georgia', serif"
              }}>
                {loading && i === messages.length - 1 && m.role === "assistant" && messages.length === 1
                  ? <span style={{ color: "#4aa14a" }}>Analyzing property data<span className="dots">...</span></span>
                  : m.text}
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role === "user" && (
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1a3a1a", border: "1px solid #4aa14a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>🎯</div>
              <div style={{ background: "#0f1f0f", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "12px 16px", color: "#4aa14a", fontSize: "13px" }}>Thinking...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #1a2a1a", display: "flex", gap: "10px" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Ask about stands, bucks, wind, timing..."
            style={{
              flex: 1, background: "#0f1f0f", border: "1px solid #2a3a2a", borderRadius: "8px",
              padding: "10px 14px", color: "#e8e0d0", fontSize: "13px", outline: "none",
              fontFamily: "'Georgia', serif"
            }}
          />
          <button onClick={sendMessage} disabled={loading} style={{
            background: loading ? "#1a2a1a" : "#2a5a2a", border: "1px solid #4aa14a",
            borderRadius: "8px", padding: "10px 18px", color: "#4aa14a",
            cursor: loading ? "not-allowed" : "pointer", fontSize: "12px", fontFamily: "monospace", letterSpacing: "1px"
          }}>
            {loading ? "..." : "SEND"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniMap({ selectedStand }) {
  const stands = STANDS;
  const minLat = Math.min(...stands.map(s => s.lat)) - 0.002;
  const maxLat = Math.max(...stands.map(s => s.lat)) + 0.002;
  const minLng = Math.min(...stands.map(s => s.lng)) - 0.002;
  const maxLng = Math.max(...stands.map(s => s.lng)) + 0.002;

  const toX = (lng) => ((lng - minLng) / (maxLng - minLng)) * 320;
  const toY = (lat) => (1 - (lat - minLat) / (maxLat - minLat)) * 180;

  const corridors = [
    [stands[0], stands[2]], [stands[1], stands[4]], [stands[0], stands[3]]
  ];

  return (
    <svg width="320" height="180" style={{ display: "block" }}>
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a2a1a" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="320" height="180" fill="#080f08" />
      <rect width="320" height="180" fill="url(#grid)" />

      {/* Terrain blobs */}
      <ellipse cx="160" cy="60" rx="80" ry="30" fill="#0d1a0d" opacity="0.8" />
      <ellipse cx="80" cy="130" rx="50" ry="20" fill="#0a160a" opacity="0.6" />

      {/* Travel corridors */}
      {corridors.map(([a, b], i) => (
        <line key={i}
          x1={toX(a.lng)} y1={toY(a.lat)}
          x2={toX(b.lng)} y2={toY(b.lat)}
          stroke="#4aa14a" strokeWidth="1" strokeDasharray="4,4" opacity="0.3"
        />
      ))}

      {/* Wind arrow */}
      <g transform="translate(290,20)">
        <circle r="12" fill="#0d1a1a" stroke="#4a8aa1" strokeWidth="1" />
        <text x="0" y="4" textAnchor="middle" fill="#4a8aa1" fontSize="8" fontFamily="monospace">NW</text>
      </g>

      {/* Stands */}
      {stands.map(s => {
        const x = toX(s.lng), y = toY(s.lat);
        const selected = selectedStand === s.id;
        const isOptimal = WIND_DATA.optimal.includes(s.name);
        return (
          <g key={s.id} transform={`translate(${x},${y})`}>
            {selected && <circle r="14" fill="none" stroke="#e8b84a" strokeWidth="1.5" opacity="0.6" />}
            {isOptimal && <circle r="10" fill="none" stroke="#4aa14a" strokeWidth="1" opacity="0.5" />}
            <circle r="5" fill={selected ? "#e8b84a" : isOptimal ? "#4aa14a" : "#2a4a2a"} stroke="#000" strokeWidth="1" />
            <text x="7" y="-6" fill="#9a9a8a" fontSize="7" fontFamily="monospace">{s.name.split(" ")[0]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function PressureChart() {
  const max = Math.max(...PRESSURE_DATA), min = Math.min(...PRESSURE_DATA);
  const range = max - min || 0.1;
  const w = 260, h = 60;
  const pts = PRESSURE_DATA.map((v, i) => ({
    x: (i / (PRESSURE_DATA.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 10) - 5
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = path + ` L${w},${h} L0,${h} Z`;

  return (
    <svg width={w} height={h + 20} style={{ display: "block" }}>
      <defs>
        <linearGradient id="pressGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4aa14a" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4aa14a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#pressGrad)" />
      <path d={path} fill="none" stroke="#4aa14a" strokeWidth="1.5" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="2.5" fill={i === 6 ? "#e8b84a" : "#4aa14a"} />
          <text x={p.x} y={h + 14} textAnchor="middle" fill="#555" fontSize="8" fontFamily="monospace">
            {PRESSURE_LABELS[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function HuntingAgent() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDeer, setSelectedDeer] = useState(DEER_PROFILES[0]);
  const [selectedStand, setSelectedStand] = useState("s1");
  const [aiQuery, setAiQuery] = useState(null);
  const [queryInput, setQueryInput] = useState("");

  const TABS = ["overview", "bucks", "cameras", "stands", "intel"];

  const stand = STANDS.find(s => s.id === selectedStand);

  function openAI(q) { setAiQuery(q); }

  return (
    <div style={{
      minHeight: "100vh", background: "#060c06",
      fontFamily: "'Georgia', serif", color: "#c8c0b0",
      position: "relative"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #080f08; } ::-webkit-scrollbar-thumb { background: #2a4a2a; }
        .tab-btn:hover { background: #1a2a1a !important; }
        .card-hover:hover { border-color: #3a5a3a !important; }
        .action-btn:hover { background: #2a5a2a !important; }
        .deer-card:hover { background: #0f1a0f !important; border-color: #3a5a3a !important; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        .glow-ring { animation: glowRing 3s infinite; }
        @keyframes glowRing { 0%,100% { box-shadow: 0 0 8px rgba(74,161,74,0.2) } 50% { box-shadow: 0 0 20px rgba(74,161,74,0.5) } }
      `}</style>

      {aiQuery && <AIConsole query={aiQuery} onClose={() => setAiQuery(null)} />}

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a2a1a", padding: "0 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ fontSize: "22px" }}>🦌</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#e8e0d0", fontWeight: 600, lineHeight: 1 }}>APEX HUNT</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#4aa14a", letterSpacing: "2px", marginTop: "2px" }}>PROPERTY INTELLIGENCE</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div className="pulse" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4aa14a" }} />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#4aa14a" }}>4 CAMERAS LIVE</span>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#666" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ borderBottom: "1px solid #1a2a1a", padding: "0 24px", background: "#080f08" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "4px" }}>
          {TABS.map(t => (
            <button key={t} className="tab-btn" onClick={() => setActiveTab(t)} style={{
              padding: "12px 20px", background: activeTab === t ? "#1a2a1a" : "none",
              border: "none", borderBottom: activeTab === t ? "2px solid #4aa14a" : "2px solid transparent",
              color: activeTab === t ? "#e8e0d0" : "#666", cursor: "pointer", fontSize: "11px",
              fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "1.5px", textTransform: "uppercase",
              transition: "all 0.2s"
            }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>

            {/* Today's Recommendation */}
            <div className="glow-ring" style={{
              gridColumn: "1 / -1", background: "#0a1a0a",
              border: "1px solid #2a5a2a", borderRadius: "12px", padding: "24px",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#4aa14a", letterSpacing: "2px", marginBottom: "8px" }}>TODAY'S TOP PLAY</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", color: "#e8e0d0", fontWeight: 700, marginBottom: "8px" }}>
                  Ridge Line Stand — AM Hunt
                </div>
                <div style={{ color: "#9a9a8a", fontSize: "13px", lineHeight: "1.6", maxWidth: "600px" }}>
                  Tall 10 was captured at 6:24 AM this morning. NW wind is perfect for entry from the south. Rising barometric pressure favors morning movement. 87% prediction confidence for a repeat encounter tomorrow at first light.
                </div>
              </div>
              <div style={{ textAlign: "center", minWidth: "100px" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "48px", color: "#4aa14a", lineHeight: 1 }}>87</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#4aa14a", letterSpacing: "1px" }}>% CONFIDENCE</div>
              </div>
            </div>

            {/* Wind */}
            <div className="card-hover" style={{ background: "#0a140a", border: "1px solid #1a2a1a", borderRadius: "12px", padding: "20px", transition: "border-color 0.2s" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#4aa14a", letterSpacing: "2px", marginBottom: "16px" }}>WIND CONDITIONS</div>
              <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "36px", transform: "rotate(-315deg)", display: "inline-block" }}>↑</div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#e8e0d0" }}>{WIND_DATA.direction}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#666" }}>{WIND_DATA.speed}</div>
                </div>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#4aa14a", marginBottom: "8px" }}>OPTIMAL STANDS:</div>
              {WIND_DATA.optimal.map(s => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#4aa14a" }} />
                  <span style={{ fontSize: "12px", color: "#c8c0b0" }}>{s}</span>
                </div>
              ))}
            </div>

            {/* Pressure */}
            <div className="card-hover" style={{ background: "#0a140a", border: "1px solid #1a2a1a", borderRadius: "12px", padding: "20px", transition: "border-color 0.2s" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#4aa14a", letterSpacing: "2px", marginBottom: "16px" }}>BAROMETRIC PRESSURE</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#e8e0d0" }}>29.2 <span style={{ fontSize: "14px", color: "#666" }}>inHg</span></div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#e8b84a" }}>↑ RISING</div>
              </div>
              <PressureChart />
              <div style={{ marginTop: "8px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#666" }}>Rising pressure = increased daytime movement</div>
            </div>

            {/* Buck Summary */}
            <div className="card-hover" style={{ background: "#0a140a", border: "1px solid #1a2a1a", borderRadius: "12px", padding: "20px", transition: "border-color 0.2s" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#4aa14a", letterSpacing: "2px", marginBottom: "16px" }}>TRACKED BUCKS</div>
              {DEER_PROFILES.map(d => (
                <div key={d.id} onClick={() => { setActiveTab("bucks"); setSelectedDeer(d); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #0f1a0f", cursor: "pointer" }}>
                  <div>
                    <div style={{ color: "#e8e0d0", fontSize: "13px", fontWeight: 600 }}>{d.name}</div>
                    <div style={{ color: "#666", fontSize: "10px", fontFamily: "'IBM Plex Mono', monospace" }}>{d.lastSeen} · {d.daysAgo === 0 ? "Today" : `${d.daysAgo}d ago`}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#4aa14a", fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px" }}>{d.confidence}%</div>
                    <div style={{ color: "#666", fontSize: "10px" }}>{d.score}"</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Property Map */}
            <div className="card-hover" style={{ gridColumn: "2 / 4", background: "#0a140a", border: "1px solid #1a2a1a", borderRadius: "12px", padding: "20px", transition: "border-color 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#4aa14a", letterSpacing: "2px" }}>PROPERTY MAP</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#666" }}>ONX SYNC ACTIVE</div>
              </div>
              <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #1a2a1a" }}>
                <MiniMap selectedStand={selectedStand} />
              </div>
              <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4aa14a" }} />
                  <span style={{ fontSize: "10px", color: "#666", fontFamily: "monospace" }}>Optimal Wind</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#e8b84a" }} />
                  <span style={{ fontSize: "10px", color: "#666", fontFamily: "monospace" }}>Selected</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "20px", height: "1px", background: "#4aa14a", opacity: 0.4 }} />
                  <span style={{ fontSize: "10px", color: "#666", fontFamily: "monospace" }}>Travel Corridor</span>
                </div>
              </div>
            </div>

            {/* AI Query Box */}
            <div style={{ gridColumn: "1 / -1", background: "#0a140a", border: "1px solid #2a4a2a", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#4aa14a", letterSpacing: "2px", marginBottom: "12px" }}>ASK THE HUNTING INTELLIGENCE ENGINE</div>
              <div style={{ display: "flex", gap: "10px" }}>
                <input value={queryInput} onChange={e => setQueryInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && queryInput.trim() && (openAI(queryInput), setQueryInput(""))}
                  placeholder='e.g. "Should I hunt Ridge Line tonight?" or "What's Tall 10\'s pattern this week?"'
                  style={{
                    flex: 1, background: "#060c06", border: "1px solid #2a3a2a", borderRadius: "8px",
                    padding: "12px 16px", color: "#e8e0d0", fontSize: "13px", outline: "none",
                    fontFamily: "'Georgia', serif"
                  }}
                />
                <button className="action-btn" onClick={() => { if (queryInput.trim()) { openAI(queryInput); setQueryInput(""); } }} style={{
                  background: "#1a4a1a", border: "1px solid #4aa14a", borderRadius: "8px",
                  padding: "12px 20px", color: "#4aa14a", cursor: "pointer",
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1px",
                  transition: "background 0.2s"
                }}>ANALYZE →</button>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                {["Best stand for tomorrow AM?", "Where is Tall 10 likely tonight?", "Should I hunt with today's wind?", "Rut prediction this week?"].map(q => (
                  <button key={q} onClick={() => openAI(q)} style={{
                    background: "none", border: "1px solid #1a2a1a", borderRadius: "20px",
                    padding: "4px 12px", color: "#666", cursor: "pointer", fontSize: "10px",
                    fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = "#4aa14a"; e.target.style.color = "#4aa14a"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "#1a2a1a"; e.target.style.color = "#666"; }}
                  >{q}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BUCKS TAB */}
        {activeTab === "bucks" && (
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {DEER_PROFILES.map(d => (
                <div key={d.id} className="deer-card" onClick={() => setSelectedDeer(d)} style={{
                  background: selectedDeer.id === d.id ? "#0f1a0f" : "#0a140a",
                  border: `1px solid ${selectedDeer.id === d.id ? "#4aa14a" : "#1a2a1a"}`,
                  borderRadius: "10px", padding: "16px", cursor: "pointer", transition: "all 0.2s"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#e8e0d0", fontWeight: 600 }}>{d.name}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#4aa14a" }}>{d.score}"</div>
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#666", marginBottom: "4px" }}>{d.age} yr · {d.encounters} encounters</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: d.daysAgo === 0 ? "#4aa14a" : "#e8b84a" }}>
                    {d.daysAgo === 0 ? "● TODAY" : `${d.daysAgo}d ago`} — {d.lastSeen}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "#0a140a", border: "1px solid #2a4a2a", borderRadius: "12px", padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#4aa14a", letterSpacing: "2px", marginBottom: "6px" }}>BUCK PROFILE</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", color: "#e8e0d0", fontWeight: 700 }}>{selectedDeer.name}</div>
                    <div style={{ color: "#9a9a8a", fontSize: "13px", marginTop: "4px" }}>{selectedDeer.pattern}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "40px", color: "#4aa14a", lineHeight: 1 }}>{selectedDeer.confidence}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#4aa14a", letterSpacing: "1px" }}>% CONFIDENCE</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                  {[
                    { label: "Score", val: `${selectedDeer.score}"` },
                    { label: "Age", val: selectedDeer.age + " yr" },
                    { label: "Encounters", val: selectedDeer.encounters },
                  ].map(item => (
                    <div key={item.label} style={{ background: "#060c06", borderRadius: "8px", padding: "12px" }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#666", marginBottom: "4px" }}>{item.label}</div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#e8e0d0" }}>{item.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#060c06", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#4aa14a", letterSpacing: "2px", marginBottom: "12px" }}>NEXT PREDICTED ENCOUNTER</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#e8b84a" }}>{selectedDeer.predictedNext}</div>
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#4aa14a", letterSpacing: "2px", marginBottom: "10px" }}>PEAK MOVEMENT WINDOWS</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {selectedDeer.peakWindows.map(w => (
                      <div key={w} style={{ background: "#0f2a0f", border: "1px solid #2a4a2a", borderRadius: "6px", padding: "6px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#4aa14a" }}>{w}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ background: "#0a140a", border: "1px solid #1a2a1a", borderRadius: "12px", padding: "20px" }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#4aa14a", letterSpacing: "2px", marginBottom: "16px" }}>RECENT SIGHTINGS LOG</div>
                {selectedDeer.sightings.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: "16px", padding: "12px 0", borderBottom: "1px solid #0f1a0f" }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#666", minWidth: "80px" }}>{s.date}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#e8b84a", minWidth: "70px" }}>{s.time}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", color: "#c8c0b0" }}>{s.stand}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#4aa14a" }}>{s.behavior}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="action-btn" onClick={() => openAI(`Give me a detailed tactical breakdown on ${selectedDeer.name} — his patterns, best stands to hunt him, ideal conditions, and what stand I should be in to kill him this week.`)} style={{
                background: "#1a3a1a", border: "1px solid #4aa14a", borderRadius: "10px", padding: "16px",
                color: "#4aa14a", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "11px", letterSpacing: "1px", transition: "background 0.2s"
              }}>
                🎯 GENERATE FULL AI HUNT PLAN FOR {selectedDeer.name.toUpperCase()}
              </button>
            </div>
          </div>
        )}

        {/* CAMERAS TAB */}
        {activeTab === "cameras" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {CAMERA_FEEDS.map(cam => {
              const stand = STANDS.find(s => s.id === cam.stand);
              return (
                <div key={cam.id} className="card-hover" style={{ background: "#0a140a", border: "1px solid #1a2a1a", borderRadius: "12px", overflow: "hidden", transition: "border-color 0.2s" }}>
                  {/* Camera preview area */}
                  <div style={{ background: "#040804", height: "160px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>📷</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#2a4a2a", letterSpacing: "2px" }}>LAST CAPTURE</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#4aa14a", marginTop: "4px" }}>{cam.lastTrigger}</div>
                    </div>
                    <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <div className={cam.status === "live" ? "pulse" : ""} style={{ width: "6px", height: "6px", borderRadius: "50%", background: cam.status === "live" ? "#4aa14a" : "#e8b84a" }} />
                      <span style={{ fontFamily: "monospace", fontSize: "9px", color: cam.status === "live" ? "#4aa14a" : "#e8b84a" }}>{cam.status.toUpperCase()}</span>
                    </div>
                    <div style={{ position: "absolute", top: "10px", left: "10px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "9px", color: "#4aa14a", background: "#0a1a0a", padding: "2px 6px", borderRadius: "4px", border: "1px solid #1a3a1a" }}>AI-ID ACTIVE</span>
                    </div>
                  </div>
                  <div style={{ padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#e8e0d0", fontWeight: 600 }}>{cam.name}</div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#666" }}>{stand?.name}</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                      <div style={{ background: "#060c06", borderRadius: "6px", padding: "10px" }}>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#666", marginBottom: "3px" }}>DETECTIONS TODAY</div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#e8e0d0" }}>{cam.detections}</div>
                      </div>
                      <div style={{ background: "#060c06", borderRadius: "6px", padding: "10px" }}>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#666", marginBottom: "3px" }}>BUCKS ID'd TODAY</div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: cam.todayBucks > 0 ? "#4aa14a" : "#666" }}>{cam.todayBucks}</div>
                      </div>
                    </div>
                    <button className="action-btn" onClick={() => openAI(`Analyze the camera data from ${cam.name} at ${stand?.name}. What patterns are you seeing, which bucks are hitting this location, and when should I hunt this stand based on the data?`)} style={{
                      width: "100%", background: "#0f1f0f", border: "1px solid #2a3a2a", borderRadius: "8px",
                      padding: "10px", color: "#4aa14a", cursor: "pointer",
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px",
                      transition: "background 0.2s"
                    }}>ANALYZE THIS CAMERA →</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STANDS TAB */}
        {activeTab === "stands" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {STANDS.map(s => {
              const isOptimal = WIND_DATA.optimal.includes(s.name);
              const cam = CAMERA_FEEDS.find(c => c.stand === s.id);
              return (
                <div key={s.id} className="card-hover" onClick={() => setSelectedStand(s.id)} style={{
                  background: selectedStand === s.id ? "#0f1a0f" : "#0a140a",
                  border: `1px solid ${selectedStand === s.id ? "#4aa14a" : isOptimal ? "#2a4a2a" : "#1a2a1a"}`,
                  borderRadius: "12px", padding: "20px", cursor: "pointer", transition: "all 0.2s"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#e8e0d0", fontWeight: 600 }}>{s.name}</div>
                        {isOptimal && <div style={{ background: "#0f2a0f", border: "1px solid #4aa14a", borderRadius: "4px", padding: "2px 6px", fontFamily: "monospace", fontSize: "8px", color: "#4aa14a" }}>✓ WIND</div>}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#666" }}>{s.type}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: s.activity > 80 ? "#4aa14a" : s.activity > 60 ? "#e8b84a" : "#666" }}>{s.activity}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#666" }}>ACTIVITY %</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ height: "4px", background: "#0f1a0f", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${s.activity}%`, background: s.activity > 80 ? "#4aa14a" : s.activity > 60 ? "#e8b84a" : "#666", borderRadius: "2px" }} />
                    </div>
                  </div>
                  {cam && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px" }}>
                      <span style={{ color: "#666" }}>Cam: {cam.name}</span>
                      <span style={{ color: cam.status === "live" ? "#4aa14a" : "#e8b84a" }}>{cam.detections} detections today</span>
                    </div>
                  )}
                </div>
              );
            })}
            <button className="action-btn" onClick={() => openAI("Based on today's wind direction (NW at 8mph), current barometric pressure (29.2 rising), and all buck activity data, rank my 5 stands from best to worst for tomorrow morning and explain why.")} style={{
              gridColumn: "1 / -1", background: "#1a3a1a", border: "1px solid #4aa14a", borderRadius: "10px",
              padding: "16px", color: "#4aa14a", cursor: "pointer",
              fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1px",
              transition: "background 0.2s"
            }}>
              🎯 AI RANK ALL STANDS FOR TOMORROW →
            </button>
          </div>
        )}

        {/* INTEL TAB */}
        {activeTab === "intel" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[
              { title: "Rut Prediction", q: "Based on the deer activity patterns and current date, give me a detailed rut prediction — when peak chasing, seeking, and lockdown will hit my property, and which stands to hunt during each phase." },
              { title: "Pressure & Recovery", q: "I've been hunting Ridge Line Stand 3 times this week. How much have I pressured it, when should I rest it, and what stand should I rotate to?" },
              { title: "Food Source Analysis", q: "Based on my cameras and buck movement patterns, where are the primary food sources on my property, and how are the bucks using them at different times of day?" },
              { title: "Entry/Exit Routes", q: "Give me the best entry and exit routes for Ridge Line Stand and Creek Crossing, minimizing scent contamination of the travel corridors based on the NW wind." },
              { title: "Weekly Hunt Plan", q: "Build me a complete 7-day hunt plan for the week. Tell me exactly which stand each morning and evening, what conditions to watch for, and when to stay home." },
              { title: "Historical Pattern Analysis", q: "Looking at all my camera and sighting data across the full season, what are the dominant movement patterns on my property and how should I adjust my hunting strategy?" },
            ].map(item => (
              <button key={item.title} className="action-btn" onClick={() => openAI(item.q)} style={{
                background: "#0a140a", border: "1px solid #1a2a1a", borderRadius: "12px", padding: "20px",
                textAlign: "left", cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#4aa14a"; e.currentTarget.style.background = "#0f1f0f"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2a1a"; e.currentTarget.style.background = "#0a140a"; }}
              >
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#e8e0d0", marginBottom: "8px", fontWeight: 600 }}>{item.title}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#4aa14a", letterSpacing: "1px" }}>ASK INTELLIGENCE ENGINE →</div>
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
