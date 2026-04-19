'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ─── EDIT BEFORE PRESENTING ───────────────────────────────────────────────────
const TEAM = ['Member 1', 'Member 2', 'Member 3'];
// Which team member speaks each slide (0 = Member 1, 1 = Member 2, 2 = Member 3)
const SPEAKER_MAP = [0, 0, 1, 1, 2, 2];

// ─── Animated Number Counter ──────────────────────────────────────────────────
function Counter({
  to, active, suffix = '', prefix = '', duration = 1.8,
}: { to: number; active: boolean; suffix?: string; prefix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) { setVal(0); return; }
    const start = Date.now();
    const tick = () => {
      const t = Math.min((Date.now() - start) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(ease * to));
      if (t < 1) requestAnimationFrame(tick);
      else setVal(to);
    };
    requestAnimationFrame(tick);
  }, [to, active, duration]);
  return <>{prefix}{val.toLocaleString('en-IN')}{suffix}</>;
}

// ─── Phone Frame ──────────────────────────────────────────────────────────────
function PhoneFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-[196px] bg-[#0A0A0A] rounded-[32px] border-2 border-[#252525] shadow-[0_0_80px_rgba(34,197,94,0.06)] overflow-hidden ${className}`}>
      <div className="flex justify-center pt-2.5 pb-1">
        <div className="w-14 h-[14px] bg-[#161616] rounded-full" />
      </div>
      <div className="px-3 pb-4 space-y-1.5">{children}</div>
    </div>
  );
}

