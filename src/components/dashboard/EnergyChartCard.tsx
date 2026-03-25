import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { TrendingUp, Zap, Activity, Gauge, BarChart2 } from 'lucide-react';
import type { EnergyReading } from '@/hooks/useEnergyHistory';

interface EnergyChartCardProps {
  history: EnergyReading[];
  isLoading: boolean;
  livePower: number;
  liveVoltage: number;
  liveCurrent: number;
}

type ChartMetric = 'power' | 'voltage' | 'current' | 'all';

const METRIC_CONFIG: Record<
  ChartMetric,
  { label: string; color: string; unit: string; icon: React.ReactNode }
> = {
  power:   { label: 'Power',   color: '#f59e0b', unit: 'W',  icon: <Zap     className="w-3.5 h-3.5" /> },
  voltage: { label: 'Voltage', color: '#3b82f6', unit: 'V',  icon: <Activity className="w-3.5 h-3.5" /> },
  current: { label: 'Current', color: '#f97316', unit: 'A',  icon: <Gauge   className="w-3.5 h-3.5" /> },
  all:     { label: 'All',     color: '#8b5cf6', unit: '',   icon: <BarChart2 className="w-3.5 h-3.5" /> },
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Custom chart tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-xl px-4 py-3 shadow-xl text-sm space-y-1.5 backdrop-blur-md">
      <p className="text-muted-foreground font-medium text-xs">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: p.color }} />
          <span className="font-semibold text-foreground">{p.value?.toFixed(2)}</span>
          <span className="text-muted-foreground text-xs">{p.name}</span>
        </div>
      ))}
    </div>
  );
};

export const EnergyChartCard: React.FC<EnergyChartCardProps> = ({
  history,
  isLoading,
  livePower,
  liveVoltage,
  liveCurrent,
}) => {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('power');

  const chartData = history.map((r) => ({
    time: formatTime(r.timestamp),
    Power: parseFloat(r.power.toFixed(2)),
    Voltage: parseFloat(r.voltage.toFixed(2)),
    Current: parseFloat(r.current.toFixed(3)),
  }));

  const avgPower   = history.length ? history.reduce((s, r) => s + r.power, 0)   / history.length : 0;
  const avgVoltage = history.length ? history.reduce((s, r) => s + r.voltage, 0) / history.length : 0;
  const peakPower  = history.length ? Math.max(...history.map((r) => r.power)) : 0;

  const showPower   = activeMetric === 'power'   || activeMetric === 'all';
  const showVoltage = activeMetric === 'voltage' || activeMetric === 'all';
  const showCurrent = activeMetric === 'current' || activeMetric === 'all';

  return (
    <Card className="card-premium col-span-1 md:col-span-2 lg:col-span-3 overflow-hidden relative group">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <CardHeader className="pb-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-200/20">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Energy Usage Chart
              </CardTitle>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                Live readings every 30 s · last {history.length} points
              </p>
            </div>
          </div>

          {/* Live stats strip */}
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: 'Live', value: `${livePower.toFixed(1)} W`, color: 'text-yellow-500' },
              { label: 'Avg',  value: `${avgPower.toFixed(1)} W`,  color: 'text-blue-500'   },
              { label: 'Peak', value: `${peakPower.toFixed(1)} W`, color: 'text-red-400'    },
            ].map((s) => (
              <div key={s.label} className="px-3 py-1.5 rounded-lg bg-muted/40 border border-border/40 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
                <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Metric selector */}
        <div className="flex gap-2 flex-wrap mt-3">
          {(Object.keys(METRIC_CONFIG) as ChartMetric[]).map((m) => {
            const cfg = METRIC_CONFIG[m];
            const isActive = activeMetric === m;
            return (
              <button
                key={m}
                onClick={() => setActiveMetric(m)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  isActive
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-muted/30 border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
                style={isActive ? { borderColor: cfg.color + '60', color: cfg.color } : {}}
              >
                {cfg.icon} {cfg.label}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pb-6">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : chartData.length < 2 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center gap-3">
            <TrendingUp className="w-12 h-12 text-muted-foreground/30" />
            <div>
              <p className="font-semibold text-muted-foreground">Collecting data…</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Chart will appear once 2+ readings are recorded (every 30 s).
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.4)" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              {chartData.length > 1 && showPower && (
                <ReferenceLine
                  y={avgPower}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  label={{ value: 'avg', position: 'insideTopRight', fontSize: 9, fill: '#f59e0b' }}
                />
              )}
              {showPower && (
                <Line
                  type="monotone"
                  dataKey="Power"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: '#f59e0b', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                  name="Power (W)"
                />
              )}
              {showVoltage && (
                <Line
                  type="monotone"
                  dataKey="Voltage"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: '#3b82f6', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                  name="Voltage (V)"
                />
              )}
              {showCurrent && (
                <Line
                  type="monotone"
                  dataKey="Current"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: '#f97316', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                  name="Current (A)"
                />
              )}
              {activeMetric === 'all' && <Legend wrapperStyle={{ fontSize: 11 }} />}
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Bottom stat bar */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Avg Voltage', value: `${avgVoltage.toFixed(1)} V`, color: 'text-blue-500',  icon: <Activity className="w-3.5 h-3.5" /> },
            { label: 'Live Current', value: `${liveCurrent.toFixed(2)} A`, color: 'text-orange-500', icon: <Gauge   className="w-3.5 h-3.5" /> },
            { label: 'Peak Power', value: `${peakPower.toFixed(1)} W`, color: 'text-red-400',    icon: <Zap     className="w-3.5 h-3.5" /> },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center">
              <div className={`flex items-center justify-center gap-1.5 mb-1 ${s.color}`}>
                {s.icon}
                <span className="text-[10px] font-semibold uppercase tracking-wider">{s.label}</span>
              </div>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
