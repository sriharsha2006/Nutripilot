"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NutritionReport, reportsApi } from "@/lib/api/reports";
import {
  Printer,
  Mail,
  Sparkles,
  Flame,
  Award,
  Scale,
  DollarSign,
  Utensils,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: NutritionReport | null;
}

export function ReportPreviewModal({ isOpen, onClose, report }: ReportPreviewModalProps) {
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState<boolean>(false);

  if (!report) return null;

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    setEmailSentSuccess(false);
    try {
      await reportsApi.emailReport(report.id, report.userEmail);
      setEmailSentSuccess(true);
      setTimeout(() => setEmailSentSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to email report:", err);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const { metrics } = report;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
        {/* Printable Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-background text-foreground">
          {/* Header Branding */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl text-primary">NutriPilot</span>
                <Badge variant="outline" className="capitalize">
                  {report.type} Digest
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {report.startDate} to {report.endDate} • Generated for {report.userName}
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-muted-foreground">
              <div>Report ID: {report.id}</div>
              <div>Issued: {new Date(report.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          {emailSentSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Report successfully dispatched to {report.userEmail}!
            </div>
          )}

          {/* AI Executive Summary */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
            <div className="font-bold text-xs text-primary flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="h-4 w-4" /> AI Performance Executive Summary
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed">{report.aiExecutiveSummary}</p>
          </div>

          {/* Metrics Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl border bg-card">
              <div className="text-[10px] text-muted-foreground">Target Compliance</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{metrics.adherenceScore}%</div>
              <div className="text-[10px] text-muted-foreground">Adherence Rate</div>
            </div>

            <div className="p-3 rounded-xl border bg-card">
              <div className="text-[10px] text-muted-foreground">Avg Daily Intake</div>
              <div className="text-xl font-black text-orange-600 dark:text-orange-400">{metrics.averageDailyCalories}</div>
              <div className="text-[10px] text-muted-foreground">Target: {metrics.targetCalories} kcal</div>
            </div>

            <div className="p-3 rounded-xl border bg-card">
              <div className="text-[10px] text-muted-foreground">Weight Trajectory</div>
              <div className="text-xl font-black text-primary">{metrics.weightChangeKg} kg</div>
              <div className="text-[10px] text-muted-foreground">{metrics.startingWeightKg}kg ➔ {metrics.endingWeightKg}kg</div>
            </div>

            <div className="p-3 rounded-xl border bg-card">
              <div className="text-[10px] text-muted-foreground">Grocery Total</div>
              <div className="text-xl font-black text-blue-600 dark:text-blue-400">${metrics.totalGrocerySpent}</div>
              <div className="text-[10px] text-muted-foreground">Estimated Spend</div>
            </div>
          </div>

          {/* Macro Ratio Distribution */}
          <div className="space-y-2 border-t pt-4">
            <div className="font-bold text-sm">Average Macronutrient Ratio Distribution</div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="font-semibold text-blue-600 dark:text-blue-400">Carbohydrates</div>
                <div className="text-lg font-bold">{metrics.carbsPctAvg}%</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">Protein</div>
                <div className="text-lg font-bold">{metrics.proteinPctAvg}%</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="font-semibold text-amber-600 dark:text-amber-400">Fats</div>
                <div className="text-lg font-bold">{metrics.fatPctAvg}%</div>
              </div>
            </div>
          </div>

          {/* Top Recipes & Recommendations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 text-xs">
            <div className="space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Utensils className="h-4 w-4 text-primary" /> Top Consumed Recipes
              </div>
              <ul className="space-y-1 pl-2">
                {report.topRecipes.map((rec, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Award className="h-4 w-4 text-emerald-500" /> Key AI Recommendations
              </div>
              <ul className="space-y-1 pl-2">
                {report.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 border-t bg-muted/20 flex flex-row justify-between items-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleSendEmail} disabled={isSendingEmail} className="gap-2">
              <Mail className="h-4 w-4" /> {isSendingEmail ? "Sending..." : "Email PDF"}
            </Button>
            <Button onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" /> Print / Save PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
