// SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import React from 'react';
import type { ComparisonKPIs } from '../types';
import { Clock, TrendingDown, Layers, ShieldCheck, Zap, Server } from 'lucide-react';

interface KPISummaryCardsProps {
  kpis?: ComparisonKPIs;
  solverRuntimeMs?: number;
  solverStatus?: string;
}

export const KPISummaryCards: React.FC<KPISummaryCardsProps> = ({
  kpis,
  solverRuntimeMs = 0,
  solverStatus = 'OPTIMAL'
}) => {
  if (!kpis) return null;

  const cards = [
    {
      title: 'Total Track Closure Hours',
      value: `${kpis.optimized_total_block_hours.toFixed(1)} hrs`,
      baseline: `${kpis.baseline_total_block_hours.toFixed(1)} hrs (Baseline BDMS)`,
      delta: `${kpis.block_hours_saved >= 0 ? '-' : '+'}${Math.abs(kpis.block_hours_saved).toFixed(1)} hrs`,
      isPositive: kpis.block_hours_saved >= 0,
      icon: Clock,
      subtext: 'Sum of concurrent line closures'
    },
    {
      title: 'Downtime Reduction',
      value: `${kpis.downtime_reduction_pct.toFixed(1)}%`,
      baseline: '0% in siloed planning',
      delta: `${kpis.downtime_reduction_pct >= 0 ? '+' : ''}${kpis.downtime_reduction_pct.toFixed(1)}%`,
      isPositive: kpis.downtime_reduction_pct >= 0,
      icon: TrendingDown,
      subtext: 'Calculated efficiency gain vs baseline'
    },
    {
      title: 'Multi-Dept Consolidation',
      value: `${kpis.consolidation_rate_pct.toFixed(1)}%`,
      baseline: '0% in manual BDMS',
      delta: `${kpis.optimized_consolidated_blocks} Joint Blocks`,
      isPositive: kpis.optimized_consolidated_blocks > 0,
      icon: Layers,
      subtext: 'Cross-dept simultaneous work'
    },
    {
      title: 'Critical Safety Clearance',
      value: `${kpis.optimized_critical_cleared} / ${kpis.total_critical_defects}`,
      baseline: `${kpis.baseline_critical_cleared} cleared in baseline`,
      delta: `${kpis.critical_clearance_delta >= 0 ? '+' : ''}${kpis.critical_clearance_delta} delta`,
      isPositive: kpis.remaining_critical_backlog === 0,
      icon: ShieldCheck,
      subtext: `Remaining Backlog: ${kpis.remaining_critical_backlog} tasks`
    },
    {
      title: 'Corridor Availability',
      value: `${kpis.corridor_availability_pct.toFixed(2)}%`,
      baseline: 'Total track hours: 2,016h',
      delta: `Freight Penalty: ${kpis.freight_disruption_penalty.toFixed(0)}`,
      isPositive: true,
      icon: Zap,
      subtext: 'Route traffic throughput capacity'
    },
    {
      title: 'CP-SAT Solver Runtime',
      value: `${solverRuntimeMs} ms`,
      baseline: `Status: ${solverStatus}`,
      delta: 'Google OR-Tools',
      isPositive: true,
      icon: Server,
      subtext: 'Exact constraint optimization'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-[#13315C]/90 border border-[#1E3A5F] rounded-xl p-4 shadow-sm hover:border-[#4A90D9]/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[#94A3B8] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">{card.title}</span>
                <div className="p-1.5 rounded-lg bg-[#1E3A5F] text-[#4A90D9]">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{card.value}</div>
              <div className="text-[11px] text-[#94A3B8] mt-0.5">{card.baseline}</div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#1E3A5F] flex items-center justify-between">
              <span className={`text-xs font-semibold ${card.isPositive ? 'text-[#2E9E6D]' : 'text-[#D64545]'}`}>
                {card.delta}
              </span>
              <span className="text-[10px] text-[#94A3B8] truncate max-w-[120px]">{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
