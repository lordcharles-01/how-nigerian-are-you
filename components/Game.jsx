"use client";

import { useState, useEffect, useRef } from "react";

// ─── SAFE BASE64 ──────────────────────────────────────────────────────────────
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

const ZONE_COLOR = {
  "North West":   { base:"#1a3a5c", visited:"#3b82f6", label:"#93c5fd" },
  "North East":   { base:"#1a3d2a", visited:"#16a34a", label:"#86efac" },
  "North Central":{ base:"#2e1f4a", visited:"#8b5cf6", label:"#c4b5fd" },
  "South West":   { base:"#3d1515", visited:"#dc2626", label:"#fca5a5" },
  "South East":   { base:"#1a3333", visited:"#0d9488", label:"#5eead4" },
  "South South":  { base:"#1c3320", visited:"#15803d", label:"#4ade80" },
};

const MAP_GRID = [
  ["Sokoto",  "Kebbi",    "Zamfara",  "Katsina",   "Kano",      "Jigawa",   "Yobe"    ],
  ["",        "",         "Niger",    "Kaduna",    "Bauchi",    "Gombe",    "Borno"   ],
  ["",        "",         "Kwara",    "FCT Abuja", "Nasarawa",  "Plateau",  "Adamawa" ],
  ["",        "",         "Kogi",     "Benue",     "",          "Taraba",   ""        ],
  ["Lagos",   "Ogun",     "Oyo",      "Osun",      "Ekiti",     "Ondo",     "Edo"     ],
  ["",        "",         "Anambra",  "Imo",       "Abia",      "Enugu",    "Ebonyi"  ],
  ["",        "Bayelsa",  "Delta",    "Rivers",    "Cross River","Akwa Ibom",""       ],
];

// ─── STATE FACTS ──────────────────────────────────────────────────────────────
const STATE_FACTS = {
  "Abia":        { fact: "Aba, in Abia State, is Nigeria's manufacturing capital. The shoes, bags and clothes made here are exported across West Africa and beyond.", icon: "👟" },
  "Adamawa":     { fact: "The Mandara Mountains in Adamawa reach over 1,400 metres and are home to some of the most dramatic landscapes in all of Nigeria.", icon: "⛰️" },
  "Akwa Ibom":   { fact: "Akwa Ibom produces more crude oil than any other state in Nigeria and has one of the highest internally generated revenues in the country.", icon: "🛢️" },
  "Anambra":     { fact: "Onitsha in Anambra is home to one of the largest markets in Africa. Traders come from as far as Senegal and South Africa to buy here.", icon: "🛒" },
  "Bauchi":      { fact: "Yankari Game Reserve in Bauchi is Nigeria's largest and most visited wildlife park, famous for its warm-water springs and elephant herds.", icon: "🐘" },
  "Bayelsa":     { fact: "Nigeria's smallest state by land area and home to just 8 local governments — yet it has produced a Nigerian President.", icon: "🏛️" },
  "Benue":       { fact: "Named after the mighty Benue River — the longest tributary of the River Niger — Benue is known as the Food Basket of the Nation thanks to its vast fertile farmland.", icon: "🌾" },
  "Borno":       { fact: "Maiduguri, the capital of Borno, sits at the edge of the Sahara and was once the commercial hub of an ancient trans-Saharan trade route.", icon: "🏜️" },
  "Cross River": { fact: "Cross River hosts the famous Calabar Carnival — often called Africa's biggest street party.", icon: "🎉" },
  "Delta":       { fact: "Delta State is home to the Niger Delta, one of the world's most biodiverse wetland ecosystems, and contains a significant portion of Nigeria's oil reserves.", icon: "🌿" },
  "Ebonyi":      { fact: "Ebonyi is one of the leading rice-producing states in South-East Nigeria, and home to the ancient salt springs of Uburu and Okposi.", icon: "🍚" },
  "Edo":         { fact: "The ancient Benin Kingdom in Edo State produced bronze artworks over 600 years ago that are now displayed in the British Museum in London.", icon: "🏺" },
  "Ekiti":       { fact: "Ekiti has more professors per square kilometre than almost any other state in Nigeria — it is nicknamed the Fountain of Knowledge.", icon: "🎓" },
  "Enugu":       { fact: "Enugu's coal mines, discovered in 1909, were the first commercially exploited coal deposits in Nigeria and powered the country's early railway system for decades.", icon: "⚫" },
  "FCT Abuja":   { fact: "Abuja was purpose-built as Nigeria's capital, replacing Lagos in 1991. Aso Rock — a 400-metre granite monolith — towers directly behind the Presidential Villa.", icon: "🪨" },
  "Gombe":       { fact: "The Tangale-Waja uplands in Gombe contain some of the most fertile farmland in North-East Nigeria and are famous for groundnut and cotton production.", icon: "🌻" },
  "Imo":         { fact: "Imo State contains Oguta Lake, one of the largest natural lakes in Nigeria, where two rivers meet but remarkably, their waters do not mix.", icon: "💧" },
  "Jigawa":      { fact: "Jigawa shares over 150km of international border with Niger Republic and is one of Nigeria's most important gateways for trans-Saharan trade.", icon: "🗺️" },
  "Kaduna":      { fact: "Kaduna is home to the Nigerian Defence Academy, the country's premier military university, which has trained virtually every generation of Nigeria's military leadership since independence.", icon: "🎖️" },
  "Kano":        { fact: "Kano's dye pits in the old city have been in continuous operation for over 500 years — they are among the oldest active dye pits in the world.", icon: "🎨" },
  "Katsina":     { fact: "The Gobarau Minaret in Katsina, built in the 15th century, is one of the oldest standing structures in Nigeria and served as both a place of worship and a lighthouse for Saharan traders.", icon: "🕌" },
  "Kebbi":       { fact: "Kebbi hosts the Argungu Fishing Festival, a UNESCO cultural heritage event, where thousands of fishermen enter the Matan Fada River simultaneously.", icon: "🎣" },
  "Kogi":        { fact: "Home to the confluence of Rivers Niger and Benue, Kogi is the only state that borders 10 other states. Its capital Lokoja was the first administrative capital of colonial Nigeria.", icon: "🌊" },
  "Kwara":       { fact: "The Owu Waterfalls in Kwara State are the highest waterfalls in West Africa, dropping over 120 metres through a dramatic forested gorge.", icon: "💦" },
  "Lagos":       { fact: "Lagos is sub-Saharan Africa's most populous city and economic engine, generating roughly 25% of Nigeria's entire GDP within just 1,171 square kilometres.", icon: "🌆" },
  "Nasarawa":    { fact: "The Farin Ruwa Waterfall in Nasarawa is one of the tallest waterfalls in Nigeria, plunging over 150 metres in a series of cascades through dense forest.", icon: "🌊" },
  "Niger":       { fact: "Nigeria's largest state by land area, covering over 76,000 square km — larger than countries like Sierra Leone and Togo — and home to the Kainji Dam.", icon: "⚡" },
  "Ogun":        { fact: "Ogun State is the birthplace of Wole Soyinka, Africa's first Nobel Laureate in Literature, who was born in Abeokuta in 1934.", icon: "✍️" },
  "Ondo":        { fact: "Home to the dramatic Idanre Hills — a 3,000-foot ancient rock formation with over 660 steps to the summit — and one of West Africa's largest bitumen deposits.", icon: "⛰️" },
  "Osun":        { fact: "Home to the Osun-Osogbo Sacred Grove, a UNESCO World Heritage Site, and Ile-Ife, regarded in Yoruba tradition as the cradle of creation.", icon: "🌳" },
  "Oyo":         { fact: "The Old Oyo Empire, based in what is now Oyo State, was once the most powerful kingdom in West Africa, controlling trade routes from the coast to the Sahara.", icon: "👑" },
  "Plateau":     { fact: "Jos in Plateau State sits at 1,200 metres above sea level. It is the coldest city in Nigeria and the one place where you genuinely need a sweater in December.", icon: "🧥" },
  "Rivers":      { fact: "Home to Port Harcourt, Nigeria's oil and gas capital, and Bonny Island, which hosts one of the world's largest liquefied natural gas export terminals.", icon: "⚓" },
  "Sokoto":      { fact: "Seat of the Sultan of Sokoto, the spiritual leader of Nigerian Muslims, and capital of the historic Sokoto Caliphate — once one of Africa's largest empires.", icon: "☪️" },
  "Taraba":      { fact: "Taraba contains parts of Gashaka Gumti National Park, the largest national park in Nigeria, covering over 6,700 square kilometres of rainforest and savannah.", icon: "🦁" },
  "Yobe":        { fact: "The Hadejia River supports one of northern Nigeria's most important inland fishing and farming economies, sustaining hundreds of thousands of livelihoods.", icon: "🎣" },
  "Zamfara":     { fact: "Home to the Kuyambana Forest Reserve, one of north-west Nigeria's major savannah woodland ecosystems and a historic refuge for wildlife.", icon: "🌲" },
};

