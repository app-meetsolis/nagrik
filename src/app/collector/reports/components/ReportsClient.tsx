'use client';

import React, { useState, useId, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Recycle, TrendingUp, Flame, Star, Award, CheckCircle2, Package, Leaf } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import AnimatedCounter from '@/components/AnimatedCounter';
import type { CollectorDashboardData } from '@/types/actions';

/* ── Demo data ───────────────────────────────────────────────────────────────── */

const DAILY_30 = [
  { day: 'Mar 21', pickups: 11, kg: 36.2 },
  { day: 'Mar 22', pickups: 13, kg: 43.5 },
  { day: 'Mar 23', pickups: 8,  kg: 26.1 },
  { day: 'Mar 24', pickups: 14, kg: 46.8 },
  { day: 'Mar 25', pickups: 15, kg: 51.3 },
  { day: 'Mar 26', pickups: 12, kg: 39.4 },
  { day: 'Mar 27', pickups: 9,  kg: 29.7 },
  { day: 'Mar 28', pickups: 10, kg: 32.8 },
  { day: 'Mar 29', pickups: 15, kg: 50.1 },
  { day: 'Mar 30', pickups: 14, kg: 45.9 },
  { day: 'Mar 31', pickups: 13, kg: 42.6 },
  { day: 'Apr 1',  pickups: 11, kg: 35.7 },
  { day: 'Apr 2',  pickups: 15, kg: 49.8 },
  { day: 'Apr 3',  pickups: 9,  kg: 29.3 },
  { day: 'Apr 4',  pickups: 12, kg: 40.1 },
  { day: 'Apr 5',  pickups: 14, kg: 46.2 },
  { day: 'Apr 6',  pickups: 11, kg: 35.9 },
  { day: 'Apr 7',  pickups: 8,  kg: 26.4 },
  { day: 'Apr 8',  pickups: 13, kg: 43.1 },
  { day: 'Apr 9',  pickups: 15, kg: 50.4 },
  { day: 'Apr 10', pickups: 14, kg: 47.2 },
  { day: 'Apr 11', pickups: 12, kg: 39.8 },
  { day: 'Apr 12', pickups: 9,  kg: 30.1 },
  { day: 'Apr 13', pickups: 10, kg: 33.6 },
  { day: 'Apr 14', pickups: 14, kg: 46.9 },
  { day: 'Apr 15', pickups: 15, kg: 51.0 },
  { day: 'Apr 16', pickups: 11, kg: 36.3 },
  { day: 'Apr 17', pickups: 13, kg: 43.8 },
  { day: 'Apr 18', pickups: 15, kg: 50.7 },
  { day: 'Apr 19', pickups: 5,  kg: 9.5  },
];

const MONTHLY = [
  { month: 'Nov', pickups: 287, kg: 918,  target: 300 },
  { month: 'Dec', pickups: 301, kg: 963,  target: 300 },
  { month: 'Jan', pickups: 315, kg: 1008, target: 300 },
  { month: 'Feb', pickups: 298, kg: 954,  target: 300 },
  { month: 'Mar', pickups: 327, kg: 1046, target: 300 },
  { month: 'Apr', pickups: 87,  kg: 278,  target: 300 },
];

const PERF = [
  { icon: Recycle,    label: 'Pickups Done',   value: 34,  total: 40,  suffix: '',      color: '#22C55E' },
  { icon: Package,    label: 'Kg Collected',   value: 127, total: 150, suffix: ' kg',   color: '#3B82F6' },
  { icon: TrendingUp, label: 'Efficiency',     value: 92,  total: 100, suffix: '%',     color: '#06B6D4' },
  { icon: Flame,      label: 'Day Streak',     value: 7,   total: 7,   suffix: ' days', color: '#F59E0B' },
  { icon: Star,       label: 'Citizen Rating', value: 4.8, total: 5,   suffix: '/5',    color: '#A855F7' },
];

/* ── SVG helpers ─────────────────────────────────────────────────────────────── */

interface Point { x: number; y: number }

