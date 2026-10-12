"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">NutriPilot</span>
          </Link>
          
          {!isLoading && user && (
            <nav className="hidden md:flex gap-3 overflow-x-auto">
              <Link href="/dashboard" className="text-xs font-semibold transition-colors hover:text-primary">Dashboard</Link>
              <Link href="/planner" className="text-xs font-semibold transition-colors hover:text-primary">Planner</Link>
              <Link href="/pantry" className="text-xs font-semibold transition-colors hover:text-primary">Pantry</Link>
              <Link href="/grocery" className="text-xs font-semibold transition-colors hover:text-primary">Grocery</Link>
              <Link href="/tracking" className="text-xs font-semibold transition-colors hover:text-primary">Tracking</Link>
              <Link href="/progress" className="text-xs font-semibold transition-colors hover:text-primary">Progress</Link>
              <Link href="/reports" className="text-xs font-semibold transition-colors hover:text-primary">Reports</Link>
              <Link href="/recipes" className="text-xs font-semibold transition-colors hover:text-primary">Recipes</Link>
              <Link href="/recommendations" className="text-xs font-semibold transition-colors hover:text-primary">Help & Tips</Link>
              <Link href="/settings" className="text-xs font-semibold transition-colors hover:text-primary">Settings</Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {!isLoading && (
            user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground hidden sm:inline-block">{user.email}</span>
                <Button variant="outline" onClick={logout} size="sm">Logout</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}
