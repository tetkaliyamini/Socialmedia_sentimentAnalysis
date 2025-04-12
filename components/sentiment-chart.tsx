"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

interface SentimentChartProps {
  data: {
    positive: number
    negative: number
    neutral: number
  }
}

export default function SentimentChart({ data }: SentimentChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Positive", "Neutral", "Negative"],
        datasets: [
          {
            data: [data.positive, data.neutral, data.negative],
            backgroundColor: [
              "rgba(34, 197, 94, 0.7)", // green
              "rgba(148, 163, 184, 0.7)", // gray
              "rgba(239, 68, 68, 0.7)", // red
            ],
            borderColor: ["rgba(34, 197, 94, 1)", "rgba(148, 163, 184, 1)", "rgba(239, 68, 68, 1)"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return (
    <div className="w-full h-[200px] flex items-center justify-center">
      <canvas ref={chartRef} />
    </div>
  )
}