function smoothPath(pts: Point[]): string {
  if (pts.length < 2) return '';
  const p = [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    const cp1x = (p1.x + (p2.x - p0.x) / 6).toFixed(1);
    const cp1y = (p1.y + (p2.y - p0.y) / 6).toFixed(1);
    const cp2x = (p2.x - (p3.x - p1.x) / 6).toFixed(1);
    const cp2y = (p2.y - (p3.y - p1.y) / 6).toFixed(1);
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/* ── Tooltip overlay (HTML, positioned relative to chart container) ───────── */

interface TooltipState { idx: number; px: number; py: number }

function ChartTooltip({
  tip, slice, color, secondaryKey, secondaryLabel, secondaryColor, containerW, VW, VH,
}: {
  tip: TooltipState;
  slice: typeof DAILY_30;
  color: string;
  secondaryKey: 'kg' | 'pickups';
  secondaryLabel: string;
  secondaryColor: string;
  containerW: number;
  VW: number;
  VH: number;
}) {
  const d = slice[tip.idx];
  const renderedH = containerW * (VH / VW);
  const pxAbs = (tip.px / VW) * containerW;
  const pyAbs = (tip.py / VH) * renderedH;

  const showLeft = pxAbs > containerW / 2;
  const left = showLeft ? pxAbs - 128 - 10 : pxAbs + 10;
  const top  = Math.max(4, Math.min(pyAbs - 34, renderedH - 80));

  const isPickups = secondaryKey === 'kg';
  const primary   = isPickups ? d.pickups : d.kg;
  const secondary = isPickups ? d.kg      : d.pickups;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 4 }}
      transition={{ duration: 0.12 }}
      className="absolute pointer-events-none z-20 bg-[#1A1A1A] border border-[#333] rounded-xl px-3 py-2.5 shadow-2xl min-w-[118px]"
      style={{ left, top }}
    >
      <p className="text-[10px] text-zinc-500 mb-1.5 font-medium">{d.day}</p>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-xl font-bold" style={{ color }}>{primary}</span>
        <span className="text-xs text-zinc-500">{isPickups ? 'pickups' : 'kg'}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-semibold" style={{ color: secondaryColor }}>{secondary}</span>
        <span className="text-[10px] text-zinc-600">{secondaryLabel}</span>
      </div>
    </motion.div>
  );
}

/* ── Area Chart ──────────────────────────────────────────────────────────────── */

type Range = '7d' | '14d' | '30d';

interface AreaChartProps {
  isDark:         boolean;
  data:           typeof DAILY_30;
  lineColor:      string;
  gradStop1:      string;
  gradStop2:      string;
  maxV:           number;
  yTicks:         number[];
  primaryKey:     'pickups' | 'kg';
  secondaryKey:   'kg' | 'pickups';
  secondaryLabel: string;
  secondaryColor: string;
  targetValue?:   number;
  showRange?:     boolean;
  title:          string;
  subtitle:       string;
  badge:          string;
}

