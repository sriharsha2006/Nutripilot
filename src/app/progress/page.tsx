"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressMetrics, trackingApi } from "@/lib/api/tracking";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Award,
  Scale,
  Calendar,
  Sparkles,
  BarChart3,
  Dumbbell,
  Droplet,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

export default function ProgressPage() {
  const [timeframe, setTimeframe] = useState<"7d" | "14d" | "30d">("14d");
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMetrics();
  }, [timeframe]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await trackingApi.getProgressMetrics(timeframe);
      setMetrics(data);
    } catch (err) {
      console.error("Failed to load progress metrics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className="min-h-[75vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Generating Recharts analytics & trend charts...</p>
      </div>
    );
  }

  const targetCal = metrics.dataPoints[0]?.targetCalories || 2000;
  const targetWeight = metrics.targetWeightKg;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-muted p-6 rounded-2xl border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wide">
            <BarChart3 className="h-3.5 w-3.5" /> Performance & Trend Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Progress & Adherence Analytics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visualize your historical calorie adherence, weight trajectory, and macro compliance.
          </p>
        </div>

        {/* Timeframe Controls */}
        <div className="flex items-center gap-1.5 bg-card p-1.5 rounded-xl border">
          {(["7d", "14d", "30d"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === tf
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf === "7d" && "7 Days"}
              {tf === "14d" && "14 Days"}
              {tf === "30d" && "30 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* Highlights Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Adherence Score */}
        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs flex justify-between items-center">
              <span>Compliance Adherence</span>
              <Award className="h-4 w-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.adherencePercentage}%
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-[11px] text-muted-foreground">Days within ±100 kcal target range</p>
          </CardContent>
        </Card>

        {/* Avg Calories */}
        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs flex justify-between items-center">
              <span>Average Daily Intake</span>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {metrics.averageCalories} <span className="text-xs font-normal text-muted-foreground">kcal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-[11px] text-muted-foreground">Target baseline: {targetCal} kcal</p>
          </CardContent>
        </Card>

        {/* Weight Change */}
        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs flex justify-between items-center">
              <span>Weight Progress</span>
              <TrendingDown className="h-4 w-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {metrics.weightChangeKg} <span className="text-xs font-normal text-muted-foreground">kg</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-[11px] text-muted-foreground">Total change over selected period</p>
          </CardContent>
        </Card>

        {/* Current Weight */}
        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs flex justify-between items-center">
              <span>Current Weight</span>
              <Scale className="h-4 w-4 text-blue-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {metrics.currentWeightKg} <span className="text-xs font-normal text-muted-foreground">kg</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-[11px] text-muted-foreground">Target goal: {targetWeight} kg</p>
          </CardContent>
        </Card>
      </div>

      {/* CHART 1: Calorie Adherence Area Chart */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" /> Daily Calorie Intake vs Target Goal
            </CardTitle>
            <Badge variant="outline">Target Goal: {targetCal} kcal</Badge>
          </div>
          <CardDescription>Visualizing daily energy intake compliance over time</CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.dataPoints} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--card)", borderRadius: "12px", border: "1px solid var(--border)" }}
                />
                <ReferenceLine y={targetCal} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: "Target", fill: "#3b82f6", fontSize: 11 }} />
                <Area type="monotone" dataKey="calories" name="Actual Intake (kcal)" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorCal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* CHART 2 & 3: Weight Trajectory & Macronutrient Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Trajectory Chart */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Scale className="h-5 w-5 text-emerald-500" /> Body Weight Trajectory
            </CardTitle>
            <CardDescription>Historical weigh-ins and trajectory curve (kg)</CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.dataPoints} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--card)", borderRadius: "12px", border: "1px solid var(--border)" }}
                  />
                  <ReferenceLine y={targetWeight} stroke="#10b981" strokeDasharray="4 4" label={{ value: `Goal (${targetWeight}kg)`, fill: "#10b981", fontSize: 11 }} />
                  <Line type="monotone" dataKey="weightKg" name="Weight (kg)" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Macronutrient Breakdown Bar Chart */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-blue-500" /> Macronutrient Compliance (g)
            </CardTitle>
            <CardDescription>Protein, Carbohydrates, and Fats daily distribution</CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.dataPoints} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--card)", borderRadius: "12px", border: "1px solid var(--border)" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="protein" name="Protein (g)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="carbs" name="Carbs (g)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fat" name="Fat (g)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
