import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ConsistencyChartProps {
  consistent: number;
  inconsistent: number;
  missing: number;
}

export function ConsistencyChart({ consistent, inconsistent, missing }: ConsistencyChartProps) {
  const data = [
    { name: "Consistent", value: consistent, color: "hsl(var(--chart-2))" },
    { name: "Inconsistent", value: inconsistent, color: "hsl(var(--chart-4))" },
    { name: "Missing", value: missing, color: "hsl(var(--muted))" },
  ].filter(item => item.value > 0);

  const total = consistent + inconsistent + missing;
  const consistencyPercentage = total > 0 ? Math.round((consistent / total) * 100) : 0;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Consistency Overview</h3>
      
      <div className="flex flex-col items-center">
        <div className="relative w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold" data-testid="text-consistency-percentage">
                {consistencyPercentage}%
              </div>
              <div className="text-xs text-muted-foreground">Consistent</div>
            </div>
          </div>
        </div>

        <div className="w-full mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
