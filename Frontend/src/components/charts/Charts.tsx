import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, RadialBarChart, RadialBar,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const axisColor = 'rgb(var(--faint))';
const gridColor = 'rgb(var(--border))';
const tooltipStyle = {
  backgroundColor: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: 8,
  fontSize: 12,
  color: 'rgb(var(--text))',
};

const COLORS = ['#3b82f6', '#22d3ee', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#38bdf8'];

export function TrendArea({ data, xKey, yKey, color = '#3b82f6', height = 220 }: {
  data: Record<string, unknown>[]; xKey: string; yKey: string; color?: string; height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${yKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: gridColor }} />
        <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} fill={`url(#grad-${yKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TrendLine({ data, xKey, lines, height = 220 }: {
  data: Record<string, unknown>[]; xKey: string; lines: { key: string; color: string; name: string }[]; height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: gridColor }} />
        <Legend wrapperStyle={{ fontSize: 11, color: axisColor }} />
        {lines.map((l) => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BarsChart({ data, xKey, yKey, color = '#3b82f6', height = 220, horizontal }: {
  data: Record<string, unknown>[]; xKey: string; yKey: string; color?: string; height?: number; horizontal?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 8, right: 16, left: horizontal ? 30 : -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey={xKey} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          </>
        )}
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: gridColor, opacity: 0.3 }} />
        <Bar dataKey={yKey} fill={color} radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({ data, height = 220 }: {
  data: { name: string; value: number }[]; height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: axisColor }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RadialGauge({ value, height = 180, color = '#3b82f6', label }: {
  value: number; height?: number; color?: string; label?: string;
}) {
  const data = [{ name: label || 'value', value }];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
        <defs>
          <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <RadialBar background={{ fill: gridColor }} dataKey="value" cornerRadius={20} fill="url(#gauge-grad)" />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
