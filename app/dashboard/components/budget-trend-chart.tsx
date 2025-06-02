"use client"

import { useTheme } from "next-themes"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BudgetTrendChartProps {
  data: Array<{
    month: string
    budget: number
    spent: number
  }>
}

export function BudgetTrendChart({ data }: BudgetTrendChartProps) {
  const { theme } = useTheme()

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Budget Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="month"
                stroke={theme === "dark" ? "#fff" : "#000"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={theme === "dark" ? "#fff" : "#000"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null
                  const budget = payload[0].payload.budget
                  const spent = payload[0].payload.spent
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
                        <strong>{label}</strong>
                      </p>
                      <p style={{ color: theme === "dark" ? "#fff" : "#000", fontSize: 12 }}>
                        Budget: ${budget}
                      </p>
                      <p style={{ color: theme === "dark" ? "#fff" : "#000", fontSize: 12 }}>
                        Spent: ${spent}
                      </p>
                    </div>
                  )
                }}
              />
              <defs>
                <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#db2777" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#db2777" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="budget"
                stroke="#2563eb"
                fill="url(#colorBudget)"
                isAnimationActive={true}
                animationDuration={800}
              />
              <Area
                type="monotone"
                dataKey="spent"
                stroke="#db2777"
                fill="url(#colorSpent)"
                isAnimationActive={true}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