// ─── TITLE / SUMMARY HELPERS ─────────────────────────────────────────────────
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
  const visited = Object.keys(answers).filter(k => answers[k]);
  const sc = visited.length;
  const zMap = {};
  ZONES.forEach(z => { zMap[z] = { zone: z, visited: 0, total: 0 }; });
  STATES.forEach(s => {
    zMap[s.zone].total++;
    if (visited.includes(s.name)) zMap[s.zone].visited++;
  });
  const zoneStats = ZONES.map(z => zMap[z]);
  const zonesCompleted = zoneStats.filter(z => z.visited === z.total).length;
  const notVisited = STATES.map(s => s.name).filter(n => !visited.includes(n));
  return {
    nickname: (nickname || "").trim() || "Anonymous",
    score: sc,
    pct: Math.round((sc / 37) * 100),
    visited,
    zoneStats,
    zonesCompleted,
    notVisited,
    title: getTitleText(sc),
    emoji: getTitleEmoji(sc),
    summary: getSummary(sc),
  };
}

// ─── STORAGE ─────────────────────────────────────────────────────────────────
function lsGet(key, fallback) {
  if (fallback === undefined) fallback = null;
  try {
    var v = localStorage.getItem(key);
    return v != null ? JSON.parse(v) : fallback;
  } catch (e) { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}
function lsDel(key) {
  try { localStorage.removeItem(key); } catch (e) {}
}

// ─── SUPABASE LEADERBOARD ─────────────────────────────────────────────────────
var SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
var SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function lb_read() {
  if (!SUPA_URL || !SUPA_KEY) return lsGet("hna_lb", []);
  try {
    var res = await fetch(
      SUPA_URL + "/rest/v1/scores?select=id,nickname,score,ts&order=score.desc,ts.desc&limit=20",
      { headers: { apikey: SUPA_KEY, Authorization: "Bearer " + SUPA_KEY } }
    );
    if (!res.ok) return lsGet("hna_lb", []);
    return await res.json();
  } catch (e) {
    return lsGet("hna_lb", []);
  }
}

async function lb_write(entry) {
  if (SUPA_URL && SUPA_KEY) {
    try {
      await fetch(SUPA_URL + "/rest/v1/scores", {
        method: "POST",
        headers: {
          apikey: SUPA_KEY,
          Authorization: "Bearer " + SUPA_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(entry),
      });
    } catch (e) {}
  }
  var rows = lsGet("hna_lb", []);
  rows.push(Object.assign({}, entry, { id: String(Date.now()) }));
  rows.sort(function(a, b) { return b.score - a.score || b.ts - a.ts; });
  lsSet("hna_lb", rows.slice(0, 100));
}

// ─── URL HELPERS ──────────────────────────────────────────────────────────────
function getBaseUrl() {
  try {
    if (typeof window !== "undefined" && window.location && window.location.href) {
      return window.location.href.split("?")[0];
    }
  } catch (e) {}
  return "";
}

function buildChallengeUrl(nickname, score) {
  var payload = safeEncode({ nickname: nickname, score: score, title: getTitleText(score) });
  var base = getBaseUrl();
  return base ? base + "?challenge=" + payload : "?challenge=" + payload;
}

// ─── GRID MAP ─────────────────────────────────────────────────────────────────
function NigeriaGridMap(props) {
  var visited = props.visited || [];
  var visitedSet = new Set(visited);
  var stateZone = {};
  var stateAbbr = {};
  STATES.forEach(function(s) { stateZone[s.name] = s.zone; stateAbbr[s.name] = s.abbr; });

  var CELL = 44;
  var GAP = 3;
  var COLS = MAP_GRID[0].length;
  var ROWS = MAP_GRID.length;
  var W = COLS * CELL + (COLS - 1) * GAP;
  var H = ROWS * CELL + (ROWS - 1) * GAP;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg
        viewBox={"0 0 " + W + " " + H}
        style={{ width: "100%", maxWidth: W, height: "auto", display: "block", margin: "0 auto" }}
      >
        {MAP_GRID.map(function(row, ri) {
          return row.map(function(name, ci) {
            if (!name) return null;
            var zone = stateZone[name];
            var abbr = stateAbbr[name];
            var isV = visitedSet.has(name);
            var col = ZONE_COLOR[zone];
            var fill = isV ? col.visited : col.base;
            var textC = isV ? "#ffffff" : col.label;
            var x = ci * (CELL + GAP);
            var y = ri * (CELL + GAP);
            return (
              <g key={name}>
                <rect
                  x={x} y={y} width={CELL} height={CELL} rx={5}
                  fill={fill}
                  stroke={isV ? textC : "rgba(255,255,255,0.08)"}
                  strokeWidth={isV ? 1.5 : 0.5}
                />
                <text
                  x={x + CELL / 2}
                  y={y + CELL / 2 + (isV ? -2 : 2)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={isV ? 9 : 8}
                  fontWeight={isV ? "800" : "500"}
                  fill={textC}
                  style={{ userSelect: "none", fontFamily: "'Sora','Segoe UI',sans-serif" }}
                >
                  {abbr}
                </text>
                {isV && (
                  <circle cx={x + CELL - 7} cy={y + 7} r={3.5} fill="#4ade80" />
                )}
              </g>
            );
          });
        })}
      </svg>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px 10px", marginTop: 10, padding: "0 2px" }}>
        {ZONES.map(function(z) {
          var col = ZONE_COLOR[z];
          var total = STATES.filter(function(s) { return s.zone === z; }).length;
          var vCount = visited.filter(function(n) {
            var st = STATES.find(function(s) { return s.name === n; });
            return st && st.zone === z;
          }).length;
          return (
            <div key={z} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 10, height: 10, borderRadius: 2,
                background: vCount > 0 ? col.visited : col.base,
                border: "1px solid " + col.label,
                flexShrink: 0,
              }} />
              <span style={{ color: "#9ca3af", fontSize: 9, lineHeight: 1.2 }}>
                {z + " (" + vCount + "/" + total + ")"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
function Confetti(props) {
  var active = props.active;
  var pts = useRef(
    Array.from({ length: 65 }, function(_, i) {
      return {
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2.5,
        dur: 2 + Math.random() * 2,
        color: ["#16a34a","#4ade80","#ffffff","#fbbf24","#f87171","#60a5fa"][i % 6],
        size: 5 + Math.random() * 7,
        rect: Math.random() > 0.5,
      };
    })
  );
  if (!active) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
      <style dangerouslySetInnerHTML={{ __html: "@keyframes cffall { 0% { transform: translateY(-10px) rotate(0deg); opacity: 1; } 100% { transform: translateY(105vh) rotate(720deg); opacity: 0; } }" }} />
      {pts.current.map(function(p) {
        return (
          <div key={p.id} style={{
            position: "absolute",
            left: p.x + "%",
            top: 0,
            width: p.size,
            height: p.rect ? p.size * 0.45 : p.size,
            backgroundColor: p.color,
            borderRadius: p.rect ? 2 : "50%",
            animation: "cffall " + p.dur + "s " + p.delay + "s ease-in forwards",
          }} />
        );
      })}
    </div>
  );
}

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
// All CSS is defined once here as a plain string — no template literals, no nesting.
// Each screen injects only GCSS via dangerouslySetInnerHTML.
var GCSS = [
  "@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');",
  "*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}",
  "body{background:#052e16}",
  ".hbtn{background:linear-gradient(135deg,#16a34a,#15803d);border:none;color:#fff;",
  "  font-family:'Sora','Segoe UI',sans-serif;font-weight:800;font-size:17px;",
  "  padding:16px 24px;border-radius:16px;cursor:pointer;width:100%;",
  "  box-shadow:0 6px 24px rgba(22,163,74,.4);transition:transform .15s,box-shadow .15s}",
  ".hbtn:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(22,163,74,.6)}",
  ".hbtn:active{transform:translateY(0)}",
  ".hcard{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:18px}",
  ".htag{display:inline-block;background:rgba(74,222,128,.14);border:1px solid rgba(74,222,128,.3);",
  "  color:#4ade80;padding:4px 13px;border-radius:999px;font-size:12px;font-weight:700}",
  ".sbtn{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);",
  "  color:#fff;font-family:'Sora','Segoe UI',sans-serif;font-size:13px;font-weight:600;",
  "  padding:11px 10px;border-radius:12px;cursor:pointer;transition:background .15s;",
  "  display:flex;align-items:center;justify-content:center;gap:5px}",
  ".sbtn:hover{background:rgba(255,255,255,.13)}",
  "@keyframes hFadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}",
  "@keyframes hFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}",
  "@keyframes hPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}",
  "@keyframes hSlideIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}",
  "@keyframes hReveal{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}",
  ".lp1{animation:hFadeUp .7s ease both}",
  ".lp2{animation:hFadeUp .7s .1s ease both}",
  ".lp3{animation:hFadeUp .7s .2s ease both}",
  ".lp4{animation:hFadeUp .7s .3s ease both}",
  ".flt{animation:hFloat 3s ease-in-out infinite;display:inline-block}",
  ".pls{animation:hPulse 2.2s ease-in-out infinite}",
  ".rh{animation:hReveal .5s ease both}",
  ".rs{animation:hFadeUp .5s .12s ease both}",
  ".qcard{animation:hSlideIn .25s ease both}",
  ".yb{background:rgba(22,163,74,.15);border:2px solid #16a34a;color:#4ade80;",
  "  font-family:'Sora','Segoe UI',sans-serif;font-size:18px;font-weight:700;",
  "  padding:18px;border-radius:16px;cursor:pointer;width:100%;transition:all .15s}",
  ".yb:hover{background:rgba(22,163,74,.3)}",
  ".yb:active{transform:scale(.97)}",
  ".nb{background:rgba(220,38,38,.12);border:2px solid #dc2626;color:#fca5a5;",
  "  font-family:'Sora','Segoe UI',sans-serif;font-size:18px;font-weight:700;",
  "  padding:18px;border-radius:16px;cursor:pointer;width:100%;transition:all .15s}",
  ".nb:hover{background:rgba(220,38,38,.25)}",
  ".nb:active{transform:scale(.97)}",
  ".back-btn{background:none;border:1px solid rgba(255,255,255,.2);color:#86efac;",
  "  font-family:'Sora','Segoe UI',sans-serif;font-size:13px;font-weight:600;",
  "  padding:7px 14px;border-radius:8px;cursor:pointer;transition:all .15s;",
  "  display:flex;align-items:center;gap:5px}",
  ".back-btn:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.35)}",
  ".back-btn:disabled{opacity:0.25;pointer-events:none}",
].join("\n");

var BG = "linear-gradient(155deg,#052e16 0%,#14532d 50%,#0f172a 100%)";
var FF = "'Sora','Segoe UI',sans-serif";
var LS_RESULT = "hna_result";
var LS_SESSION = "hna_session";

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  var [screen, setScreen] = useState("landing");
  var [nameInput, setNameInput] = useState("");
  var [nickname, setNickname] = useState("");
  var [stateOrder, setStateOrder] = useState([]);
  var [currentIdx, setCurrentIdx] = useState(0);
  var [answers, setAnswers] = useState({});
  var [result, setResult] = useState(null);
  var [leaderboard, setLeaderboard] = useState([]);
  var [confetti, setConfetti] = useState(false);
  var [challenger, setChallenger] = useState(null);
  var [animating, setAnimating] = useState(false);
  var tapLock = useRef(false);

  useEffect(function() {
    try {
      var params = new URLSearchParams(window.location.search);
      var ch = params.get("challenge");
      if (ch) {
        var d = safeDecode(ch);
        if (d && d.nickname && typeof d.score === "number") {
          setChallenger(d);
          setScreen("challenge");
          return;
        }
      }
    } catch (e) {}

    var savedResult = lsGet(LS_RESULT);
    if (savedResult && savedResult.score != null) {
      setResult(savedResult);
      if (savedResult.score >= 25) setConfetti(true);
      setScreen("result");
      return;
    }

    var sess = lsGet(LS_SESSION);
    if (sess && Array.isArray(sess.stateOrder) && sess.currentIdx < sess.stateOrder.length) {
      setNickname(sess.nickname || "");
      setStateOrder(sess.stateOrder);
      setCurrentIdx(sess.currentIdx);
      setAnswers(sess.answers || {});
      setScreen("game");
    }
  }, []);

  useEffect(function() {
    if (screen === "landing" || screen === "leaderboard") {
      lb_read().then(function(rows) {
        setLeaderboard((rows || []).slice(0, 20));
      });
    }
  }, [screen]);

  function startGame(rawName) {
    var nick = (rawName || "").trim() || "Anonymous";
    var order = shuffle(STATES.map(function(s) { return s.name; }));
    setNickname(nick);
    setStateOrder(order);
    setCurrentIdx(0);
    setAnswers({});
    setResult(null);
    setConfetti(false);
    lsDel(LS_RESULT);
    lsSet(LS_SESSION, { nickname: nick, stateOrder: order, currentIdx: 0, answers: {} });
    setScreen("game");
  }

  function handleAnswer(ans) {
    if (tapLock.current || animating) return;
    tapLock.current = true;
    setTimeout(function() { tapLock.current = false; }, 380);

    var stateName = stateOrder[currentIdx];
    var newAnswers = Object.assign({}, answers);
    newAnswers[stateName] = ans;
    setAnswers(newAnswers);
    setAnimating(true);

    setTimeout(function() {
      setAnimating(false);
      var next = currentIdx + 1;
      if (next >= stateOrder.length) {
        var rd = buildResultObject(newAnswers, nickname);
        lsSet(LS_RESULT, rd);
        lsDel(LS_SESSION);
        lb_write({ nickname: rd.nickname, score: rd.score, ts: Date.now() });
        setResult(rd);
        if (rd.score >= 25) setTimeout(function() { setConfetti(true); }, 350);
        setScreen("result");
      } else {
        setCurrentIdx(next);
        lsSet(LS_SESSION, { nickname: nickname, stateOrder: stateOrder, currentIdx: next, answers: newAnswers });
      }
    }, 270);
  }

  function handleBack() {
    if (currentIdx <= 0 || animating) return;
    var prev = currentIdx - 1;
    var stateName = stateOrder[prev];
    var newAnswers = Object.assign({}, answers);
    delete newAnswers[stateName];
    setAnswers(newAnswers);
    setCurrentIdx(prev);
    lsSet(LS_SESSION, { nickname: nickname, stateOrder: stateOrder, currentIdx: prev, answers: newAnswers });
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
    var nick = result.nickname;
    var score = result.score;
    var title = result.title;
    var challengeUrl = buildChallengeUrl(nick, score);
    var text = "I scored " + score + "/37 on \"How Nigerian Are You?\" — " + title + ". Think you can beat me?";
    var enc = encodeURIComponent;

    if (platform === "copy") {
      try {
        navigator.clipboard.writeText(challengeUrl)
          .then(function() { alert("Challenge link copied!"); },
                function() { alert("Your link:\n" + challengeUrl); });
      } catch (e) { alert("Your link:\n" + challengeUrl); }
      return;
    }
    if (platform === "native") {
      try {
        if (typeof navigator !== "undefined" && navigator.share) {
          navigator.share({ title: "How Nigerian Are You?", text: text, url: challengeUrl }).catch(function() {});
          return;
        }
      } catch (e) {}
    }
    var links = {
      twitter:  "https://twitter.com/intent/tweet?text=" + enc(text + " " + challengeUrl),
      whatsapp: "https://api.whatsapp.com/send?text=" + enc(text + " " + challengeUrl),
      telegram: "https://t.me/share/url?url=" + enc(challengeUrl) + "&text=" + enc(text),
      facebook: "https://www.facebook.com/sharer/sharer.php?u=" + enc(getBaseUrl()) + "&quote=" + enc(text),
    };
    try { window.open(links[platform], "_blank", "noopener,noreferrer"); } catch (e) {}
  }

  return (
    <div>
      <Confetti active={confetti} />
      {screen === "landing"     && <LandingScreen  leaderboard={leaderboard} onStart={function() { setScreen("name"); }} />}
      {screen === "challenge"   && <ChallengeScreen data={challenger} onAccept={function() { setScreen("name"); }} />}
      {screen === "name"        && <NameScreen value={nameInput} onChange={setNameInput} onNext={function() { startGame(nameInput); }} />}
      {screen === "game" && stateOrder.length > 0 && (
        <GameScreen
          stateName={stateOrder[currentIdx]}
          currentIdx={currentIdx}
          total={stateOrder.length}
          animating={animating}
          onAnswer={handleAnswer}
          onBack={handleBack}
        />
      )}
      {screen === "result" && result && (
        <ResultScreen
          data={result}
          onPlayAgain={handlePlayAgain}
          onLeaderboard={function() { setScreen("leaderboard"); }}
          onShare={shareResult}
        />
      )}
      {screen === "leaderboard" && (
        <LeaderboardScreen
          leaderboard={leaderboard}
          myNickname={result ? result.nickname : nickname}
          onBack={function() { setScreen(result ? "result" : "landing"); }}
        />
      )}
    </div>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
function LandingScreen(props) {
  var leaderboard = props.leaderboard;
  var onStart = props.onStart;
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FF, overflowX: "hidden" }}>
      <style dangerouslySetInnerHTML={{ __html: GCSS }} />
      <div style={{ maxWidth: 430, margin: "0 auto", padding: "0 18px 52px" }}>
        <div className="lp1" style={{ paddingTop: 52, textAlign: "center" }}>
          <span className="htag">🇳🇬 The Original Nigerian Travel Test</span>
          <div className="flt" style={{ marginTop: 22, fontSize: 64 }}>🗺️</div>
          <h1 style={{ color: "#fff", fontSize: 34, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", marginTop: 10 }}>
            How Nigerian<br />Are You?
          </h1>
          <p style={{ color: "#86efac", marginTop: 12, fontSize: 15, lineHeight: 1.65 }}>
            How many states have you actually <strong style={{ color: "#4ade80" }}>stepped foot in?</strong><br />
            No lies. No audio travelling. 👀
          </p>
        </div>

        <div className="lp2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 26 }}>
          {[["37","States"],["6","Zones"],["2min","To play"]].map(function(item) {
            return (
              <div key={item[0]} className="hcard" style={{ padding: "12px 6px", textAlign: "center" }}>
                <div style={{ color: "#4ade80", fontSize: 22, fontWeight: 800 }}>{item[0]}</div>
                <div style={{ color: "#86efac", fontSize: 11, marginTop: 2 }}>{item[1]}</div>
              </div>
            );
          })}
        </div>

        <div className="lp3" style={{ marginTop: 22 }}>
          <button className="hbtn pls" onClick={onStart}>Start the Quiz →</button>
          <p style={{ color: "#d1fae5", fontSize: 12, textAlign: "center", marginTop: 7 }}>
            No sign-up. No long thing. Pure vibes only.
          </p>
        </div>

        {leaderboard.length > 0 && (
          <div className="lp4 hcard" style={{ marginTop: 26, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>🏆 Top Travellers</span>
              <span className="htag" style={{ fontSize: 10 }}>🌍 GLOBAL</span>
            </div>
            {leaderboard.slice(0, 5).map(function(e, i) {
              return (
                <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, color: i === 0 ? "#fbbf24" : "#6b7280" }}>
                      {i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1)}
                    </span>
                    <span style={{ color: "#e5e7eb", fontSize: 14, fontWeight: 600 }}>{e.nickname}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#4ade80", fontWeight: 700, fontSize: 14 }}>{e.score}/37</span>
                    <div style={{ width: 34, height: 4, background: "#1f2937", borderRadius: 9 }}>
                      <div style={{ width: ((e.score / 37) * 100) + "%", height: "100%", background: "#16a34a", borderRadius: 9 }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="lp4" style={{ marginTop: 16 }}>
          <p style={{ color: "#86efac", fontSize: 12, textAlign: "center", marginBottom: 8, fontWeight: 600 }}>
            Spreading across Nigerian timelines right now 🔥
          </p>
          {[["Chidimma_O","Inspector General of States",32],["Emeka_Benz","Inter State Operator",13],["Halima_K","Village Champion",4]].map(function(item) {
            return (
              <div key={item[0]} className="hcard" style={{ padding: "10px 14px", marginBottom: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{item[0]}</div>
                  <div style={{ color: "#86efac", fontSize: 11 }}>{item[1]}</div>
                </div>
                <span style={{ color: "#4ade80", fontWeight: 800, fontSize: 20 }}>{item[2]}/37</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── CHALLENGE ────────────────────────────────────────────────────────────────
function ChallengeScreen(props) {
  var data = props.data;
  var onAccept = props.onAccept;
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FF, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style dangerouslySetInnerHTML={{ __html: GCSS }} />
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 10 }}>⚔️</div>
        <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 800 }}>You've Been Challenged!</h2>
        <div className="hcard" style={{ padding: 22, margin: "18px 0", border: "1px solid rgba(74,222,128,.22)" }}>
          <p style={{ color: "#86efac", fontSize: 14 }}>The gauntlet was thrown by</p>
          <p style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "8px 0" }}>{data ? data.nickname : ""}</p>
          <div style={{ background: "rgba(5,46,22,.6)", borderRadius: 12, padding: "12px 20px", display: "inline-block" }}>
            <span style={{ color: "#4ade80", fontSize: 38, fontWeight: 800 }}>{data ? data.score : 0}</span>
            <span style={{ color: "#6b7280", fontSize: 20 }}>/37</span>
          </div>
          <p style={{ color: "#fbbf24", fontWeight: 700, fontSize: 14, marginTop: 10 }}>"{data ? data.title : ""}"</p>
        </div>
        <p style={{ color: "#86efac", marginBottom: 18, fontSize: 14 }}>Can you beat this? Show them what you are made of. 🇳🇬</p>
        <button className="hbtn" onClick={onAccept}>Accept the Challenge →</button>
      </div>
    </div>
  );
}

// ─── NAME ─────────────────────────────────────────────────────────────────────
function NameScreen(props) {
  var value = props.value;
  var onChange = props.onChange;
  var onNext = props.onNext;
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FF, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style dangerouslySetInnerHTML={{ __html: GCSS }} />
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 50, marginBottom: 12 }}>✍️</div>
        <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 800 }}>What do they call you?</h2>
        <p style={{ color: "#86efac", marginTop: 8, fontSize: 14, lineHeight: 1.5 }}>
          Your name goes on the leaderboard.<br />No surname, no drama.
        </p>
        <input
          type="text"
          value={value}
          onChange={function(e) { onChange(e.target.value); }}
          onKeyDown={function(e) { if (e.key === "Enter") onNext(); }}
          placeholder="e.g. Tunde, Ngozi, Chioma..."
          maxLength={20}
          autoFocus
          style={{
            width: "100%", marginTop: 22, padding: "14px 18px",
            background: "rgba(255,255,255,.07)",
            border: "2px solid rgba(74,222,128,.3)",
            borderRadius: 14, color: "#fff", fontSize: 18,
            fontFamily: FF, outline: "none", textAlign: "center",
          }}
        />
        <button className="hbtn" style={{ marginTop: 14 }} onClick={onNext}>
          Let's Go →
        </button>
        <p style={{ color: "#6ee7b7", fontSize: 11, marginTop: 8 }}>
          Leave blank to play as Anonymous
        </p>
      </div>
    </div>
  );
}

// ─── GAME ─────────────────────────────────────────────────────────────────────
function GameScreen(props) {
  var stateName = props.stateName;
  var currentIdx = props.currentIdx;
  var total = props.total;
  var animating = props.animating;
  var onAnswer = props.onAnswer;
  var onBack = props.onBack;

  var pct = Math.round((currentIdx / total) * 100);
  var displayName = stateName === "FCT Abuja" ? "FCT Abuja" : stateName + " State";
  var factData = STATE_FACTS[stateName] || { fact: "", icon: "📍" };
  var canGoBack = currentIdx > 0;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(155deg,#020c04,#0b1a0c)", fontFamily: FF, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 18px" }}>
      <style dangerouslySetInnerHTML={{ __html: GCSS }} />
      <div style={{ maxWidth: 420, width: "100%" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button
            className="back-btn"
            onClick={onBack}
            disabled={!canGoBack || animating}
          >
            ← Back
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#d1fae5", fontSize: 13, fontWeight: 600 }}>{currentIdx} / {total} answered</span>
              <span style={{ color: "#4ade80", fontSize: 13, fontWeight: 700 }}>{pct}%</span>
            </div>
            <div style={{ height: 7, background: "#1e293b", borderRadius: 9 }}>
              <div style={{ width: pct + "%", height: "100%", background: "linear-gradient(90deg,#166534,#4ade80)", borderRadius: 9, transition: "width .3s ease" }} />
            </div>
          </div>
        </div>

        <div
          className={animating ? "" : "qcard"}
          style={{
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 24, padding: "28px 22px",
            textAlign: "center", marginBottom: 14,
            opacity: animating ? 0 : 1,
            transition: "opacity .2s",
          }}
        >
          <p style={{ color: "#86efac", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", marginBottom: 10 }}>
            HAVE YOU EVER VISITED
          </p>
          <h2 style={{ color: "#ffffff", fontSize: 30, fontWeight: 800, lineHeight: 1.1, marginBottom: 6 }}>
            {displayName}?
          </h2>
          <p style={{ color: "#6ee7b7", fontSize: 12, marginBottom: 20 }}>
            Physically. In person. For real. 👀
          </p>
          <div style={{ background: "rgba(74,222,128,.08)", border: "1px solid rgba(74,222,128,.2)", borderRadius: 14, padding: "14px 16px", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{factData.icon}</span>
              <div>
                <p style={{ color: "#fbbf24", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", marginBottom: 5 }}>
                  DID YOU KNOW?
                </p>
                <p style={{ color: "#e2f5ea", fontSize: 13, lineHeight: 1.6, fontWeight: 400 }}>
                  {factData.fact}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button className="yb" onClick={function() { onAnswer(true); }} disabled={animating}>✅ Yes</button>
          <button className="nb" onClick={function() { onAnswer(false); }} disabled={animating}>❌ No</button>
        </div>
        <p style={{ color: "#6ee7b7", fontSize: 12, textAlign: "center", marginTop: 12 }}>
          No overthinking — gut feel only
        </p>
      </div>
    </div>
  );
}

// ─── RESULT ───────────────────────────────────────────────────────────────────
function ResultScreen(props) {
  var data = props.data;
  var onPlayAgain = props.onPlayAgain;
  var onLeaderboard = props.onLeaderboard;
  var onShare = props.onShare;

  var nickname = data.nickname;
  var score = data.score;
  var pct = data.pct;
  var visited = data.visited;
  var zoneStats = data.zoneStats;
  var zonesCompleted = data.zonesCompleted;
  var notVisited = data.notVisited;
  var title = data.title;
  var emoji = data.emoji;
  var summary = data.summary;

  var [canNative, setCanNative] = useState(false);
  useEffect(function() {
    try { setCanNative(typeof navigator !== "undefined" && !!navigator.share); } catch (e) {}
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FF, paddingBottom: 56 }}>
      <style dangerouslySetInnerHTML={{ __html: GCSS }} />
      <div style={{ maxWidth: 430, margin: "0 auto", padding: "0 16px" }}>

        <div className="rh" style={{ textAlign: "center", paddingTop: 44, paddingBottom: 20 }}>
          <span className="htag">🇳🇬 Your Result</span>
          <div style={{ marginTop: 18, marginBottom: 2 }}>
            <span style={{ color: "#4ade80", fontSize: 82, fontWeight: 800, lineHeight: 1 }}>{score}</span>
            <span style={{ color: "#4b5563", fontSize: 34, fontWeight: 700 }}>/37</span>
          </div>
          <div style={{ fontSize: 34, margin: "4px 0 6px" }}>{emoji}</div>
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>{title}</h2>
          <p style={{ color: "#86efac", marginTop: 9, fontSize: 14, lineHeight: 1.65, padding: "0 8px" }}>{summary}</p>
          <div style={{ display: "inline-block", marginTop: 14, background: "rgba(22,163,74,.14)", border: "1px solid rgba(74,222,128,.28)", borderRadius: 999, padding: "5px 16px", color: "#4ade80", fontSize: 14, fontWeight: 700 }}>
            {pct}% of Nigeria explored
          </div>
        </div>

        <div className="rs hcard" style={{ padding: "14px 12px", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Your Nigeria Map</span>
            <span style={{ color: "#4ade80", fontSize: 12 }}>{zonesCompleted}/6 zones complete</span>
          </div>
          <NigeriaGridMap visited={visited} />
        </div>

        <div className="rs hcard" style={{ padding: 16, marginBottom: 14 }}>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Geo-political Zone Breakdown</p>
          {zoneStats.map(function(z) {
            var col = ZONE_COLOR[z.zone];
            return (
              <div key={z.zone} style={{ marginBottom: 11 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: col.visited, flexShrink: 0 }} />
                    <span style={{ color: "#d1d5db", fontSize: 13 }}>
                      {z.zone}{z.visited === z.total ? " ✅" : ""}
                    </span>
                  </div>
                  <span style={{ color: "#4ade80", fontSize: 13, fontWeight: 700 }}>{z.visited}/{z.total}</span>
                </div>
                <div style={{ height: 5, background: "#1e293b", borderRadius: 9 }}>
                  <div style={{ width: ((z.visited / z.total) * 100) + "%", height: "100%", background: z.visited === z.total ? col.visited : "#334155", borderRadius: 9, transition: "width .8s ease" }} />
                </div>
              </div>
            );
          })}
        </div>

        {notVisited.length > 0 && (
          <div className="rs hcard" style={{ padding: 16, marginBottom: 14 }}>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
              {"States on Your Bucket List (" + notVisited.length + ")"}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {notVisited.map(function(s) {
                return (
                  <span key={s} style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", color: "#fca5a5", padding: "3px 9px", borderRadius: 999, fontSize: 11 }}>
                    {s}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="rs hcard" style={{ padding: 16, marginBottom: 14, border: "1px solid rgba(74,222,128,.16)" }}>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Share Your Score 📢</p>
          <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 12 }}>Challenge your friends. Embarrass your colleagues.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <button className="sbtn" onClick={function() { onShare("twitter"); }}>𝕏 Twitter/X</button>
            <button className="sbtn" onClick={function() { onShare("whatsapp"); }}>💬 WhatsApp</button>
            <button className="sbtn" onClick={function() { onShare("telegram"); }}>✈️ Telegram</button>
            <button className="sbtn" onClick={function() { onShare("facebook"); }}>📘 Facebook</button>
          </div>
          <button className="sbtn" style={{ width: "100%", background: "rgba(22,163,74,.12)", borderColor: "rgba(74,222,128,.32)", color: "#4ade80" }} onClick={function() { onShare("copy"); }}>
            🔗 Copy Challenge Link
          </button>
          {canNative && (
            <button className="sbtn" style={{ width: "100%", marginTop: 8 }} onClick={function() { onShare("native"); }}>
              ↗️ Share via Phone
            </button>
          )}
        </div>

        <div className="rs" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button onClick={onPlayAgain} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.13)", color: "#fff", fontFamily: FF, fontWeight: 700, fontSize: 14, padding: 14, borderRadius: 14, cursor: "pointer" }}>
            🔄 Play Again
          </button>
          <button onClick={onLeaderboard} style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", border: "none", color: "#fff", fontFamily: FF, fontWeight: 700, fontSize: 14, padding: 14, borderRadius: 14, cursor: "pointer" }}>
            🏆 Leaderboard
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
function LeaderboardScreen(props) {
  var leaderboard = props.leaderboard;
  var myNickname = props.myNickname;
  var onBack = props.onBack;
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FF, paddingBottom: 52 }}>
      <style dangerouslySetInnerHTML={{ __html: GCSS }} />
      <div style={{ maxWidth: 430, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ paddingTop: 40, paddingBottom: 20 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#4ade80", fontFamily: FF, fontSize: 14, cursor: "pointer", marginBottom: 14 }}>
            ← Back
          </button>
          <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 800 }}>🏆 Leaderboard</h2>
          <p style={{ color: "#86efac", fontSize: 13, marginTop: 4 }}>Global — powered by Supabase</p>
        </div>

        {leaderboard.length === 0 ? (
          <div style={{ textAlign: "center", color: "#4b5563", paddingTop: 60 }}>
            <div style={{ fontSize: 48 }}>🇳🇬</div>
            <p style={{ marginTop: 14, fontSize: 15 }}>No scores yet — be the first!</p>
          </div>
        ) : leaderboard.map(function(e, i) {
          var isMe = e.nickname === myNickname;
          var medal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1);
          return (
            <div
              key={e.id}
              style={{
                background: isMe ? "rgba(22,163,74,.11)" : "rgba(255,255,255,.04)",
                border: "1px solid " + (isMe ? "rgba(74,222,128,.35)" : "rgba(255,255,255,.07)"),
                borderRadius: 14, padding: "12px 16px", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 12,
              }}
            >
              <span style={{ fontSize: i < 3 ? 20 : 13, color: i === 0 ? "#fbbf24" : "#6b7280", minWidth: 28 }}>
                {medal}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{e.nickname}</span>
                  {isMe && <span className="htag" style={{ fontSize: 9, padding: "1px 7px" }}>YOU</span>}
                </div>
                <div style={{ height: 4, background: "#1e293b", borderRadius: 9 }}>
                  <div style={{ width: ((e.score / 37) * 100) + "%", height: "100%", background: "#16a34a", borderRadius: 9 }} />
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#4ade80", fontWeight: 800, fontSize: 18 }}>{e.score}</div>
                <div style={{ color: "#6b7280", fontSize: 11 }}>/37</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
