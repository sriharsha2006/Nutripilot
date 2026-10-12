"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportPreviewModal } from "@/components/reports/ReportPreviewModal";
import { NutritionReport, reportsApi } from "@/lib/api/reports";
import {
  FileText,
  Sparkles,
  Printer,
  Mail,
  Plus,
  Calendar,
  Award,
  Flame,
  CheckCircle2,
  Eye,
} from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<NutritionReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Selected Modal State
  const [selectedReport, setSelectedReport] = useState<NutritionReport | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await reportsApi.getReports();
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (type: "weekly" | "monthly") => {
    setIsGenerating(true);
    try {
      const created = await reportsApi.generateReport(type);
      setReports([created, ...reports]);
      setSelectedReport(created);
      setIsPreviewOpen(true);
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenPreview = (report: NutritionReport) => {
    setSelectedReport(report);
    setIsPreviewOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading nutrition reports...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-muted p-6 rounded-2xl border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wide">
            <FileText className="h-3.5 w-3.5" /> PDF Reports & Digest Exports
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Nutrition & Progress Reports</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Generate printable PDF digests summarizing calorie adherence, macro ratios, weight trends, and grocery savings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => handleGenerateReport("weekly")}
            disabled={isGenerating}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" /> {isGenerating ? "Generating..." : "Generate 7-Day Report"}
          </Button>

          <Button
            variant="outline"
            onClick={() => handleGenerateReport("monthly")}
            disabled={isGenerating}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" /> 30-Day Monthly Digest
          </Button>
        </div>
      </div>

      {/* Reports Archive List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Generated Report Archive
          </h2>
          <span className="text-xs text-muted-foreground">{reports.length} report(s) available</span>
        </div>

        {reports.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-muted/20 border rounded-2xl">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-lg">No Generated Reports Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Generate your first 7-day or 30-day performance report to preview and export as PDF.
            </p>
            <Button onClick={() => handleGenerateReport("weekly")} variant="outline" size="sm">
              Generate Weekly Report
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Card key={report.id} className="border shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {report.type}
                      </Badge>
                      <h3 className="font-bold text-base">{report.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Covering {report.startDate} to {report.endDate} • Generated on {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-emerald-500" /> {report.metrics.adherenceScore}% Target Score
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Avg: {report.metrics.averageDailyCalories} kcal / day
                      </div>
                    </div>

                    <Button variant="secondary" size="sm" onClick={() => handleOpenPreview(report)} className="gap-1.5">
                      <Eye className="h-3.5 w-3.5" /> Preview & Print PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <ReportPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        report={selectedReport}
      />
    </div>
  );
}
