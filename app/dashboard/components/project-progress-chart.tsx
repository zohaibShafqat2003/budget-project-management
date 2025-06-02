"use client"

import { useTheme } from "next-themes"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProjectProgressChartProps {
  data: Array<{
    name: string
    progress: number
    tasks: number
  }>
}

export function ProjectProgressChart({ data }: ProjectProgressChartProps) {
  const { theme } = useTheme()

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Project Progress Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="name"
                stroke={theme === "dark" ? "#fff" : "#000"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke={theme === "dark" ? "#fff" : "#000"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null
                  const { progress, tasks } = payload[0].payload
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
                        Progress: {progress}%
                      </p>
                      <p style={{ color: theme === "dark" ? "#fff" : "#000", fontSize: 12 }}>
                        Tasks: {tasks}
                      </p>
                    </div>
                  )
                }}
              />
              <Bar
                dataKey="progress"
                fill="url(#colorProgress)"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={800}
              />
              <defs>
                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.2} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
