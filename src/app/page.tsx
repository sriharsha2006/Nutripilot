import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center space-y-8">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary">
          Your AI-Powered Personal Nutrition Planner
        </h1>
        <p className="text-xl text-muted-foreground">
          NutriPilot creates personalized meal plans based on your goals, constraints, and preferences. Get explainable recommendations and automated grocery lists.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/register">Get Started</Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}
