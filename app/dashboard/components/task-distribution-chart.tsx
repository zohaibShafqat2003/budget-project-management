"use client"

import { useTheme } from "next-themes"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TaskDistributionChartProps {
  data: Array<{
    name: string
    value: number
  }>
}

const COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a"]

export function TaskDistributionChart({ data }: TaskDistributionChartProps) {
  const { theme } = useTheme()

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Task Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null
                  const { name, value } = payload[0].payload
                  return (
                    <div
                      style={{
                        backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
                        padding: "8px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        border: "1px solid",
                        borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                      }}
                    >
                      <p style={{ color: theme === "dark" ? "#fff" : "#000", fontSize: 12 }}>
                        <strong>{name}</strong>
                      </p>
                      <p style={{ color: theme === "dark" ? "#fff" : "#000", fontSize: 12 }}>
                        Tasks: {value}
                      </p>
                    </div>
                  )
                }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "12px",
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
