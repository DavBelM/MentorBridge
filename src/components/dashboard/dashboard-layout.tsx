"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authentication check is complete
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push("/login");
      } 
      // If authenticated but no profile, redirect to profile setup
      else if (hasProfile === false) {
        router.push("/profile/setup");
      }
    }
  }, [isAuthenticated, isLoading, hasProfile, router]);

  // Show loading state while checking
  if (isLoading || hasProfile === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If not authenticated or no profile, return empty (will redirect)
  if (!isAuthenticated || hasProfile === false) {
    return null;
  }

  // If authenticated and has profile, render dashboard content
  return <>{children}</>;
}