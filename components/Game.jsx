"use client";
/**
 * HOW NIGERIAN ARE YOU?
 * Production-ready React single-file component.
 *
 * DEPLOYMENT (Vercel / GitHub):
 * 1. npx create-next-app@latest hna --app --js
 * 2. Replace contents of app/page.js with:
 *      import Game from "@/components/Game";
 *      export default function Page() { return <Game />; }
 * 3. Copy this file to components/Game.jsx (add "use client"; as first line)
 * 4. npm run build && vercel deploy
 *
 * Leaderboard uses localStorage — works with zero backend.
 * To upgrade to Supabase, swap the two functions marked SUPABASE_SWAP below.
 */

import { useState, useEffect, useRef } from "react";

// ─── SAFE BASE64 ─────────────────────────────────────────────────────────────
// btoa() crashes on Unicode/emoji. This wrapper handles it safely.
function safeEncode(obj) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))); }
  catch { return btoa(JSON.stringify(obj).replace(/[^\x00-\x7F]/g, "?")); }
}
function safeDecode(str) {
  try { return JSON.parse(decodeURIComponent(escape(atob(str)))); }
  catch { try { return JSON.parse(atob(str)); } catch { return null; } }
}

// ─── STATE DATA ───────────────────────────────────────────────────────────────
const STATES = [
  { name:"Abia",        zone:"South East",    abbr:"AB" },
  { name:"Adamawa",     zone:"North East",    abbr:"AD" },
  { name:"Akwa Ibom",   zone:"South South",   abbr:"AK" },
  { name:"Anambra",     zone:"South East",    abbr:"AN" },
  { name:"Bauchi",      zone:"North East",    abbr:"BA" },
  { name:"Bayelsa",     zone:"South South",   abbr:"BY" },
  { name:"Benue",       zone:"North Central", abbr:"BE" },
  { name:"Borno",       zone:"North East",    abbr:"BO" },
  { name:"Cross River", zone:"South South",   abbr:"CR" },
  { name:"Delta",       zone:"South South",   abbr:"DE" },
  { name:"Ebonyi",      zone:"South East",    abbr:"EB" },
  { name:"Edo",         zone:"South South",   abbr:"ED" },
  { name:"Ekiti",       zone:"South West",    abbr:"EK" },
  { name:"Enugu",       zone:"South East",    abbr:"EN" },
  { name:"FCT Abuja",   zone:"North Central", abbr:"FC" },
  { name:"Gombe",       zone:"North East",    abbr:"GO" },
  { name:"Imo",         zone:"South East",    abbr:"IM" },
  { name:"Jigawa",      zone:"North West",    abbr:"JI" },
  { name:"Kaduna",      zone:"North West",    abbr:"KD" },
  { name:"Kano",        zone:"North West",    abbr:"KN" },
  { name:"Katsina",     zone:"North West",    abbr:"KT" },
  { name:"Kebbi",       zone:"North West",    abbr:"KE" },
  { name:"Kogi",        zone:"North Central", abbr:"KO" },
  { name:"Kwara",       zone:"North Central", abbr:"KW" },
  { name:"Lagos",       zone:"South West",    abbr:"LA" },
  { name:"Nasarawa",    zone:"North Central", abbr:"NA" },
  { name:"Niger",       zone:"North Central", abbr:"NI" },
  { name:"Ogun",        zone:"South West",    abbr:"OG" },
  { name:"Ondo",        zone:"South West",    abbr:"ON" },
  { name:"Osun",        zone:"South West",    abbr:"OS" },
  { name:"Oyo",         zone:"South West",    abbr:"OY" },
  { name:"Plateau",     zone:"North Central", abbr:"PL" },
  { name:"Rivers",      zone:"South South",   abbr:"RI" },
  { name:"Sokoto",      zone:"North West",    abbr:"SO" },
  { name:"Taraba",      zone:"North East",    abbr:"TA" },
  { name:"Yobe",        zone:"North East",    abbr:"YO" },
  { name:"Zamfara",     zone:"North West",    abbr:"ZA" },
];

const ZONES = ["North West","North East","North Central","South West","South East","South South"];

// Zone colours used on the grid map
const ZONE_COLOR = {
  "North West":  { base:"#1a3a5c", visited:"#3b82f6", label:"#93c5fd" },
  "North East":  { base:"#1a3d2a", visited:"#16a34a", label:"#86efac" },
  "North Central":{ base:"#2e1f4a", visited:"#8b5cf6", label:"#c4b5fd" },
  "South West":  { base:"#3d1515", visited:"#dc2626", label:"#fca5a5" },
  "South East":  { base:"#1a3333", visited:"#0d9488", label:"#5eead4" },
  "South South": { base:"#1c3320", visited:"#15803d", label:"#4ade80" },
};