// ─── SLIDE 1 — India's Waste Crisis ──────────────────────────────────────────
function Slide1({ active }: { active: boolean }) {
  return (
    <div className="flex h-full items-center gap-12">
      {/* Left */}
      <div className="flex-1 min-w-0">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-3.5 py-1.5 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[11px] font-bold text-red-400 tracking-[0.14em] uppercase">The Problem</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <div className="text-[5.8rem] font-black text-white leading-none tracking-tighter">
            <Counter to={150000} active={active} />
          </div>
          <p className="text-zinc-400 text-xl mt-1 mb-7 leading-snug">
            tonnes of waste, every single day.<br />
            <span className="text-zinc-600 text-base">India's cities are running out of room.</span>
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="grid grid-cols-3 gap-3">
          {[
            { val: '77%', label: 'goes unsegregated', color: 'text-red-400', bg: 'bg-red-500/8' },
            { val: '₹14,000 Cr', label: 'lost annually', color: 'text-amber-400', bg: 'bg-amber-500/8' },
            { val: '₹25,000 Cr', label: 'recyclables wasted', color: 'text-orange-400', bg: 'bg-orange-500/8' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border border-white/5 rounded-2xl px-4 py-4`}>
              <div className={`text-2xl font-black ${s.color} leading-tight`}>{s.val}</div>
              <div className="text-[11px] text-zinc-600 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right — Broken Chain */}
      <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.38 }}
        className="w-60 shrink-0 space-y-1.5">
        <p className="text-[11px] text-zinc-700 font-semibold uppercase tracking-widest mb-3 text-center">
          The broken chain
        </p>
        {[
          { icon: '🧑', title: 'Citizen', text: 'No idea which bin. No feedback. No motivation.', delay: 0.4 },
          { icon: '🚛', title: 'Collector', text: 'Mixes everything together. No tracking, no score.', delay: 0.52 },
          { icon: '🏭', title: 'Processing', text: 'Contaminated waste → straight to landfill.', delay: 0.64 },
        ].map((c, i) => (
          <React.Fragment key={c.title}>
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: c.delay }}
              className="bg-[#111] border border-red-500/12 rounded-2xl p-3.5">
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-base">{c.icon}</span>
                <span className="text-sm font-bold text-white">{c.title}</span>
                <span className="ml-auto text-[10px] font-bold text-red-500">❌</span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-snug">{c.text}</p>
            </motion.div>
            {i < 2 && (
              <div className="flex justify-center">
                <div className="text-red-900 text-sm leading-none">↓</div>
              </div>
            )}
          </React.Fragment>
        ))}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="bg-red-500/8 border border-red-500/15 rounded-xl px-3 py-2 text-center mt-2">
          <span className="text-red-400 text-xs font-semibold">Result: Jaipur alone generates 2,500+ tonnes/day</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── SLIDE 2 — The Behavior Gap ───────────────────────────────────────────────
function Slide2({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col h-full justify-center gap-7">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3.5 py-1.5 mb-4">
          <span className="text-[11px] font-bold text-amber-400 tracking-[0.14em] uppercase">Root Cause</span>
        </div>
        <h2 className="text-[3.4rem] font-black text-white leading-tight tracking-tight">
          It's not a <span className="text-amber-400">knowledge</span> gap.
          <br />It's a <span className="text-red-400">behavior</span> gap.
        </h2>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
        className="grid grid-cols-3 gap-4">
        {[
          { icon: '📢', label: 'Swachh Bharat', sub: 'Campaigns', verdict: 'One-time awareness. No behavior change 6 months later.' },
          { icon: '♻️', label: 'Kabadiwala / ScrapQ', sub: 'Recycling apps', verdict: 'Focuses on pickup logistics. Citizen behavior: unchanged.' },
          { icon: '📱', label: 'Jaipur 311', sub: 'Municipal app', verdict: 'Report and forget. No AI classification. No gamification.' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 + i * 0.1 }}
            className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-5 flex flex-col gap-3">
            <span className="text-3xl">{s.icon}</span>
            <div>
              <div className="text-sm font-bold text-white">{s.label}</div>
              <div className="text-[10px] text-zinc-600 mb-2">{s.sub}</div>
              <div className="text-[11px] text-zinc-500 leading-relaxed">{s.verdict}</div>
            </div>
            <div className="flex items-center gap-1.5 mt-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span className="text-[10px] text-red-500/80 font-medium">Treats symptoms, not the cause</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.68 }}
        className="bg-[#0C1A0C] border border-[#22C55E]/18 rounded-2xl px-6 py-4">
        <p className="text-[#22C55E] text-[1.05rem] font-medium text-center leading-relaxed">
          "People <em>know</em> they should segregate — but there's no instant feedback, no reward,
          and no accountability when they don't."
        </p>
      </motion.div>
    </div>
  );
}

// ─── SLIDE 3 — Meet Nagrik ────────────────────────────────────────────────────
function Slide3({ active }: { active: boolean }) {
  return (
    <div className="flex h-full items-center gap-10">
      {/* Left */}
      <div className="flex-1 min-w-0">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="inline-flex items-center gap-2 bg-[#22C55E]/10 border border-[#22C55E]/22 rounded-full px-3.5 py-1.5 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[11px] font-bold text-[#22C55E] tracking-[0.14em] uppercase">The Solution</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="flex items-center gap-3 mb-1">
          <div className="w-11 h-11 rounded-[14px] bg-[#22C55E]/12 border border-[#22C55E]/28 flex items-center justify-center">
            <span className="text-xl">🌿</span>
          </div>
          <span className="text-[4.2rem] font-black text-white tracking-tight leading-none">nagrik</span>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-xl font-bold text-[#22C55E] mb-2 tracking-wide">
          Scan. Segregate. Score.
        </motion.p>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-zinc-400 text-sm mb-7 leading-relaxed max-w-[340px]">
          The first AI platform that closes the full accountability loop — from the citizen's hand to the collector's route to the city's score.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="space-y-2.5">
          {[
            { icon: '🤖', label: 'GPT-4o Vision AI', desc: '9 waste categories · 4 bin colors · instant result' },
            { icon: '⭐', label: 'Eco-Points Engine', desc: '2–15 pts per scan · redeemable at local businesses' },
            { icon: '🚛', label: 'Collector Accountability', desc: 'Real-time pickup tracking · route optimization · scoring' },
            { icon: '📊', label: 'Ward Transparency', desc: 'Public leaderboard · recycling rate per ward · live' },
          ].map((p, i) => (
            <motion.div key={p.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.08 }}
              className="flex items-center gap-3 bg-[#111] border border-[#1A1A1A] rounded-xl px-4 py-2.5">
              <span className="text-lg shrink-0">{p.icon}</span>
              <div>
                <div className="text-[13px] font-bold text-white">{p.label}</div>
                <div className="text-[11px] text-zinc-600">{p.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right — Scan Result Phone */}
      <motion.div initial={{ opacity: 0, x: 28, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: 0.36, duration: 0.45 }}
        className="shrink-0">
        <PhoneFrame>
          {/* App header */}
          <div className="flex items-center justify-between pt-1 pb-1">
            <span className="text-[10px] font-bold text-[#22C55E]">🌿 nagrik</span>
            <span className="text-[9px] bg-[#22C55E]/12 text-[#22C55E] px-2 py-0.5 rounded-full font-semibold">Result</span>
          </div>

          {/* Bin circle */}
          <div className="flex flex-col items-center py-3 gap-1.5">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6, type: 'spring', stiffness: 280 }}
              className="w-[68px] h-[68px] rounded-full bg-[#22C55E]/18 border-2 border-[#22C55E]/45 flex items-center justify-center">
              <span className="text-3xl">🌿</span>
            </motion.div>
            <div className="text-center">
              <div className="text-white font-bold text-[13px]">Wet Organic</div>
              <div className="text-[10px] text-zinc-600">Goes in the Green Bin</div>
            </div>
          </div>

          {/* Points badge */}
          <div className="bg-[#22C55E]/10 border border-[#22C55E]/22 rounded-xl py-2 text-center">
            <span className="text-[#22C55E] font-black text-sm">+10 Eco Points</span>
          </div>

          {/* Prep steps */}
          <div className="bg-[#131313] rounded-xl p-2.5 space-y-1.5">
            <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider mb-1">Prep Steps</div>
            {['Remove any packaging', 'Drain excess liquid', 'Place in green bin'].map(s => (
              <div key={s} className="flex items-start gap-1.5">
                <span className="text-[#22C55E] text-[10px] mt-px">✓</span>
                <span className="text-[10px] text-zinc-400 leading-snug">{s}</span>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div className="text-[9px] text-zinc-600 px-0.5">
            💡 Composting food waste reduces methane by 95%
          </div>

          {/* Log button */}
          <button className="w-full bg-[#22C55E] text-black font-bold text-[11px] py-2.5 rounded-xl">
            Log Scan →
          </button>
        </PhoneFrame>
      </motion.div>
    </div>
  );
}

// ─── SLIDE 4 — The Accountability Loop ───────────────────────────────────────
function Slide4({ active }: { active: boolean }) {
  const steps = [
    { icon: '📸', label: 'Citizen Scans', sub: 'Camera → photo', color: '#22C55E' },
    { icon: '🤖', label: 'AI Classifies', sub: 'Under 3 seconds', color: '#3B82F6' },
    { icon: '🎯', label: 'Bin + Points', sub: '2–15 eco-pts', color: '#A855F7' },
    { icon: '🚛', label: 'Collector Notified', sub: 'Real-time alert', color: '#F59E0B' },
    { icon: '📊', label: 'Ward Score', sub: 'Public board', color: '#22C55E' },
  ];

  return (
    <div className="flex flex-col h-full justify-center gap-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3.5 py-1.5 mb-4">
          <span className="text-[11px] font-bold text-blue-400 tracking-[0.14em] uppercase">How It Works</span>
        </div>
        <h2 className="text-[3.4rem] font-black text-white leading-tight tracking-tight">
          The Accountability <span className="text-[#22C55E]">Loop</span>
        </h2>
        <p className="text-zinc-500 text-base mt-1.5">
          Every scan triggers a full chain of action — automatically, in real time.
        </p>
      </motion.div>

      {/* Flow diagram */}
      <div className="flex items-start gap-1">
        {steps.map((s, i) => (
          <React.Fragment key={s.label}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 + i * 0.12 }}
              className="flex-1 flex flex-col items-center gap-3">
              <div className="w-[68px] h-[68px] rounded-2xl flex items-center justify-center text-[1.8rem] border"
                style={{ background: `${s.color}12`, borderColor: `${s.color}28` }}>
                {s.icon}
              </div>
              <div className="text-center px-1">
                <div className="text-[13px] font-bold text-white leading-tight">{s.label}</div>
                <div className="text-[11px] text-zinc-600 mt-0.5">{s.sub}</div>
              </div>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.4 + i * 0.12, duration: 0.25 }}
                className="flex-shrink-0 text-zinc-700 text-xl mt-5 mx-0.5">
                →
              </motion.div>
            )}
          </React.Fragment>
        ))}
        {/* Loop arrow */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
          className="flex-shrink-0 text-[#22C55E] font-black text-sm mt-5 ml-1">
          ↺
        </motion.div>
      </div>

      {/* Stats row */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
        className="bg-[#0C1A0C] border border-[#22C55E]/14 rounded-2xl px-6 py-4 flex justify-around items-center">
        {[
          { val: '9', label: 'Waste Categories' },
          { val: '4', label: 'Bin Colors' },
          { val: '< 3s', label: 'AI Response' },
          { val: '2–15', label: 'Eco Points' },
          { val: 'Live', label: 'Collector Alerts' },
          { val: '₹0', label: 'Cost to Citizen' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className="text-lg font-black text-[#22C55E]">{s.val}</div>
            <div className="text-[10px] text-zinc-600">{s.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── SLIDE 5 — The Platform ───────────────────────────────────────────────────
function Slide5({ active }: { active: boolean }) {
  return (
    <div className="flex h-full items-center gap-10">
      {/* Left */}
      <div className="flex-1 min-w-0">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3.5 py-1.5 mb-5">
          <span className="text-[11px] font-bold text-purple-400 tracking-[0.14em] uppercase">The Platform</span>
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="text-[2.8rem] font-black text-white leading-tight tracking-tight mb-4">
          Two dashboards.<br /><span className="text-[#22C55E]">One mission.</span>
        </motion.h2>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="space-y-3 mb-6">
          {[
            { icon: '🧑', role: 'Citizens', color: '#22C55E', desc: 'Scan waste, earn points, climb the leaderboard, redeem rewards at local shops.' },
            { icon: '🚛', role: 'Collectors', color: '#F59E0B', desc: 'Live pickup queue, Google Maps navigation, daily kg stats, performance score.' },
          ].map((r, i) => (
            <motion.div key={r.role} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42 + i * 0.1 }}
              className="bg-[#111] border border-[#1A1A1A] rounded-2xl px-4 py-3.5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ background: `${r.color}12`, border: `1px solid ${r.color}25` }}>
                {r.icon}
              </div>
              <div>
                <div className="text-[13px] font-bold text-white mb-0.5">{r.role}</div>
                <div className="text-[11px] text-zinc-500 leading-relaxed">{r.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          className="flex flex-wrap gap-2">
          {['AI Scanner', 'Eco Marketplace', 'Public Leaderboard', 'Route Optimizer', 'Ward Analytics', 'Reports Dashboard'].map(tag => (
            <span key={tag} className="bg-[#111] border border-[#22C55E]/18 text-[#22C55E] text-[10px] font-semibold rounded-full px-3 py-1.5">
              {tag}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Right — Two phones */}
      <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32 }}
        className="flex gap-4 shrink-0 items-start pt-4">
        {/* Citizen dashboard */}
        <PhoneFrame>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] font-bold text-[#22C55E]">🌿 nagrik</span>
            <span className="text-[8px] bg-[#22C55E]/12 text-[#22C55E] px-1.5 py-0.5 rounded-full font-bold">Citizen</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            {[
              { v: '247', l: 'Eco Points', c: '#22C55E' },
              { v: '12', l: 'Total Scans', c: '#3B82F6' },
            ].map(s => (
              <div key={s.l} className="bg-[#131313] rounded-xl px-2.5 py-2.5">
                <div className="text-sm font-black" style={{ color: s.c }}>{s.v}</div>
                <div className="text-[9px] text-zinc-600">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="bg-[#131313] rounded-xl p-2.5">
            <div className="text-[9px] text-zinc-600 font-semibold mb-1.5">Ward Rank</div>
            <div className="flex items-center gap-2">
              <span className="text-[#22C55E] text-sm font-black">#3</span>
              <span className="text-[10px] text-white">Mansarovar</span>
              <span className="ml-auto text-[#22C55E] text-[9px] font-bold">↑ 2</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[9px] text-zinc-600 font-semibold">Recent Scans</div>
            {[
              { type: 'Dry Plastic', pts: '+10', color: '#3B82F6' },
              { type: 'Wet Organic', pts: '+10', color: '#22C55E' },
            ].map(sc => (
              <div key={sc.type} className="flex items-center gap-1.5 bg-[#131313] rounded-lg px-2 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sc.color }} />
                <span className="text-[9px] text-zinc-400 flex-1">{sc.type}</span>
                <span className="text-[9px] font-bold" style={{ color: sc.color }}>{sc.pts}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#22C55E] rounded-xl py-2 text-center">
            <span className="text-black text-[10px] font-black">📸 Scan Waste</span>
          </div>
        </PhoneFrame>

        {/* Collector dashboard */}
        <PhoneFrame className="mt-8">
          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] font-bold text-amber-400">🚛 nagrik</span>
            <span className="text-[8px] bg-amber-500/12 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">Collector</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            {[
              { v: '5/8', l: 'Today', c: '#22C55E' },
              { v: '127 kg', l: 'Collected', c: '#F59E0B' },
            ].map(s => (
              <div key={s.l} className="bg-[#131313] rounded-xl px-2.5 py-2.5">
                <div className="text-sm font-black" style={{ color: s.c }}>{s.v}</div>
                <div className="text-[9px] text-zinc-600">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="text-[9px] text-zinc-600 font-semibold">Pending Pickups</div>
          {[
            { name: 'Rahul Sharma', type: 'Wet Organic', color: '#22C55E' },
            { name: 'Priya Tiwari', type: 'Dry Plastic', color: '#3B82F6' },
            { name: 'Amit Gupta', type: 'E-Waste', color: '#EF4444' },
          ].map(p => (
            <div key={p.name} className="bg-[#131313] rounded-xl px-2 py-2 flex items-center gap-2 border-l-2"
              style={{ borderColor: p.color }}>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-bold text-white truncate">{p.name}</div>
                <div className="text-[8px] text-zinc-600">{p.type}</div>
              </div>
              <span className="text-[9px] text-zinc-700">Navigate →</span>
            </div>
          ))}
        </PhoneFrame>
      </motion.div>
    </div>
  );
}

// ─── SLIDE 6 — The Vision ─────────────────────────────────────────────────────
function Slide6({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col h-full justify-center items-center text-center gap-7 px-4">
      {/* Logo */}
      <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08, type: 'spring', stiffness: 240 }}
        className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-[18px] bg-[#22C55E]/12 border border-[#22C55E]/28 flex items-center justify-center">
          <span className="text-3xl">🌿</span>
        </div>
        <span className="text-[4.5rem] font-black text-white tracking-tight leading-none">nagrik</span>
      </motion.div>

      {/* Vision statement */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="max-w-[580px]">
        <h2 className="text-[2.6rem] font-black text-white leading-tight tracking-tight mb-2">
          Cleaner cities.{' '}
          <span className="text-[#22C55E]">Smarter citizens.</span>
          <br />Accountable collectors.
        </h2>
        <p className="text-zinc-500 text-base">
          Built in Jaipur. Designed for every Indian city.
        </p>
      </motion.div>

      {/* Vision targets */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
        className="flex gap-4 w-full max-w-[560px]">
        {[
          { val: '50', unit: 'Cities', sub: 'by 2026', color: '#22C55E' },
          { val: '10M', unit: 'Scans', sub: 'Year 1 target', color: '#3B82F6' },
          { val: '₹25K Cr', unit: 'Recovered', sub: 'Recyclable value', color: '#A855F7' },
        ].map((s, i) => (
          <motion.div key={s.unit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46 + i * 0.1 }}
            className="flex-1 bg-[#111] border border-[#1A1A1A] rounded-2xl px-5 py-4">
            <div className="text-[2rem] font-black leading-tight mb-0.5" style={{ color: s.color }}>{s.val}</div>
            <div className="text-sm font-bold text-white">{s.unit}</div>
            <div className="text-[11px] text-zinc-600 mt-0.5">{s.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Team */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
        className="flex items-center gap-3">
        <span className="text-zinc-600 text-sm">Presented by</span>
        {TEAM.map((name, i) => (
          <React.Fragment key={name}>
            <span className="text-white font-semibold text-sm">{name}</span>
            {i < TEAM.length - 1 && <span className="text-zinc-700 text-lg">·</span>}
          </React.Fragment>
        ))}
      </motion.div>

      {/* Tagline pill */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.78 }}
        className="bg-[#0C1A0C] border border-[#22C55E]/18 rounded-full px-6 py-2.5">
        <p className="text-[#22C55E] text-sm font-semibold tracking-wide">
          Scan. Segregate. Score. — Making India's cities cleaner, one photo at a time.
        </p>
      </motion.div>
    </div>
  );
}

// ─── Slide registry ───────────────────────────────────────────────────────────
const SLIDES = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6];
const TITLES = [
  "India's Waste Crisis",
  'The Behavior Gap',
  'Meet Nagrik',
  'The Accountability Loop',
  'The Platform',
  'The Vision',
];

// ─── Main Presentation ────────────────────────────────────────────────────────
export default function PresentationClient() {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  const go = useCallback((d: number) => {
    const next = current + d;
    if (next < 0 || next >= SLIDES.length) return;
    setDir(d);
    setCurrent(next);
  }, [current]);

  const jumpTo = useCallback((i: number) => {
    setDir(i > current ? 1 : -1);
    setCurrent(i);
  }, [current]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [go]);

  const SlideComp = SLIDES[current];
  const speakerIdx = SPEAKER_MAP[current];
  const speakerColors = ['#22C55E', '#3B82F6', '#A855F7'];

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] flex flex-col overflow-hidden select-none"
      onClick={() => go(1)}
    >
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.022]">
        <svg className="w-full h-full">
          <defs>
            <pattern id="deck-grid" width="56" height="56" patternUnits="userSpaceOnUse">
              <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#22C55E" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#deck-grid)" />
        </svg>
      </div>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[140px]"
          style={{ background: `${speakerColors[speakerIdx]}05` }} />
      </div>

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-4"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#22C55E]/12 border border-[#22C55E]/22 flex items-center justify-center">
            <span className="text-[11px]">🌿</span>
          </div>
          <span className="text-[11px] font-bold text-zinc-700 tracking-tight">nagrik</span>
        </div>

        {/* Speaker badge */}
        <div className="flex items-center gap-2 bg-[#111] border border-[#1E1E1E] rounded-full px-3.5 py-1.5">
          <span className="text-xs">🎤</span>
          <span className="text-xs font-bold text-white" style={{ color: speakerColors[speakerIdx] }}>
            {TEAM[speakerIdx]}
          </span>
          <span className="text-zinc-700 text-xs">·</span>
          <span className="text-xs text-zinc-500">{TITLES[current]}</span>
        </div>

        <span className="text-[11px] text-zinc-700 font-mono tabular-nums">
          {current + 1} <span className="text-zinc-800">/</span> {SLIDES.length}
        </span>
      </div>

      {/* Slide */}
      <div className="flex-1 flex items-center justify-center px-14 pt-16 pb-16 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={current}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? 72 : -72, opacity: 0, filter: 'blur(4px)' }),
              center: { x: 0, opacity: 1, filter: 'blur(0px)' },
              exit: (d: number) => ({ x: d > 0 ? -72 : 72, opacity: 0, filter: 'blur(4px)' }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-5xl h-[480px]"
            onClick={e => e.stopPropagation()}
          >
            <SlideComp active />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-4"
        onClick={e => e.stopPropagation()}>
        <button
          onClick={() => go(-1)}
          disabled={current === 0}
          className="flex items-center gap-1 text-xs text-zinc-600 disabled:opacity-25 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 disabled:pointer-events-none"
        >
          <ChevronLeft size={13} /> Prev
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => jumpTo(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-7 bg-[#22C55E]'
                  : 'w-1 bg-zinc-700 hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>

        {current < SLIDES.length - 1 ? (
          <button
            onClick={() => go(1)}
            className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            Next <ChevronRight size={13} />
          </button>
        ) : (
          <span className="text-xs text-[#22C55E] font-semibold px-3">Thank you 🌿</span>
        )}
      </div>
    </div>
  );
}
