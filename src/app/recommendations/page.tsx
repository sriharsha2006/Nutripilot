"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartRecommendation, FoodBankLocation, recipesApi } from "@/lib/api/recipes";
import {
  Sparkles,
  HeartHandshake,
  DollarSign,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [foodBanks, setFoodBanks] = useState<FoodBankLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await recipesApi.getRecommendations();
      setRecommendations(data.recommendations);
      setFoodBanks(data.foodBanks);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading AI recommendations & community resources...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-muted p-6 rounded-2xl border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wide">
            <Sparkles className="h-3.5 w-3.5" /> AI Guidance & Community Support
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Smart Recommendations & Food Bank Locator</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Personalized advice to optimize budget, utilize expiring ingredients, and access community assistance.
          </p>
        </div>
      </div>

      {/* AI Smart Recommendations */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" /> Active AI Recommendations
          </h2>
          <span className="text-xs text-muted-foreground">{recommendations.length} active suggestion(s)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="border shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <CardHeader className="p-5 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <Badge
                    variant={rec.category === "leftovers" ? "secondary" : rec.category === "budget" ? "accent" : "outline"}
                    className="text-[10px] capitalize"
                  >
                    {rec.category}
                  </Badge>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{rec.impact}</span>
                </div>
                <CardTitle className="text-base font-bold pt-2">{rec.title}</CardTitle>
              </CardHeader>

              <CardContent className="p-5 pt-1 space-y-3 flex-1">
                <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
              </CardContent>

              {rec.actionLink && (
                <div className="p-5 pt-0 border-t mt-auto pt-3">
                  <Button variant="outline" size="sm" asChild className="w-full justify-between text-xs">
                    <Link href={rec.actionLink}>
                      {rec.actionText} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Food Bank & Community Resources */}
      <div id="foodbanks" className="space-y-4 pt-4">
        <div className="flex justify-between items-center border-b pb-2">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <HeartHandshake className="h-5 w-5 text-rose-500" /> Food Bank & Community Assistance Directory
            </h2>
            <p className="text-xs text-muted-foreground">Nearby verified emergency food pantries and fresh produce distributors.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {foodBanks.map((fb) => (
            <Card key={fb.id} className="border shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <CardHeader className="p-5 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base font-bold">{fb.name}</CardTitle>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {fb.distanceKm} km away
                  </Badge>
                </div>
                <CardDescription className="text-xs flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> {fb.address}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-1 space-y-3 flex-1 text-xs">
                <div className="space-y-1">
                  <div className="font-semibold text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Hours of Operation
                  </div>
                  <p className="text-foreground">{fb.hours}</p>
                </div>

                <div className="space-y-1">
                  <div className="font-semibold text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> Contact Phone
                  </div>
                  <p className="text-foreground">{fb.phone}</p>
                </div>

                <div className="space-y-1 border-t pt-2">
                  <div className="font-semibold text-muted-foreground">Services Provided</div>
                  <div className="flex flex-wrap gap-1">
                    {fb.services.map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200">
                  <span className="font-semibold flex items-center gap-1 text-[11px]">
                    <ShieldCheck className="h-3.5 w-3.5" /> Eligibility
                  </span>
                  <p className="text-[11px] opacity-90 mt-0.5">{fb.eligibility}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
