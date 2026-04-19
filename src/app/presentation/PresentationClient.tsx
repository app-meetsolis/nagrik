'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ─── EDIT BEFORE PRESENTING ───────────────────────────────────────────────────
const TEAM = ['Member 1', 'Member 2', 'Member 3'];
const SPEAKER_MAP = [0, 0, 1, 1, 2, 2];

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ to, active, suffix = '', prefix = '', duration = 1.8 }: {
  to: number; active: boolean; suffix?: string; prefix?: string; duration?: number;
}) {
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
    <div className={`w-[260px] bg-[#0A0A0A] rounded-[36px] border-[2.5px] border-[#252525] shadow-[0_0_60px_rgba(34,197,94,0.1)] overflow-hidden ${className}`}>
      <div className="flex justify-center pt-3 pb-1.5">
        <div className="w-16 h-[16px] bg-[#161616] rounded-full" />
      </div>
      <div className="px-4 pb-5 space-y-2">{children}</div>
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
          className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-full px-4 py-2 mb-5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-bold text-red-400 tracking-[0.12em] uppercase">The Problem</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <div className="text-[6.5rem] font-black text-white leading-none tracking-tighter">
            <Counter to={150000} active={active} />
          </div>
          <p className="text-zinc-300 text-2xl mt-2 mb-7 leading-snug font-medium">
            tonnes of waste, every single day.
            <br /><span className="text-zinc-500 text-lg font-normal">India's cities are running out of room.</span>
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="grid grid-cols-3 gap-4">
          {[
            { val: '77%', label: 'goes unsegregated to landfills', color: 'text-red-400', bg: 'bg-red-500/8', border: 'border-red-500/15' },
            { val: '₹14,000 Cr', label: 'lost in annual management costs', color: 'text-amber-400', bg: 'bg-amber-500/8', border: 'border-amber-500/15' },
            { val: '₹25,000 Cr', label: 'in recyclables wasted yearly', color: 'text-orange-400', bg: 'bg-orange-500/8', border: 'border-orange-500/15' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl px-5 py-5`}>
              <div className={`text-3xl font-black ${s.color} leading-tight`}>{s.val}</div>
              <div className="text-sm text-zinc-500 mt-1.5 leading-snug">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right — Broken Chain */}
      <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.38 }}
        className="w-72 shrink-0 space-y-2">
        <p className="text-xs text-zinc-700 font-bold uppercase tracking-widest mb-4 text-center">
          The broken chain
        </p>
        {[
          { icon: '🧑', title: 'Citizen', text: 'No idea which bin. Zero feedback. Zero motivation to do it right.', delay: 0.42 },
          { icon: '🚛', title: 'Collector', text: 'Mixes everything together regardless. No tracking. No accountability.', delay: 0.54 },
          { icon: '🏭', title: 'Processing', text: 'Contaminated waste arrives. ₹25,000 Cr of recyclables straight to landfill.', delay: 0.66 },
        ].map((c, i) => (
          <React.Fragment key={c.title}>
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: c.delay }}
              className="bg-[#111] border border-red-500/15 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-lg">
                  {c.icon}
                </div>
                <span className="text-base font-bold text-white">{c.title}</span>
                <span className="ml-auto text-red-500 font-bold text-sm">❌</span>
              </div>
              <p className="text-sm text-zinc-500 leading-snug">{c.text}</p>
            </motion.div>
            {i < 2 && (
              <div className="flex justify-center py-0.5">
                <div className="text-red-800 text-lg leading-none">↓</div>
              </div>
            )}
          </React.Fragment>
        ))}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.82 }}
          className="bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-3 text-center mt-2">
          <span className="text-red-400 text-sm font-semibold">
            Jaipur alone: 2,500+ tonnes every day
          </span>
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
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/22 rounded-full px-4 py-2 mb-4">
          <span className="text-sm font-bold text-amber-400 tracking-[0.12em] uppercase">Root Cause</span>
        </div>
        <h2 className="text-[3.8rem] font-black text-white leading-tight tracking-tight">
          It's not a <span className="text-amber-400">knowledge</span> gap.
          <br />It's a <span className="text-red-400">behavior</span> gap.
        </h2>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
        className="grid grid-cols-3 gap-4">
        {[
          {
            icon: '📢', label: 'Swachh Bharat Campaigns', sub: 'Government initiative',
            verdict: 'One-time awareness messaging. No sustained behavior change 6 months later.',
          },
          {
            icon: '♻️', label: 'Kabadiwala / ScrapQ', sub: 'Recycling apps',
            verdict: 'Focuses only on pickup logistics. The citizen\'s sorting behavior stays unchanged.',
          },
          {
            icon: '📱', label: 'Jaipur 311 App', sub: 'Municipal app',
            verdict: 'Report and forget model. No AI classification. No reward. No gamification.',
          },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 + i * 0.1 }}
            className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-5 flex flex-col gap-3">
            <span className="text-4xl">{s.icon}</span>
            <div>
              <div className="text-base font-bold text-white mb-0.5">{s.label}</div>
              <div className="text-xs text-zinc-600 mb-2.5">{s.sub}</div>
              <div className="text-sm text-zinc-400 leading-relaxed">{s.verdict}</div>
            </div>
            <div className="flex items-center gap-2 mt-auto pt-1 border-t border-[#1A1A1A]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span className="text-xs text-red-400/80 font-medium">Treats symptoms, not the cause</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.68 }}
        className="bg-[#0C1A0C] border border-[#22C55E]/20 rounded-2xl px-7 py-5">
        <p className="text-[#22C55E] text-lg font-medium text-center leading-relaxed">
          "People <em>know</em> they should segregate — but there's <strong>no instant feedback</strong>,{' '}
          <strong>no reward</strong>, and <strong>no accountability</strong> when they don't."
        </p>
      </motion.div>
    </div>
  );
}

// ─── SLIDE 3 — Meet Nagrik ────────────────────────────────────────────────────
function Slide3({ active }: { active: boolean }) {
  return (
    <div className="flex h-full items-center gap-12">
      {/* Left */}
      <div className="flex-1 min-w-0">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="inline-flex items-center gap-2 bg-[#22C55E]/10 border border-[#22C55E]/25 rounded-full px-4 py-2 mb-5">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-sm font-bold text-[#22C55E] tracking-[0.12em] uppercase">The Solution</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="flex items-center gap-3.5 mb-1.5">
          <div className="w-14 h-14 rounded-2xl bg-[#22C55E]/12 border border-[#22C55E]/28 flex items-center justify-center">
            <span className="text-3xl">🌿</span>
          </div>
          <span className="text-[4.8rem] font-black text-white tracking-tight leading-none">nagrik</span>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-[#22C55E] mb-3 tracking-wide">
          Scan. Segregate. Score.
        </motion.p>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
          className="text-zinc-400 text-base mb-6 leading-relaxed max-w-[380px]">
          The first AI platform that closes the full accountability loop — from the citizen's hand to the collector's route to the city's public score.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }}
          className="space-y-2.5">
          {[
            { icon: '🤖', label: 'GPT-4o Vision AI', desc: '9 waste categories · 4 bin colors · instant classification' },
            { icon: '⭐', label: 'Eco-Points Engine', desc: '2–15 pts per correct scan · redeemable at local businesses' },
            { icon: '🚛', label: 'Collector Accountability', desc: 'Real-time pickup queue · Google Maps navigation · daily scores' },
            { icon: '📊', label: 'Ward-Level Transparency', desc: 'Public recycling leaderboard · live stats per ward' },
          ].map((p, i) => (
            <motion.div key={p.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.58 + i * 0.08 }}
              className="flex items-center gap-3.5 bg-[#111] border border-[#1A1A1A] rounded-xl px-4 py-3">
              <span className="text-2xl shrink-0">{p.icon}</span>
              <div>
                <div className="text-base font-bold text-white">{p.label}</div>
                <div className="text-sm text-zinc-500 mt-0.5">{p.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right — Scan Result Phone */}
      <motion.div initial={{ opacity: 0, x: 28, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 0.36, duration: 0.45 }} className="shrink-0">
        <PhoneFrame>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-bold text-[#22C55E]">🌿 nagrik</span>
            <span className="text-xs bg-[#22C55E]/12 text-[#22C55E] px-2.5 py-1 rounded-full font-semibold">AI Result</span>
          </div>

          <div className="flex flex-col items-center py-4 gap-2.5">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.62, type: 'spring', stiffness: 260 }}
              className="w-20 h-20 rounded-full bg-[#22C55E]/18 border-[2.5px] border-[#22C55E]/50 flex items-center justify-center">
              <span className="text-4xl">🌿</span>
            </motion.div>
            <div className="text-center">
              <div className="text-white font-bold text-base">Wet Organic</div>
              <div className="text-sm text-zinc-500">→ Green Bin</div>
            </div>
          </div>

          <div className="bg-[#22C55E]/10 border border-[#22C55E]/25 rounded-xl py-2.5 text-center">
            <span className="text-[#22C55E] font-black text-base">+10 Eco Points ⭐</span>
          </div>

          <div className="bg-[#131313] rounded-xl p-3 space-y-2">
            <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Prep Steps</div>
            {['Remove any packaging', 'Drain excess liquid', 'Place in green bin'].map(s => (
              <div key={s} className="flex items-center gap-2">
                <span className="text-[#22C55E] text-sm font-bold">✓</span>
                <span className="text-sm text-zinc-300">{s}</span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 px-1">
            <span className="text-sm">💡</span>
            <span className="text-xs text-zinc-600 leading-snug">Composting food waste reduces methane emissions by 95%</span>
          </div>

          <button className="w-full bg-[#22C55E] text-black font-black text-sm py-3 rounded-xl">
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
    { icon: '🚛', label: 'Collector Alert', sub: 'Real-time ping', color: '#F59E0B' },
    { icon: '📊', label: 'Ward Score', sub: 'Public board', color: '#22C55E' },
  ];

  return (
    <div className="flex flex-col h-full justify-center gap-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/22 rounded-full px-4 py-2 mb-4">
          <span className="text-sm font-bold text-blue-400 tracking-[0.12em] uppercase">How It Works</span>
        </div>
        <h2 className="text-[3.8rem] font-black text-white leading-tight tracking-tight">
          The Accountability <span className="text-[#22C55E]">Loop</span>
        </h2>
        <p className="text-zinc-400 text-lg mt-2">
          Every single scan triggers an automatic chain of action — citizen to collector to city.
        </p>
      </motion.div>

      {/* Flow diagram */}
      <div className="flex items-start gap-0">
        {steps.map((s, i) => (
          <React.Fragment key={s.label}>
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 + i * 0.12 }}
              className="flex-1 flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl border-2"
                style={{ background: `${s.color}12`, borderColor: `${s.color}30` }}>
                {s.icon}
              </div>
              <div className="text-center px-1">
                <div className="text-base font-bold text-white leading-tight">{s.label}</div>
                <div className="text-sm text-zinc-500 mt-1">{s.sub}</div>
              </div>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.4 + i * 0.12, duration: 0.3 }}
                className="flex-shrink-0 text-zinc-700 text-2xl mt-7 mx-1 font-thin">
                →
              </motion.div>
            )}
          </React.Fragment>
        ))}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05 }}
          className="shrink-0 text-[#22C55E] text-xl font-black mt-7 ml-2" title="Repeats — it's a loop">
          ↺
        </motion.div>
      </div>

      {/* Stats bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.92 }}
        className="bg-[#0C1A0C] border border-[#22C55E]/16 rounded-2xl px-8 py-5 flex justify-around items-center">
        {[
          { val: '9', label: 'Waste Categories' },
          { val: '4', label: 'Bin Colors' },
          { val: '< 3s', label: 'AI Response' },
          { val: '2–15', label: 'Eco Points' },
          { val: 'Live', label: 'Collector Alerts' },
          { val: '₹0', label: 'Cost to Citizen' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className="text-2xl font-black text-[#22C55E]">{s.val}</div>
            <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
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
      {/* Left content */}
      <div className="flex-1 min-w-0">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/22 rounded-full px-4 py-2 mb-5">
          <span className="text-sm font-bold text-purple-400 tracking-[0.12em] uppercase">The Platform</span>
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="text-[3.2rem] font-black text-white leading-tight tracking-tight mb-5">
          Two dashboards.<br /><span className="text-[#22C55E]">One mission.</span>
        </motion.h2>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="space-y-3 mb-6">
          {[
            { icon: '🧑', role: 'Citizens', color: '#22C55E', desc: 'Scan waste, earn eco-points, climb the ward leaderboard, redeem rewards at local businesses.' },
            { icon: '🚛', role: 'Collectors', color: '#F59E0B', desc: 'Live pickup queue, one-tap Google Maps navigation, daily kg stats, performance dashboard.' },
          ].map((r, i) => (
            <motion.div key={r.role} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.44 + i * 0.1 }}
              className="bg-[#111] border border-[#1A1A1A] rounded-2xl px-5 py-4 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: `${r.color}12`, border: `1.5px solid ${r.color}25` }}>
                {r.icon}
              </div>
              <div>
                <div className="text-base font-bold text-white mb-1">{r.role}</div>
                <div className="text-sm text-zinc-400 leading-relaxed">{r.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.68 }}
          className="flex flex-wrap gap-2">
          {['AI Scanner', 'Eco Marketplace', 'Leaderboard', 'Route Optimizer', 'Ward Analytics', 'Reports'].map(tag => (
            <span key={tag} className="bg-[#111] border border-[#22C55E]/22 text-[#22C55E] text-xs font-semibold rounded-full px-3.5 py-1.5">
              {tag}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Right — Two phones */}
      <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32 }}
        className="flex gap-4 shrink-0 items-start">
        {/* Citizen phone */}
        <PhoneFrame>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-bold text-[#22C55E]">🌿 nagrik</span>
            <span className="text-xs bg-[#22C55E]/12 text-[#22C55E] px-2.5 py-1 rounded-full font-bold">Citizen</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: '247', l: 'Eco Points', c: '#22C55E' },
              { v: '12', l: 'Total Scans', c: '#3B82F6' },
            ].map(s => (
              <div key={s.l} className="bg-[#131313] rounded-xl px-3 py-3">
                <div className="text-xl font-black" style={{ color: s.c }}>{s.v}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="bg-[#131313] rounded-xl p-3">
            <div className="text-xs text-zinc-500 font-semibold mb-2">Ward Rank</div>
            <div className="flex items-center gap-2">
              <span className="text-[#22C55E] text-2xl font-black">#3</span>
              <span className="text-sm text-white font-medium">Mansarovar</span>
              <span className="ml-auto text-[#22C55E] text-xs font-bold bg-[#22C55E]/10 px-2 py-0.5 rounded-full">↑ 2</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="text-xs text-zinc-500 font-semibold">Recent Scans</div>
            {[
              { type: 'Dry Plastic', pts: '+10', color: '#3B82F6' },
              { type: 'Wet Organic', pts: '+10', color: '#22C55E' },
              { type: 'E-Waste', pts: '+15', color: '#EF4444' },
            ].map(sc => (
              <div key={sc.type} className="flex items-center gap-2 bg-[#131313] rounded-lg px-3 py-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sc.color }} />
                <span className="text-sm text-zinc-300 flex-1">{sc.type}</span>
                <span className="text-sm font-bold" style={{ color: sc.color }}>{sc.pts}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#22C55E] rounded-xl py-2.5 text-center">
            <span className="text-black text-sm font-black">📸 Scan Waste</span>
          </div>
        </PhoneFrame>

        {/* Collector phone */}
        <PhoneFrame className="mt-10">
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-bold text-amber-400">🚛 nagrik</span>
            <span className="text-xs bg-amber-500/12 text-amber-400 px-2.5 py-1 rounded-full font-bold">Collector</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: '5/8', l: "Today's Pickups", c: '#22C55E' },
              { v: '127 kg', l: 'Collected', c: '#F59E0B' },
            ].map(s => (
              <div key={s.l} className="bg-[#131313] rounded-xl px-3 py-3">
                <div className="text-xl font-black" style={{ color: s.c }}>{s.v}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-zinc-500 font-semibold pt-1">Pending Pickups</div>
          {[
            { name: 'Rahul Sharma', type: 'Wet Organic', addr: 'Mansarovar', color: '#22C55E' },
            { name: 'Priya Tiwari', type: 'Dry Plastic', addr: 'Jawahar Nagar', color: '#3B82F6' },
            { name: 'Amit Gupta', type: 'E-Waste', addr: 'Jhotwara', color: '#EF4444' },
          ].map(p => (
            <div key={p.name} className="bg-[#131313] rounded-xl px-3 py-2.5 flex items-center gap-2.5 border-l-[3px]"
              style={{ borderColor: p.color }}>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">{p.name}</div>
                <div className="text-xs text-zinc-600">{p.type} · {p.addr}</div>
              </div>
              <span className="text-xs text-zinc-600 font-medium">Maps →</span>
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
    <div className="flex flex-col h-full justify-center items-center text-center gap-7 px-6">
      {/* Logo */}
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08, type: 'spring', stiffness: 220 }}
        className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-[20px] bg-[#22C55E]/12 border border-[#22C55E]/30 flex items-center justify-center">
          <span className="text-4xl">🌿</span>
        </div>
        <span className="text-[5rem] font-black text-white tracking-tight leading-none">nagrik</span>
      </motion.div>

      {/* Vision statement */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="max-w-[620px]">
        <h2 className="text-[2.8rem] font-black text-white leading-tight tracking-tight mb-2">
          Cleaner cities.{' '}
          <span className="text-[#22C55E]">Smarter citizens.</span>
          <br />Accountable collectors.
        </h2>
        <p className="text-zinc-400 text-lg mt-1">
          Built in Jaipur. Designed for every Indian city.
        </p>
      </motion.div>

      {/* Roadmap — honest, not fake download numbers */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
        className="flex gap-4 w-full max-w-[640px]">
        {[
          {
            phase: 'Phase 01',
            title: 'App Built & Live',
            sub: 'What we have today',
            detail: 'AI scanner, collector dashboard, citizen app, eco marketplace — fully functional.',
            color: '#22C55E',
            bg: 'bg-[#22C55E]/8',
            border: 'border-[#22C55E]/20',
          },
          {
            phase: 'Phase 02',
            title: 'Jaipur Pilot',
            sub: 'Next step',
            detail: '3 wards, 500+ households, partnership with Jaipur Municipal Corporation.',
            color: '#3B82F6',
            bg: 'bg-[#3B82F6]/8',
            border: 'border-[#3B82F6]/20',
          },
          {
            phase: 'Phase 03',
            title: 'Pan-India',
            sub: '2026 vision',
            detail: 'Open API for any municipal body. SaaS model. 50 Indian cities.',
            color: '#A855F7',
            bg: 'bg-[#A855F7]/8',
            border: 'border-[#A855F7]/20',
          },
        ].map((s, i) => (
          <motion.div key={s.phase} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46 + i * 0.1 }}
            className={`flex-1 ${s.bg} border ${s.border} rounded-2xl px-5 py-4 text-left`}>
            <div className="text-xs font-bold tracking-widest uppercase mb-1.5" style={{ color: s.color }}>
              {s.phase}
            </div>
            <div className="text-base font-black text-white mb-0.5">{s.title}</div>
            <div className="text-xs text-zinc-600 mb-2">{s.sub}</div>
            <div className="text-sm text-zinc-400 leading-relaxed">{s.detail}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Team */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="flex items-center gap-3">
        <span className="text-zinc-500 text-sm">Presented by</span>
        {TEAM.map((name, i) => (
          <React.Fragment key={name}>
            <span className="text-white font-semibold text-base">{name}</span>
            {i < TEAM.length - 1 && <span className="text-zinc-700 text-xl">·</span>}
          </React.Fragment>
        ))}
      </motion.div>

      {/* Tagline */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.82 }}
        className="bg-[#0C1A0C] border border-[#22C55E]/20 rounded-full px-7 py-3">
        <p className="text-[#22C55E] text-base font-semibold tracking-wide">
          Scan. Segregate. Score. — Making India's cities cleaner, one photo at a time.
        </p>
      </motion.div>
    </div>
  );
}

// ─── Registry ─────────────────────────────────────────────────────────────────
const SLIDES = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6];
const TITLES = ["India's Waste Crisis", 'The Behavior Gap', 'Meet Nagrik', 'The Accountability Loop', 'The Platform', 'The Vision'];

// ─── Main ─────────────────────────────────────────────────────────────────────
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

  const speakerIdx = SPEAKER_MAP[current];
  const speakerColors = ['#22C55E', '#3B82F6', '#A855F7'];
  const SlideComp = SLIDES[current];

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col overflow-hidden select-none"
      onClick={() => go(1)}>

      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <svg className="w-full h-full">
          <defs>
            <pattern id="deck-grid" width="56" height="56" patternUnits="userSpaceOnUse">
              <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#22C55E" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#deck-grid)" />
        </svg>
      </div>

      {/* Ambient glow shifts per speaker */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          key={speakerIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-[180px]"
          style={{ background: `${speakerColors[speakerIdx]}04` }}
        />
      </div>

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-10 py-4"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#22C55E]/12 border border-[#22C55E]/22 flex items-center justify-center">
            <span className="text-sm">🌿</span>
          </div>
          <span className="text-sm font-bold text-zinc-700">nagrik</span>
        </div>

        <div className="flex items-center gap-2.5 bg-[#111] border border-[#1E1E1E] rounded-full px-4 py-2">
          <span className="text-sm">🎤</span>
          <span className="text-sm font-bold" style={{ color: speakerColors[speakerIdx] }}>
            {TEAM[speakerIdx]}
          </span>
          <span className="text-zinc-700">·</span>
          <span className="text-sm text-zinc-500">{TITLES[current]}</span>
        </div>

        <span className="text-sm text-zinc-700 font-mono tabular-nums">
          {current + 1} <span className="text-zinc-800">/</span> {SLIDES.length}
        </span>
      </div>

      {/* Slide area */}
      <div className="flex-1 flex items-center justify-center px-14 pt-16 pb-16 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={current}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0, filter: 'blur(6px)' }),
              center: { x: 0, opacity: 1, filter: 'blur(0px)' },
              exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0, filter: 'blur(6px)' }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-5xl h-[540px]"
            onClick={e => e.stopPropagation()}
          >
            <SlideComp active />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-10 py-4"
        onClick={e => e.stopPropagation()}>
        <button onClick={() => go(-1)} disabled={current === 0}
          className="flex items-center gap-1.5 text-sm text-zinc-600 disabled:opacity-25 hover:text-zinc-300 transition-colors px-3 py-2 rounded-lg hover:bg-white/5 disabled:pointer-events-none">
          <ChevronLeft size={15} /> Prev
        </button>

        <div className="flex items-center gap-2.5">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => jumpTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-[#22C55E]' : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'}`} />
          ))}
        </div>

        {current < SLIDES.length - 1 ? (
          <button onClick={() => go(1)}
            className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-300 transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <span className="text-sm text-[#22C55E] font-semibold px-3">Thank you 🌿</span>
        )}
      </div>
    </div>
  );
}
