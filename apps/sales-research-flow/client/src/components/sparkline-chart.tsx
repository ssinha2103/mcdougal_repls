import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function SparklineChart({ 
  data, 
  color = "hsl(var(--primary))", 
  width = 80, 
  height = 30 
}: SparklineChartProps) {
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={`sparkline-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          fill={`url(#sparkline-gradient-${color})`}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