// ─── MAP GRID ─────────────────────────────────────────────────────────────────
// 7 columns × 7 rows. Mirrors Nigeria's north-south, west-east geography.
// Empty strings are blank cells that preserve spatial shape.
const MAP_GRID = [
  ["Sokoto",    "Kebbi",     "Zamfara",   "Katsina",    "Kano",       "Jigawa",    "Yobe"     ],
  ["",          "",          "Niger",     "Kaduna",     "Bauchi",     "Gombe",     "Borno"    ],
  ["",          "",          "Kwara",     "FCT Abuja",  "Nasarawa",   "Plateau",   "Adamawa"  ],
  ["",          "",          "Kogi",      "Benue",      "",           "Taraba",    ""         ],
  ["Lagos",     "Ogun",      "Oyo",       "Osun",       "Ekiti",      "Ondo",      "Edo"      ],
  ["",          "",          "Anambra",   "Imo",        "Abia",       "Enugu",     "Ebonyi"   ],
  ["",          "Bayelsa",   "Delta",     "Rivers",     "Cross River","Akwa Ibom", ""         ],
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getTitleText(s) {
  if (s === 0)  return "Stay At Home Boss";
  if (s <= 3)   return "Village Champion";
  if (s <= 6)   return "Owambe Commuter";
  if (s <= 9)   return "Inter State Operator";
  if (s <= 12)  return "National Road Veteran";
  if (s <= 15)  return "Country Cruiser Emeritus";
  if (s <= 18)  return "Area Commander of Travel";
  if (s <= 21)  return "Minister of Internal Affairs";
  if (s <= 24)  return "Naija Pathfinder";
  if (s <= 27)  return "Minister of Tourism";
  if (s <= 30)  return "Federal Character Ambassador";
  if (s <= 33)  return "Inspector General of States";
  if (s <= 35)  return "Grand Commander of the Federation";
  if (s <= 36)  return "Dangote of Travel";
  return "Mungo Park Reincarnated";
}

function getTitleEmoji(s) {
  if (s === 0)  return "🛋️";
  if (s <= 3)   return "🏘️";
  if (s <= 6)   return "🤔";
  if (s <= 9)   return "🚐";
  if (s <= 12)  return "🎉";
  if (s <= 15)  return "🌅";
  if (s <= 18)  return "🎖️";
  if (s <= 21)  return "👑";
  if (s <= 24)  return "🍢";
  if (s <= 27)  return "🧭";
  if (s <= 30)  return "📋";
  if (s <= 33)  return "💼";
  if (s <= 35)  return "🎩";
  if (s <= 36)  return "💰";
  return "🏆";
}

function getSummary(s) {
  if (s === 0)  return "Zero states. Not even your state of origin. We need to talk.";
  if (s <= 3)   return "At this point, even Google Maps is asking questions. When will you travel?";
  if (s <= 6)   return "Your travel experience begins and ends with your area and one cousin's wedding.";
  if (s <= 9)   return "You've scratched the surface. Nigeria has 37 stories — you've read some.";
  if (s <= 12)  return "You and interstate buses are clearly in a committed relationship.";
  if (s <= 15)  return "FRSC officers look at you with the familiarity reserved for regular customers.";
  if (s <= 18)  return "You've seen enough motor parks to write a PhD thesis on danfo culture.";
  if (s <= 21)  return "You've entered enough states to start saying things like 'traffic there is different.'";
  if (s <= 24)  return "Motor parks, roadside suya and random checkpoints are now part of your life story.";
  if (s <= 27)  return "You've covered serious ground. FRSC officers recognise your face on sight.";
  if (s <= 30)  return "Federal character? You embody it. Every geopolitical zone has a story about you.";
  if (s <= 33)  return "At this stage, you no longer travel. You embark on national assignments.";
  if (s <= 35)  return "At this point you are no longer a traveler. You are a national monument.";
  if (s <= 36)  return "One state short of perfection. Nigeria owes you a pension.";
  return "All 37. You can now conduct NYSC orientation for the entire country.";
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildResultObject(answers, nickname) {
  const visited    = Object.keys(answers).filter(k => answers[k]);
  const sc         = visited.length;
  const zMap       = {};
  ZONES.forEach(z => { zMap[z] = { zone:z, visited:0, total:0 }; });
  STATES.forEach(s => {
    zMap[s.zone].total++;
    if (visited.includes(s.name)) zMap[s.zone].visited++;
  });
  const zoneStats      = ZONES.map(z => zMap[z]);
  const zonesCompleted = zoneStats.filter(z => z.visited === z.total).length;
  const notVisited     = STATES.map(s => s.name).filter(n => !visited.includes(n));
  return {
    nickname: (nickname || "").trim() || "Anonymous",
    score: sc,
    pct: Math.round((sc / 37) * 100),
    visited,
    zoneStats,
    zonesCompleted,
    notVisited,
    title:   getTitleText(sc),
    emoji:   getTitleEmoji(sc),
    summary: getSummary(sc),
  };
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────
function lsGet(key, fallback = null) {
  try { const v = localStorage.getItem(key); return v != null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
function lsDel(key)      { try { localStorage.removeItem(key); } catch {} }

// ─── SUPABASE LEADERBOARD ─────────────────────────────────────────────────────
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function lb_read() {
  try {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/scores?select=id,nickname,score,ts&order=score.desc,ts.desc&limit=20`,
      { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
    );
    if (!res.ok) return lsGet("hna_lb", []);
    return await res.json();
  } catch {
    return lsGet("hna_lb", []);
  }
}

async function lb_write(entry) {
  try {
    await fetch(`${SUPA_URL}/rest/v1/scores`, {
      method: "POST",
      headers: {
        apikey: SUPA_KEY,
        Authorization: `Bearer ${SUPA_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(entry),
    });
  } catch {}
  // Always also write locally as fallback
  const rows = lsGet("hna_lb", []);
  rows.push({ ...entry, id: String(Date.now()) });
  rows.sort((a, b) => b.score - a.score || b.ts - a.ts);
  lsSet("hna_lb", rows.slice(0, 100));
}

// ─── URL ──────────────────────────────────────────────────────────────────────
function getBaseUrl() {
  try { return typeof window !== "undefined" ? window.location.href.split("?")[0] : ""; }
  catch { return ""; }
}
function buildChallengeUrl(nickname, score) {
  const payload = safeEncode({ nickname, score, title: getTitleText(score) });
  const base    = getBaseUrl();
  return base ? `${base}?challenge=${payload}` : `?challenge=${payload}`;
}

// ─── GRID MAP COMPONENT ───────────────────────────────────────────────────────
function NigeriaGridMap({ visited = [] }) {
  const visitedSet = new Set(visited);
  const stateZone  = Object.fromEntries(STATES.map(s => [s.name, s.zone]));
  const stateAbbr  = Object.fromEntries(STATES.map(s => [s.name, s.abbr]));

  const CELL = 44;   // px per cell
  const GAP  = 3;    // px gap
  const COLS = MAP_GRID[0].length;
  const ROWS = MAP_GRID.length;
  const W    = COLS * CELL + (COLS - 1) * GAP;
  const H    = ROWS * CELL + (ROWS - 1) * GAP;

  return (
    <div style={{ width:"100%", overflowX:"auto" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width:"100%", maxWidth:W, height:"auto", display:"block", margin:"0 auto" }}
        aria-label="Nigeria state grid map"
      >
        {MAP_GRID.map((row, ri) =>
          row.map((name, ci) => {
            if (!name) return null;
            const zone  = stateZone[name];
            const abbr  = stateAbbr[name];
            const isV   = visitedSet.has(name);
            const col   = ZONE_COLOR[zone];
            const fill  = isV ? col.visited : col.base;
            const textC = isV ? "#ffffff"   : col.label;
            const x     = ci * (CELL + GAP);
            const y     = ri * (CELL + GAP);

            return (
              <g key={name}>
                <rect
                  x={x} y={y} width={CELL} height={CELL} rx={5}
                  fill={fill}
                  stroke={isV ? textC : "rgba(255,255,255,0.08)"}
                  strokeWidth={isV ? 1.5 : 0.5}
                />
                {/* Abbreviation */}
                <text
                  x={x + CELL / 2}
                  y={y + CELL / 2 + (isV ? -2 : 2)}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={isV ? 9 : 8}
                  fontWeight={isV ? "800" : "500"}
                  fill={textC}
                  style={{ userSelect:"none", fontFamily:"'Sora','Segoe UI',sans-serif" }}
                >
                  {abbr}
                </text>
                {/* Green dot for visited */}
                {isV && (
                  <circle
                    cx={x + CELL - 7} cy={y + 7} r={3.5}
                    fill="#4ade80"
                  />
                )}
              </g>
            );
          })
        )}
      </svg>

      {/* Zone colour legend */}
      <div style={{
        display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
        gap:"5px 10px", marginTop:10, padding:"0 2px",
      }}>
        {ZONES.map(z => {
          const col     = ZONE_COLOR[z];
          const total   = STATES.filter(s => s.zone === z).length;
          const vCount  = visited.filter(n => STATES.find(s => s.name === n)?.zone === z).length;
          return (
            <div key={z} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{
                width:10, height:10, borderRadius:2,
                background: vCount > 0 ? col.visited : col.base,
                border:`1px solid ${col.label}`, flexShrink:0,
              }}/>
              <span style={{ color:"#9ca3af", fontSize:9, lineHeight:1.2 }}>
                {z} ({vCount}/{total})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
function Confetti({ active }) {
  const pts = useRef(
    Array.from({ length: 65 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2.5,
      dur: 2 + Math.random() * 2,
      color: ["#16a34a","#4ade80","#ffffff","#fbbf24","#f87171","#60a5fa"][i % 6],
      size: 5 + Math.random() * 7,
      rect: Math.random() > 0.5,
    }))
  );
  if (!active) return null;
  return (
    <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden" }}>
      <style>{`
        @keyframes cffall {
          0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pts.current.map(p => (
        <div key={p.id} style={{
          position:"absolute", left:`${p.x}%`, top:0,
          width:p.size, height:p.rect ? p.size * 0.45 : p.size,
          backgroundColor:p.color, borderRadius:p.rect ? 2 : "50%",
          animation:`cffall ${p.dur}s ${p.delay}s ease-in forwards`,
        }}/>
      ))}
    </div>
  );
}

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #052e16; }

  .hbtn {
    background: linear-gradient(135deg, #16a34a, #15803d);
    border: none; color: #fff; cursor: pointer; width: 100%;
    font-family: 'Sora','Segoe UI',sans-serif; font-weight: 800; font-size: 17px;
    padding: 16px 24px; border-radius: 16px;
    box-shadow: 0 6px 24px rgba(22,163,74,.4);
    transition: transform .15s, box-shadow .15s;
  }
  .hbtn:hover  { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(22,163,74,.6); }
  .hbtn:active { transform: translateY(0); }

  .hcard {
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 18px;
  }
  .htag {
    display: inline-block;
    background: rgba(74,222,128,.13); border: 1px solid rgba(74,222,128,.3);
    color: #4ade80; padding: 4px 13px; border-radius: 999px;
    font-size: 12px; font-weight: 700;
  }
  .sbtn {
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(255,255,255,.06);
    color: #fff; cursor: pointer;
    font-family: 'Sora','Segoe UI',sans-serif; font-size: 13px; font-weight: 600;
    padding: 11px 10px; border-radius: 12px;
    transition: background .15s;
    display: flex; align-items: center; justify-content: center; gap: 5px;
  }
  .sbtn:hover { background: rgba(255,255,255,.13); }

  @keyframes hFadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes hFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes hPulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
  @keyframes hSlideIn { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes hReveal  { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
`;
const BG = "linear-gradient(155deg,#052e16 0%,#14532d 50%,#0f172a 100%)";
const FF = "'Sora','Segoe UI',sans-serif";

// Keys for localStorage
const LS_RESULT  = "hna_result";
const LS_SESSION = "hna_session";

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  // "landing" | "challenge" | "name" | "game" | "result" | "leaderboard"
  const [screen,     setScreen]     = useState("landing");
  const [nameInput,  setNameInput]  = useState("");
  const [nickname,   setNickname]   = useState("");
  const [stateOrder, setStateOrder] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers,    setAnswers]    = useState({});
  const [result,     setResult]     = useState(null);     // atomic — set before screen flip
  const [leaderboard,setLeaderboard]= useState([]);
  const [confetti,   setConfetti]   = useState(false);
  const [challenger, setChallenger] = useState(null);
  const [animating,  setAnimating]  = useState(false);
  const tapLock = useRef(false);

  // ── Initialise on mount ────────────────────────────────────────────────────
  useEffect(() => {
    // 1. Challenge link?
    try {
      const ch = new URLSearchParams(window.location.search).get("challenge");
      if (ch) {
        const d = safeDecode(ch);
        if (d?.nickname && typeof d.score === "number") {
          setChallenger(d);
          setScreen("challenge");
          return;
        }
      }
    } catch {}

    // 2. Persisted result from last completed game?
    //    This is what fixes the blank page on refresh / in-app browsers.
    const savedResult = lsGet(LS_RESULT);
    if (savedResult?.score != null) {
      setResult(savedResult);
      if (savedResult.score >= 25) setConfetti(true);
      setScreen("result");
      return;
    }

    // 3. Mid-game session?
    const sess = lsGet(LS_SESSION);
    if (sess?.stateOrder?.length && sess.currentIdx < sess.stateOrder.length) {
      setNickname(sess.nickname || "");
      setStateOrder(sess.stateOrder);
      setCurrentIdx(sess.currentIdx);
      setAnswers(sess.answers || {});
      setScreen("game");
    }
  }, []);

  // Refresh leaderboard whenever we land on those screens
  useEffect(() => {
    if (screen === "landing" || screen === "leaderboard")
      lb_read().then(rows => setLeaderboard((rows || []).slice(0, 20)));
  }, [screen]);

  // ── Game flow ──────────────────────────────────────────────────────────────
  function startGame(rawName) {
    const nick  = rawName.trim() || "Anonymous";
    const order = shuffle(STATES.map(s => s.name));
    setNickname(nick);
    setStateOrder(order);
    setCurrentIdx(0);
    setAnswers({});
    setResult(null);
    setConfetti(false);
    lsDel(LS_RESULT);
    lsSet(LS_SESSION, { nickname:nick, stateOrder:order, currentIdx:0, answers:{} });
    setScreen("game");
  }

  function handleAnswer(ans) {
    if (tapLock.current || animating) return;
    tapLock.current = true;
    setTimeout(() => { tapLock.current = false; }, 380);

    const newAnswers = { ...answers, [stateOrder[currentIdx]]: ans };
    setAnswers(newAnswers);
    setAnimating(true);

    setTimeout(() => {
      setAnimating(false);
      const next = currentIdx + 1;

      if (next >= stateOrder.length) {
        // ── All 37 done ─────────────────────────────────────────────────────
        const rd = buildResultObject(newAnswers, nickname);
        // Persist BEFORE switching screen so refresh never loses it
        lsSet(LS_RESULT, rd);
        lsDel(LS_SESSION);
        lb_write({ nickname: rd.nickname, score: rd.score, ts: Date.now() });
        setResult(rd);
        if (rd.score >= 25) setTimeout(() => setConfetti(true), 350);
        setScreen("result");
      } else {
        setCurrentIdx(next);
        lsSet(LS_SESSION, { nickname, stateOrder, currentIdx:next, answers:newAnswers });
      }
    }, 270);
  }

  function handlePlayAgain() {
    lsDel(LS_RESULT);
    setResult(null);
    setConfetti(false);
    setNameInput("");
    setScreen("name");
  }

  function shareResult(platform) {
    if (!result) return;
    const { nickname:nick, score, title } = result;
    const challengeUrl = buildChallengeUrl(nick, score);
    const text = `I scored ${score}/37 on "How Nigerian Are You?" — ${title}. Think you can beat me?`;
    const enc  = encodeURIComponent;
    const links = {
      twitter:  `https://twitter.com/intent/tweet?text=${enc(text + " " + challengeUrl)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${enc(text + " " + challengeUrl)}`,
      telegram: `https://t.me/share/url?url=${enc(challengeUrl)}&text=${enc(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(getBaseUrl())}&quote=${enc(text)}`,
    };
    if (platform === "copy") {
      try {
        navigator.clipboard.writeText(challengeUrl)
          .then(() => alert("Challenge link copied! Send it to your people."),
                () => alert("Your challenge link:\n" + challengeUrl));
      } catch { alert("Your challenge link:\n" + challengeUrl); }
      return;
    }
    if (platform === "native") {
      try {
        if (navigator?.share) {
          navigator.share({ title:"How Nigerian Are You?", text, url:challengeUrl }).catch(()=>{});
          return;
        }
      } catch {}
    }
    try { window.open(links[platform], "_blank", "noopener,noreferrer"); } catch {}
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Confetti active={confetti} />
      {screen === "landing"     && <LandingScreen  leaderboard={leaderboard} onStart={() => setScreen("name")} />}
      {screen === "challenge"   && <ChallengeScreen data={challenger}        onAccept={() => setScreen("name")} />}
      {screen === "name"        && <NameScreen      value={nameInput} onChange={setNameInput} onNext={() => startGame(nameInput)} />}
      {screen === "game" && stateOrder.length > 0 && (
        <GameScreen
          stateName={stateOrder[currentIdx]}
          currentIdx={currentIdx}
          total={stateOrder.length}
          animating={animating}
          onAnswer={handleAnswer}
        />
      )}
      {screen === "result" && result && (
        <ResultScreen
          data={result}
          onPlayAgain={handlePlayAgain}
          onLeaderboard={() => setScreen("leaderboard")}
          onShare={shareResult}
        />
      )}
      {screen === "leaderboard" && (
        <LeaderboardScreen
          leaderboard={leaderboard}
          myNickname={result?.nickname || nickname}
          onBack={() => setScreen(result ? "result" : "landing")}
        />
      )}
    </>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
function LandingScreen({ onStart, leaderboard }) {
  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:FF, overflowX:"hidden" }}>
      <style>{GCSS + `
        .lp1 { animation: hFadeUp .7s ease both; }
        .lp2 { animation: hFadeUp .7s .1s ease both; }
        .lp3 { animation: hFadeUp .7s .2s ease both; }
        .lp4 { animation: hFadeUp .7s .3s ease both; }
        .flt { animation: hFloat 3s ease-in-out infinite; display: inline-block; }
        .pls { animation: hPulse 2.2s ease-in-out infinite; }
      `}</style>

      <div style={{ maxWidth:430, margin:"0 auto", padding:"0 18px 52px" }}>

        {/* Hero */}
        <div className="lp1" style={{ paddingTop:52, textAlign:"center" }}>
          <span className="htag">🇳🇬 The Original Nigerian Travel Test</span>
          <div className="flt" style={{ marginTop:22, fontSize:64 }}>🗺️</div>
          <h1 style={{ color:"#fff", fontSize:34, fontWeight:800, lineHeight:1.1, letterSpacing:"-0.02em", marginTop:10 }}>
            How Nigerian<br/>Are You?
          </h1>
          <p style={{ color:"#86efac", marginTop:12, fontSize:15, lineHeight:1.65 }}>
            How many states have you actually{" "}
            <strong style={{ color:"#4ade80" }}>stepped foot in?</strong><br/>
            No lies. No audio travelling. 👀
          </p>
        </div>

        {/* Stats */}
        <div className="lp2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:26 }}>
          {[["37","States"],["6","Zones"],["2min","To play"]].map(([n,l]) => (
            <div key={n} className="hcard" style={{ padding:"12px 6px", textAlign:"center" }}>
              <div style={{ color:"#4ade80", fontSize:22, fontWeight:800 }}>{n}</div>
              <div style={{ color:"#86efac", fontSize:11, marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="lp3" style={{ marginTop:22 }}>
          <button className="hbtn pls" onClick={onStart}>Start the Quiz →</button>
          <p style={{ color:"#4b5563", fontSize:12, textAlign:"center", marginTop:7 }}>
            No sign-up. No long thing. Pure vibes only.
          </p>
        </div>

        {/* Leaderboard preview */}
        {leaderboard.length > 0 && (
          <div className="lp4 hcard" style={{ marginTop:26, padding:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ color:"#fff", fontWeight:700, fontSize:14 }}>🏆 Top Travellers</span>
              <span className="htag" style={{ fontSize:10 }}>THIS DEVICE</span>
            </div>
            {leaderboard.slice(0,5).map((e,i) => (
              <div key={e.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:i<4?"1px solid rgba(255,255,255,.05)":"none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:14, color:i===0?"#fbbf24":"#6b7280" }}>
                    {i===0?"👑":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                  </span>
                  <span style={{ color:"#e5e7eb", fontSize:14, fontWeight:600 }}>{e.nickname}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ color:"#4ade80", fontWeight:700, fontSize:14 }}>{e.score}/37</span>
                  <div style={{ width:34, height:4, background:"#1f2937", borderRadius:9 }}>
                    <div style={{ width:`${(e.score/37)*100}%`, height:"100%", background:"#16a34a", borderRadius:9 }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Social proof */}
        <div className="lp4" style={{ marginTop:16 }}>
          <p style={{ color:"#374151", fontSize:11, textAlign:"center", marginBottom:8 }}>
            Spreading across Nigerian timelines right now 🔥
          </p>
          {[["Chidimma_O","Federal Traveller",32],["Emeka_Benz","Weekend Traveller",13],["Halima_K","Village Champion",4]].map(([n,t,s]) => (
            <div key={n} className="hcard" style={{ padding:"10px 14px", marginBottom:7, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ color:"#fff", fontWeight:600, fontSize:13 }}>{n}</div>
                <div style={{ color:"#6b7280", fontSize:11 }}>{t}</div>
              </div>
              <span style={{ color:"#4ade80", fontWeight:800, fontSize:20 }}>{s}/37</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// ─── CHALLENGE ────────────────────────────────────────────────────────────────
function ChallengeScreen({ data, onAccept }) {
  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:FF, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <style>{GCSS}</style>
      <div style={{ maxWidth:400, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:10 }}>⚔️</div>
        <h2 style={{ color:"#fff", fontSize:26, fontWeight:800 }}>You've Been Challenged!</h2>
        <div className="hcard" style={{ padding:22, margin:"18px 0", border:"1px solid rgba(74,222,128,.22)" }}>
          <p style={{ color:"#86efac", fontSize:14 }}>The gauntlet was thrown by</p>
          <p style={{ color:"#fff", fontSize:28, fontWeight:800, margin:"8px 0" }}>{data?.nickname}</p>
          <div style={{ background:"rgba(5,46,22,.6)", borderRadius:12, padding:"12px 20px", display:"inline-block" }}>
            <span style={{ color:"#4ade80", fontSize:38, fontWeight:800 }}>{data?.score}</span>
            <span style={{ color:"#6b7280", fontSize:20 }}>/37</span>
          </div>
          <p style={{ color:"#fbbf24", fontWeight:700, fontSize:14, marginTop:10 }}>"{data?.title}"</p>
        </div>
        <p style={{ color:"#86efac", marginBottom:18, fontSize:14 }}>Can you beat this? Show them what you're made of. 🇳🇬</p>
        <button className="hbtn" onClick={onAccept}>Accept the Challenge →</button>
      </div>
    </div>
  );
}

// ─── NAME ─────────────────────────────────────────────────────────────────────
function NameScreen({ value, onChange, onNext }) {
  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:FF, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <style>{GCSS}</style>
      <div style={{ maxWidth:400, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:50, marginBottom:12 }}>✍️</div>
        <h2 style={{ color:"#fff", fontSize:26, fontWeight:800 }}>What do they call you?</h2>
        <p style={{ color:"#86efac", marginTop:8, fontSize:14, lineHeight:1.5 }}>
          Your name goes on the leaderboard.<br/>No surname, no drama.
        </p>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onNext()}
          placeholder="e.g. Tunde, Ngozi, Chioma..."
          maxLength={20}
          autoFocus
          style={{
            width:"100%", marginTop:22, padding:"14px 18px",
            background:"rgba(255,255,255,.07)",
            border:"2px solid rgba(74,222,128,.3)",
            borderRadius:14, color:"#fff", fontSize:18,
            fontFamily:FF, outline:"none", textAlign:"center",
          }}
        />
        <button className="hbtn" style={{ marginTop:14 }} onClick={onNext}>
          Let's Go →
        </button>
        <p style={{ color:"#374151", fontSize:11, marginTop:8 }}>
          Leave blank to play as Anonymous
        </p>
      </div>
    </div>
  );
}

// ─── GAME ─────────────────────────────────────────────────────────────────────
function GameScreen({ stateName, currentIdx, total, animating, onAnswer }) {
  const pct         = Math.round((currentIdx / total) * 100);
  const displayName = stateName === "FCT Abuja" ? "FCT Abuja" : `${stateName} State`;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(155deg,#01080300,#0b1a0c)", fontFamily:FF, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 18px" }}>
      <style>{GCSS + `
        .yb {
          background: rgba(22,163,74,.13); border: 2px solid #16a34a; color: #4ade80;
          font-family: ${FF}; font-size: 18px; font-weight: 700;
          padding: 18px; border-radius: 16px; cursor: pointer; width: 100%;
          transition: all .15s;
        }
        .yb:hover  { background: rgba(22,163,74,.28); }
        .yb:active { transform: scale(.97); }
        .nb {
          background: rgba(220,38,38,.1); border: 2px solid #dc2626; color: #fca5a5;
          font-family: ${FF}; font-size: 18px; font-weight: 700;
          padding: 18px; border-radius: 16px; cursor: pointer; width: 100%;
          transition: all .15s;
        }
        .nb:hover  { background: rgba(220,38,38,.22); }
        .nb:active { transform: scale(.97); }
        .qcard { animation: hSlideIn .25s ease both; }
      `}</style>

      <div style={{ maxWidth:420, width:"100%" }}>
        {/* Progress */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
            <span style={{ color:"#6b7280", fontSize:13 }}>{currentIdx} / {total} answered</span>
            <span style={{ color:"#4ade80", fontSize:13, fontWeight:700 }}>{pct}%</span>
          </div>
          <div style={{ height:7, background:"#1e293b", borderRadius:9 }}>
            <div style={{
              width:`${pct}%`, height:"100%",
              background:"linear-gradient(90deg,#166534,#4ade80)",
              borderRadius:9, transition:"width .3s ease",
            }}/>
          </div>
        </div>

        {/* Question */}
        <div
          className={animating ? "" : "qcard"}
          style={{
            background:"rgba(255,255,255,.04)",
            border:"1px solid rgba(255,255,255,.07)",
            borderRadius:24, padding:"34px 24px",
            textAlign:"center", marginBottom:20,
            opacity: animating ? 0 : 1,
            transition:"opacity .2s",
          }}
        >
          <div style={{ fontSize:44, marginBottom:12 }}>📍</div>
          <p style={{ color:"#6b7280", fontSize:13, fontWeight:600, letterSpacing:".08em", marginBottom:8 }}>
            HAVE YOU EVER VISITED
          </p>
          <h2 style={{ color:"#fff", fontSize:28, fontWeight:800, lineHeight:1.15 }}>
            {displayName}?
          </h2>
          <p style={{ color:"#374151", fontSize:12, marginTop:10 }}>
            Physically. In person. For real. 👀
          </p>
        </div>

        {/* Answers */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <button className="yb" onClick={() => onAnswer(true)}  disabled={animating}>✅ Yes</button>
          <button className="nb" onClick={() => onAnswer(false)} disabled={animating}>❌ No</button>
        </div>
        <p style={{ color:"#1c2b1c", fontSize:12, textAlign:"center", marginTop:14 }}>
          No overthinking — gut feel only
        </p>
      </div>
    </div>
  );
}

// ─── RESULT ───────────────────────────────────────────────────────────────────
function ResultScreen({ data, onPlayAgain, onLeaderboard, onShare }) {
  const {
    nickname, score, pct, visited,
    zoneStats, zonesCompleted, notVisited,
    title, emoji, summary,
  } = data;

  // Detect native share safely (in-app browsers may throw)
  const [canNative, setCanNative] = useState(false);
  useEffect(() => {
    try { setCanNative(typeof navigator !== "undefined" && !!navigator.share); } catch {}
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:FF, paddingBottom:56 }}>
      <style>{GCSS + `
        .rh { animation: hReveal  .5s ease both; }
        .rs { animation: hFadeUp  .5s .12s ease both; }
      `}</style>
      <div style={{ maxWidth:430, margin:"0 auto", padding:"0 16px" }}>

        {/* ── Score hero ── */}
        <div className="rh" style={{ textAlign:"center", paddingTop:44, paddingBottom:20 }}>
          <span className="htag">🇳🇬 Your Result</span>
          <div style={{ marginTop:18, marginBottom:2 }}>
            <span style={{ color:"#4ade80", fontSize:82, fontWeight:800, lineHeight:1 }}>{score}</span>
            <span style={{ color:"#4b5563", fontSize:34, fontWeight:700 }}>/37</span>
          </div>
          <div style={{ fontSize:34, margin:"4px 0 6px" }}>{emoji}</div>
          <h2 style={{ color:"#fff", fontSize:22, fontWeight:800 }}>{title}</h2>
          <p style={{ color:"#86efac", marginTop:9, fontSize:14, lineHeight:1.65, padding:"0 8px" }}>
            {summary}
          </p>
          <div style={{
            display:"inline-block", marginTop:14,
            background:"rgba(22,163,74,.14)",
            border:"1px solid rgba(74,222,128,.28)",
            borderRadius:999, padding:"5px 16px",
            color:"#4ade80", fontSize:14, fontWeight:700,
          }}>
            {pct}% of Nigeria explored
          </div>
        </div>

        {/* ── Grid Map ── */}
        <div className="rs hcard" style={{ padding:"14px 12px", marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <span style={{ color:"#fff", fontWeight:700, fontSize:14 }}>Your Nigeria Map</span>
            <span style={{ color:"#4ade80", fontSize:12 }}>{zonesCompleted}/6 zones complete</span>
          </div>
          <NigeriaGridMap visited={visited} />
        </div>

        {/* ── Zone breakdown ── */}
        <div className="rs hcard" style={{ padding:16, marginBottom:14 }}>
          <p style={{ color:"#fff", fontWeight:700, fontSize:14, marginBottom:12 }}>
            Geo-political Zone Breakdown
          </p>
          {zoneStats.map(z => {
            const col = ZONE_COLOR[z.zone];
            return (
              <div key={z.zone} style={{ marginBottom:11 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:10, height:10, borderRadius:2, background:col.visited, flexShrink:0 }}/>
                    <span style={{ color:"#d1d5db", fontSize:13 }}>
                      {z.zone}
                      {z.visited === z.total && " ✅"}
                    </span>
                  </div>
                  <span style={{ color:"#4ade80", fontSize:13, fontWeight:700 }}>
                    {z.visited}/{z.total}
                  </span>
                </div>
                <div style={{ height:5, background:"#1e293b", borderRadius:9 }}>
                  <div style={{
                    width:`${(z.visited/z.total)*100}%`, height:"100%",
                    background:z.visited===z.total ? col.visited : "#334155",
                    borderRadius:9, transition:"width .8s ease",
                  }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bucket list ── */}
        {notVisited.length > 0 && (
          <div className="rs hcard" style={{ padding:16, marginBottom:14 }}>
            <p style={{ color:"#fff", fontWeight:700, fontSize:14, marginBottom:8 }}>
              States on Your Bucket List ({notVisited.length})
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {notVisited.map(s => (
                <span key={s} style={{
                  background:"rgba(239,68,68,.08)",
                  border:"1px solid rgba(239,68,68,.2)",
                  color:"#fca5a5", padding:"3px 9px",
                  borderRadius:999, fontSize:11,
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Share ── */}
        <div className="rs hcard" style={{ padding:16, marginBottom:14, border:"1px solid rgba(74,222,128,.16)" }}>
          <p style={{ color:"#fff", fontWeight:700, fontSize:14, marginBottom:3 }}>
            Share Your Score 📢
          </p>
          <p style={{ color:"#6b7280", fontSize:12, marginBottom:12 }}>
            Challenge your friends. Embarrass your colleagues.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
            <button className="sbtn" onClick={() => onShare("twitter")}>𝕏 Twitter/X</button>
            <button className="sbtn" onClick={() => onShare("whatsapp")}>💬 WhatsApp</button>
            <button className="sbtn" onClick={() => onShare("telegram")}>✈️ Telegram</button>
            <button className="sbtn" onClick={() => onShare("facebook")}>📘 Facebook</button>
          </div>
          <button
            className="sbtn"
            style={{ width:"100%", background:"rgba(22,163,74,.12)", borderColor:"rgba(74,222,128,.32)", color:"#4ade80" }}
            onClick={() => onShare("copy")}
          >
            🔗 Copy Challenge Link
          </button>
          {canNative && (
            <button className="sbtn" style={{ width:"100%", marginTop:8 }} onClick={() => onShare("native")}>
              ↗️ Share via Phone
            </button>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="rs" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <button
            onClick={onPlayAgain}
            style={{
              background:"rgba(255,255,255,.06)",
              border:"1px solid rgba(255,255,255,.13)",
              color:"#fff", fontFamily:FF, fontWeight:700,
              fontSize:14, padding:14, borderRadius:14, cursor:"pointer",
            }}
          >
            🔄 Play Again
          </button>
          <button
            onClick={onLeaderboard}
            style={{
              background:"linear-gradient(135deg,#16a34a,#15803d)",
              border:"none", color:"#fff", fontFamily:FF,
              fontWeight:700, fontSize:14, padding:14,
              borderRadius:14, cursor:"pointer",
            }}
          >
            🏆 Leaderboard
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
function LeaderboardScreen({ leaderboard, myNickname, onBack }) {
  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:FF, paddingBottom:52 }}>
      <style>{GCSS}</style>
      <div style={{ maxWidth:430, margin:"0 auto", padding:"0 16px" }}>

        <div style={{ paddingTop:40, paddingBottom:20 }}>
          <button
            onClick={onBack}
            style={{ background:"none", border:"none", color:"#4ade80", fontFamily:FF, fontSize:14, cursor:"pointer", marginBottom:14 }}
          >
            ← Back
          </button>
          <h2 style={{ color:"#fff", fontSize:26, fontWeight:800 }}>🏆 Leaderboard</h2>
          <p style={{ color:"#6b7280", fontSize:13, marginTop:4 }}>
            Top travellers on this device
          </p>
        </div>

        {leaderboard.length === 0 ? (
          <div style={{ textAlign:"center", color:"#4b5563", paddingTop:60 }}>
            <div style={{ fontSize:48 }}>🇳🇬</div>
            <p style={{ marginTop:14, fontSize:15 }}>No scores yet — be the first!</p>
          </div>
        ) : (
          leaderboard.map((e, i) => {
            const isMe  = e.nickname === myNickname;
            const medal = i===0?"👑": i===1?"🥈": i===2?"🥉": `#${i+1}`;
            return (
              <div
                key={e.id}
                style={{
                  background: isMe ? "rgba(22,163,74,.11)" : "rgba(255,255,255,.04)",
                  border: `1px solid ${isMe ? "rgba(74,222,128,.35)" : "rgba(255,255,255,.07)"}`,
                  borderRadius:14, padding:"12px 16px", marginBottom:8,
                  display:"flex", alignItems:"center", gap:12,
                }}
              >
                <span style={{ fontSize:i<3?20:13, color:i===0?"#fbbf24":"#6b7280", minWidth:28 }}>
                  {medal}
                </span>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                    <span style={{ color:"#fff", fontWeight:700, fontSize:15 }}>{e.nickname}</span>
                    {isMe && (
                      <span className="htag" style={{ fontSize:9, padding:"1px 7px" }}>YOU</span>
                    )}
                  </div>
                  <div style={{ height:4, background:"#1e293b", borderRadius:9 }}>
                    <div style={{ width:`${(e.score/37)*100}%`, height:"100%", background:"#16a34a", borderRadius:9 }}/>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:"#4ade80", fontWeight:800, fontSize:18 }}>{e.score}</div>
                  <div style={{ color:"#6b7280", fontSize:11 }}>/37</div>
                </div>
              </div>
            );
          })
        )}

        <p style={{ color:"#374151", fontSize:11, textAlign:"center", marginTop:20, lineHeight:1.5 }}>
          Leaderboard is stored on this device.<br/>
          Connect a database to make it global.
        </p>
      </div>
    </div>
  );
}
