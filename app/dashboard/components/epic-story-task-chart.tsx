"use client"

import { useTheme } from "next-themes"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface EpicStoryTaskChartProps {
  data: Array<{
    name: string
    epics: number
    stories: number
    tasks: number
  }>
}

export function EpicStoryTaskChart({ data }: EpicStoryTaskChartProps) {
  const { theme } = useTheme()

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">
          Epic ∕ Story ∕ Task Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 20, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="name"
                stroke={theme === "dark" ? "#fff" : "#000"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis
                stroke={theme === "dark" ? "#fff" : "#000"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null
                  const o: any = payload[0].payload
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
                      <p
                        style={{ color: theme === "dark" ? "#fff" : "#000", fontSize: 12 }}
                      >
                        <strong>{label}</strong>
                      </p>
                      <p
                        style={{ color: theme === "dark" ? "#fff" : "#000", fontSize: 12 }}
                      >
                        Epics: {o.epics}
                      </p>
                      <p
                        style={{ color: theme === "dark" ? "#fff" : "#000", fontSize: 12 }}
                      >
                        Stories: {o.stories}
                      </p>
                      <p
                        style={{ color: theme === "dark" ? "#fff" : "#000", fontSize: 12 }}
                      >
                        Tasks: {o.tasks}
                      </p>
                    </div>
                  )
                }}
              />
              <Legend verticalAlign="top" height={36} />
              {/* Stacked bars, each with a different color */}
              <Bar
                dataKey="epics"
                stackId="a"
                fill="#2563eb"
                isAnimationActive={true}
                animationDuration={800}
              />
              <Bar
                dataKey="stories"
                stackId="a"
                fill="#7c3aed"
                isAnimationActive={true}
                animationDuration={800}
              />
              <Bar
                dataKey="tasks"
                stackId="a"
                fill="#22c55e"
                isAnimationActive={true}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 