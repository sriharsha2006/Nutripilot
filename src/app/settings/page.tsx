"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserSettings, settingsApi } from "@/lib/api/settings";
import {
  Settings,
  User,
  Bell,
  Globe,
  Lock,
  Download,
  Save,
  CheckCircle2,
  ShieldCheck,
  Moon,
  Sun,
  Laptop,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passMessage, setPassMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await settingsApi.getSettings();
      setSettings(data);
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await settingsApi.updateSettings(settings);
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPassMessage("Password must be at least 6 characters.");
      return;
    }
    try {
      const res = await settingsApi.changePassword({ current: currentPassword, new: newPassword });
      setPassMessage(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPassMessage(""), 4000);
    } catch (err) {
      console.error("Failed to change password:", err);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await settingsApi.exportUserData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nutripilot-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    } catch (err) {
      console.error("Failed to export data:", err);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-[75vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading settings and preferences...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-muted p-6 rounded-2xl border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wide">
            <Settings className="h-3.5 w-3.5" /> Account & App Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Settings & User Preferences</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your account security, notification alerts, unit systems, and data exports.
          </p>
        </div>

        <Button onClick={handleSaveSettings} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Settings updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Profile & Security */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Profile & Security
            </CardTitle>
            <CardDescription>Manage user credentials and account password</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={settings.email} disabled className="bg-muted/50" />
            </div>

            <div className="border-t pt-3 space-y-3">
              <Label className="font-semibold flex items-center gap-1.5 text-foreground">
                <Lock className="h-3.5 w-3.5 text-primary" /> Change Password
              </Label>

              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="New Password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button type="button" variant="secondary" size="sm" onClick={handlePasswordChange}>
                  Update Password
                </Button>
                {passMessage && <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{passMessage}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display & Regional Preferences */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Units & Display Options
            </CardTitle>
            <CardDescription>Configure measurement units and localization</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-xs">
            <div className="space-y-2">
              <Label htmlFor="unitSystem">Measurement Units System</Label>
              <Select
                id="unitSystem"
                value={settings.unitSystem}
                onChange={(e) => setSettings({ ...settings, unitSystem: e.target.value as any })}
                options={[
                  { label: "Metric (kg, cm, ml)", value: "metric" },
                  { label: "Imperial (lbs, ft/in, fl oz)", value: "imperial" },
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Grocery Currency Symbol</Label>
              <Select
                id="currency"
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                options={[
                  { label: "USD ($)", value: "$" },
                  { label: "EUR (€)", value: "€" },
                  { label: "GBP (£)", value: "£" },
                  { label: "CAD ($)", value: "CA$" },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" /> Notifications & Alerts
            </CardTitle>
            <CardDescription>Manage automated email and push notifications</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-xs">
            {[
              { id: "mealReminders", label: "Daily Meal & Hydration Log Reminders", desc: "Receive gentle prompts to log meals and water intake." },
              { id: "pantryExpiryAlerts", label: "Pantry Expiration Warning Alerts", desc: "Get notified when ingredients are expiring within 3 days." },
              { id: "weeklyReportDigest", label: "Weekly PDF Progress Digest", desc: "Receive a weekly email summary of calorie & weight progress." },
            ].map((item) => {
              const isChecked = (settings.notifications as any)[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        [item.id]: !isChecked,
                      },
                    })
                  }
                  className="p-3 rounded-xl border bg-card hover:bg-muted/40 cursor-pointer flex items-start gap-3 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 rounded border-muted-foreground text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="font-semibold text-foreground">{item.label}</div>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Data Backup & Account Management */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" /> Data Backup & Account Controls
            </CardTitle>
            <CardDescription>Export your complete personal data history</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-muted/40 border space-y-2">
              <div className="font-semibold">Export Personal Data Backup</div>
              <p className="text-muted-foreground text-[11px]">
                Download a JSON archive containing your profile metrics, meal planner history, pantry stock, and weight logs.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={handleExportData} className="gap-2">
                <Download className="h-3.5 w-3.5" /> Download JSON Backup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
