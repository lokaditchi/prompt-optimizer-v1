import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, Clock, Zap, DollarSign, Calendar } from 'lucide-react'
import { useMetrics } from '@/hooks/useMetrics'
import { formatCost } from '@/lib/utils'
import './MetricsPanel.css'

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number, prefix?: string, suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) {
      setDisplayValue(end)
      return
    }

    let startTimestamp: number | null = null
    const duration = 1000 // 1s
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4)
      
      setDisplayValue(Math.floor(easeProgress * (end - start) + start))
      
      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setDisplayValue(end)
      }
    }
    
    window.requestAnimationFrame(step)
  }, [value])

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip glass">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="tooltip-value" style={{ color: entry.color }}>
            {entry.name}: {entry.name.includes('Cost') ? formatCost(entry.value) : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function MetricsPanel() {
  const { metrics, dateRange, setDateRange } = useMetrics()

  if (!metrics || metrics.totalRuns === 0) {
    return (
      <div className="metrics-panel page-container empty-state animate-fade-in">
        <div className="empty-metrics-content">
          <Activity size={48} className="text-muted mb-4" />
          <h2>No Metrics Yet</h2>
          <p className="text-muted">Run some tests in the Test Runner to see your metrics dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="metrics-panel page-container animate-fade-in">
      <div className="metrics-header">
        <div>
          <h2>Metrics Dashboard</h2>
          <p className="text-muted">Analyze your prompt performance and costs.</p>
        </div>
        <div className="date-range-selector">
          <Calendar size={16} className="text-muted" />
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value as any)}
            className="range-select"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0s' }}>
          <div className="card-icon-wrapper cyan">
            <Activity size={24} />
          </div>
          <div className="card-value">
            <AnimatedCounter value={metrics.totalRuns} />
          </div>
          <div className="card-label">Total Test Runs</div>
        </div>

        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <div className="card-icon-wrapper amber">
            <Clock size={24} />
          </div>
          <div className="card-value">
            <AnimatedCounter value={Math.round(metrics.avgLatencyMs)} suffix="ms" />
          </div>
          <div className="card-label">Avg. Latency</div>
        </div>

        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="card-icon-wrapper purple">
            <Zap size={24} />
          </div>
          <div className="card-value">
            <AnimatedCounter value={metrics.totalTokens} />
          </div>
          <div className="card-label">Total Tokens</div>
        </div>

        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="card-icon-wrapper green">
            <DollarSign size={24} />
          </div>
          <div className="card-value">
            {formatCost(metrics.totalEstimatedCost)}
          </div>
          <div className="card-label">Estimated Cost</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <h3>Latency Over Time</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.latencyOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent-amber)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-accent-amber)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-secondary)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="avgLatency" name="Latency (ms)" stroke="var(--color-accent-amber)" strokeWidth={2} fillOpacity={1} fill="url(#colorLatency)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card animate-scale-in" style={{ animationDelay: '0.25s' }}>
          <h3>Token Usage</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.tokensByRun} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-secondary)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="promptTokens" name="Prompt Tokens" stackId="a" fill="var(--color-accent-purple)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="completionTokens" name="Completion Tokens" stackId="a" fill="var(--color-accent-cyan)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card full-width animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <h3>Cumulative Cost</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.costByDay} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-secondary)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val.toFixed(4)}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="cost" name="Cost" stroke="var(--color-accent-green)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-bg-primary)", strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