function AreaChart({
  isDark, data, lineColor, gradStop1, gradStop2, maxV, yTicks,
  primaryKey, secondaryKey, secondaryLabel, secondaryColor,
  targetValue, showRange = false,
  title, subtitle, badge,
}: AreaChartProps) {
  const uid    = useId();
  const gradId = `g-${uid}`;
  const maskId = `m-${uid}`;
  const glowId = `gl-${uid}`;
  const svgRef     = useRef<SVGSVGElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<Range>('14d');
  const [tip, setTip]     = useState<TooltipState | null>(null);
  const [containerW, setContainerW] = useState(460);

  const slice = !showRange ? data :
    range === '7d' ? data.slice(-7) : range === '14d' ? data.slice(-14) : data;

  const VW = 460, VH = 160;
  const PL = 30, PR = 10, PT = 12, PB = 26;
  const CW = VW - PL - PR;
  const CH = VH - PT - PB;

  const toX = (i: number) => PL + (i / Math.max(1, slice.length - 1)) * CW;
  const toY = (v: number) => PT + (1 - Math.min(v, maxV) / maxV) * CH;

  const pts: Point[] = slice.map((d, i) => ({ x: toX(i), y: toY(d[primaryKey] as number) }));
  const line = smoothPath(pts);
  const bottomY = PT + CH;
  const area  = pts.length > 1
    ? line + ` L ${pts[pts.length - 1].x.toFixed(1)} ${bottomY} L ${pts[0].x.toFixed(1)} ${bottomY} Z`
    : '';

  const muted = isDark ? '#52525B' : '#9CA3AF';
  const grid  = isDark ? '#1C1C1C' : '#F3F4F6';

  const labelStep = Math.max(1, Math.floor(slice.length / 5));
  const labelIdxs = slice.map((_, i) => i).filter(i => i % labelStep === 0 || i === slice.length - 1);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    const wrap = wrapRef.current;
    if (!svg || !wrap) return;
    const { left, width } = svg.getBoundingClientRect();
    setContainerW(width);
    const mouseX = e.clientX - left;
    const svgX   = (mouseX / width) * VW;
    const rawIdx = (svgX - PL) / CW * (slice.length - 1);
    const idx    = Math.max(0, Math.min(slice.length - 1, Math.round(rawIdx)));
    setTip({ idx, px: pts[idx].x, py: pts[idx].y });
  }, [slice, pts, CW]);

  const hovPt = tip !== null ? pts[tip.idx] : null;

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: lineColor + '18', color: lineColor }}>{badge}</span>
          {showRange && (
            <div className="flex items-center gap-0.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-0.5">
              {(['7d', '14d', '30d'] as Range[]).map((r) => (
                <button key={r} onClick={() => setRange(r)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${
                    range === r ? 'bg-[#22C55E] text-black' : 'text-zinc-500 hover:text-zinc-300'
                  }`}>{r}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div ref={wrapRef} className="relative select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          width="100%"
          className="overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTip(null)}
        >
          <defs>
            {/* Area gradient */}
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={gradStop1} stopOpacity={0.5} />
              <stop offset="60%"  stopColor={gradStop2} stopOpacity={0.12} />
              <stop offset="100%" stopColor={gradStop2} stopOpacity={0.01} />
            </linearGradient>
            {/* Clip chart area */}
            <clipPath id={maskId}>
              <rect x={PL} y={PT - 2} width={CW} height={CH + 4} />
            </clipPath>
            {/* Glow filter for line */}
            <filter id={glowId} x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Dashed grid lines */}
          {yTicks.map((v) => {
            const y = toY(v);
            return (
              <g key={v}>
                <line x1={PL} y1={y} x2={VW - PR} y2={y}
                  stroke={grid} strokeWidth="1" strokeDasharray="4 4" />
                <text x={PL - 5} y={y + 4} textAnchor="end" fontSize="8.5" fill={muted}>{v}</text>
              </g>
            );
          })}

          {/* Target line */}
          {targetValue !== undefined && (
            <>
              <line x1={PL} y1={toY(targetValue)} x2={VW - PR} y2={toY(targetValue)}
                stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="6 4" opacity={0.45} />
              <text x={VW - PR + 2} y={toY(targetValue) + 4} fontSize="8" fill="#3B82F6" opacity={0.6}>T</text>
            </>
          )}

          {/* Today marker */}
          <line x1={pts[pts.length - 1]?.x ?? 0} y1={PT}
            x2={pts[pts.length - 1]?.x ?? 0} y2={PT + CH}
            stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" opacity={0.5} />

          {/* Area fill */}
          <motion.path key={`${range}-area`} d={area}
            fill={`url(#${gradId})`} clipPath={`url(#${maskId})`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }} />

          {/* Glow copy of line (blurred, behind) */}
          <motion.path key={`${range}-glow`} d={line}
            fill="none" stroke={lineColor} strokeWidth="4" opacity={0.25}
            strokeLinecap="round" clipPath={`url(#${maskId})`}
            filter={`url(#${glowId})`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.25 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }} />

          {/* Main line */}
          <motion.path key={`${range}-line`} d={line}
            fill="none" stroke={lineColor} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            clipPath={`url(#${maskId})`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }} />

          {/* Static dots */}
          {pts.map((pt, i) => (
            <motion.circle key={i} cx={pt.x} cy={pt.y}
              r={i === pts.length - 1 ? 4 : tip?.idx === i ? 0 : 2.5}
              fill={i === pts.length - 1 ? '#F59E0B' : lineColor}
              stroke={isDark ? '#111' : '#fff'} strokeWidth="1.5"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.025, duration: 0.18 }} />
          ))}

          {/* Hover crosshair */}
          {hovPt && (
            <g>
              {/* Vertical line */}
              <line x1={hovPt.x} y1={PT} x2={hovPt.x} y2={PT + CH}
                stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              {/* Horizontal guide dashed */}
              <line x1={PL} y1={hovPt.y} x2={hovPt.x} y2={hovPt.y}
                stroke={lineColor} strokeWidth="0.8" strokeDasharray="3 3" opacity={0.4} />
              {/* Glow ring */}
              <circle cx={hovPt.x} cy={hovPt.y} r={10} fill={lineColor} opacity={0.12} />
              <circle cx={hovPt.x} cy={hovPt.y} r={6}  fill={lineColor} opacity={0.22} />
              {/* Active dot */}
              <circle cx={hovPt.x} cy={hovPt.y} r={4.5} fill={lineColor}
                stroke="white" strokeWidth="2" />
              {/* Y-axis label for hovered value */}
              <rect x={0} y={hovPt.y - 8} width={PL - 2} height={16} rx={3}
                fill={lineColor} opacity={0.9} />
              <text x={PL / 2} y={hovPt.y + 4} textAnchor="middle" fontSize="8"
                fontWeight="700" fill="white">
                {slice[tip!.idx][primaryKey]}
              </text>
            </g>
          )}

          {/* X-axis labels */}
          {labelIdxs.map((i) => (
            <text key={i} x={toX(i)} y={VH - 4}
              textAnchor="middle" fontSize="8.5"
              fill={tip?.idx === i ? lineColor : muted}
              fontWeight={tip?.idx === i ? '700' : '400'}>
              {slice[i].day.replace(/^(Apr|Mar) /, '')}
            </text>
          ))}

          {/* Legend */}
          <g>
            <circle cx={PL} cy={VH - 4} r={3} fill={lineColor} />
            <text x={PL + 6} y={VH - 1} fontSize="8" fill={muted}>
              {primaryKey === 'pickups' ? 'Pickups' : 'Kg'}
            </text>
            {targetValue !== undefined && (
              <>
                <line x1={PL + 56} y1={VH - 4} x2={PL + 70} y2={VH - 4}
                  stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 3" opacity={0.5} />
                <text x={PL + 74} y={VH - 1} fontSize="8" fill={muted}>Target ({targetValue})</text>
              </>
            )}
            <circle cx={PL + (targetValue !== undefined ? 148 : 56)} cy={VH - 4} r={3} fill="#F59E0B" />
            <text x={PL + (targetValue !== undefined ? 155 : 63)} y={VH - 1} fontSize="8" fill={muted}>Today</text>
          </g>
        </svg>

        {/* HTML tooltip overlay */}
        <AnimatePresence>
          {tip !== null && (
            <ChartTooltip
              tip={tip}
              slice={slice}
              color={lineColor}
              secondaryKey={secondaryKey}
              secondaryLabel={secondaryLabel}
              secondaryColor={secondaryColor}
              containerW={containerW}
              VW={VW}
              VH={VH}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Monthly gradient bar chart with hover ───────────────────────────────────── */

function MonthlyBars({ isDark }: { isDark: boolean }) {
  const maxPickups = Math.max(...MONTHLY.map(m => m.pickups));
  const muted = isDark ? 'text-zinc-500' : 'text-gray-500';
  const text  = isDark ? 'text-white'    : 'text-gray-900';
  const [hovMonth, setHovMonth] = useState<string | null>(null);

  return (
    <div className="space-y-2.5">
      {MONTHLY.map(({ month, pickups, kg, target }, idx) => {
        const isPartial = idx === MONTHLY.length - 1;
        const pct       = (pickups / maxPickups) * 100;
        const hitTarget = pickups >= target;
        const isHov     = hovMonth === month;

        return (
          <motion.div
            key={month}
            className="flex items-center gap-3 relative"
            onHoverStart={() => setHovMonth(month)}
            onHoverEnd={() => setHovMonth(null)}
          >
            <span className={`text-xs font-medium w-7 flex-shrink-0 transition-colors duration-150 ${isHov ? (hitTarget ? 'text-[#22C55E]' : 'text-amber-400') : muted}`}>
              {month}
            </span>

            <div className={`flex-1 h-7 rounded-xl relative overflow-hidden transition-all duration-200 ${isDark ? 'bg-[#1A1A1A]' : 'bg-gray-100'}`}>
              {/* Background track with subtle grid */}
              {[25, 50, 75].map(p => (
                <div key={p} className="absolute inset-y-0 w-px bg-[#2A2A2A] opacity-40" style={{ left: `${p}%` }} />
              ))}

              {/* Main bar */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-xl flex items-center"
                style={{
                  background: isPartial
                    ? `repeating-linear-gradient(135deg,
                        ${hitTarget ? '#16A34A' : '#D97706'} 0px,
                        ${hitTarget ? '#16A34A' : '#D97706'} 5px,
                        ${hitTarget ? '#22C55E' : '#F59E0B'} 5px,
                        ${hitTarget ? '#22C55E' : '#F59E0B'} 10px)`
                    : hitTarget
                      ? 'linear-gradient(90deg, #15803D, #22C55E, #4ADE80)'
                      : 'linear-gradient(90deg, #B45309, #F59E0B, #FCD34D)',
                  filter: isHov ? 'brightness(1.15)' : 'brightness(1)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.85, delay: 0.12 + idx * 0.1, ease: [0.34, 1.2, 0.64, 1] }}
              />

              {/* Bar label */}
              <motion.span
                className="relative z-10 pl-2.5 text-[11px] font-bold text-white drop-shadow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
              >
                {isPartial ? `${pickups} ▸` : pickups}
              </motion.span>
            </div>

            {/* Hover tooltip */}
            <AnimatePresence>
              {isHov && (
                <motion.div
                  initial={{ opacity: 0, x: -4, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -4, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-10 top-1/2 -translate-y-1/2 z-20 ml-2 pointer-events-none"
                  style={{ left: `calc(${(pickups / maxPickups) * 100}% + 46px)` }}
                >
                  <div className="bg-[#1A1A1A] border border-[#333] rounded-xl px-3 py-2 shadow-2xl whitespace-nowrap">
                    <p className="text-[10px] text-zinc-500 mb-1">{month} {isPartial ? '(in progress)' : ''}</p>
                    <p className={`text-sm font-bold ${hitTarget ? 'text-[#22C55E]' : 'text-amber-400'}`}>
                      {pickups} <span className="text-xs font-normal text-zinc-500">pickups</span>
                    </p>
                    <p className="text-xs font-semibold text-[#3B82F6]">
                      {kg.toLocaleString()} <span className="text-[10px] font-normal text-zinc-600">kg collected</span>
                    </p>
                    <p className={`text-[10px] mt-0.5 ${hitTarget ? 'text-[#22C55E]' : 'text-amber-400'}`}>
                      {Math.round((pickups / target) * 100)}% of target
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right % label */}
            <span className={`text-[10px] font-bold w-10 text-right flex-shrink-0 transition-all duration-150 ${hitTarget ? 'text-[#22C55E]' : 'text-amber-400'}`}>
              {Math.round((pickups / target) * 100)}%
            </span>
          </motion.div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center gap-4 pt-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm" style={{ background: 'linear-gradient(90deg,#15803D,#22C55E,#4ADE80)' }} />
          <span className={`text-[10px] ${muted}`}>Target met</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm" style={{ background: 'linear-gradient(90deg,#B45309,#F59E0B,#FCD34D)' }} />
          <span className={`text-[10px] ${muted}`}>Below target</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm" style={{
            background: 'repeating-linear-gradient(135deg,#22C55E 0,#22C55E 4px,#16A34A 4px,#16A34A 8px)'
          }} />
          <span className={`text-[10px] ${muted}`}>In progress</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────────────── */

interface Props { data: CollectorDashboardData | null }

export default function ReportsClient({ data }: Props) {
  const { isDark } = useTheme();
  const todayEntry = DAILY_30[DAILY_30.length - 1];

  const collectorName     = data?.collector.name ?? 'Rajesh Kumar';
  const totalPickupsToday = data?.pickups?.length ? data.pickups.length : todayEntry.pickups;
  const completedToday    = data?.pickups?.length ? data.pickups.filter(p => p.status === 'completed').length : 3;
  const kgRaw             = data?.pickups?.length
    ? data.pickups.filter(p => p.status === 'completed').reduce((s, p) => s + parseFloat(p.weight), 0)
    : 9.5;
  const kgToday  = kgRaw.toFixed(1);
  const co2Today = (parseFloat(kgToday) * 0.52).toFixed(1);
  const weekTotal = DAILY_30.slice(-7).reduce((s, d) => s + d.pickups, 0);
  const weekKg    = DAILY_30.slice(-7).reduce((s, d) => s + d.kg, 0).toFixed(0);

  const card  = isDark ? 'bg-[#141414] border-[#1F1F1F]' : 'bg-white border-gray-200';
  const text  = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-zinc-500' : 'text-gray-500';

  const pickups14Avg = (DAILY_30.slice(-14).reduce((s, d) => s + d.pickups, 0) / 14).toFixed(1);
  const kg14Total    = DAILY_30.slice(-14).reduce((s, d) => s + d.kg, 0).toFixed(0);
  const kg14Avg      = (DAILY_30.slice(-14).reduce((s, d) => s + d.kg, 0) / 14).toFixed(1);

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-[#3B82F6]" />
        </div>
        <div>
          <h1 className={`text-xl font-bold ${text}`}>Reports</h1>
          <p className={`text-xs ${muted}`}>{collectorName}&apos;s performance overview</p>
        </div>
      </motion.div>

      {/* Today hero */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-2xl p-4 border border-[#22C55E]/25 bg-[#22C55E]/5">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/15 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            </div>
            <span className="text-xs text-[#22C55E] font-semibold">
              {totalPickupsToday ? Math.round((completedToday / totalPickupsToday) * 100) : 0}%
            </span>
          </div>
          <p className={`text-3xl font-bold mt-1 ${text}`}>
            <AnimatedCounter to={completedToday} duration={700} />
            <span className="text-zinc-500 text-xl font-normal">/{totalPickupsToday}</span>
          </p>
          <p className={`text-xs mt-0.5 ${muted}`}>Pickups done today</p>
        </div>

        <div className="rounded-2xl p-4 border border-[#3B82F6]/25 bg-[#3B82F6]/5">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/15 flex items-center justify-center">
              <Package className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <span className="text-xs text-[#3B82F6] font-semibold">today</span>
          </div>
          <p className={`text-3xl font-bold mt-1 ${text}`}>{kgToday}<span className="text-zinc-500 text-base font-normal"> kg</span></p>
          <p className={`text-xs mt-0.5 ${muted}`}>≈ {co2Today} kg CO₂ prevented</p>
        </div>
      </motion.div>

      {/* Weekly pills */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-2 mb-6">
        {[
          { icon: Award,  label: 'Week Pickups', value: weekTotal,                             color: '#A855F7', bg: 'border-purple-500/20 bg-purple-500/8' },
          { icon: Package,label: 'Week Kg',       value: parseInt(weekKg),                     color: '#3B82F6', bg: 'border-[#3B82F6]/20 bg-[#3B82F6]/8' },
          { icon: Leaf,   label: 'CO₂ Saved kg',  value: Math.round(parseInt(weekKg) * 0.52), color: '#22C55E', bg: 'border-[#22C55E]/20 bg-[#22C55E]/8' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`rounded-xl p-3 border ${bg} text-center`}>
            <p className="text-xl font-bold" style={{ color }}><AnimatedCounter to={value} duration={700} /></p>
            <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Pickups Area Chart ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        className={`border rounded-2xl p-5 mb-4 ${card}`}>
        <AreaChart
          isDark={isDark}
          data={DAILY_30}
          lineColor="#22C55E"
          gradStop1="#22C55E"
          gradStop2="#16A34A"
          maxV={18}
          yTicks={[0, 5, 10, 15]}
          primaryKey="pickups"
          secondaryKey="kg"
          secondaryLabel="kg"
          secondaryColor="#3B82F6"
          targetValue={15}
          showRange
          title="Daily Pickups"
          subtitle={`Avg ${pickups14Avg}/day · Total ${DAILY_30.slice(-14).reduce((s, d) => s + d.pickups, 0)}`}
          badge={`Avg ${pickups14Avg}/day`}
        />
      </motion.div>

      {/* ── Kg Area Chart ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className={`border rounded-2xl p-5 mb-4 ${card}`}>
        <AreaChart
          isDark={isDark}
          data={DAILY_30.slice(-14)}
          lineColor="#3B82F6"
          gradStop1="#3B82F6"
          gradStop2="#1D4ED8"
          maxV={60}
          yTicks={[0, 20, 40, 55]}
          primaryKey="kg"
          secondaryKey="pickups"
          secondaryLabel="pickups"
          secondaryColor="#22C55E"
          showRange={false}
          title="Kg Collected · Last 14 Days"
          subtitle={`Avg ${kg14Avg} kg/day`}
          badge={`${kg14Total} kg total`}
        />
      </motion.div>

      {/* ── Monthly Bars ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className={`border rounded-2xl p-5 mb-4 ${card}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={`text-sm font-semibold ${text}`}>Monthly Pickups</p>
            <p className={`text-xs ${muted} mt-0.5`}>Target: 300 pickups / month · hover to inspect</p>
          </div>
          <span className="text-xs text-[#22C55E] font-semibold bg-[#22C55E]/10 px-2.5 py-1 rounded-full">
            {MONTHLY.slice(0, -1).filter(m => m.pickups >= m.target).length}/5 on target
          </span>
        </div>
        <MonthlyBars isDark={isDark} />
      </motion.div>

      {/* ── Performance Metrics ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
        className={`border rounded-2xl p-5 mb-4 ${card}`}>
        <p className={`text-sm font-semibold ${text} mb-5`}>Performance Metrics</p>
        <div className="space-y-5">
          {PERF.map(({ icon: Icon, label, value, total, suffix, color }, idx) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  <p className={`text-xs font-medium ${text}`}>{label}</p>
                </div>
                <p className="text-xs font-bold" style={{ color }}>{value}{suffix}</p>
              </div>
              <div className={`h-2 rounded-full ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-200'}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(value / total) * 100}%` }}
                  transition={{ duration: 0.9, delay: 0.3 + idx * 0.08, ease: 'easeOut' }}
                  className="h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Recent Highlights ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className={`border rounded-2xl p-5 ${card}`}>
        <p className={`text-sm font-semibold ${text} mb-4`}>Recent Highlights</p>
        <div className="space-y-3.5">
          {[
            { icon: '🏆', title: 'Top Collector',        desc: 'Ranked #1 in Mansarovar Ward this week',         time: '2 days ago' },
            { icon: '🔥', title: '7-Day Streak',          desc: 'Completed pickups every day this week',          time: '1 day ago'  },
            { icon: '⭐', title: 'Perfect Rating',        desc: 'Received 5-star reviews from 3 citizens',        time: '3 days ago' },
            { icon: '♻️', title: '1,000 kg Collected',    desc: 'Milestone: 1,000 kg waste collected this month', time: '5 days ago' },
            { icon: '🌱', title: '520 kg CO₂ Prevented',  desc: 'Equivalent to planting 24 trees',               time: '5 days ago' },
          ].map(({ icon, title, desc, time }, i) => (
            <motion.div key={title} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.06 }} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${text}`}>{title}</p>
                <p className={`text-xs ${muted} mt-0.5`}>{desc}</p>
              </div>
              <span className={`text-[10px] ${muted} flex-shrink-0 whitespace-nowrap`}>{time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
